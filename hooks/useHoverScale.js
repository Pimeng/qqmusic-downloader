'use client';

import { useEffect, useRef, useCallback } from 'react';

const SELECTORS = [
  'button:not([disabled])',
  'a[href]',
  'input[type="checkbox"]:not([disabled])',
  'input[type="submit"]:not([disabled])',
  'input[type="button"]:not([disabled])',
  '[role="button"]:not([disabled])'
].join(', ');

export function useHoverScale(scale = 1.05) {
  const containerRef = useRef(null);
  const scaleRef = useRef(scale);

  scaleRef.current = scale;

  const applyClass = useCallback((root) => {
    if (!root || root.nodeType !== 1) return;

    const elements = [];
    if (root.matches?.(SELECTORS)) {
      elements.push(root);
    }
    root.querySelectorAll?.(SELECTORS).forEach(el => elements.push(el));

    elements.forEach((el) => {
      if (!el.classList.contains('hover-scale')) {
        el.classList.add('hover-scale');
        el.dataset.hoverScale = scaleRef.current;
      }
    });
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    applyClass(container);

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1) {
            applyClass(node);
          }
        });
      });
    });

    observer.observe(container, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
    };
  }, [applyClass]);

  return containerRef;
}
