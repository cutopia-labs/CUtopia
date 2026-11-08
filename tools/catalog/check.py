"""Read-only checks of catalog freshness and the public planner delivery path."""
import argparse
import hashlib
import json
from pathlib import Path
import re
import time
from datetime import datetime, timezone
from urllib.error import HTTPError
from urllib.request import Request, urlopen

BASE_URL = 'https://data.cutopia.app'
API_URL = 'https://eisbgazs16.execute-api.ap-southeast-1.amazonaws.com/Prod/graphql'
FIELDS = ('days', 'startTimes', 'endTimes', 'locations', 'instructors', 'meetingDates')
OBJECT_KEY = re.compile(r'objects/[a-f0-9]{64}\.json')


def fetch(url, payload=None, headers=None):
    request = Request(url, data=json.dumps(payload).encode() if payload else None,
                      headers={'Origin': 'https://cutopia.app',
                               **({'Content-Type': 'application/json'} if payload else {}),
                               **(headers or {})})
    try:
        response = urlopen(request, timeout=20)
    except HTTPError as error:
        if error.code != 304:
            raise
        response = error
    with response:
        return response.read(), {key.lower(): value for key, value in response.headers.items()}


def validate_freshness(manifest, max_age_hours, now=None):
    now = now or datetime.now(timezone.utc)
    checked = datetime.fromisoformat(manifest['checkedAt'].replace('Z', '+00:00'))
    age = (now - checked).total_seconds() / 3600
    if not -0.1 <= age <= max_age_hours:
        raise ValueError(f'Catalog last full crawl is {age:.1f} hours old (limit {max_age_hours})')
    if not re.fullmatch(r'20\d{2}-\d{2} Term [12]', manifest['currentTerm']):
        raise ValueError('Default is not a regular undergraduate semester')
    if manifest['currentTerm'] not in manifest['availableTerms']:
        raise ValueError('Default semester is missing from the picker')
    content = {key: manifest[key] for key in
               ('schemaVersion', 'currentTerm', 'availableTerms', 'subjects', 'resources')}
    raw = json.dumps(content, sort_keys=True, ensure_ascii=False, separators=(',', ':')).encode()
    if manifest['schemaVersion'] != 1 or hashlib.sha256(raw).hexdigest() != manifest['version']:
        raise ValueError('Manifest content does not match its version')
    return age


def sections_for_api(sections):
    # The GraphQL contract exposes scalar arrays as strings (including day numbers).
    return {name: {field: [str(value) if value is not None else None for value in row[field]]
                          if row.get(field) is not None else None for field in FIELDS}
            for name, row in sections.items()}


def check(base_url=BASE_URL, api_url=API_URL, max_age_hours=36, expected=None):
    raw, headers = fetch(base_url + '/manifest.json')
    manifest = json.loads(raw)
    if headers.get('access-control-allow-origin') not in ('*', 'https://cutopia.app'):
        raise ValueError('Public catalog does not allow the production browser origin')
    age = validate_freshness(manifest, max_age_hours)
    if expected and any(manifest[key] != expected[key] for key in ('version', 'checkedAt', 'currentTerm')):
        raise ValueError('CDN has not reached the just-published catalog')

    def revalidate(url, original_headers):
        etag = original_headers.get('etag')
        if not etag:
            raise ValueError('Public catalog response has no ETag')
        _, conditional_headers = fetch(url, headers={'If-None-Match': etag})
        if conditional_headers.get('access-control-allow-origin') not in ('*', 'https://cutopia.app'):
            raise ValueError('Conditional catalog response does not allow the browser origin')

    revalidate(base_url + '/manifest.json', headers)

    def read_object(key):
        if not OBJECT_KEY.fullmatch(key):
            raise ValueError('Invalid catalog object key')
        raw, object_headers = fetch(base_url + '/' + key)
        if object_headers.get('access-control-allow-origin') not in ('*', 'https://cutopia.app'):
            raise ValueError(f'Public object is missing browser CORS: {key}')
        if hashlib.sha256(raw).hexdigest() != key[8:-5]:
            raise ValueError(f'Public object has incorrect content: {key}')
        revalidate(base_url + '/' + key, object_headers)
        return json.loads(raw)

    listing = read_object(manifest['resources']['courseList'])
    offered = [row['c'] for rows in listing.values() for row in rows if row.get('o')]
    if len(offered) < 500 or len({cid[:4] for cid in offered}) < 30:
        raise ValueError('Default-semester search index is unexpectedly sparse')
    subjects = list(dict.fromkeys(
        [s for s in ('ACCT', 'CSCI', 'ECON', 'ENGG', 'MATH') if any(cid.startswith(s) for cid in offered)] +
        sorted({cid[:4] for cid in offered})))[:5]
    samples = []
    term = manifest['currentTerm']
    for subject in subjects:
        rows = read_object(manifest['subjects'][subject])
        actual = {subject + row['code'] for row in rows if row.get('terms', {}).get(term)}
        indexed = {cid for cid in offered if cid.startswith(subject)}
        if actual != indexed:
            raise ValueError(f'Search availability differs from schedules: {subject}')
        row = next(row for row in rows if subject + row['code'] in indexed)
        samples.append((subject + row['code'], row))

    selections = []
    for index, (cid, _) in enumerate(samples):
        selections.append(f'c{index}:course(filter:{{requiredCourse:{json.dumps(cid)},'
                          f'requiredTerm:{json.dumps(term)}}})'
                          '{courseId title sections{name days startTimes endTimes locations instructors meetingDates}}')
    raw, api_headers = fetch(api_url, {'query': 'query CatalogDeliveryHealth {' + ' '.join(selections) + '}'},
                            {'X-Catalog-Version': manifest['version']})
    if api_headers.get('access-control-allow-origin') not in ('*', 'https://cutopia.app'):
        raise ValueError('Production API does not allow the browser origin')
    response = json.loads(raw)
    if response.get('errors') or not response.get('data'):
        raise ValueError('Production course API returned GraphQL errors')
    for index, (cid, row) in enumerate(samples):
        actual = response['data'][f'c{index}']
        if actual['courseId'] != cid or actual['title'] != row['title']:
            raise ValueError(f'Production course metadata differs from catalog: {cid}')
        sections = {section['name']: {key: section.get(key) for key in FIELDS}
                    for section in actual['sections'] or []}
        if sections != sections_for_api(row['terms'][term]):
            raise ValueError(f'Production sections differ from published catalog: {cid}')
    return {'version': manifest['version'], 'checkedAt': manifest['checkedAt'],
            'ageHours': round(age, 2), 'currentTerm': term, 'offeredCourses': len(offered),
            'verifiedSubjects': subjects, 'verifiedCourses': [cid for cid, _ in samples],
            'delivery': 'CDN integrity, browser CORS (including conditional requests), search and production API passed'}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--expected-report', type=Path)
    parser.add_argument('--attempts', type=int, choices=range(1, 8), default=3)
    parser.add_argument('--retry-seconds', type=int, choices=range(0, 31), default=20)
    args = parser.parse_args()
    expected = json.loads(args.expected_report.read_text()) if args.expected_report else None
    for attempt in range(args.attempts):
        try:
            print(json.dumps(check(expected=expected), indent=2))
            return
        except Exception as error:
            print(f'Delivery check {attempt + 1}/{args.attempts} failed: {error}', flush=True)
            if attempt + 1 == args.attempts:
                raise
            time.sleep(args.retry_seconds)


if __name__ == '__main__':
    main()
