# CUtopia reliability and releases

## What to measure

Start with a rolling 28-day internal SLO. Establish the baseline before making
an external SLA commitment. Count requests that receive an unexpected GraphQL
error even when HTTP status is 200. Keep expected application errors, such as
incorrect passwords and invalid course IDs, separate from service failures.

| Journey | Initial target | Measurement |
| --- | --- | --- |
| Read a course timetable | 99.9% successful, p95 under 2 seconds | HTTP status, GraphQL response, CDN version and sections |
| Login and save a timetable | 99.5% successful, p95 under 3 seconds | GraphQL outcomes and synthetic checks with a dedicated account |
| Course freshness | Full crawl within 36 hours, expected daily | Published `checkedAt`, not `publishedAt` |
| Course quality | No malformed venues or search/schedule disagreement | Publication validation, venue counts and live read checks |

Use CloudWatch Lambda `Errors` and API Gateway `5XXError` for transport/runtime
failures. Use `graphql_request` structured logs for `database_unavailable` and
`server_error` returned by resolvers. Log `course_reviews_unavailable` as degraded
optional data. Include failed Lambda requests in the denominator even when no
GraphQL response log was emitted. These are aggregate signals; a multi-field
GraphQL request can contain both data and an error. Use the named course probe
to measure the timetable journey independently. Alert when two consecutive
checks fail, or after several database failures in a short window. Keep alerts
actionable by linking the run, deployment revision and failing journey.

The 7-day Lambda baseline on 13 November 2026 was 14 errors in 4,148
invocations (99.66% free of a Lambda runtime error). This metric does not
measure GraphQL resolver errors, browser availability, or an external SLA.

## Release path

1. Open an issue with the user impact, a reproduction and the acceptance check.
   For feedback, start with read-only aggregates from MongoDB `reports` and
   keep student identifiers and original report text out of public issues.
2. Make a focused PR to `dev`. Run type checks and tests for affected packages.
   Run MongoDB tests only on a disposable local database or an isolated staging
   database. Exercise a rejected connection, a successful later request,
   expired verification recovery and multi-venue classes when relevant.
3. Build the candidate and record the commit and artifact checksums. Deploy to
   staging first. Verify cached and cold course reads, CORS including 304,
   the empty term case, login error handling and account recovery. Use an
   owned test mailbox for real email acceptance. Exercise a missing database
   in a local integration test to avoid breaking the shared staging service.
4. Deploy compatible backend changes before the frontend that calls them.
   Keep the previous artifacts available. For Lambda updates check code hashes
   and update status, and retain the existing signing keys and environment.
   Publish course data separately through the data repository workflow.
5. Check production from the public site and API. Confirm the release hash,
   the same course snapshot across search and sections, and a representative
   multi-venue section. Watch errors and latency for at least 30 minutes and
   review again after 24 hours. For a failed app release, restore its last
   accepted artifact. For a bad data release, restore the last accepted
   immutable manifest with a conditional S3 write.

## Known limits and next steps

- Stop logging database connection strings and request variables before
  rotating credentials. Rotate the affected Atlas database users with overlap,
  deploy the replacement credentials to all consumers, verify the new users,
  and revoke the old users. Historical logs need restricted access and a
  retention decision. Avoid deleting incident evidence as part of an app deploy.
- Staging and production need separate DB users and credentials, and isolated
  email testing. Plan a tested migration from the deprecated Node.js 14 Lambda
  runtime and versioned aliases for more reliable rollback. Do this separately
  from application logic changes so failures can be attributed correctly.
- Timetable document writes and account references are currently separate
  operations. The write order avoids creating dangling pointers when the
  timetable insert fails. Full transactional guarantees and an idempotent
  reconciliation for historical references remain follow-up work.
- Catalog venue names are preserved from the public CUHK timetable. A named
  venue can be checked against the official directory, but directory existence
  alone does not establish the date-specific booking. `TBA` and `No Room
  Required` are valid source values. Do not infer or substitute a room.
