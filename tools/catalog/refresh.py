"""Refresh public course data and atomically publish a content-addressed catalog."""
import argparse
import concurrent.futures
import contextlib
import hashlib
import io
import json
import os
from pathlib import Path
import re
import shutil
import sys
import tempfile
import threading
from datetime import date, datetime, timezone
from zoneinfo import ZoneInfo


def canonical(value):
    return json.dumps(value, sort_keys=True, ensure_ascii=False, separators=(',', ':')).encode()


def inspect(directory):
    courses = {}
    terms = {}
    sections = {}
    for file in sorted((Path(directory) / 'courses').glob('*.json')):
        if not re.fullmatch('[A-Z]{4}', file.stem):
            continue
        rows = json.loads(file.read_text())
        if not isinstance(rows, list):
            raise ValueError(f'Invalid subject: {file.stem}')
        for course in rows:
            course_id = file.stem + course['code']
            if course_id in courses or not course.get('title'):
                raise ValueError(f'Invalid or duplicate course: {course_id}')
            courses[course_id] = course
            for term, values in course.get('terms', {}).items():
                terms[term] = terms.get(term, 0) + 1
                for section in values.values():
                    sizes = [len(section[key]) for key in ('days', 'startTimes', 'endTimes', 'locations', 'instructors')]
                    if len(set(sizes)) != 1:
                        raise ValueError(f'Inconsistent meeting fields: {course_id}')
                    sections[term] = sections.get(term, 0) + 1
    if not courses:
        raise ValueError('Refusing to publish an empty catalog')
    return courses, terms, sections


def regular_term(term):
    match = re.fullmatch(r'(20\d{2})-(\d{2}) Term ([12])', term)
    if not match or int(match[2]) != (int(match[1]) + 1) % 100:
        return None
    return int(match[1]), int(match[3])


def select_term(directory, config, previous=None, today=None):
    """Choose the undergraduate planning window, never the largest term label."""
    courses, counts, _ = inspect(directory)
    today = today or datetime.now(ZoneInfo('Asia/Hong_Kong')).date()
    override = config.get('currentTerm')
    if override:
        if not regular_term(override) or not counts.get(override):
            raise ValueError('Default term override must be an offered undergraduate Term 1 or 2')
        return override, 'manual-override'
    # July opens planning for the next first term; November opens second-term
    # planning. Keep Term 2 through June, including its January add/drop period.
    year = today.year if today.month >= 7 else today.year - 1
    number = 2 if today.month >= 11 or today.month < 7 else 1
    target = f'{year}-{(year + 1) % 100:02d} Term {number}'
    reference = max((n for term, n in counts.items()
                     if regular_term(term) and regular_term(term) <= (year, number)), default=0)

    def ready(term):
        not_before = config.get('termNotBefore', {}).get(term)
        if not_before and today < date.fromisoformat(not_before):
            return False
        subjects = {cid[:4] for cid, c in courses.items() if c.get('terms', {}).get(term)}
        return counts.get(term, 0) >= max(500, reference * 0.75) and len(subjects) >= 30

    if ready(target):
        return target, 'registration-window-ready'
    # Sparse/early future schedules must not change the published default.
    if previous and regular_term(previous) and counts.get(previous):
        return previous, 'retain-default-until-ready'
    candidates = [term for term in counts
                  if regular_term(term) and regular_term(term) <= (year, number)
                  and ready(term)]
    if not candidates:
        raise ValueError('No sufficiently published undergraduate planning term')
    return max(candidates, key=regular_term), 'latest-ready-fallback'


def available_terms(directory, current_term):
    _, counts, _ = inspect(directory)
    year, _ = regular_term(current_term)
    others = [term for term, count in counts.items() if count and regular_term(term)
              and regular_term(term)[0] == year and term != current_term]
    summer = f'{year}-{(year + 1) % 100:02d} Summer Session'
    return [current_term, *sorted(others, key=regular_term, reverse=True),
            *([summer] if counts.get(summer) else [])]


def update_availability(directory, current_term):
    courses, _, _ = inspect(directory)
    path = Path(directory) / 'resources/course_list.json'
    listing = json.loads(path.read_text())
    for rows in listing.values():
        for row in rows:
            row.pop('o', None)
            if courses[row['c']].get('terms', {}).get(current_term):
                row['o'] = 1
    path.write_bytes(canonical(listing))


def venue_quality(courses, term):
    quality = dict(meetings=0, namedLocation=0, toBeAnnounced=0,
                   noRoomRequired=0, multiLocationSections=0)
    for course_id, course in courses.items():
        for name, section in course.get('terms', {}).get(term, {}).items():
            locations = section['locations']
            if not locations:
                raise ValueError(f'No meeting locations in {course_id} {name}')
            normalized = set()
            for location in locations:
                if (not isinstance(location, str) or not location.strip() or
                        re.search(r'[\x00-\x1f\x7f]|<[^>]+>|^\s*(?:null|undefined)\s*$',
                                  location, re.IGNORECASE)):
                    raise ValueError(f'Malformed meeting location in {course_id} {name}')
                value = ' '.join(location.split()).casefold()
                normalized.add(value)
                quality['meetings'] += 1
                if value == 'tba':
                    quality['toBeAnnounced'] += 1
                elif value == 'no room required':
                    quality['noRoomRequired'] += 1
                else:
                    quality['namedLocation'] += 1
            if len(normalized) > 1:
                quality['multiLocationSections'] += 1
    return quality


def require_published_courses(directory, previous):
    if previous is None:
        return
    subjects = {file.stem: f'objects/{hashlib.sha256(canonical(json.loads(file.read_text()))).hexdigest()}.json'
                for file in (Path(directory) / 'courses').glob('*.json')
                if re.fullmatch('[A-Z]{4}', file.stem)}
    if subjects != previous['subjects']:
        raise ValueError('Publish-only requires the currently published course data; update the data checkout first')


def validate(directory, baseline, current_term, previous_term=None):
    new, terms, sections = inspect(directory)
    old, old_terms, old_sections = inspect(baseline)
    if not set(old).issubset(new):
        raise ValueError('Historical course IDs were lost')
    active_terms = [current_term]
    if current_term.endswith('Term 1'):
        active_terms.append(current_term[:-1] + '2')
    if previous_term and previous_term[:7] == current_term[:7]:
        active_terms.append(previous_term)
    for term in active_terms:
        if terms.get(term, 0) < old_terms.get(term, 0) * 0.95:
            raise ValueError(f'Unexpected drop in offered courses: {term}')
        if sections.get(term, 0) < old_sections.get(term, 0) * 0.95:
            raise ValueError(f'Unexpected drop in class sections: {term}')
    resources = Path(directory) / 'resources'
    listing = json.loads((resources / 'course_list.json').read_text())
    if {course['c'] for rows in listing.values() for course in rows} != set(new):
        raise ValueError('Course search index disagrees with course files')
    index = json.loads((Path(directory) / 'derived/subject_course_names.json').read_text())
    if {subject + code for subject, codes in index.items() for code in codes} != set(new):
        raise ValueError('Course ID index disagrees with course files')
    old_instructors = set(json.loads((Path(baseline) / 'resources/instructors.json').read_text()))
    if not old_instructors.issubset(json.loads((resources / 'instructors.json').read_text())):
        raise ValueError('Historical instructors were lost')
    return {'courses': len(new), 'offeredCourses': terms, 'sections': sections,
            'venueQuality': venue_quality(new, current_term)}


def get_json(s3, bucket, key):
    try:
        response = s3.get_object(Bucket=bucket, Key=key)
        return json.loads(response['Body'].read()), response['ETag']
    except s3.exceptions.NoSuchKey:
        return None, None


def publish(s3, bucket, directory, current_term, previous, previous_etag, checked_at=None):
    def upload(value):
        body = canonical(value)
        digest = hashlib.sha256(body).hexdigest()
        key = f'objects/{digest}.json'
        try:
            s3.head_object(Bucket=bucket, Key='published/' + key)
        except Exception as error:
            if error.response['ResponseMetadata']['HTTPStatusCode'] != 404:
                raise
            s3.put_object(Bucket=bucket, Key='published/' + key, Body=body,
                          ContentType='application/json; charset=utf-8',
                          CacheControl='public,max-age=31536000,immutable',
                          Metadata={'sha256': digest})
        return key

    subjects = {file.stem: upload(json.loads(file.read_text()))
                for file in sorted((Path(directory) / 'courses').glob('*.json'))
                if re.fullmatch('[A-Z]{4}', file.stem)}
    files = {'courseList': 'resources/course_list.json', 'instructors': 'resources/instructors.json',
             'faculties': 'derived/faculty_subjects.json', 'courseIds': 'derived/subject_course_names.json'}
    resources = {name: upload(json.loads((Path(directory) / file).read_text())) for name, file in files.items()}
    available = available_terms(directory, current_term)
    content = {'schemaVersion': 1, 'currentTerm': current_term, 'availableTerms': available,
               'subjects': subjects, 'resources': resources}
    version = hashlib.sha256(canonical(content)).hexdigest()
    now = datetime.now(timezone.utc).isoformat(timespec='milliseconds').replace('+00:00', 'Z')
    manifest = {**content, 'version': version, 'publishedAt': now, 'checkedAt': checked_at or now}
    changed = previous is None or previous['version'] != version
    if changed:
        s3.put_object(Bucket=bucket, Key=f'published/manifests/{version}.json',
                      Body=canonical(manifest), ContentType='application/json; charset=utf-8',
                      CacheControl='public,max-age=31536000,immutable')
    else:
        manifest['publishedAt'] = previous['publishedAt']
    # Conditional promotion prevents an older concurrent run replacing newer data.
    condition = {'IfMatch': previous_etag} if previous_etag else {'IfNoneMatch': '*'}
    s3.put_object(Bucket=bucket, Key='published/manifest.json', Body=canonical(manifest),
                  ContentType='application/json; charset=utf-8',
                  CacheControl='public,max-age=60,s-maxage=60', **condition)
    return manifest, changed


def crawl(s3, bucket, data, work, run_id, current_term, baseline_version, workers):
    sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'scraper'))
    from cuscraper import CourseScraper
    from requests.adapters import HTTPAdapter
    from urllib3.util.retry import Retry
    from bs4 import BeautifulSoup

    scraper_version = hashlib.sha256(
        Path(__file__).read_bytes() +
        (Path(__file__).resolve().parents[1] / 'scraper/cuscraper/__init__.py').read_bytes() +
        (Path(__file__).resolve().parents[1] / 'scraper/cuscraper/utils.py').read_bytes()
    ).hexdigest()
    output = work / 'crawl/catalog'
    os.chdir(work)
    local = threading.local()

    def make_scraper(label):
        cs = CourseScraper(current_term=current_term, merge_dir=str(data),
                           dirname=str(work / 'crawl'), timestamp='catalog')
        cs.log_file.close()
        cs.log_file = io.StringIO()
        cs.course_url = cs.course_url.replace('http://', 'https://')
        request = cs.sess.request

        def timed_request(method, url, **kwargs):
            kwargs.setdefault('timeout', (10, 30))
            response = request(method, url.replace('http://', 'https://'), **kwargs)
            response.raise_for_status()
            return response

        cs.sess.request = timed_request
        cs.sess.mount('https://', HTTPAdapter(max_retries=Retry(total=2, backoff_factor=1, allowed_methods=None)))
        captcha = cs.get_captcha

        def bounded_captcha(soup, manual=False):
            if manual or cs.auto_captcha_attempts >= 10:
                raise RuntimeError('Captcha retry limit exceeded')
            return captcha(soup, manual=False)

        cs.get_captcha = bounded_captcha
        return cs

    coordinator = make_scraper('coordinator')
    shutil.copytree(data / 'courses', output / 'courses', dirs_exist_ok=True)
    response = coordinator.sess.get(coordinator.course_url)
    soup = BeautifulSoup(response.text, 'html.parser')
    coordinator.code_list = [option.get('value') for option in soup.select('#ddl_subject option')[1:] if option.get('value')]
    if len(coordinator.code_list) < 100:
        raise RuntimeError('Official catalog did not return a valid subject list')
    expected = coordinator.code_list
    expected_state = {'schemaVersion': 1, 'scraperVersion': scraper_version,
                      'baselineVersion': baseline_version, 'currentTerm': current_term}
    done = []
    lock = threading.Lock()

    def subject(code):
        if not re.fullmatch('[A-Z_]{4,12}', code):
            raise ValueError('Invalid subject code')
        key = f'checkpoints/{run_id}/{code}.json'
        saved, _ = get_json(s3, bucket, key)
        if saved and all(saved.get(k) == v for k, v in expected_state.items()):
            if saved.get('subject') == code and isinstance(saved.get('courses'), list):
                (output / 'courses' / (code + '.json')).write_bytes(canonical(saved['courses']))
                with lock:
                    done.append(code)
                    print(f'Resumed {len(done)}/{len(expected)} subjects', file=sys.__stderr__, flush=True)
                return code
        if not hasattr(local, 'scraper'):
            local.scraper = make_scraper(threading.current_thread().name)
        cs = local.scraper
        last_error = None
        for attempt in range(3):
            try:
                cs.auto_captcha_attempts = 0
                cs.log_file.seek(0)
                cs.log_file.truncate()
                cs.search_subject(code)
                errors = cs.log_file.getvalue()
                if 'Error parsing course section' in errors or 'Error parsing course info' in errors:
                    raise RuntimeError(f'Incomplete parsing for {code}: {errors[-1000:]}')
                rows = json.loads((output / 'courses' / (code + '.json')).read_text())
                s3.put_object(Bucket=bucket, Key=key,
                              Body=canonical({**expected_state, 'subject': code, 'courses': rows}),
                              ContentType='application/json')
                with lock:
                    done.append(code)
                    print(f'Completed {len(done)}/{len(expected)} subjects', file=sys.__stderr__, flush=True)
                return code
            except Exception as error:
                last_error = error
                local.scraper = cs = make_scraper(f'retry-{code}-{attempt}')
        raise last_error

    with open(work / 'crawl.log', 'w') as log, contextlib.redirect_stdout(log):
        with concurrent.futures.ThreadPoolExecutor(max_workers=workers) as pool:
            completed = list(pool.map(subject, expected))
        if set(completed) != set(expected):
            raise RuntimeError('Catalog crawl is incomplete')
        coordinator.generate_stat()
    # Retain known faculty mappings when an official department was renamed.
    old = json.loads((data / 'derived/faculty_subjects.json').read_text())
    faculty_file = output / 'derived/faculty_subjects.json'
    faculties = json.loads(faculty_file.read_text())
    assigned = {code for codes in faculties.values() for code in codes}
    for faculty, codes in old.items():
        faculties.setdefault(faculty, []).extend(code for code in codes if code not in assigned)
        faculties[faculty] = sorted(set(faculties[faculty]))
    faculty_file.write_bytes(canonical(faculties))
    return output, len(expected)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--data-dir', type=Path, required=True)
    parser.add_argument('--bucket', required=True)
    parser.add_argument('--current-term')
    parser.add_argument('--run-id', default=datetime.now(timezone.utc).strftime('%Y-%m-%d'))
    parser.add_argument('--workers', type=int, default=4, choices=range(1, 7))
    parser.add_argument('--publish-only', action='store_true')
    args = parser.parse_args()
    if not re.fullmatch('[a-zA-Z0-9._-]{1,80}', args.run_id):
        parser.error('Invalid run ID')
    import boto3
    s3 = boto3.client('s3', region_name=os.environ.get('AWS_REGION', 'ap-southeast-1'))
    data = args.data_dir.resolve()
    previous, etag = get_json(s3, args.bucket, 'published/manifest.json')
    config_path = data / 'catalog-config.json'
    config = json.loads(config_path.read_text()) if config_path.exists() else {}
    if args.current_term:
        config['currentTerm'] = args.current_term
    previous_term = previous['currentTerm'] if previous else None
    current_term = config.get('currentTerm') or previous_term or select_term(data, config)[0]
    if args.publish_only:
        require_published_courses(data, previous)
    with tempfile.TemporaryDirectory(prefix='cutopia-catalog-') as temporary:
        work = Path(temporary)
        output, count = (data, 0) if args.publish_only else crawl(
            s3, args.bucket, data, work, args.run_id, current_term,
            previous['version'] if previous else None, args.workers)
        current_term, selection_reason = select_term(output, config, previous_term)
        summary = validate(output, data, current_term, previous_term)
        update_availability(output, current_term)
        manifest, changed = publish(s3, args.bucket, output, current_term, previous, etag,
                                    previous['checkedAt'] if args.publish_only and previous else None)
        if output != data:
            for name in ('courses', 'derived', 'resources'):
                shutil.copytree(output / name, data / name, dirs_exist_ok=True)
        report = {**summary, 'subjectsChecked': count, 'version': manifest['version'],
                  'checkedAt': manifest['checkedAt'], 'changed': changed, 'runId': args.run_id,
                  'currentTerm': current_term, 'availableTerms': manifest['availableTerms'],
                  'termSelection': selection_reason, 'publicationMode': 'publish-only' if args.publish_only else 'full-crawl'}
        (data / 'last-update.json').write_text(json.dumps(report, indent=2) + '\n')
        print(json.dumps(report, indent=2))


if __name__ == '__main__':
    main()
