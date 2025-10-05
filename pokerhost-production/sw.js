const CACHE_NAME = 'poker-host-v1.0.0';
const STATIC_CACHE_NAME = 'poker-host-static-v1.0.0';
const DYNAMIC_CACHE_NAME = 'poker-host-dynamic-v1.0.0';

// 需要快取的靜態資源
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/favicon.ico'
];

// 需要快取的 API 端點
const API_ENDPOINTS = [
  '/api/games',
  '/api/players',
  '/api/expenses'
];

// 安裝事件 - 快取靜態資源
self.addEventListener('install', (event) => {
  console.log('Service Worker 安裝中...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('快取靜態資源...');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('靜態資源快取完成');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('快取靜態資源失敗:', error);
      })
  );
});

// 激活事件 - 清理舊快取
self.addEventListener('activate', (event) => {
  console.log('Service Worker 激活中...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE_NAME && cacheName !== DYNAMIC_CACHE_NAME) {
              console.log('刪除舊快取:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker 激活完成');
        return self.clients.claim();
      })
  );
});

// 攔截請求事件
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 處理 API 請求
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      networkFirstStrategy(request)
    );
    return;
  }

  // 處理靜態資源請求
  if (request.destination === 'image' || 
      request.destination === 'script' || 
      request.destination === 'style') {
    event.respondWith(
      cacheFirstStrategy(request)
    );
    return;
  }

  // 處理頁面請求
  if (request.mode === 'navigate') {
    event.respondWith(
      networkFirstStrategy(request)
    );
    return;
  }

  // 其他請求使用網路優先策略
  event.respondWith(
    networkFirstStrategy(request)
  );
});

// 網路優先策略
async function networkFirstStrategy(request) {
  try {
    // 先嘗試從網路獲取
    const networkResponse = await fetch(request);
    
    // 如果是成功的回應，快取它
    if (networkResponse.status === 200) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('網路請求失敗，嘗試從快取獲取:', request.url);
    
    // 網路失敗時，從快取獲取
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // 如果是頁面請求且快取中沒有，返回離線頁面
    if (request.mode === 'navigate') {
      return caches.match('/index.html');
    }
    
    throw error;
  }
}

// 快取優先策略
async function cacheFirstStrategy(request) {
  // 先嘗試從快取獲取
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    // 快取中沒有，從網路獲取
    const networkResponse = await fetch(request);
    
    // 快取網路回應
    if (networkResponse.status === 200) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('獲取資源失敗:', request.url, error);
    throw error;
  }
}

// 處理背景同步
self.addEventListener('sync', (event) => {
  console.log('背景同步事件:', event.tag);
  
  if (event.tag === 'game-sync') {
    event.waitUntil(syncGameData());
  }
});

// 同步遊戲數據
async function syncGameData() {
  try {
    // 從 IndexedDB 獲取待同步的數據
    const pendingUpdates = await getPendingUpdates();
    
    for (const update of pendingUpdates) {
      try {
        const response = await fetch('/api/sync', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(update)
        });
        
        if (response.ok) {
          // 同步成功，移除待同步數據
          await removePendingUpdate(update.id);
        }
      } catch (error) {
        console.error('同步數據失敗:', error);
      }
    }
  } catch (error) {
    console.error('背景同步失敗:', error);
  }
}

// 處理推送通知
self.addEventListener('push', (event) => {
  console.log('收到推送通知:', event);
  
  const options = {
    body: event.data ? event.data.text() : '您有新的撲克牌局更新',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: '查看詳情',
        icon: '/icons/checkmark.png'
      },
      {
        action: 'close',
        title: '關閉',
        icon: '/icons/xmark.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('Poker Host', options)
  );
});

// 處理通知點擊
self.addEventListener('notificationclick', (event) => {
  console.log('通知被點擊:', event);
  
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// 輔助函數 - 獲取待同步數據
async function getPendingUpdates() {
  // 這裡應該從 IndexedDB 獲取數據
  // 簡化實現，返回空數組
  return [];
}

// 輔助函數 - 移除待同步數據
async function removePendingUpdate(id) {
  // 這裡應該從 IndexedDB 移除數據
  console.log('移除待同步數據:', id);
}

// 處理消息事件
self.addEventListener('message', (event) => {
  console.log('Service Worker 收到消息:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});

// 錯誤處理
self.addEventListener('error', (event) => {
  console.error('Service Worker 錯誤:', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
  console.error('Service Worker 未處理的 Promise 拒絕:', event.reason);
});
