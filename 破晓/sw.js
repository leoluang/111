const CACHE_NAME = 'zexi-dawn-v1';
// 定义需要被浏览器强制离线缓存的核心文件，保证断网时网页也能秒开
const urlsToCache = [
  './index.html',
  './manifest.json',
  'https://cdn.tailwindcss.com',
  'https://unpkg.com/@phosphor-icons/web'
];

// 安装阶段：把核心文件塞进缓存里
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
  // 强制立即接管，不等待其他标签页关闭
  self.skipWaiting();
});

// 拦截网络请求：如果有网就走网，没网（或者网络慢）就直接从刚才的缓存里掏出来给你看
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});

// 激活阶段：负责清理旧版本的废弃缓存
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});