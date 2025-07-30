const CACHE_NAME = 'oppood-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/meeting.html',
  '/oneday-class.html',
  '/login.html',
  '/styles/common.css',
  '/styles/header.css',
  '/styles/calendar.css',
  '/styles/meeting.css',
  '/styles/oneday-class.css',
  '/styles/modal.css',
  '/styles/responsive.css',
  '/js/auth.js',
  '/js/navigation.js',
  '/js/common.js',
  '/js/calendar.js',
  '/js/meeting.js',
  '/js/oneday-class.js'
];

// 설치 이벤트
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('캐시 열림');
        return cache.addAll(urlsToCache);
      })
  );
});

// 활성화 이벤트
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// fetch 이벤트
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // 캐시에서 찾으면 반환
        if (response) {
          return response;
        }

        // 네트워크 요청
        return fetch(event.request).then(
          response => {
            // 유효한 응답이 아니면 그대로 반환
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // 응답 복사
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      })
      .catch(() => {
        // 오프라인 폴백
        if (event.request.destination === 'document') {
          return caches.match('/offline.html');
        }
      })
  );
});