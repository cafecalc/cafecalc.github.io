'use strict';
(() => {
  const precachedResources = [
    '.'
  ];

  // Set by GitHub Action
  const cacheName = null;

  if (!cacheName) {
    console.log('Global cacheName not set! Review GitHub Actions!');
    return;
  }

  // Install the service worker and open the cache and add files mentioned in array to cache
  self.addEventListener('install', (event) => {
    // Update Immediately to latest version
    self.skipWaiting();

    event.waitUntil(
      caches.open(cacheName)
        .then((cache) => {
          console.log(`Opened cache ${cacheName}`);
          return cache.addAll(precachedResources);
        })
    );
  });

  // Listens to request from application.
  self.addEventListener('fetch', (event) => {
    event.respondWith(
      caches.match(event.request)
        .then((response) => {

          if (response) {
            // The requested file exists in cache so we return it from cache.
            return response;
          }

          // The requested file is not present in cache so we send it forward to the internet
          return fetch(event.request);
        })
    );
  });

  // Clean up old cache versions
  self.addEventListener('activate', (event) => {
    let cacheWhitelist = []; // Add cache names which you do not want to delete
    cacheWhitelist.push(cacheName);
    event.waitUntil(
      caches.keys().then((names) => {
        return Promise.all(
          names.map((name) => {
            if (!cacheWhitelist.includes(name)) {
              console.log(`Delete cache ${name}`);
              return caches.delete(name);
            }
          })
        );
      })
    );

    // Update Immediately to latest version
    event.waitUntil(self.clients.claim());
  });
})();
