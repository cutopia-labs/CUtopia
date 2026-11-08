/** @jest-environment jsdom */
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { observable, runInAction } from 'mobx';

import SearchPanel, { SearchResult } from './SearchPanel';

jest.mock(
  '../../styles/components/organisms/SearchPanel.module.scss',
  () => ({})
);
jest.mock('../../config', () => ({ MAX_SEARCH_RESULT_LENGTH: 40 }));
jest.mock('../../helpers', () => ({
  objStrEqual: (a, b) => JSON.stringify(a) === JSON.stringify(b),
  validCourse: () => false,
}));
jest.mock('../../hooks/useMobileQuery', () => () => false);
jest.mock('next/router', () => ({
  useRouter: () => ({ pathname: '/planner', query: {}, replace: jest.fn() }),
}));
jest.mock('../../store', () => ({
  useUser: () => ({ searchHistory: [], favoriteCourses: [] }),
  useData: () => mockData,
}));
jest.mock('../atoms/Loading', () => () => <span>Loading results</span>);
jest.mock('../atoms/Card', () => ({ children }) => <div>{children}</div>);
jest.mock('../molecules/ListItem', () => ({ title, onClick }) => (
  <button onClick={onClick}>{title}</button>
));
jest.mock('../molecules/ErrorCard', () => () => <span>No results</span>);
jest.mock('../molecules/ChipsRow', () => () => null);
jest.mock('../planner/CourseSectionCard', () => () => null);
jest.mock('../planner/PlannerEmptyState', () => () => null);

const user = {} as any;
const payload = { mode: 'subject', text: 'AIST', showAvalibility: true } as any;
let mockData;

describe('Planner search semester availability', () => {
  beforeEach(() => {
    mockData = observable(
      {
        catalogVersion: 'first',
        searchCourses: jest
          .fn()
          .mockResolvedValue([{ c: 'AIST1000', t: 'Introduction', o: 1 }]),
      },
      { searchCourses: false }
    );
  });

  it('re-evaluates displayed results when the published catalog changes', async () => {
    render(
      <SearchResult searchPayload={payload} user={user} data={mockData} />
    );
    await screen.findByRole('button', { name: 'AIST1000' });
    mockData.searchCourses.mockResolvedValue([
      { c: 'AIST1000', t: 'Introduction' },
    ]);
    runInAction(() => {
      mockData.catalogVersion = 'second';
    });
    await waitFor(() => {
      expect(screen.queryByRole('button', { name: 'AIST1000' })).toBeNull();
      expect(screen.getByText('AIST1000').closest('.disabled')).toBeTruthy();
    });
  });

  it('ignores an older search response that arrives after a newer one', async () => {
    let resolveOld;
    mockData.searchCourses.mockReturnValueOnce(
      new Promise(resolve => (resolveOld = resolve))
    );
    const { rerender } = render(
      <SearchResult searchPayload={payload} user={user} data={mockData} />
    );
    mockData.searchCourses.mockResolvedValue([
      { c: 'CSCI1000', t: 'Computing', o: 1 },
    ]);
    rerender(
      <SearchResult
        searchPayload={{ ...payload, text: 'CSCI' }}
        user={user}
        data={mockData}
      />
    );
    await screen.findByRole('button', { name: 'CSCI1000' });
    resolveOld([{ c: 'AIST1000', t: 'Introduction', o: 1 }]);
    await waitFor(() => expect(screen.queryByText('AIST1000')).toBeNull());
  });

  it('applies planner availability to an initial search supplied by another component', async () => {
    render(
      <SearchPanel searchPayloadProp={{ mode: 'subject', text: 'AIST' }} />
    );
    await screen.findByRole('button', { name: 'AIST1000' });
    expect(mockData.searchCourses).toHaveBeenCalledWith(
      expect.objectContaining({
        payload: expect.objectContaining({
          showAvalibility: true,
          offerredOnly: true,
        }),
      })
    );
  });
});
