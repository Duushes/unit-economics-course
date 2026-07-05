'use client';

import { useEffect } from 'react';

const UPDATE_INTERVAL_MS = 60 * 60 * 1000; // проверка деплоя раз в час при открытом приложении

// Регистрирует service worker только в production и держит PWA свежим:
// - updateViaCache: 'none' — sw.js не берётся из HTTP-кэша GitHub Pages (там max-age=600);
// - registration.update() при возврате в приложение и по таймеру — ловим свежий деплой;
// - controllerchange → одна перезагрузка — новая версия применяется сразу, без
//   «отставания на сессию». При самой первой установке SW не перезагружаемся.
// Относительный путь 'sw.js' резолвится под basePath автоматически.
export default function RegisterSW() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return;
    if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return;

    let registration: ServiceWorkerRegistration | undefined;
    let interval: number | undefined;
    let reloading = false;

    const checkForUpdate = () => registration?.update().catch(() => {});
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') checkForUpdate();
    };
    const onControllerChange = () => {
      if (reloading) return;
      reloading = true;
      window.location.reload();
    };

    const onLoad = () => {
      const wasControlled = Boolean(navigator.serviceWorker.controller);
      navigator.serviceWorker
        .register('sw.js', { updateViaCache: 'none' })
        .then((reg) => {
          registration = reg;
          if (wasControlled) {
            navigator.serviceWorker.addEventListener('controllerchange', onControllerChange);
          }
          interval = window.setInterval(checkForUpdate, UPDATE_INTERVAL_MS);
          document.addEventListener('visibilitychange', onVisibilityChange);
        })
        .catch(() => {
          /* офлайн-режим просто не активируется — курс работает как обычный сайт */
        });
    };

    if (document.readyState === 'complete') onLoad();
    else window.addEventListener('load', onLoad);

    return () => {
      window.removeEventListener('load', onLoad);
      navigator.serviceWorker.removeEventListener('controllerchange', onControllerChange);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      if (interval) window.clearInterval(interval);
    };
  }, []);
  return null;
}
