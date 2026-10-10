/* Service worker · recibe los avisos push y los muestra aunque la app esté cerrada o en segundo plano.
   Debe publicarse en la MISMA carpeta que index.html. */
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', () => {});   // algunos navegadores lo exigen para poder instalar la app

self.addEventListener('push', e => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch (_) { d = { body: e.data ? e.data.text() : '' }; }
  const importante = ['reserva_nueva', 'reserva_cancelada', 'pago', 'publicidad'].includes(d.tipo);
  const opts = {
    body: d.body || '', icon: d.icon || 'icon-192.png', badge: 'icon-192.png',
    tag: d.tag || undefined, renotify: !!d.tag, requireInteraction: importante,
    vibrate: d.tipo === 'publicidad' ? [300, 100, 300, 100, 300, 100, 500] : [200, 100, 200, 100, 400],   // aviso del club: vibración más larga e insistente
    data: { url: d.url || './' }
  };
  e.waitUntil((async () => {
    const wins = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    // con la app a la vista ya suena y habla dentro de la propia app: solo se le avisa para que se actualice al instante
    if (wins.some(c => c.visibilityState === 'visible' && c.focused)) { wins.forEach(c => c.postMessage({ type: 'push', tipo: d.tipo || null })); return; }
    await self.registration.showNotification(d.title || '🔔 Notificación', opts);
  })());
});

// Si el navegador rota la suscripción push, se renueva aquí mismo (aunque la app esté cerrada);
// la app la vuelve a registrar en el servidor en cuanto se abre (pushSync).
self.addEventListener('pushsubscriptionchange', e => {
  const key = e.oldSubscription && e.oldSubscription.options && e.oldSubscription.options.applicationServerKey;
  if (!key) return;
  e.waitUntil(self.registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: key }).catch(() => {}));
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  const url = (e.notification.data && e.notification.data.url) || './';
  e.waitUntil((async () => {
    const wins = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const c of wins) { if ('focus' in c) { await c.focus(); c.postMessage({ type: 'push-click' }); return; } }
    if (self.clients.openWindow) await self.clients.openWindow(url);
  })());
});
