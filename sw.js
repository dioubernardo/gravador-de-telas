
self.addEventListener('install', function (e) {
    e.waitUntil(
        caches.open('gravador-de-telas-v1').then(function (cache) {
            return cache.addAll([
                'index.html',
                'functions.js',

                'assets/logo.png',
                'assets/logo.svg',

                'libs/bootstrap/bootstrap.min.css',
                'libs/jquery/jquery-3.5.1.slim.min.js'
            ]);
        })
    );
});

self.addEventListener('fetch', function (event) {
    event.respondWith(caches.match(event.request).then(function (response) {
        if (response !== undefined) {
            return response;
        } else {
            return fetch(event.request).then(function (response) {
                let responseClone = response.clone();
                caches.open('gravador-de-telas-v1').then(function (cache) {
                    cache.put(event.request, responseClone);
                });
                return response;
            });
        }
    }));
});