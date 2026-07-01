'use client';

import { useEffect } from 'react';

// Регистрирует service worker только в production.
// Относительный путь 'sw.js' резолвится под basePath автоматически.
export default function RegisterSW() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return;
    if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return;
    const onLoad = () => {
      navigator.serviceWorker.register('sw.js').catch(() => {
        /* офлайн-режим просто не активируется — курс работает как обычный сайт */
      });
    };
    window.addEventListener('load', onLoad);
    return () => window.removeEventListener('load', onLoad);
  }, []);
  return null;
}
