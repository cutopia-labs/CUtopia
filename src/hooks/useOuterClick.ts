import { useEffect, useRef } from 'react';

const useOuterClick = (
  callback: (e: MouseEvent) => any,
  skip?: boolean,
  ignoredClassNames?: Set<string>
) => {
  const callbackRef = useRef(null);
  const innerRef = useRef(null);

  useEffect(() => {
    callbackRef.current = callback;
  });

  useEffect(() => {
    const handleClick = (e) => {
      if (skip) {
        return;
      }
      if (ignoredClassNames && typeof e.target?.className === 'string') {
        for (const name of (e.target.className as string).split(' ')) {
          console.log(`Checking name ${name}`);
          if (ignoredClassNames.has(name)) {
            return;
          }
        }
      }
      if (
        innerRef.current &&
        callbackRef.current &&
        !innerRef.current.contains(e.target)
      )
        callbackRef.current(e);
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [skip]);

  return innerRef;
};

export default useOuterClick;
