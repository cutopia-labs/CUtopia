import { useState } from 'react';

type Point = {
  x: number;
  y: number;
};

const l2norm = (p1: Point, p2: Point) => {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.sqrt(dx * dx + dy * dy);
};

const useClickObserver = clickCallback => {
  const [dragStartPos, setDragStartPos] = useState(null);
  const onStart = (_, data) => {
    setDragStartPos({ x: data.x, y: data.y });
  };
  const onStop = (_, data) => {
    const dragStopPoint = { x: data.x, y: data.y };
    if (l2norm(dragStartPos, dragStopPoint) < 5) {
      clickCallback();
    }
  };
  return { onStart, onStop };
};

export default useClickObserver;
