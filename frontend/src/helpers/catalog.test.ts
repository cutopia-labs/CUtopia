/** @jest-environment jsdom */
export {};

describe('Browser catalog versioning', () => {
  let catalog;
  let fetchMock;
  const key = `objects/${'a'.repeat(64)}.json`;
  const manifest = {
    schemaVersion: 1,
    version: 'a'.repeat(64),
    currentTerm: '2026-27 Term 1',
    availableTerms: ['2026-27 Term 1', '2026-27 Term 2'],
    subjects: { TEST: key },
    resources: {
      courseList: key,
      instructors: key,
      faculties: key,
      courseIds: key,
    },
  };

  beforeEach(() => {
    jest.resetModules();
    localStorage.clear();
    fetchMock = jest
      .fn()
      .mockResolvedValue({ ok: true, json: async () => manifest });
    global.fetch = fetchMock;
    catalog = require('./catalog');
  });

  it('uses the published version instead of a build timestamp', async () => {
    const changed = jest.fn();
    window.addEventListener('catalog-updated', changed);
    expect((await catalog.getCatalogManifest()).version).toBe(manifest.version);
    await catalog.getCatalogManifest();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(changed).toHaveBeenCalledTimes(1);
    window.removeEventListener('catalog-updated', changed);
  });

  it('keeps a valid persisted snapshot when the network is unavailable', async () => {
    localStorage.setItem('catalogManifest', JSON.stringify(manifest));
    fetchMock.mockRejectedValue(new Error('offline'));
    expect((await catalog.getCatalogManifest()).version).toBe(manifest.version);
  });

  it('blocks fetching arbitrary URLs or traversing object paths', async () => {
    await expect(catalog.getCatalogObject('../secret')).rejects.toThrow();
    await expect(
      catalog.getCatalogObject('https://example.com')
    ).rejects.toThrow();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('constructs links for courses absent from generated static paths', () => {
    expect(catalog.courseHref('TEST9999')).toBe('/course?courseId=TEST9999');
  });
});
