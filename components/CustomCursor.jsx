'use client';

import { useEffect } from 'react';

export default function CustomCursor() {
  useEffect(() => {
    const cursor = document.createElement('div');
    cursor.className = 'custom-cursor';
    document.body.appendChild(cursor);

    const dot = document.createElement('div');
    dot.className = 'custom-cursor-dot';
    document.body.appendChild(dot);

    const moveCursor = (e) => {
      cursor.style.left = e.clientX + 'px';
      cursor.style.top = e.clientY + 'px';
      dot.style.left = e.clientX + 'px';
      dot.style.top = e.clientY + 'px';
    };

    const handleMouseEnter = () => cursor.classList.add('hover');
    const handleMouseLeave = () => cursor.classList.remove('hover');

    window.addEventListener('mousemove', moveCursor);

    const interactiveElements = document.querySelectorAll('button, a, input, textarea, .song-strip-item, .result-cell');
    interactiveElements.forEach(el => {
      el.addEventListener('mouseenter', handleMouseEnter);
      el.addEventListener('mouseleave', handleMouseLeave);
    });

    return () => {
      window.removeEventListener('mousemove', moveCursor);
      cursor.remove();
      dot.remove();
    };
  }, []);

  return null;
}
