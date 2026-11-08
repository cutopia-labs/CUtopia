# Daily course catalog

The data repository runs `workflow.yml` daily at 04:23 Hong Kong time and supports
manual runs. Application code and the scraper are pinned to reviewed revisions.
GitHub concurrency serializes complete runs; four bounded crawler workers fetch
subjects, with HTTPS, request timeouts, bounded captcha attempts and retries.

The publisher uses GitHub OIDC and a role limited to the catalog bucket. No Atlas,
SMTP or application deployment credentials are needed. Checkpoints are private
under `checkpoints/<run-id>/`; only `published/` is accessible through CloudFront.
Checkpoints expire after 14 days. Use the failed workflow run ID as `resume_run`
to restore validated subjects with matching scraper, term and baseline versions.

Every successful crawl validates directory membership, historical identifiers and
instructors, indexes, meeting arrays and unexpected offering reductions. Errors
prevent promotion. Content-addressed objects are uploaded first, an immutable
manifest second, then a conditional write promotes `manifest.json`. An unchanged
catalog only advances its check timestamp. Daily updates never deploy the app.

Browser and backend caches pin a manifest version. Public objects are immutable;
the current manifest has a 60-second CDN TTL. The browser checks again on focus
and every five minutes while visible. Saved timetables are not overwritten.
Course links use `/course?courseId=...`, which can display newly discovered courses
without generating another static page. Existing static URLs remain supported.

## Operations and cost

The full crawl takes longer than a single Lambda invocation and uses native OCR
dependencies. A scheduled standard GitHub runner keeps that work out of AWS
compute. GitHub's public-repository runners are
[free](https://docs.github.com/en/actions/concepts/billing-and-usage).
GitHub concurrency supplies the run lock; S3 subject checkpoints supply resume
state, so this job needs no database table or separate lock service.

The deployed CloudFront distribution uses the
[Free flat-rate plan](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/flat-rate-pricing-plan.html),
currently including 1 million requests and 100 GB transfer monthly. AWS sends
usage notifications at 50%, 80% and 100%; exceeding the allowance can reduce
performance without an overage charge. S3 storage and requests, and existing
GraphQL usage, are separate from the CDN price. The approximately 31 MB catalog,
content deduplication and checkpoint expiration keep the new S3 footprint small;
check actual billing after the first month rather than assuming all AWS usage is
free. No paid CDN plan, scheduled Lambda or always-on server is provisioned.

For routine maintenance:

- Check the latest workflow result and `https://data.cutopia.app/manifest.json`.
  `checkedAt` advances after every successful full crawl, even with unchanged
  course content. GitHub may delay scheduled runs; 04:23 is a target start time.
- If a run fails, inspect its logs and dispatch the workflow with its run ID in
  `resume_run`. A changed scraper, term or published baseline invalidates old
  checkpoints and starts those subjects again.
- The default planning term follows the undergraduate registration policy below.
  `catalog-config.json` can impose an official `termNotBefore` release date or
  explicitly pin `currentTerm` during an exceptional registration arrangement.
  Keep the publisher commit pinned when changing application code.
- Application releases still use the normal deployment process. Daily data
  commits have no permission to deploy application code or change user records.

## Setup

Deploy `backend/catalog-storage.yaml` in Singapore and `backend/catalog-cdn.yaml`
in `us-east-1`. Both templates preserve the storage bucket on replacement/deletion;
the CDN uses a Free pricing subscription. Set `CATALOG_BUCKET` on the GraphQL
functions. The frontend defaults to `https://data.cutopia.app` and supports a
build-time `NEXT_PUBLIC_CATALOG_URL` override.

Install this workflow in `cutopia-labs/cuhk-course-data/.github/workflows/` and set:

- `CATALOG_UPDATER_REF`: immutable CUtopia commit containing this CLI.
- `CATALOG_PUBLISHER_ROLE`: role ARN from the storage stack.
- `CATALOG_BUCKET`: bucket name from the storage stack.

With no explicit `currentTerm` pin, the publisher chooses the default from
validated schedules using Hong Kong dates:

- July–October targets that academic year's Term 1; November–June targets Term 2.
  These are conservative planning windows, not assertions that registration is
  already open. They prevent preloaded next-year schedules from taking over.
- A target must have at least 500 offered courses across 30 subjects and at
  least 75% of the largest regular-semester course count up to that target.
  Sparse or incomplete schedules retain the previous default.
- `termNotBefore` can delay a specific semester until its verified official
  release date. For 2026–27 Term 2 this is 4 November 2026, per the
  [RES registration announcement](https://www.res.cuhk.edu.hk/undergraduate-students/information-for-current-students/course-selection-and-add-drop/course-registration-and-add-drop-for-the-second-term-2026-27/).
- Only undergraduate Term 1/Term 2 participate in automatic selection. Summer
  remains an explicit picker option when data exists. Programme-specific Term
  3/4, medical academic-year labels, and unknown labels such as Winter never
  become the default by string sorting.

The previous regular semester remains selectable. A user's explicit picker
choice survives a default change, and saved timetables are not rewritten.
The course-search availability flags are rebuilt for the selected default.
Every successful run commits its report, preserving an auditable freshness
history even when course content has not changed.

## Automated delivery checks

The daily job verifies its exact published version through the public CDN after
recording the crawl. CDN propagation is allowed up to seven attempts. A separate
`health-workflow.yml`, installed as `catalog-health.yml` in the data repository,
checks delivery every six hours, even if the crawler fails before publication.
It requires only public HTTP reads and GitHub `contents: read`; it uses no AWS
credentials, crawler dependencies, database writes or application deployments.

The check fails when the last **full crawl** is over 36 hours old, browser CORS
fails (including conditional HTTP 304 cache revalidation), an immutable object has the wrong hash, sampled search availability differs
from schedules, or the version-pinned production API returns different course
sections. It samples five subjects including ACCT, CSCI, ECON, ENGG and MATH when
offered, plus an inactive course (preferably from AIST) whose API sections must
also be absent for the default semester. `publish_only` cannot disguise stale
data by changing `checkedAt`.
Failures appear as failed GitHub Actions runs; repository notification settings
control who receives GitHub's failure notifications. This is detection, not a
guarantee against GitHub scheduling or university website outages. The next daily
run retries a full crawl automatically; manual checkpoint resume remains
available for faster recovery. Successful data commits also keep the public
repository active, avoiding GitHub's 60-day inactivity suspension while updates
remain healthy. Check workflow activity if the repository has had no successful
updates for an extended period.

Run the same read-only delivery check locally with `python tools/catalog/check.py`.

Dispatch with `publish_only=true` to reapply the policy to the currently
published dataset without another crawl or app deployment. This refuses a stale
course checkout and preserves the last actual crawl's `checkedAt` timestamp.

## Run and test

```sh
python -m pip install -r tools/catalog/requirements.txt
python -m unittest discover -s tools/catalog -p 'test_*.py'
python tools/catalog/refresh.py --data-dir data --bucket BUCKET --run-id RUN_ID
```

To seed from an already validated dataset, add `--publish-only --current-term TERM`.
To roll back, read the desired immutable manifest under `published/manifests/`,
then replace the current manifest with a conditional write against its latest
ETag. Keep `version` and all referenced object keys intact. Update the CLI pin
only after tests pass. Inspect `last-update.json` for the last successful check;
the app keeps its last usable data during transient fetch failures.
