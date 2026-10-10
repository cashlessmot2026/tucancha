// Prueba unitaria del service worker con un entorno simulado (self, clients, registration)
const fs = require('fs'), vm = require('vm');
const code = fs.readFileSync('C:/Users/victo/OneDrive/Desktop/padel/sw.js', 'utf8');
let fails = 0; const ok = (c, m) => { console.log(c ? '✔' : '✘', m); if (!c) fails++; };

function entorno(wins) {
  const handlers = {}, log = { shown: [], opened: [], focused: 0, posted: [] };
  const clientsList = wins.map(w => ({ ...w, focus: async () => { log.focused++; }, postMessage: m => log.posted.push(m) }));
  const self = {
    addEventListener: (t, fn) => { handlers[t] = fn; }, skipWaiting: () => {},
    clients: { claim: async () => {}, matchAll: async () => clientsList, openWindow: async u => { log.opened.push(u); } },
    registration: { showNotification: async (t, o) => { log.shown.push({ t, o }); } }
  };
  vm.runInNewContext(code, { self, console });
  const fire = async (type, ev) => { let p; ev.waitUntil = x => { p = x; }; handlers[type](ev); if (p) await p; };
  return { handlers, log, fire };
}
(async () => {
  // 1) app cerrada / en segundo plano: se muestra la notificación del sistema
  let e = entorno([{ visibilityState: 'hidden', focused: false }]);
  await e.fire('push', { data: { json: () => ({ title: '🆕 Reserva nueva', body: 'Reserva nueva de Jorge: cancha 1 · 19:00', tag: 'n-1', tipo: 'reserva_nueva', url: 'https://x/', icon: 'https://x/icon-192.png' }) } });
  const n = e.log.shown[0];
  ok(e.log.shown.length === 1, 'app en segundo plano → muestra 1 notificación');
  ok(n && n.t === '🆕 Reserva nueva' && /Jorge/.test(n.o.body), 'título y texto correctos');
  ok(n && n.o.requireInteraction === true, 'reserva nueva se queda en pantalla hasta que la toques');
  ok(n && Array.isArray(n.o.vibrate) && n.o.vibrate.length > 2, 'vibra en el celular');
  ok(n && n.o.tag === 'n-1' && n.o.renotify === true, 'cada aviso suena aunque haya otro anterior (renotify)');
  ok(n && n.o.data.url === 'https://x/', 'guarda la dirección para abrir la app');
  // 2) recarga (no urgente): no exige interacción
  e = entorno([]);
  await e.fire('push', { data: { json: () => ({ title: '💰 Recarga registrada', body: 'x', tag: 'n-2', tipo: 'recarga' }) } });
  ok(e.log.shown.length === 1 && e.log.shown[0].o.requireInteraction === false, 'recarga: se muestra y se puede descartar sola');
  // 3) app a la vista: NO duplica; le avisa a la app para que se actualice
  e = entorno([{ visibilityState: 'visible', focused: true }]);
  await e.fire('push', { data: { json: () => ({ title: 't', body: 'b', tipo: 'pago' }) } });
  ok(e.log.shown.length === 0 && e.log.posted.length === 1 && e.log.posted[0].type === 'push', 'app abierta y a la vista → no duplica; la app se actualiza al instante');
  // 4) datos vacíos o texto plano no rompen
  e = entorno([]);
  await e.fire('push', { data: { json: () => { throw new Error('no json'); }, text: () => 'hola' } });
  ok(e.log.shown.length === 1 && e.log.shown[0].o.body === 'hola', 'aviso de texto plano también se muestra');
  await e.fire('push', { data: null });
  ok(e.log.shown.length === 2, 'aviso sin datos se muestra con título por defecto');
  // 5) tocar la notificación: enfoca la app abierta, o la abre
  e = entorno([{ visibilityState: 'hidden', focused: false }]); let cerrada = false;
  await e.fire('notificationclick', { notification: { close: () => { cerrada = true; }, data: { url: 'https://x/' } } });
  ok(cerrada && e.log.focused === 1 && e.log.opened.length === 0, 'al tocarla con la app abierta → la trae al frente');
  e = entorno([]);
  await e.fire('notificationclick', { notification: { close: () => {}, data: { url: 'https://x/app/' } } });
  ok(e.log.opened[0] === 'https://x/app/', 'al tocarla con la app cerrada → la abre');
  console.log(fails ? `\n${fails} FALLOS` : '\nTODO OK');
  process.exit(fails ? 1 : 0);
})();
