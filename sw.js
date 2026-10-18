const CACHE_NAME = 'topupzone-auto-v1';

self.addEventListener('install', (e) => {
  // Memaksa Service Worker baru untuk langsung aktif tanpa menunggu
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  // Strategi: Network First (Ambil dari internet dulu, kalau gagal baru ambil cache)
  // Ini memastikan website SELALU mengambil file HTML terbaru dari GitHub
  e.respondWith(
    fetch(e.request)
      .then((response) => {
        // Simpan salinan terbaru ke cache (untuk mode offline)
        const resClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(e.request, resClone);
        });
        return response;
      })
      .catch(() => {
        // Jika tidak ada internet, gunakan file yang tersimpan di HP
        return caches.match(e.request);
      })
  );
});
