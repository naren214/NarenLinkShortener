import { useEffect, useMemo, useState } from 'react';
import './Cubes.css';

// Inspired by Can Tastemel's original work for the lambda.ai landing page.
// https://cantastemel.com | https://reactbits.dev/animations/cubes
export default function Cubes({
  gridSize = 8,
  maxAngle = 45,
  radius = 3,
  borderStyle = '2px dashed #B497CF',
  faceColor = '#1a1a2e',
  rippleColor = '#ff6b6b',
  rippleSpeed = 1.5,
  autoAnimate = true,
  rippleOnClick = true,
}) {
  const cells = useMemo(() => Array.from({ length: gridSize * gridSize }, (_, index) => index), [gridSize]);
  const [activeIndex, setActiveIndex] = useState(null);

  useEffect(() => {
    if (!autoAnimate) return undefined;
    let index = 0;
    const timer = window.setInterval(() => {
      setActiveIndex(index);
      index = (index + 1) % cells.length;
    }, Math.max(900, 2100 / rippleSpeed));
    return () => window.clearInterval(timer);
  }, [autoAnimate, cells.length, rippleSpeed]);

  function triggerRipple(index) {
    if (!rippleOnClick) return;
    setActiveIndex(index);
  }

  return (
    <div className="cubes" style={{ '--grid-size': gridSize, '--max-angle': `${maxAngle}deg`, '--radius': `${radius}px`, '--cube-border': borderStyle, '--cube-face': faceColor, '--ripple': rippleColor, '--ripple-speed': `${rippleSpeed}s` }} onClick={(event) => { if (event.target === event.currentTarget) setActiveIndex(null); }}>
      <div className="cubes-grid" style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)`, gridTemplateRows: `repeat(${gridSize}, 1fr)` }}>
        {cells.map((index) => {
          const x = index % gridSize;
          const y = Math.floor(index / gridSize);
          const distance = activeIndex === null ? 0 : Math.hypot(x - (activeIndex % gridSize), y - Math.floor(activeIndex / gridSize));
          return <div className={`cube ${activeIndex === index ? 'is-active' : ''}`} key={index} onClick={() => triggerRipple(index)} style={{ '--distance': distance, '--delay': `${(x + y) * 35}ms` }}><span className="cube-face" /></div>;
        })}
      </div>
    </div>
  );
}
