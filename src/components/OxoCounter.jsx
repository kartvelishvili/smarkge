import { useEffect, useRef } from 'react';

export default function OxoCounter({ siteId = '54', style = '1', color = '#6366f1' }) {
  const loaded = useRef(false);

  useEffect(() => {
    if (loaded.current) return;
    loaded.current = true;

    if (!document.querySelector('script[src*="oxo.ge/counter.js"]')) {
      const s = document.createElement('script');
      s.src = '//oxo.ge/counter.js';
      s.async = true;
      document.body.appendChild(s);
    }
  }, []);

  return (
    <div
      id="top-ge-counter-container"
      data-site-id={siteId}
      data-counter-style={style}
      data-counter-color={color}
    />
  );
}
