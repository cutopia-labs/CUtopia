from datetime import datetime, timedelta, timezone
import hashlib
import importlib.util
import json
from pathlib import Path
import unittest
from unittest.mock import patch
from urllib.error import HTTPError
from io import BytesIO

spec = importlib.util.spec_from_file_location('catalog_check', Path(__file__).with_name('check.py'))
check = importlib.util.module_from_spec(spec)
spec.loader.exec_module(check)


class DeliveryTests(unittest.TestCase):
    def setUp(self):
        self.headers = {'access-control-allow-origin': '*', 'etag': '"version"'}
        self.objects = {}
        self.section = {key: [] for key in check.FIELDS}
        self.section['days'] = [1]
        self.term = '2026-27 Term 2'
        subjects = ['ACCT', 'CSCI', 'ECON', 'ENGG', 'MATH'] + [f'TA{chr(65+i)}A' for i in range(25)]
        listing = {}
        keys = {}
        for subject in subjects:
            rows = [{'code': f'{1000+i}', 'title': f'{subject} course {i}',
                     'terms': {self.term: {'A': self.section}}} for i in range(20)]
            listing[subject] = [{'c': subject + row['code'], 'o': 1} for row in rows]
            keys[subject] = self.object(rows)
        self.manifest = {
            'schemaVersion': 1, 'currentTerm': self.term, 'availableTerms': [self.term],
            'subjects': keys, 'resources': {'courseList': self.object(listing)},
        }
        self.rehash_manifest()
        self.manifest['checkedAt'] = datetime.now(timezone.utc).isoformat()
        self.api = {'data': {f'c{i}': {'courseId': subject+'1000', 'title': f'{subject} course 0',
                                     'sections': [{'name': 'A', **{key: ['1'] if key == 'days' else []
                                                                  for key in check.FIELDS}}]}
                             for i, subject in enumerate(subjects[:5])}}

    def rehash_manifest(self):
        content = {key: self.manifest[key] for key in
                   ('schemaVersion', 'currentTerm', 'availableTerms', 'subjects', 'resources')}
        self.manifest['version'] = hashlib.sha256(self.encode(content)).hexdigest()

    def encode(self, value):
        return json.dumps(value, sort_keys=True, ensure_ascii=False, separators=(',', ':')).encode()

    def object(self, value):
        raw = self.encode(value)
        key = 'objects/' + hashlib.sha256(raw).hexdigest() + '.json'
        self.objects[key] = raw
        return key

    def fetch(self, url, payload=None, headers=None):
        if headers and 'If-None-Match' in headers:
            return b'', self.headers
        if url.endswith('/manifest.json'):
            return self.encode(self.manifest), self.headers
        if payload:
            self.assertEqual(headers['X-Catalog-Version'], self.manifest['version'])
            return self.encode(self.api), self.headers
        return self.objects[url.split('https://data.cutopia.app/')[1]], self.headers

    def run_check(self, **kwargs):
        with patch.object(check, 'fetch', self.fetch):
            return check.check(**kwargs)

    def test_verifies_fresh_index_and_string_serialized_production_sections(self):
        result = self.run_check()
        self.assertEqual(result['offeredCourses'], 600)
        self.assertEqual(len(result['verifiedCourses']), 5)

    def test_rejects_stale_or_future_crawl_timestamps(self):
        now = datetime.now(timezone.utc)
        for delta in (timedelta(hours=-37), timedelta(hours=1)):
            self.manifest['checkedAt'] = (now + delta).isoformat()
            with self.assertRaisesRegex(ValueError, 'last full crawl'):
                self.run_check()

    def test_rejects_browser_cors_failure(self):
        self.headers = {}
        with self.assertRaisesRegex(ValueError, 'browser origin'):
            self.run_check()

    def test_rejects_corrupt_immutable_object(self):
        self.objects[self.manifest['subjects']['CSCI']] = b'[]'
        with self.assertRaisesRegex(ValueError, 'incorrect content'):
            self.run_check()

    def test_rejects_version_mismatch_after_publication(self):
        with self.assertRaisesRegex(ValueError, 'just-published'):
            self.run_check(expected={**self.manifest, 'version': '0' * 64})

    def test_rejects_graphql_errors_even_with_http_success(self):
        self.api = {'errors': [{'message': 'unavailable'}]}
        with self.assertRaisesRegex(ValueError, 'GraphQL errors'):
            self.run_check()

    def test_rejects_api_schedule_from_an_old_snapshot(self):
        self.api['data']['c1']['sections'][0]['days'] = ['2']
        with self.assertRaisesRegex(ValueError, 'sections differ'):
            self.run_check()

    def test_checks_inactive_course_with_only_previous_semester_sections(self):
        listing = json.loads(self.objects[self.manifest['resources']['courseList']])
        listing['AIST'] = [{'c': 'AIST1000', 't': 'First-term course'}]
        self.manifest['resources']['courseList'] = self.object(listing)
        self.manifest['subjects']['AIST'] = self.object([
            {'code': '1000', 'title': 'First-term course',
             'terms': {'2026-27 Term 1': {'A': self.section}}}])
        self.rehash_manifest()
        self.api['data']['c5'] = {'courseId': 'AIST1000', 'title': 'First-term course', 'sections': None}
        result = self.run_check()
        self.assertEqual(result['verifiedUnavailableCourse'], 'AIST1000')
        self.api['data']['c5']['sections'] = self.api['data']['c0']['sections']
        with self.assertRaisesRegex(ValueError, 'sections differ'):
            self.run_check()

    def test_rejects_index_offering_a_course_without_sections(self):
        key = self.manifest['subjects']['CSCI']
        rows = json.loads(self.objects[key])
        rows[0]['terms'] = {}
        self.manifest['subjects']['CSCI'] = self.object(rows)
        self.rehash_manifest()
        with self.assertRaisesRegex(ValueError, 'availability differs'):
            self.run_check()

    def test_rejects_tampered_manifest(self):
        self.manifest['resources']['courseList'] = 'objects/' + '0' * 64 + '.json'
        with self.assertRaisesRegex(ValueError, 'does not match'):
            self.run_check()

    def test_rejects_missing_cors_on_conditional_response_even_when_first_get_passes(self):
        def fetch(url, payload=None, headers=None):
            if headers and 'If-None-Match' in headers:
                return b'', {'etag': '"version"'}
            return self.fetch(url, payload, headers)
        with patch.object(check, 'fetch', fetch):
            with self.assertRaisesRegex(ValueError, 'Conditional catalog response'):
                check.check()

    def test_reads_headers_on_304_instead_of_treating_it_as_a_network_failure(self):
        error = HTTPError('https://data.cutopia.app/manifest.json', 304, 'Not Modified',
                          {'Access-Control-Allow-Origin': '*'}, BytesIO(b''))
        with patch.object(check, 'urlopen', side_effect=error):
            raw, headers = check.fetch(error.url, headers={'If-None-Match': '"version"'})
            self.assertEqual(raw, b'')
            self.assertEqual(headers['access-control-allow-origin'], '*')

    def test_public_get_uses_a_simple_browser_request(self):
        with patch.object(check, 'urlopen') as opener:
            opener.return_value.__enter__.return_value.read.return_value = b'{}'
            check.fetch(check.BASE_URL + '/manifest.json')
            request = opener.call_args.args[0]
            self.assertEqual(request.get_method(), 'GET')
            self.assertFalse(request.has_header('Content-type'))
            self.assertEqual(request.get_header('Origin'), 'https://cutopia.app')

    def test_api_post_declares_json_and_preserves_version_header(self):
        with patch.object(check, 'urlopen') as opener:
            opener.return_value.__enter__.return_value.read.return_value = b'{}'
            check.fetch(check.API_URL, {'query': 'query { course { courseId } }'},
                        {'X-Catalog-Version': self.manifest['version']})
            request = opener.call_args.args[0]
            self.assertEqual(request.get_method(), 'POST')
            self.assertEqual(request.get_header('Content-type'), 'application/json')
            self.assertEqual(request.get_header('X-catalog-version'), self.manifest['version'])


if __name__ == '__main__':
    unittest.main()
