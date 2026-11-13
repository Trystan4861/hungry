const CACHE_PREFIX = 'hungry-app-'
const CACHE_NAME = `${CACHE_PREFIX}__APP_VERSION__`
const APP_URL = new URL('./', self.registration.scope).toString()
const MANIFEST_URL = new URL('manifest.json', self.registration.scope).toString()
const STATIC_ASSET = /\.(?:avif|css|eot|gif|ico|jpe?g|js|json|png|svg|webp|woff2?)$/i

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME)
    const response = await fetch(APP_URL, { cache: 'reload' })
    if (!response.ok) throw new Error(`Unable to cache app shell: ${response.status}`)

    const html = await response.clone().text()
    await cache.put(APP_URL, response)
    await cache.put(MANIFEST_URL, await fetch(MANIFEST_URL, { cache: 'reload' }))

    const assetUrls = [...html.matchAll(/(?:src|href)=["']([^"']+)["']/gi)]
      .map((match) => new URL(match[1], APP_URL))
      .filter((url) => url.origin === self.location.origin && STATIC_ASSET.test(url.pathname))

    await Promise.all(assetUrls.map(async (url) => {
      try {
        const asset = await fetch(url, { cache: 'reload' })
        if (asset.ok) await cache.put(url, asset)
      } catch {
        // Keep installation working if a nonessential asset cannot be fetched.
      }
    }))

    await self.skipWaiting()
  })())
})

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const cacheNames = await caches.keys()
    await Promise.all(cacheNames
      .filter((name) => name.startsWith(CACHE_PREFIX) && name !== CACHE_NAME)
      .map((name) => caches.delete(name)))
    await self.clients.claim()
  })())
})

self.addEventListener('fetch', (event) => {
  const request = event.request
  const url = new URL(request.url)
  if (request.method !== 'GET' || url.origin !== self.location.origin) return

  if (request.mode === 'navigate') {
    event.respondWith(fetch(request)
      .then(async (response) => {
        if (response.ok) {
          const cache = await caches.open(CACHE_NAME)
          await cache.put(APP_URL, response.clone())
        }
        return response
      })
      .catch(() => caches.match(APP_URL)))
    return
  }

  if (STATIC_ASSET.test(url.pathname)) {
    event.respondWith((async () => {
      const cached = await caches.match(request)
      if (cached) return cached

      const response = await fetch(request)
      if (response.ok && response.type === 'basic') {
        const cache = await caches.open(CACHE_NAME)
        await cache.put(request, response.clone())
      }
      return response
    })())
  }
})
