/** @jest-environment jsdom */
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { useQuery } from '@apollo/client';

import CourseSectionCard from './CourseSectionCard';

jest.mock('@apollo/client', () => ({ useQuery: jest.fn() }));
jest.mock('mobx-react-lite', () => ({ observer: component => component }));
jest.mock('../../constants/queries', () => ({ COURSE_PLANNER_INFO_QUERY: {} }));
jest.mock('../../helpers', () => ({ validCourse: () => true }));
jest.mock('../../store', () => ({
  useView: () => ({ handleError: jest.fn() }),
}));
jest.mock('../atoms/Loading', () => ({
  __esModule: true,
  default: () =>
    require('react').createElement('span', null, 'Loading metadata'),
}));
jest.mock('../review/CourseCard', () => ({
  __esModule: true,
  default: ({ courseInfo }) => {
    const [term, select] = require('../../hooks/usePlanningTerm').default(
      courseInfo.courseId,
      '2026-27 Term 2'
    );
    return require('react').createElement(
      'button',
      { onClick: () => select('2026-27 Term 1') },
      `${courseInfo.courseId}: ${term}`
    );
  },
}));

const query = useQuery as jest.Mock;
const metadata = { course: { courseId: 'TEST1000', title: 'Course' } };

describe('Planner card catalog refresh', () => {
  it('keeps the manual semester selection while invalidated metadata refetches', () => {
    query.mockReturnValue({ data: metadata, loading: false });
    const { rerender } = render(<CourseSectionCard courseId="TEST1000" />);
    fireEvent.click(screen.getByRole('button'));
    query.mockReturnValue({
      data: undefined,
      previousData: metadata,
      loading: true,
    });
    rerender(<CourseSectionCard courseId="TEST1000" />);
    expect(screen.getByRole('button').textContent).toBe(
      'TEST1000: 2026-27 Term 1'
    );
    query.mockReturnValue({
      data: metadata,
      previousData: metadata,
      loading: false,
    });
    rerender(<CourseSectionCard courseId="TEST1000" />);
    expect(screen.getByRole('button').textContent).toBe(
      'TEST1000: 2026-27 Term 1'
    );
  });

  it('does not display another course from previous query data during navigation', () => {
    query.mockReturnValue({
      data: undefined,
      previousData: metadata,
      loading: true,
    });
    render(<CourseSectionCard courseId="TEST2000" />);
    expect(screen.getByText('Loading metadata')).toBeTruthy();
    expect(screen.queryByRole('button')).toBeNull();
  });
});
