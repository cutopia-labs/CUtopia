import fs from 'fs';
import path from 'path';

import AWS from 'aws-sdk';
import { CatalogManifest, Course, ErrorCode } from 'cutopia-types';

const s3 = new AWS.S3({ maxRetries: 2, httpOptions: { timeout: 8000 } });
const MAX_AGE = 60000;
const OBJECT_KEY = /^objects\/[a-f0-9]{64}\.json$/;
const manifests = new Map<string, CatalogManifest>();
const subjects = new Map<string, Record<string, Course>>();
const pending = new Map<string, Promise<any>>();
let latest: CatalogManifest;
let checkedAt = 0;

const read = async (key: string) => {
  const result = await s3
    .getObject({ Bucket: process.env.CATALOG_BUCKET, Key: `published/${key}` })
    .promise();
  return JSON.parse(result.Body.toString('utf8'));
};

export const validateManifest = (value: CatalogManifest) => {
  if (
    value?.schemaVersion !== 1 ||
    !/^[a-f0-9]{64}$/.test(value.version) ||
    !value.subjects ||
    !value.resources ||
    !Array.isArray(value.availableTerms) ||
    !value.availableTerms.includes(value.currentTerm) ||
    !['courseList', 'instructors', 'faculties', 'courseIds'].every(key =>
      OBJECT_KEY.test(value.resources[key])
    ) ||
    !Object.keys(value.subjects).every(subject => /^[A-Z]{4}$/.test(subject)) ||
    !Object.values({ ...value.subjects, ...value.resources }).every(key =>
      OBJECT_KEY.test(key)
    )
  ) {
    throw new Error('Invalid catalog manifest');
  }
  return value;
};

export const getCatalogManifest = async (version?: string) => {
  if (!process.env.CATALOG_BUCKET) return null;
  if (version && !/^[a-f0-9]{64}$/.test(version)) {
    throw new Error('Invalid catalog version');
  }
  if (version && manifests.has(version)) return manifests.get(version);
  if (!version && latest && Date.now() - checkedAt < MAX_AGE) return latest;
  const key = version ? `manifests/${version}.json` : 'manifest.json';
  if (!pending.has(key)) {
    pending.set(
      key,
      read(key)
        .then(value => {
          const manifest = validateManifest(value);
          if (version && manifest.version !== version) {
            throw new Error('Catalog version mismatch');
          }
          if (manifests.size >= 4)
            manifests.delete(manifests.keys().next().value);
          manifests.set(manifest.version, manifest);
          if (!version) {
            latest = manifest;
            checkedAt = Date.now();
          }
          return manifest;
        })
        .catch(error => {
          // An existing valid snapshot remains usable during a transient outage.
          if (!version && latest) return latest;
          throw error;
        })
        .finally(() => pending.delete(key))
    );
  }
  return pending.get(key) as Promise<CatalogManifest>;
};

export const readCatalogCourse = async (
  courseId: string,
  manifest?: CatalogManifest
): Promise<Course> => {
  const subject = courseId.slice(0, 4);
  const selected = manifest || (await getCatalogManifest());
  const key = selected?.subjects[subject];
  if (selected && !key) throw Error(ErrorCode.INVALID_COURSE_ID.toString());
  const cacheKey = key || subject;
  if (!subjects.has(cacheKey)) {
    if (!pending.has(cacheKey)) {
      pending.set(
        cacheKey,
        (key
          ? read(key)
          : Promise.resolve(
              JSON.parse(
                fs.readFileSync(
                  path.join(__dirname, '../data/courses', `${subject}.json`),
                  'utf8'
                )
              )
            )
        )
          .then(rows => {
            if (!Array.isArray(rows))
              throw new Error('Invalid catalog subject');
            const courses = Object.fromEntries(
              rows.map(course => [
                subject + course.code,
                { ...course, courseId: subject + course.code },
              ])
            );
            if (subjects.size >= 64)
              subjects.delete(subjects.keys().next().value);
            subjects.set(cacheKey, courses);
            return courses;
          })
          .finally(() => pending.delete(cacheKey))
      );
    }
    await pending.get(cacheKey);
  }
  const course = subjects.get(cacheKey)?.[courseId];
  if (!course) throw Error(ErrorCode.INVALID_COURSE_ID.toString());
  return course;
};

export const validateCourseIds = async (
  input: unknown,
  manifest?: CatalogManifest
) => {
  if (!input || typeof input !== 'object') return;
  if (Array.isArray(input)) {
    await Promise.all(input.map(value => validateCourseIds(value, manifest)));
    return;
  }
  for (const [key, value] of Object.entries(input)) {
    if (
      (key === 'courseId' || key === 'requiredCourse') &&
      typeof value === 'string'
    ) {
      await readCatalogCourse(value, manifest);
    } else if (value && typeof value === 'object') {
      await validateCourseIds(value, manifest);
    }
  }
};
