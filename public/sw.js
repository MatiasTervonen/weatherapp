self.addEventListener("install", () => {
  console.log("Service Worker: Installed");
  self.skipWaiting(); // Forces the service worker to activate immediately
});

self.addEventListener("activate", () => {
  console.log("Service Worker: Activated");
});

self.addEventListener("fetch", (event) => {
  // Basic fetch handler - responds with the network request
  event.respondWith(fetch(event.request));
});
