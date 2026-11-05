import type { CatalogManifest } from 'cutopia-types';

const base = process.env.NEXT_PUBLIC_CATALOG_URL || 'https://data.cutopia.app';
const objectKey = /^objects\/[a-f0-9]{64}\.json$/;
let latest: CatalogManifest;
let checkedAt = 0;
let pending: Promise<CatalogManifest>;
const objects = new Map<string, Promise<any>>();

export const isCatalogManifest = (value: CatalogManifest) =>
  value?.schemaVersion === 1 &&
  /^[a-f0-9]{64}$/.test(value.version) &&
  typeof value.currentTerm === 'string' &&
  Array.isArray(value.availableTerms) &&
  !!value.subjects &&
  !!value.resources &&
  value.availableTerms.includes(value.currentTerm) &&
  ['courseList', 'instructors', 'faculties', 'courseIds'].every(key =>
    objectKey.test(value.resources[key])
  ) &&
  Object.keys(value.subjects).every(subject => /^[A-Z]{4}$/.test(subject)) &&
  Object.values({ ...value.subjects, ...value.resources }).every(key =>
    objectKey.test(key)
  );

const fetchJSON = async (key: string) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const response = await fetch(`${base}/${key}`, {
      signal: controller.signal,
    });
    if (!response.ok)
      throw new Error('Course catalog is temporarily unavailable');
    return await response.json();
  } finally {
    clearTimeout(timeout);
  }
};

export const getCatalogManifest = async (
  force = false
): Promise<CatalogManifest> => {
  if (typeof window === 'undefined') return null;
  if (!latest) {
    try {
      const saved = JSON.parse(localStorage.getItem('catalogManifest'));
      if (isCatalogManifest(saved)) latest = saved;
    } catch (_) {
      // A missing or corrupt browser cache is replaced by the published catalog.
    }
  }
  if (!force && latest && Date.now() - checkedAt < 60000) return latest;
  if (!pending) {
    pending = fetchJSON('manifest.json')
      .then(value => {
        if (!isCatalogManifest(value))
          throw new Error('Invalid course catalog');
        const previous = latest?.version;
        latest = value;
        checkedAt = Date.now();
        try {
          localStorage.setItem('catalogManifest', JSON.stringify(value));
        } catch (_) {
          // Browsing also works when persistent storage is unavailable.
        }
        if (previous !== latest.version) {
          window.dispatchEvent(
            new CustomEvent('catalog-updated', { detail: value })
          );
        }
        return latest;
      })
      .catch(() => {
        checkedAt = Date.now();
        return latest || null;
      })
      .finally(() => {
        pending = null;
      });
  }
  return pending;
};

export const getCatalogObject = async (key: string) => {
  if (!objectKey.test(key)) throw new Error('Invalid catalog object');
  if (!objects.has(key)) {
    if (objects.size >= 12) objects.delete(objects.keys().next().value);
    objects.set(
      key,
      fetchJSON(key).catch(error => {
        objects.delete(key);
        throw error;
      })
    );
  }
  return objects.get(key);
};

export const getCatalogCourse = async (courseId: string) => {
  if (!/^[A-Z]{4}[0-9]{4}$/.test(courseId))
    throw new Error('Invalid course ID');
  const manifest = await getCatalogManifest();
  if (!manifest) return null;
  const key = manifest.subjects[courseId.slice(0, 4)];
  if (!key) throw new Error('Course not found');
  const rows = await getCatalogObject(key);
  if (!Array.isArray(rows)) throw new Error('Invalid catalog subject');
  const course = rows.find(row => row.code === courseId.slice(4));
  if (!course) throw new Error('Course not found');
  return {
    ...course,
    courseId,
    assessments: Object.entries(course.assessments || {}).map(
      ([name, percentage]) => ({ name, percentage })
    ),
  };
};

export const courseHref = (courseId: string) =>
  `/course?courseId=${encodeURIComponent(courseId)}`;
