import { useRef, useEffect, useCallback } from 'react';

export default function useDebounce(fn, delay) {
  const { current } = useRef({ fn, timer: null });
  useEffect(() => {
    current.fn = fn;
  }, [current, fn]);
  return useCallback(() => {
    if (current.timer) {
      clearTimeout(current.timer);
    }
    current.timer = setTimeout(() => current.fn(...arguments), delay);
  }, [current, delay]);
}
