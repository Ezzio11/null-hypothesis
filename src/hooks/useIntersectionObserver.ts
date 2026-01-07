import { useEffect } from 'react';

export default function useIntersectionObserver(
  selector: string,
  callback: (element: HTMLElement) => void,
  options = {},
  setupFn?: (element: Element) => void
) {
  useEffect(() => {
    const elements = document.querySelectorAll(selector);
    if (elements.length === 0) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        const el = entry.target as HTMLElement;
        if (setupFn) setupFn(el);
        callback(el);
      }
    }, { threshold: 0.1, ...options });

    elements.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, [selector, callback, options, setupFn]);
}