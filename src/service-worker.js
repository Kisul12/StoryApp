console.log('Service Worker: Hello from the SW file!');

self.addEventListener('install', (event) => {
  console.log('Service Worker: Install event - Caching App Shell');
  event.waitUntil(
    caches.open('story-app-shell-BARU')
      .then((cache) => {
        console.log('Service Worker: App Shell Caching - Adding URLs:', [
          '/',
          '/index.html',
          '/app.bundle.js',
          '/app.css',
          '/favicon.png',
          '/manifest.json'
        ]);
        return cache.addAll([
          '/',
          '/index.html',
          '/app.bundle.js',
          '/app.css',
          '/favicon.png',
          '/manifest.json'
        ]);
      })
      .then(() => {
        console.log('Service Worker: App Shell cached successfully');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Service Worker: Failed to cache App Shell:', error);
      })
  );
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activate event - Clearing old caches');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== 'story-app-shell-BARU') {
            console.log('Service Worker: Clearing old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  console.log(`Service Worker: Fetching ${event.request.url}`);
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          console.log(`Service Worker: Returning response from cache for ${event.request.url}`);
          return response;
        }
        console.log(`Service Worker: No response found in cache. Fetching from network for ${event.request.url}`);
        return fetch(event.request);
      })
      .catch((error) => {
        console.error(`Service Worker: Error during fetch for ${event.request.url}`, error);
      })
  );
});

self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push event received.');

  let notificationData = {
    title: 'Notifikasi Baru',
    options: {
      body: 'Anda memiliki pesan baru.',
      icon: '/favicon.png',
      badge: '/images/logo-48.png'
    }
  };

  if (event.data) {
    try {
      const dataFromServer = event.data.json();
      console.log('[Service Worker] Push data payload:', dataFromServer);

      notificationData.title = dataFromServer.title || notificationData.title;

      if (dataFromServer.options) {
        notificationData.options.body = dataFromServer.options.body || notificationData.options.body;
        notificationData.options.icon = dataFromServer.options.icon || notificationData.options.icon;
      }
    } catch (e) {
      console.error('[Service Worker] Error parsing push data as JSON, using text():', e);
      notificationData.options.body = event.data.text();
    }
  } else {
    console.log('[Service Worker] Push event Punya data tapi tidak ada payload, menggunakan default.');
  }

  const title = notificationData.title;
  const options = notificationData.options;

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notification click received.', event.notification);
  event.notification.close();

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});
