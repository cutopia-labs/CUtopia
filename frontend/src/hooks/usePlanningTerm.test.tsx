/** @jest-environment jsdom */
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

import usePlanningTerm from './usePlanningTerm';

const Picker = ({ courseId, defaultTerm }) => {
  const [term, select] = usePlanningTerm(courseId, defaultTerm);
  return (
    <>
      <span data-testid="term">{term}</span>
      <button onClick={() => select('2026-27 Term 1')}>
        Select first term
      </button>
    </>
  );
};

describe('Planning semester selection', () => {
  it('follows the published default when the manifest arrives after rendering', () => {
    const { rerender } = render(
      <Picker courseId="TEST1000" defaultTerm="2026-27 Term 1" />
    );
    rerender(<Picker courseId="TEST1000" defaultTerm="2026-27 Term 2" />);
    expect(screen.getByTestId('term').textContent).toBe('2026-27 Term 2');
  });

  it('keeps an explicit selection when the catalog default changes', () => {
    const { rerender } = render(
      <Picker courseId="TEST1000" defaultTerm="2026-27 Term 2" />
    );
    fireEvent.click(screen.getByText('Select first term'));
    rerender(<Picker courseId="TEST1000" defaultTerm="2027-28 Term 1" />);
    expect(screen.getByTestId('term').textContent).toBe('2026-27 Term 1');
  });

  it('uses the default for a different course rather than inheriting its predecessor selection', () => {
    const { rerender } = render(
      <Picker courseId="TEST1000" defaultTerm="2026-27 Term 2" />
    );
    fireEvent.click(screen.getByText('Select first term'));
    rerender(<Picker courseId="TEST2000" defaultTerm="2026-27 Term 2" />);
    expect(screen.getByTestId('term').textContent).toBe('2026-27 Term 2');
  });
});
