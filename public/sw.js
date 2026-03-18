// Amazonia ERP - Service Worker
const CACHE_VERSION = 'amazonia-v1';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const DYNAMIC_CACHE = `${CACHE_VERSION}-dynamic`;

// Static assets to pre-cache on install
const PRECACHE_URLS = [
  '/',
  '/pwa-icon.svg',
  '/favicon.svg',
  '/manifest.json',
];

// Install: pre-cache core static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(PRECACHE_URLS);
    })
  );
  // Activate immediately without waiting for old SW to finish
  self.skipWaiting();
});

// Activate: clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== STATIC_CACHE && key !== DYNAMIC_CACHE)
          .map((key) => caches.delete(key))
      );
    })
  );
  // Take control of all pages immediately
  self.clients.claim();
});

// Fetch: apply different strategies based on request type
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip chrome-extension and other non-http(s) requests
  if (!url.protocol.startsWith('http')) return;

  // API calls: network-first strategy
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/rest/')) {
    event.respondWith(networkFirst(request));
    return;
  }

  // Static assets (JS, CSS, images, fonts): cache-first strategy
  if (isStaticAsset(url.pathname)) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // Navigation requests (HTML pages): network-first with offline fallback
  if (request.mode === 'navigate') {
    event.respondWith(networkFirstWithFallback(request));
    return;
  }

  // Everything else: network-first
  event.respondWith(networkFirst(request));
});

// Determine if a request is for a static asset
function isStaticAsset(pathname) {
  return /\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot|webp|avif)(\?.*)?$/.test(pathname);
}

// Cache-first strategy: check cache, fallback to network, cache the response
async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
  }
}

// Network-first strategy: try network, fallback to cache
async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await caches.match(request);
    if (cached) return cached;
    return new Response(JSON.stringify({ error: 'Sin conexión' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// Network-first with offline HTML fallback for navigation
async function networkFirstWithFallback(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await caches.match(request);
    if (cached) return cached;

    // Return cached index.html for SPA routing
    const indexCached = await caches.match('/');
    if (indexCached) return indexCached;

    return new Response(offlinePage(), {
      status: 503,
      headers: { 'Content-Type': 'text/html' },
    });
  }
}

// Minimal offline fallback page
function offlinePage() {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Amazonia ERP — Sin conexión</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      background: #0f172a;
      color: #e2e8f0;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 2rem;
    }
    .container {
      text-align: center;
      max-width: 400px;
    }
    .icon {
      width: 80px;
      height: 80px;
      margin: 0 auto 1.5rem;
      border-radius: 16px;
      background: #0c4a1f;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2rem;
    }
    h1 { font-size: 1.5rem; margin-bottom: 0.75rem; }
    p { color: #94a3b8; margin-bottom: 1.5rem; line-height: 1.6; }
    button {
      background: #0c4a1f;
      color: white;
      border: none;
      padding: 0.75rem 2rem;
      border-radius: 8px;
      font-size: 1rem;
      cursor: pointer;
      font-weight: 500;
    }
    button:hover { background: #166534; }
  </style>
</head>
<body>
  <div class="container">
    <div class="icon">&#127793;</div>
    <h1>Sin conexión</h1>
    <p>No se pudo conectar al servidor. Verifica tu conexión a internet e intenta nuevamente.</p>
    <button onclick="window.location.reload()">Reintentar</button>
  </div>
</body>
</html>`;
}
