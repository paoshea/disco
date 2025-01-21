// Service Worker for background location tracking
const CACHE_NAME = 'disco-location-cache-v1';
const LOCATION_SYNC_TAG = 'location-sync';
const API_BASE_URL = '/api'; // Update this with your API base URL

// Cache API routes and static assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(['/api/location', '/offline.html']);
    })
  );
});

// Clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME)
          .map(name => caches.delete(name))
      );
    })
  );
});

// Handle background sync events
self.addEventListener('sync', event => {
  if (event.tag === LOCATION_SYNC_TAG) {
    event.waitUntil(syncLocation());
  }
});

// Handle periodic background sync events
self.addEventListener('periodicsync', event => {
  if (event.tag === LOCATION_SYNC_TAG) {
    event.waitUntil(syncLocation());
  }
});

// Handle location updates in the background
async function syncLocation() {
  try {
    // Get cached location data
    const cache = await caches.open(CACHE_NAME);
    const locationData = await cache.match('/location-queue');

    if (locationData) {
      const { positions, userId } = await locationData.json();

      // Send each location update to the server
      for (const position of positions) {
        await fetch(`${API_BASE_URL}/location`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId,
            ...position,
          }),
        });
      }

      // Clear the cache after successful sync
      await cache.delete('/location-queue');
    }
  } catch (error) {
    console.error('Background sync failed:', error);
    throw error; // Retry sync later
  }
}

// Handle fetch events
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
