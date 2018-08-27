// Name the cache container that will hold the cached elements
var FILES_CACHE = 'monikers-cache';

// You can specify elements to be precached. They can be cached when installing the SW
var urlsToCache = [
    '/monikers/',
    '/monikers/index.html',
    '/monikers/index.js',
    '/monikers/helpers.js',
    '/monikers/index.css',
    '/monikers/cards.json',
    '/monikers/images/card.png',
    '/monikers/images/back.png',
    '/monikers/images/icon.png',
    '/monikers/lib/handlebars.js',
    '/monikers/lib/semantic.min.css',
    '/monikers/lib/semantic.min.js',
    '/monikers/lib/themes/default/assets/fonts/icons.ttf',
    '/monikers/lib/themes/default/assets/fonts/icons.woff',
    '/monikers/lib/themes/default/assets/fonts/icons.woff2',
    '/monikers/lib/themes/default/assets/fonts/outline-icons.ttf',
    '/monikers/lib/themes/default/assets/fonts/outline-icons.woff',
    '/monikers/lib/themes/default/assets/fonts/outline-icons.woff2'
];

// Capture SW installation event to complete process prior to page reload
self.addEventListener('install', function () {
    return self.skipWaiting();
});

// Capture SW activation event so that elements can be precached
self.addEventListener('activate', function (event) {
    // BEGIN OPTION 1
    // Pages and elements are only cached when accessed by the user while online
    //return self.clients.claim( );
    // END OPTION 1

    // BEGIN OPTION 2
    // Required logic if you want to precache elements,
    // so user can navigate offline even before visiting certain elements
    event.waitUntil(
        caches.open(FILES_CACHE)
            .then(function (cache) {
                console.log('caching 1 ');
                return cache.addAll(urlsToCache);
            })
            .then(function () {
                console.log('caching 2');
                return self.clients.claim();
            })
            .catch(function (e) {
                console.log("Error handling cache", e);
            })
    );
    // END OPTION 2
});

self.addEventListener('fetch', function (event) {
    console.log('SW - fetch listener: ', event.request.url);
    event.respondWith(
        caches.match(event.request)
            .then(function (response) {
                console.log("caching match: ", response);
                // Cache hit - return response
                if (response) {
                    return response;
                }
                console.log("SW - no cache match - calling network: ", event.request.url);
                return fetch(event.request);
            })
            .catch(function (e) {
                console.log('SW - Error fetching static resource from cache: ', e.message);
            })
    );
});