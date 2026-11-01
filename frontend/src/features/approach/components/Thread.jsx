import { useEffect, useState } from 'react';

/**
 * Vertical decorative thread line connecting chapters on the left rail.
 */
export default function Thread({ target }) {
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (!target?.current) return undefined;
    const update = () => {
      if (target.current) {
        setHeight(target.current.offsetHeight);
      }
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [target]);

  return (
    <div
      className="pointer-events-none absolute left-[calc(var(--rail)/2)] top-0 w-px -translate-x-1/2 bg-gradient-to-b from-primary/35 via-primary/20 to-transparent"
      style={{ height: height ? `${height}px` : '100%' }}
      aria-hidden="true"
    />
  );
}
