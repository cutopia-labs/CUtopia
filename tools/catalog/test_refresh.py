import hashlib
from datetime import date
import importlib.util
import json
from pathlib import Path
import tempfile
import unittest

spec = importlib.util.spec_from_file_location('catalog_refresh', Path(__file__).with_name('refresh.py'))
refresh = importlib.util.module_from_spec(spec)
spec.loader.exec_module(refresh)


class MissingObject(Exception):
    response = {'ResponseMetadata': {'HTTPStatusCode': 404}}


class MemoryS3:
    def __init__(self):
        self.objects = {}
        self.writes = []

    def head_object(self, Bucket, Key):
        if Key not in self.objects:
            raise MissingObject()
        return {}

    def put_object(self, Bucket, Key, Body, **kwargs):
        previous = self.objects.get(Key)
        if 'IfMatch' in kwargs:
            if previous is None or hashlib.md5(previous).hexdigest() != kwargs['IfMatch']:
                raise RuntimeError('Concurrent publication')
        if kwargs.get('IfNoneMatch') == '*' and previous is not None:
            raise RuntimeError('Concurrent publication')
        self.objects[Key] = Body
        self.writes.append(Key)


class PublicationTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.root = Path(self.temp.name)
        self.s3 = MemoryS3()
        for name in ('courses', 'resources', 'derived'):
            (self.root / name).mkdir()
        files = {
            'courses/TEST.json': [{'code': '1000', 'title': 'Test course'}],
            'resources/course_list.json': {'TEST': [{'c': 'TEST1000', 't': 'Test course'}]},
            'resources/instructors.json': [],
            'derived/faculty_subjects.json': {'Science': ['TEST']},
            'derived/subject_course_names.json': {'TEST': ['1000']},
        }
        for name, value in files.items():
            (self.root / name).write_text(json.dumps(value))

    def tearDown(self):
        self.temp.cleanup()

    def test_promotes_only_after_all_immutable_objects_exist(self):
        manifest, changed = refresh.publish(self.s3, 'catalog', self.root, '2026-27 Term 1', None, None)
        self.assertTrue(changed)
        self.assertEqual(self.s3.writes[-1], 'published/manifest.json')
        for key in [*manifest['subjects'].values(), *manifest['resources'].values()]:
            self.assertIn('published/' + key, self.s3.objects)

    def test_unchanged_data_does_not_create_new_objects_or_change_version(self):
        before, _ = refresh.publish(self.s3, 'catalog', self.root, '2026-27 Term 1', None, None)
        etag = hashlib.md5(self.s3.objects['published/manifest.json']).hexdigest()
        count = len(self.s3.objects)
        after, changed = refresh.publish(self.s3, 'catalog', self.root, '2026-27 Term 1', before, etag)
        self.assertFalse(changed)
        self.assertEqual(before['version'], after['version'])
        self.assertEqual(before['publishedAt'], after['publishedAt'])
        self.assertEqual(count, len(self.s3.objects))

    def test_rejects_stale_publisher_without_replacing_live_manifest(self):
        before, _ = refresh.publish(self.s3, 'catalog', self.root, '2026-27 Term 1', None, None)
        current = self.s3.objects['published/manifest.json']
        with self.assertRaisesRegex(RuntimeError, 'Concurrent'):
            refresh.publish(self.s3, 'catalog', self.root, '2026-27 Term 1', before, 'stale')
        self.assertEqual(self.s3.objects['published/manifest.json'], current)

    def test_reselecting_default_preserves_actual_crawl_timestamp(self):
        before, _ = refresh.publish(self.s3, 'catalog', self.root, '2026-27 Term 1', None, None)
        etag = hashlib.md5(self.s3.objects['published/manifest.json']).hexdigest()
        after, _ = refresh.publish(self.s3, 'catalog', self.root, '2026-27 Term 2', before, etag,
                                   checked_at=before['checkedAt'])
        self.assertEqual(after['checkedAt'], before['checkedAt'])
        self.assertEqual(after['currentTerm'], '2026-27 Term 2')

    def test_publish_only_refuses_an_outdated_data_checkout(self):
        before, _ = refresh.publish(self.s3, 'catalog', self.root, '2026-27 Term 1', None, None)
        refresh.require_published_courses(self.root, before)
        (self.root / 'courses/TEST.json').write_text(json.dumps([{'code': '1000', 'title': 'Stale data'}]))
        with self.assertRaisesRegex(ValueError, 'currently published'):
            refresh.require_published_courses(self.root, before)

    def test_validates_indexes_and_refuses_data_loss(self):
        self.assertEqual(refresh.validate(self.root, self.root, '2026-27 Term 1')['courses'], 1)
        (self.root / 'derived/subject_course_names.json').write_text('{}')
        with self.assertRaisesRegex(ValueError, 'Course ID index'):
            refresh.validate(self.root, self.root, '2026-27 Term 1')


class PlanningTermTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.root = Path(self.temp.name)
        (self.root / 'courses').mkdir()
        self.first = '2026-27 Term 1'
        self.second = '2026-27 Term 2'

    def tearDown(self):
        self.temp.cleanup()

    def dataset(self, terms):
        section = {'S1': {'days': [], 'startTimes': [], 'endTimes': [], 'locations': [], 'instructors': []}}
        for n in range(30):
            subject = f'T{chr(65 + n // 26)}{chr(65 + n % 26)}A'
            rows = [{'code': f'{i:04d}', 'title': 'Course',
                     'terms': {term: section for term, limit in terms.items() if i * 30 + n < limit}}
                    for i in range(40)]
            (self.root / 'courses' / f'{subject}.json').write_text(json.dumps(rows))

    def choose(self, day, config=None, previous=None):
        return refresh.select_term(self.root, config or {}, previous or self.first, date.fromisoformat(day))[0]

    def test_november_uses_second_term_without_selecting_programme_or_future_terms(self):
        self.dataset({self.first: 600, self.second: 600, '2026-27 Term 4': 600,
                      '2026-27 Winter': 600, '2027-28 Term 1': 1200})
        self.assertEqual(self.choose('2026-11-05'), self.second)

    def test_first_term_registration_does_not_jump_to_preloaded_second_term(self):
        self.dataset({self.first: 600, self.second: 600})
        self.assertEqual(self.choose('2026-09-10'), self.first)

    def test_second_term_add_drop_does_not_jump_to_summer_or_four_term_programmes(self):
        self.dataset({self.first: 600, self.second: 600, '2026-27 Summer Session': 600,
                      '2026-27 Term 3': 600, '2026-27 Term 4': 600})
        self.assertEqual(self.choose('2027-01-24', previous=self.second), self.second)

    def test_new_academic_year_waits_for_first_term_planning_window(self):
        next_first = '2027-28 Term 1'
        self.dataset({self.first: 600, self.second: 600, next_first: 600})
        self.assertEqual(self.choose('2027-06-30', previous=self.second), self.second)
        self.assertEqual(self.choose('2027-07-01', previous=self.second), next_first)

    def test_official_release_override_delays_automatic_switch(self):
        self.dataset({self.first: 600, self.second: 600})
        config = {'termNotBefore': {self.second: '2026-11-04'}}
        self.assertEqual(self.choose('2026-11-03', config), self.first)
        self.assertEqual(self.choose('2026-11-04', config), self.second)

    def test_sparse_schedule_retains_existing_default(self):
        self.dataset({self.first: 600, self.second: 100})
        self.assertEqual(self.choose('2026-11-05'), self.first)

    def test_bootstrap_cannot_bypass_the_official_release_floor(self):
        self.dataset({self.first: 600, self.second: 600})
        selected, _ = refresh.select_term(
            self.root, {'termNotBefore': {self.second: '2026-11-04'}},
            today=date(2026, 11, 3))
        self.assertEqual(selected, self.first)

    def test_bootstrap_rejects_sparse_data_instead_of_inventing_a_default(self):
        self.dataset({self.first: 100, self.second: 100})
        with self.assertRaisesRegex(ValueError, 'No sufficiently published'):
            refresh.select_term(self.root, {}, today=date(2026, 11, 5))

    def test_partial_schedule_fails_relative_coverage_threshold(self):
        self.dataset({self.first: 1200, self.second: 800})
        self.assertEqual(self.choose('2026-11-05'), self.first)

    def test_term_picker_keeps_previous_regular_term_and_default_first(self):
        self.dataset({self.first: 600, self.second: 600, '2026-27 Winter': 600,
                      '2026-27 Summer Session': 100})
        self.assertEqual(refresh.available_terms(self.root, self.second),
                         [self.second, self.first, '2026-27 Summer Session'])

    def test_search_availability_follows_the_selected_default(self):
        self.dataset({self.first: 600, self.second: 500})
        (self.root / 'resources').mkdir()
        listing = {'TEST': [{'c': 'TAAA0000'}, {'c': 'TBDA0039', 'o': 1}]}
        path = self.root / 'resources/course_list.json'
        path.write_text(json.dumps(listing))
        refresh.update_availability(self.root, self.second)
        rows = json.loads(path.read_text())['TEST']
        self.assertEqual(rows[0]['o'], 1)
        self.assertNotIn('o', rows[1])


if __name__ == '__main__':
    unittest.main()
