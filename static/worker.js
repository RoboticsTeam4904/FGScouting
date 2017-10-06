var CACHE = 'network-or-cache';

self.addEventListener('install', function(evt) {
  evt.waitUntil(precache());
});

self.addEventListener('fetch', function(evt) {
  evt.respondWith(navigator.onLine ? fromNetwork(evt.request) : fromCache(evt.request))
});

self.addEventListener('sync', function(event) {
  if (event.tag == 'dbPush') {
    event.waitUntil(dbPush());
  }
  if (event.tag == 'dbPull') {
    event.waitUntil(dbPull());
  }
});

function precache() {
  return caches.open(CACHE).then(function (cache) {
    return cache.addAll([
      '/app.js',
      '/',
      '/static/Arvo.woff2',
      '/static/logo.png'
    ]);
  });
}

function fromNetwork(request) {
  return new Promise(function (fulfill, reject) {
    fetch(request).then(function (response) {
      fulfill(response);
    }, reject);
  });
}

function dbPush() {
  return new Promise(function (fulfill, reject) {
    if (navigator.onLine) {
      fulfill()
    }
    else {
      reject()
    }
  });
}

function dbPull() {
  return new Promise(function (fulfill, reject) {
    if (navigator.onLine){
      fulfill()
    }
    else {
      reject()
    }
  });
}

function fromCache(request) {
  return caches.open(CACHE).then(function (cache) {
    return cache.match(request).then(function (matching) {
      return matching || Promise.reject('no-match');
    });
  });
}
