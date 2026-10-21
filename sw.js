// Offline support for 龜兔賽跑. Bump CACHE (and APP_VERSION in index.html) on every release.
var CACHE = 'tortoise-and-hare-v1';
var AUDIO = ['cover', 'tip-cover', 'p1', 'tip-p1', 'p2', 'tip-p2', 'p3', 'tip-p3', 'p4', 'tip-p4', 'p5', 'tip-p5', 'p6', 'tip-p6', 'p7', 'tip-p7', 'p8', 'tip-p8', 'p9', 'tip-p9', 'p10', 'tip-p10', 'p11', 'tip-p11', 'p12', 'tip-p12'].concat(['sfx-turn','sfx-pop','sfx-tap','sfx-brick','sfx-wind','sfx-stinger','sfx-splash','sfx-boing','sfx-cheer','sfx-chew','sfx-snore','sfx-knock','sfx-struggle']).map(function (n) { return './audio/' + n + '.mp3'; });
var FILES = ['./', './index.html', './manifest.json', './icon.svg', './icon-180.png', './icon-192.png', './icon-512.png', './icon-maskable-512.png'].concat(AUDIO);
self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) {
    return c.addAll(FILES.map(function (f) { return new Request(f, { cache: 'reload' }); }));
  }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ks) {
    return Promise.all(ks.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener('fetch', function (e) {
  var url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;
  var cacheFirst = /\/audio\/[\w-]+\.mp3$|\.png$|\.svg$/.test(url.pathname);
  if (cacheFirst) {
    e.respondWith(caches.match(e.request, { ignoreSearch: true }).then(function (m) {
      return m || fetch(e.request).then(function (r) {
        if (r && r.ok) { var copy = r.clone(); caches.open(CACHE).then(function (c) { c.put(e.request, copy); }); }
        return r;
      });
    }));
    return;
  }
  e.respondWith(fetch(e.request, { cache: 'no-cache' }).then(function (r) {
    if (r && r.ok) { var copy = r.clone(); caches.open(CACHE).then(function (c) { c.put(e.request, copy); }); }
    return r;
  }).catch(function () {
    return caches.match(e.request, { ignoreSearch: true }).then(function (m) { return m || caches.match('./index.html'); });
  }));
});
