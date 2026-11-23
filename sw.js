// Service Worker بسيط: يخلي البرنامج يفتح من غير نت بعد أول فتحة
const CACHE = 'clothes-pos-v2'

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(['./', './index.html', './manifest.webmanifest'])))
  self.skipWaiting()
})

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
  )
  self.clients.claim()
})

self.addEventListener('fetch', (e) => {
  const req = e.request
  if (req.method !== 'GET') return
  const url = new URL(req.url)
  // ما نكاشش طلبات Firebase
  if (url.hostname.includes('googleapis.com') || url.hostname.includes('firebase')) return
  e.respondWith(
    fetch(req)
      .then((res) => {
        if (res.ok && (url.origin === self.location.origin || url.hostname.includes('gstatic') || url.hostname.includes('fonts.googleapis'))) {
          const copy = res.clone()
          caches.open(CACHE).then((c) => c.put(req, copy))
        }
        return res
      })
      .catch(() => caches.match(req).then((r) => r || caches.match('./index.html')))
  )
})
