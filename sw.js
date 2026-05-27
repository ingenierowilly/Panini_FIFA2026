// Panini FIFA 2026 — Service Worker v4
// Cambia CACHE_NAME para forzar actualización en todos los dispositivos
const CACHE_NAME = 'panini2026-v11';
const ASSETS = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(c => c.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (url.hostname.includes('fonts.g')) {
    e.respondWith(fetch(e.request).then(r => { const cl=r.clone(); caches.open(CACHE_NAME).then(c=>c.put(e.request,cl)); return r; }).catch(() => caches.match(e.request)));
    return;
  }
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(r => {
        if (r && r.status===200 && r.type!=='opaque') { const cl=r.clone(); caches.open(CACHE_NAME).then(c=>c.put(e.request,cl)); }
        return r;
      }).catch(() => { if (e.request.mode==='navigate') return caches.match('./index.html'); });
    })
  );
});
