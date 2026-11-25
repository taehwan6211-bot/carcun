// 카컨 수리관리: 앱이 꺼져 있어도 알림을 받기 위한 파일 (화면·데이터를 저장하지 않음)
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));

self.addEventListener('push', e => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch (_) { d = { body: e.data ? e.data.text() : '' }; }
  e.waitUntil(self.registration.showNotification(d.title || '카컨', {
    body: d.body || '',
    tag: d.tag || 'carcun',
    renotify: true,
    icon: 'icon-192.png',
    vibrate: [200, 100, 200],
    data: { url: d.url || '/' }
  }));
});

// 알림을 누르면 앱을 열고 그 차량 화면으로
self.addEventListener('notificationclick', e => {
  e.notification.close();
  const url = new URL((e.notification.data && e.notification.data.url) || '/', self.location.origin);
  e.waitUntil((async () => {
    const list = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const c of list) {
      if (new URL(c.url).origin === self.location.origin) {
        await c.focus();
        c.postMessage({ open: url.searchParams.get('o') });
        return;
      }
    }
    await self.clients.openWindow(url.href);
  })());
});
