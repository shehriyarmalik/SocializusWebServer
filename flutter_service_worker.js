'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';
const RESOURCES = {
  "assets/AssetManifest.json": "15dfac18c2020ff674ce863fc67635dd",
"assets/assets/images/1.png": "7ae0f7bfb7323e06a12069674b6ac897",
"assets/assets/images/2.png": "32b54ce05ed990baec02bc5f6c46d674",
"assets/assets/images/3.png": "a544a3e51d5e4ffe63edd539aff25ca5",
"assets/assets/images/4.png": "3cb9d806790a0f360d47f119646ed737",
"assets/assets/images/android.png": "d8ebbbdc31d38f5c803e3923047b92fa",
"assets/assets/images/bg.png": "e737fdf369736c85c16aa55d6b625d1e",
"assets/assets/images/camera.png": "487bf31964883de405bd699057b19f93",
"assets/assets/images/chinese.png": "e206c2f9aa8a76ca87fe5d1f85abf8bb",
"assets/assets/images/fb.png": "b73c1a817f37d7f953b738f446eace3a",
"assets/assets/images/france.png": "f8da6cfcbbf440213b007e0228ac2db3",
"assets/assets/images/german.png": "7a62d3e9ec1845138c1b55ef9aef0073",
"assets/assets/images/google.png": "ff629c02385f2f3a199b7e0b3065d077",
"assets/assets/images/ios.png": "596f63e2211b49debfec566d0897126b",
"assets/assets/images/italian.png": "774c00b7c2cfe0455d4f59eece834b14",
"assets/assets/images/logo.png": "23ea5a3dd5c242c8f1b946dc9d3a96fc",
"assets/assets/images/person.png": "c39a56babc5d58cf461a78aeb043817f",
"assets/assets/images/portugal.png": "69ef961058ae503d457caecef34975aa",
"assets/assets/images/russia.png": "152ac13ea7e6a660623c6a1ff8c0b784",
"assets/assets/images/spanish.png": "7101acb71883f0e14b9ee9925b311dbe",
"assets/assets/images/uk.png": "4f84dc53d62ff0c3bf1490d8ed67b840",
"assets/assets/json/ar.json": "bc0fd0baf44a41fa1e1ae92b4061a792",
"assets/assets/json/de.json": "e7c949dfd3a619a1fb057f65bfde0f6a",
"assets/assets/json/en.json": "bd38b726a2c0a3ed9aa6c2b79912dd76",
"assets/assets/json/es.json": "7bf80d2a221382f5832c42f6ba7c9ce4",
"assets/assets/json/fr.json": "23162205be3398d02b63c536d8e37464",
"assets/assets/json/it.json": "e6a89d11a1780902bfd2d164cd242427",
"assets/assets/json/pt.json": "bd38b726a2c0a3ed9aa6c2b79912dd76",
"assets/assets/json/ru.json": "bd38b726a2c0a3ed9aa6c2b79912dd76",
"assets/assets/json/zh.json": "bd38b726a2c0a3ed9aa6c2b79912dd76",
"assets/FontManifest.json": "dc3d03800ccca4601324923c0b1d6d57",
"assets/fonts/MaterialIcons-Regular.otf": "4e6447691c9509f7acdbf8a931a85ca1",
"assets/NOTICES": "6ae8c1ab79cdc7254db61d7cbf6bab28",
"assets/packages/cupertino_icons/assets/CupertinoIcons.ttf": "6d342eb68f170c97609e9da345464e5e",
"favicon.png": "5dcef449791fa27946b3d35ad8803796",
"icons/Icon-192.png": "ac9a721a12bbc803b44f645561ecb1e1",
"icons/Icon-512.png": "96e752610906ba2a93c65f8abe1645f1",
"index.html": "2ed95d8b1a7c109d185867fab3cdd510",
"/": "2ed95d8b1a7c109d185867fab3cdd510",
"main.dart.js": "84f3ca1413c4406f0781628a98b7c165",
"manifest.json": "e043398ffb77650a56afb9a943ddfaa2",
"version.json": "646dc8d21e2cb7db70d5bdf7d93066b1"
};

// The application shell files that are downloaded before a service worker can
// start.
const CORE = [
  "/",
"main.dart.js",
"index.html",
"assets/NOTICES",
"assets/AssetManifest.json",
"assets/FontManifest.json"];
// During install, the TEMP cache is populated with the application shell files.
self.addEventListener("install", (event) => {
  self.skipWaiting();
  return event.waitUntil(
    caches.open(TEMP).then((cache) => {
      return cache.addAll(
        CORE.map((value) => new Request(value, {'cache': 'reload'})));
    })
  );
});

// During activate, the cache is populated with the temp files downloaded in
// install. If this service worker is upgrading from one with a saved
// MANIFEST, then use this to retain unchanged resource files.
self.addEventListener("activate", function(event) {
  return event.waitUntil(async function() {
    try {
      var contentCache = await caches.open(CACHE_NAME);
      var tempCache = await caches.open(TEMP);
      var manifestCache = await caches.open(MANIFEST);
      var manifest = await manifestCache.match('manifest');
      // When there is no prior manifest, clear the entire cache.
      if (!manifest) {
        await caches.delete(CACHE_NAME);
        contentCache = await caches.open(CACHE_NAME);
        for (var request of await tempCache.keys()) {
          var response = await tempCache.match(request);
          await contentCache.put(request, response);
        }
        await caches.delete(TEMP);
        // Save the manifest to make future upgrades efficient.
        await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
        return;
      }
      var oldManifest = await manifest.json();
      var origin = self.location.origin;
      for (var request of await contentCache.keys()) {
        var key = request.url.substring(origin.length + 1);
        if (key == "") {
          key = "/";
        }
        // If a resource from the old manifest is not in the new cache, or if
        // the MD5 sum has changed, delete it. Otherwise the resource is left
        // in the cache and can be reused by the new service worker.
        if (!RESOURCES[key] || RESOURCES[key] != oldManifest[key]) {
          await contentCache.delete(request);
        }
      }
      // Populate the cache with the app shell TEMP files, potentially overwriting
      // cache files preserved above.
      for (var request of await tempCache.keys()) {
        var response = await tempCache.match(request);
        await contentCache.put(request, response);
      }
      await caches.delete(TEMP);
      // Save the manifest to make future upgrades efficient.
      await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
      return;
    } catch (err) {
      // On an unhandled exception the state of the cache cannot be guaranteed.
      console.error('Failed to upgrade service worker: ' + err);
      await caches.delete(CACHE_NAME);
      await caches.delete(TEMP);
      await caches.delete(MANIFEST);
    }
  }());
});

// The fetch handler redirects requests for RESOURCE files to the service
// worker cache.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== 'GET') {
    return;
  }
  var origin = self.location.origin;
  var key = event.request.url.substring(origin.length + 1);
  // Redirect URLs to the index.html
  if (key.indexOf('?v=') != -1) {
    key = key.split('?v=')[0];
  }
  if (event.request.url == origin || event.request.url.startsWith(origin + '/#') || key == '') {
    key = '/';
  }
  // If the URL is not the RESOURCE list then return to signal that the
  // browser should take over.
  if (!RESOURCES[key]) {
    return;
  }
  // If the URL is the index.html, perform an online-first request.
  if (key == '/') {
    return onlineFirst(event);
  }
  event.respondWith(caches.open(CACHE_NAME)
    .then((cache) =>  {
      return cache.match(event.request).then((response) => {
        // Either respond with the cached resource, or perform a fetch and
        // lazily populate the cache.
        return response || fetch(event.request).then((response) => {
          cache.put(event.request, response.clone());
          return response;
        });
      })
    })
  );
});

self.addEventListener('message', (event) => {
  // SkipWaiting can be used to immediately activate a waiting service worker.
  // This will also require a page refresh triggered by the main worker.
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
    return;
  }
  if (event.data === 'downloadOffline') {
    downloadOffline();
    return;
  }
});

// Download offline will check the RESOURCES for all files not in the cache
// and populate them.
async function downloadOffline() {
  var resources = [];
  var contentCache = await caches.open(CACHE_NAME);
  var currentContent = {};
  for (var request of await contentCache.keys()) {
    var key = request.url.substring(origin.length + 1);
    if (key == "") {
      key = "/";
    }
    currentContent[key] = true;
  }
  for (var resourceKey of Object.keys(RESOURCES)) {
    if (!currentContent[resourceKey]) {
      resources.push(resourceKey);
    }
  }
  return contentCache.addAll(resources);
}

// Attempt to download the resource online before falling back to
// the offline cache.
function onlineFirst(event) {
  return event.respondWith(
    fetch(event.request).then((response) => {
      return caches.open(CACHE_NAME).then((cache) => {
        cache.put(event.request, response.clone());
        return response;
      });
    }).catch((error) => {
      return caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response != null) {
            return response;
          }
          throw error;
        });
      });
    })
  );
}
