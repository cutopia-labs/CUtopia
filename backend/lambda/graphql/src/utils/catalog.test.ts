jest.mock('aws-sdk', () => ({
  __esModule: true,
  default: { S3: jest.fn() },
}));

const object = (letter: string) => `objects/${letter.repeat(64)}.json`;
const manifest = (letter: string) => ({
  schemaVersion: 1,
  version: letter.repeat(64),
  currentTerm: '2026-27 Term 1',
  availableTerms: ['2026-27 Term 1', '2026-27 Term 2'],
  subjects: { TEST: object(letter) },
  resources: {
    courseList: object('c'),
    instructors: object('d'),
    faculties: object('e'),
    courseIds: object('f'),
  },
});

describe('Runtime catalog snapshots', () => {
  let catalog;
  let files;

  beforeEach(() => {
    jest.resetModules();
    process.env.CATALOG_BUCKET = 'unit-test';
    files = {
      'published/manifest.json': manifest('a'),
      [`published/${object('a')}`]: [{ code: '1000', title: 'Original' }],
      [`published/${object('b')}`]: [{ code: '1000', title: 'Updated' }],
    };
    const AWS = require('aws-sdk').default;
    AWS.S3.mockImplementation(() => ({
      getObject: ({ Key }) => ({
        promise: async () => {
          if (!(Key in files)) throw new Error('Missing object');
          return { Body: Buffer.from(JSON.stringify(files[Key])) };
        },
      }),
    }));
    catalog = require('./catalog');
  });

  afterEach(() => {
    delete process.env.CATALOG_BUCKET;
    jest.restoreAllMocks();
  });

  it('refreshes data in a warm process without mixing catalog versions', async () => {
    const now = jest.spyOn(Date, 'now').mockReturnValue(100000);
    const original = await catalog.getCatalogManifest();
    expect((await catalog.readCatalogCourse('TEST1000', original)).title).toBe(
      'Original'
    );
    files['published/manifest.json'] = manifest('b');
    now.mockReturnValue(161000);
    const current = await catalog.getCatalogManifest();
    expect((await catalog.readCatalogCourse('TEST1000', current)).title).toBe(
      'Updated'
    );
    expect((await catalog.readCatalogCourse('TEST1000', original)).title).toBe(
      'Original'
    );
  });

  it('rejects unknown course IDs before a mutation can use them', async () => {
    await expect(
      catalog.validateCourseIds({ input: { courseId: 'TEST9999' } })
    ).rejects.toThrow();
    await expect(
      catalog.validateCourseIds({ entries: [{ courseId: 'TEST1000' }] })
    ).resolves.toBeUndefined();
  });

  it('rejects path traversal and arbitrary URLs in a manifest', () => {
    expect(() =>
      catalog.validateManifest({
        ...manifest('a'),
        subjects: { TEST: 'https://example.com' },
      })
    ).toThrow();
    expect(() =>
      catalog.validateManifest({ ...manifest('a'), resources: {} })
    ).toThrow();
  });

  it('retains the last valid manifest during a temporary storage outage', async () => {
    const now = jest.spyOn(Date, 'now').mockReturnValue(100000);
    const original = await catalog.getCatalogManifest();
    delete files['published/manifest.json'];
    now.mockReturnValue(161000);
    expect(await catalog.getCatalogManifest()).toEqual(original);
  });
});
