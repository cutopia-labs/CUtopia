import { useState } from 'react';

// Follow published defaults until the user makes an explicit choice. A catalog
// refresh must not replace that choice; navigating to another course resets it.
const usePlanningTerm = (courseId: string, defaultTerm: string) => {
  const [choice, setChoice] = useState<{ courseId: string; term: string }>();
  const term = choice?.courseId === courseId ? choice.term : defaultTerm;
  return [
    term,
    (selectedTerm: string) => setChoice({ courseId, term: selectedTerm }),
  ] as const;
};

export default usePlanningTerm;
