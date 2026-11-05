import hashlib
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

    def test_validates_indexes_and_refuses_data_loss(self):
        self.assertEqual(refresh.validate(self.root, self.root, '2026-27 Term 1')['courses'], 1)
        (self.root / 'derived/subject_course_names.json').write_text('{}')
        with self.assertRaisesRegex(ValueError, 'Course ID index'):
            refresh.validate(self.root, self.root, '2026-27 Term 1')


if __name__ == '__main__':
    unittest.main()
