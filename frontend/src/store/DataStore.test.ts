/** @jest-environment jsdom */
import { getCatalogManifest, getCatalogObject } from '../helpers/catalog';
import DataStore from './DataStore';

jest.mock('../config', () => ({
  CURRENT_TERM: '2026-27 Term 1',
  plannerTerms: ['2026-27 Term 1', '2026-27 Term 2'],
  DATA_CONFIGS: { courseList: { expire: 0, fetchKey: 'course_list' } },
}));
jest.mock('../helpers/catalog');
jest.mock('../helpers/data', () => ({}));

const manifest = {
  version: 'second-version',
  currentTerm: '2026-27 Term 2',
  availableTerms: ['2026-27 Term 2', '2026-27 Term 1'],
  resources: { courseList: 'second-index' },
  checkedAt: '2026-11-07T00:00:00Z',
};
const first = { AIST: [{ c: 'AIST1000', t: 'First term', o: 1 }] };
const second = { AIST: [{ c: 'AIST1000', t: 'First term' }] };

describe('Semester and availability snapshot', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    localStorage.clear();
  });

  it('changes the default semester only when its matching availability index arrives', async () => {
    const store = new DataStore();
    store.saveData(first, 'courseList', 'first-index');
    (getCatalogManifest as jest.Mock).mockResolvedValue(manifest);
    let resolveIndex;
    (getCatalogObject as jest.Mock).mockReturnValue(
      new Promise(resolve => (resolveIndex = resolve))
    );
    const pending = store.getRemoteData('courseList');
    await Promise.resolve();
    expect(store.currentTerm).toBe('2026-27 Term 1');
    expect(store.courseList.AIST[0].o).toBe(1);
    resolveIndex(second);
    await pending;
    expect(store.currentTerm).toBe('2026-27 Term 2');
    expect(store.courseList.AIST[0].o).toBeUndefined();
    expect(store.catalogVersion).toBe('second-version');
  });

  it('retains a coherent previous semester if the new index cannot load', async () => {
    const store = new DataStore();
    store.saveData(first, 'courseList', 'first-index');
    (getCatalogManifest as jest.Mock).mockResolvedValue(manifest);
    (getCatalogObject as jest.Mock).mockRejectedValue(new Error('offline'));
    await expect(store.getRemoteData('courseList')).rejects.toThrow('offline');
    expect(store.currentTerm).toBe('2026-27 Term 1');
    expect(store.courseList.AIST[0].o).toBe(1);
    expect(store.catalogVersion).toBe('');
  });

  it('never trusts unversioned build-time availability when the catalog is unavailable', async () => {
    const store = new DataStore();
    store.saveData(first, 'courseList');
    (getCatalogManifest as jest.Mock).mockResolvedValue(null);
    global.fetch = jest.fn().mockResolvedValue({ json: async () => first });
    const result = await store.getRemoteData('courseList');
    expect(result.AIST[0].o).toBeUndefined();
    expect(result.AIST[0].t).toBe('First term');
  });
});
