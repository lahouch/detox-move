const CACHE_NAME = 'detox-v_emergency'; // Changement de nom pour forcer la mise à jour
const assets = ['./', './index.html', './styles.css', './app.js', './manifest.json'];

self.addEventListener('install', e => {
    self.skipWaiting(); // Force le nouveau SW à s'activer
    e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(assets)));
});

self.addEventListener('fetch', e => {
    e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});