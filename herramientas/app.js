
/* =====================================================================
   CONFIGURACIÓN
   ===================================================================== */
const SB_URL = 'https://oshhdrnkegmhnasgwbpg.supabase.co';
const SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zaGhkcm5rZWdtaG5hc2d3YnBnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk5MzA4MTEsImV4cCI6MjEwNTUwNjgxMX0.Zvzx47E1emgtyTyUQH6mQEqBm_9u8kNgqkSP2_bAims';
const PTS_VICTORIA = 3;                       // puntos por partido ganado
const sb = supabase.createClient(SB_URL, SB_KEY);
const T = t => sb.from(t);
const UC = 'id,nombre,cedula,telefono,correo,role,wallet,puntos,partidos,victorias,sede_id,created_at,foto';
const DEF_NAME = 'Cashless-Sport (Pádel) Santa Marta';
const IMG_OK = /^data:image\/(png|jpe?g|webp|gif);base64,[A-Za-z0-9+/=]+$/;

/* =====================================================================
   UTILIDADES
   ===================================================================== */
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const pad = n => String(n).padStart(2, '0');
const money = n => '$' + Number(n || 0).toLocaleString('es-CO', { maximumFractionDigits: 0 });
const today = () => { const d = new Date(); return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`; };
const addDays = (s, n) => { const d = new Date(s + 'T12:00'); d.setDate(d.getDate() + n); return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`; };
const dfmt = (s, o) => new Date(s + 'T12:00').toLocaleDateString('es-CO', o);
const dfc = (s, o) => { const t = dfmt(s, o); return t.charAt(0).toUpperCase() + t.slice(1); };   // solo la primera letra en mayúscula: "Lunes, 21 de septiembre"
const hh = h => pad(h) + ':00';
const isAdm = () => S.user?.role === 'admin';
const empty = m => `<div class="empty">${m}</div>`;
const hue = s => { let h = 0; for (const c of String(s)) h = (h * 31 + c.charCodeAt(0)) % 360; return h; };
const avatar = (x, cls = '') => {
  const o = x && typeof x === 'object' ? x : { nombre: x }, n = o.nombre;
  if (o.foto && IMG_OK.test(o.foto)) return `<span class="av ${cls}" role="img" aria-label="${esc(n || '')}" style="background:#0a1530 url('${o.foto}') center/cover no-repeat"></span>`;
  return `<span class="av ${cls}" style="background:hsl(${hue(n)} 70% 68%)">${esc((n || '?').trim().split(/\s+/).slice(0, 2).map(w => w[0]).join('').toUpperCase())}</span>`;
};
const teamName = t => (t || []).map(p => p.nombre).join(' / ') || '—';

const ICON = {
  home:'<path d="M3 11l9-8 9 8v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
  cal:'<rect x="3" y="4" width="18" height="17" rx="2"/><path d="M8 2v4M16 2v4M3 10h18"/>',
  users:'<circle cx="9" cy="8" r="3.5"/><path d="M2 20c0-3.5 3-6 7-6s7 2.5 7 6"/><path d="M17 4.5a3.5 3.5 0 0 1 0 7M22 20c0-2.6-1.6-4.6-4-5.4"/>',
  people:'<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7"/>',
  trophy:'<path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0zM7 6H4v2a3 3 0 0 0 3 3M17 6h3v2a3 3 0 0 1-3 3"/>',
  bag:'<path d="M5 8h14l-1 12H6zM9 8V6a3 3 0 0 1 6 0v2"/>',
  wallet:'<path d="M3 7a2 2 0 0 1 2-2h13v4"/><rect x="3" y="7" width="18" height="13" rx="2"/><circle cx="16.5" cy="13.5" r="1.2"/>',
  bell:'<path d="M6 8a6 6 0 0 1 12 0c0 7 3 8 3 8H3s3-1 3-8M10 20a2 2 0 0 0 4 0"/>',
  tv:'<rect x="2" y="4" width="20" height="13" rx="2"/><path d="M8 21h8M12 17v4"/>',
  chart:'<path d="M4 20V10M10 20V4M16 20v-8M22 20H2"/>',
  check:'<path d="M4 12l5 5L20 6"/>',
  build:'<path d="M3 21h18M5 21V8l7-5 7 5v13M9 21v-6h6v6"/>',
  pie:'<path d="M12 3v9h9a9 9 0 1 1-9-9z"/><path d="M15.5 3.6A9 9 0 0 1 20.4 8.5H15.5z"/>',
  money:'<rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2.6"/><path d="M6 9v.01M18 15v.01"/>',
  gear:'<circle cx="12" cy="12" r="3"/><path d="M19.4 13a7.5 7.5 0 0 0 0-2l2-1.6-2-3.4-2.4.9a7.5 7.5 0 0 0-1.7-1L15 3.3h-4L10.6 6a7.5 7.5 0 0 0-1.7 1l-2.4-.9-2 3.4 2 1.6a7.5 7.5 0 0 0 0 2l-2 1.6 2 3.4 2.4-.9c.5.4 1.1.7 1.7 1l.4 2.6h4l.4-2.6c.6-.3 1.2-.6 1.7-1l2.4.9 2-3.4z"/>',
  bracket:'<path d="M3 4h5v5H3zM3 15h5v5H3zM16 9.5h5v5h-5zM8 6.5h3v11H8M11 12h5"/>',
  out:'<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>',
  mega:'<path d="M3 10v4a1 1 0 0 0 1 1h2l4 5V4l-4 5H4a1 1 0 0 0-1 1z"/><path d="M15 8a4 4 0 0 1 0 8M18 5a8 8 0 0 1 0 14M10 15v4a2 2 0 0 1-4 0v-3"/>'
};
const ic = n => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${ICON[n]}</svg>`;

/* SHA-256 (con respaldo por si crypto.subtle no está disponible) */
function sha256js(s) {
  const rr = (v, a) => (v >>> a) | (v << (32 - a));
  const K = [], Hh = [];
  for (let p = 2; K.length < 64; p++) {
    let ok = true; for (let d = 2; d * d <= p; d++) if (p % d === 0) { ok = false; break; }
    if (ok) { if (Hh.length < 8) Hh.push((Math.pow(p, .5) % 1 * 4294967296) | 0); K.push((Math.pow(p, 1/3) % 1 * 4294967296) | 0); }
  }
  const bytes = [...new TextEncoder().encode(s)], bl = bytes.length * 8;
  bytes.push(0x80); while (bytes.length % 64 !== 56) bytes.push(0);
  for (let i = 7; i >= 0; i--) bytes.push(i > 3 ? 0 : (bl >>> (i * 8)) & 255);
  const w = new Array(64); let H = Hh;
  for (let o = 0; o < bytes.length; o += 64) {
    for (let i = 0; i < 16; i++) w[i] = (bytes[o+i*4] << 24) | (bytes[o+i*4+1] << 16) | (bytes[o+i*4+2] << 8) | bytes[o+i*4+3];
    for (let i = 16; i < 64; i++) {
      const s0 = rr(w[i-15],7) ^ rr(w[i-15],18) ^ (w[i-15] >>> 3), s1 = rr(w[i-2],17) ^ rr(w[i-2],19) ^ (w[i-2] >>> 10);
      w[i] = (w[i-16] + s0 + w[i-7] + s1) | 0;
    }
    let [a,b,c,d,e,f,g,h] = H;
    for (let i = 0; i < 64; i++) {
      const S1 = rr(e,6) ^ rr(e,11) ^ rr(e,25), ch = (e & f) ^ (~e & g), t1 = (h + S1 + ch + K[i] + w[i]) | 0;
      const S0 = rr(a,2) ^ rr(a,13) ^ rr(a,22), mj = (a & b) ^ (a & c) ^ (b & c), t2 = (S0 + mj) | 0;
      h = g; g = f; f = e; e = (d + t1) | 0; d = c; c = b; b = a; a = (t1 + t2) | 0;
    }
    const v = [a,b,c,d,e,f,g,h]; H = H.map((x, i) => (x + v[i]) | 0);
  }
  return H.map(x => (x >>> 0).toString(16).padStart(8, '0')).join('');
}
async function sha(s) {
  try { if (window.crypto?.subtle) { const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s)); return [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, '0')).join(''); } } catch (e) {}
  return sha256js(s);
}

/* Recorta/ajusta una imagen (cuadrada para fotos de perfil, PNG para el logo) */
function fitImg(file, max, square, type = 'image/jpeg', q = .75) {
  return new Promise((res, rej) => {
    const fr = new FileReader();
    fr.onerror = () => rej(new Error('No se pudo leer la imagen'));
    fr.onload = () => {
      const im = new Image();
      im.onerror = () => rej(new Error('Archivo de imagen no válido'));
      im.onload = () => {
        let sx = 0, sy = 0, sw = im.width, sh = im.height, w, h;
        if (square) { const s = Math.min(im.width, im.height); sx = (im.width - s) / 2; sy = (im.height - s) / 2; sw = sh = s; w = h = Math.min(max, s); }
        else { const k = Math.min(1, max / Math.max(im.width, im.height)); w = Math.round(im.width * k); h = Math.round(im.height * k); }
        const c = document.createElement('canvas'); c.width = w; c.height = h;
        c.getContext('2d').drawImage(im, sx, sy, sw, sh, 0, 0, w, h);
        res(c.toDataURL(type, q));
      };
      im.src = fr.result;
    };
    fr.readAsDataURL(file);
  });
}

/* Reduce imágenes antes de guardarlas */
function resizeImg(file, max = 900, q = .72) {
  return new Promise((res, rej) => {
    const fr = new FileReader();
    fr.onerror = () => rej(new Error('No se pudo leer la imagen'));
    fr.onload = () => {
      const im = new Image();
      im.onerror = () => rej(new Error('Archivo de imagen no válido'));
      im.onload = () => {
        const k = Math.min(1, max / Math.max(im.width, im.height));
        const c = document.createElement('canvas'); c.width = im.width * k; c.height = im.height * k;
        c.getContext('2d').drawImage(im, 0, 0, c.width, c.height);
        res(c.toDataURL('image/jpeg', q));
      };
      im.src = fr.result;
    };
    fr.readAsDataURL(file);
  });
}

async function db(p) { const { data, error } = await p; if (error) throw new Error(error.message); return data; }
async function act(fn) { try { await fn(); } catch (e) { console.error(e); toast(e.message || String(e), 'err'); } }

function toast(msg, type = '') {
  const t = document.createElement('div'); t.className = 'toast ' + type; t.textContent = msg;
  $('#toasts').appendChild(t); setTimeout(() => t.remove(), 4200);
}
function popup3(html) {
  const d = document.createElement('div'); d.className = 'pop';
  d.innerHTML = `<div class="popc">${html}<div class="bar"><i></i></div></div>`;
  document.body.appendChild(d); setTimeout(() => d.remove(), 3000);
}
function modal(html, cls = '') {
  closeModal();
  const b = document.createElement('div'); b.className = 'mbg'; b.id = 'modal';
  b.innerHTML = `<div class="modal ${cls}"><button class="x" data-a="closeModal" aria-label="Cerrar">×</button>${html}</div>`;
  b.addEventListener('mousedown', e => { if (e.target === b) closeModal(); });
  document.body.appendChild(b); return b;
}
function closeModal() { stopCam(); $('#modal')?.remove(); if (typeof S !== 'undefined') S.retoOpenId = null; }

/* =====================================================================
   ESTADO
   ===================================================================== */
const S = { user: null, view: null, sedes: [], courts: [], rankings: [], sedeId: null, fecha: today(), rk: { sede: 'all', cat: 'all' }, mid: null, match: null, tmpImg: null, users: null, usersAt: 0, cfg: {}, tid: null };
const bc = ('BroadcastChannel' in window) ? new BroadcastChannel('padel-marcador') : null;

async function loadBase() {
  const [a, b, c, cf] = await Promise.all([
    db(T('sedes').select('*').eq('activa', true).order('nombre')),
    db(T('canchas').select('*').eq('activa', true).order('nombre')),
    db(T('rankings').select('*').order('orden')),
    db(T('ajustes').select('*')).catch(() => [])
  ]);
  S.sedes = a; S.courts = b; S.rankings = c;
  S.cfg = Object.fromEntries(cf.map(x => [x.clave, x.valor])); applyBrand();
  if (!S.sedeId || !a.find(x => x.id === S.sedeId)) S.sedeId = S.user?.sede_id || a[0]?.id || null;
}
const catOf = p => S.rankings.find(r => p >= r.min_puntos && (r.max_puntos == null || p <= r.max_puntos)) || S.rankings[0] || { id: 0, nombre: '—', color: '#999', min_puntos: 0 };
const catBadge = p => { const c = catOf(p); return `<span class="bd" style="--c:${c.color}">${esc(c.nombre)}</span>`; };
async function getUsers(force) {
  if (!force && S.users && Date.now() - S.usersAt < 60000) return S.users;
  S.users = await db(T('app_users').select(UC).order('nombre').limit(1000)); S.usersAt = Date.now(); return S.users;
}
async function refreshUser() {
  const u = await db(T('app_users').select(UC).eq('id', S.user.id).maybeSingle());
  if (u) { S.user = u; updTop(); }
}
function sedeSel() {
  return `<select class="in" style="max-width:260px" data-c="sede">${S.sedes.map(s => `<option value="${s.id}" ${s.id === S.sedeId ? 'selected' : ''}>${esc(s.nombre)}${s.ciudad ? ' · ' + esc(s.ciudad) : ''}</option>`).join('')}</select>`;
}

/* =====================================================================
   PWA (manifiesto en línea)
   ===================================================================== */
/* Marca del club: nombre y logo editables por el admin (tabla ajustes) */
const appName = () => (S.cfg.nombre_app || DEF_NAME).trim();
const appLogo = () => (S.cfg.logo && IMG_OK.test(S.cfg.logo)) ? S.cfg.logo : '';
function brandHtml() {
  const m = appName().match(/^(.*?)\s*(\(.*)$/), main = m ? m[1] || appName() : appName(), sub = m ? m[2] : '';
  const hy = main.indexOf('-'), mh = hy > 0 ? `${esc(main.slice(0, hy + 1))}<b>${esc(main.slice(hy + 1))}</b>` : esc(main);
  return `${appLogo() ? `<img class="logo" src="${appLogo()}" alt="">` : '<i></i>'}<span class="bn">${mh}${sub ? `<small>${esc(sub)}</small>` : ''}</span>`;
}
let pwaEls = [];
function applyBrand() {
  document.title = appName();
  pwaEls.forEach(e => e.remove()); pwaEls = [];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><rect width="512" height="512" rx="110" fill="#060d1c"/><circle cx="256" cy="256" r="120" fill="#b8f22a"/><path d="M150 210c70 30 140 30 212 0M150 302c70-30 140-30 212 0" stroke="#060d1c" stroke-width="18" fill="none"/></svg>`;
  const icon = appLogo() || 'data:image/svg+xml;base64,' + btoa(svg);
  const f = document.createElement('link'); f.rel = 'icon'; f.href = icon;   // el manifest de la app instalada es el archivo estático manifest.webmanifest
  document.head.append(f); pwaEls = [f];
}
applyBrand();

/* =====================================================================
   DELEGACIÓN DE EVENTOS
   ===================================================================== */
const A = {}, C = {}, V = {};
document.addEventListener('click', e => {
  if (!S.audioOk) { S.audioOk = true; try { actx().resume(); } catch (_) {} $('#audioBn') && ($('#audioBn').style.display = 'none'); }
  const el = e.target.closest('[data-a]'); if (!el) return;
  const f = A[el.dataset.a]; if (f) act(() => f(el.dataset, el, e));
});
document.addEventListener('change', e => { const el = e.target.closest('[data-c]'); if (el && C[el.dataset.c]) act(() => C[el.dataset.c](el.value, el)); });
document.addEventListener('input', e => { const el = e.target.closest('[data-i]'); if (el && C[el.dataset.i]) C[el.dataset.i](el.value, el); });
document.addEventListener('keydown', e => { if (e.key === 'Enter' && e.target.dataset?.enter) { const b = $(`[data-a="${e.target.dataset.enter}"]`); b && b.click(); } });
A.closeModal = closeModal;
A.go = d => { if (d.v === 'torneos') S.tid = null; go(d.v); };

/* ---- Idioma: botones ES / EN / PT / FR (traducen toda la página con Google Translate oculto) ---- */
const LANGS = [['es', 'ES'], ['en', 'EN'], ['pt', 'PT'], ['fr', 'FR']];
const curLang = () => { try { return localStorage.getItem('padel_lang') || 'es'; } catch (_) { return 'es'; } };
const langBtns = () => `<div class="lang" translate="no">${LANGS.map(l => `<button data-a="lang" data-l="${l[0]}" class="${curLang() === l[0] ? 'on' : ''}" title="${l[1]}">${l[1]}</button>`).join('')}</div>`;
function gtCookie(l) {
  const val = l === 'es' ? '' : `/es/${l}`, exp = l === 'es' ? '; expires=Thu, 01 Jan 1970 00:00:00 GMT' : '';
  document.cookie = `googtrans=${val}; path=/${exp}`;
  if (location.hostname) document.cookie = `googtrans=${val}; path=/; domain=${location.hostname}${exp}`;
}
window.gtInit = () => { try { new google.translate.TranslateElement({ pageLanguage: 'es', includedLanguages: 'es,en,pt,fr', autoDisplay: false }, 'gte'); } catch (_) {} };
(function () {
  const l = curLang(); document.documentElement.lang = l; gtCookie(l);
  if (l !== 'es') { const s = document.createElement('script'); s.src = 'https://translate.google.com/translate_a/element.js?cb=gtInit'; s.async = true; document.head.appendChild(s); }
})();
A.lang = d => {
  const l = d.l; if (l === curLang()) return;
  try { localStorage.setItem('padel_lang', l); } catch (_) {}
  gtCookie(l);
  const c = document.querySelector('select.goog-te-combo');
  if (c && l !== 'es') { c.value = l; c.dispatchEvent(new Event('change')); $$('.lang button').forEach(b => b.classList.toggle('on', b.dataset.l === l)); }
  else location.reload();
};

/* =====================================================================
   ARRANQUE
   ===================================================================== */
async function boot() {
  if (location.hash.startsWith('#/marcador')) return projector(location.hash.split('/')[2]);
  if (location.hash.startsWith('#/tomar/')) return takeScreen(location.hash.split('/')[2]);
  if (location.hash.startsWith('#/reloj/')) return relojScreen(location.hash.split('/')[2]);
  const ck = location.hash.match(/^#\/checkin\/([0-9a-f-]{36})/i); if (ck) S.pendingCheckin = ck[1];
  try { await loadBase(); }
  catch (e) {
    $('#app').innerHTML = `<div class="formwrap" style="min-height:100vh"><div class="card authcard"><h2>No se pudo conectar</h2><p class="muted mt">${esc(e.message)}</p><p class="mt">Ejecuta el archivo <b>schema.sql</b> en el SQL Editor de Supabase y recarga esta página.</p></div></div>`;
    return;
  }
  const uid = localStorage.getItem('padel_uid');
  if (uid) { try { const u = await db(T('app_users').select(UC).eq('id', uid).maybeSingle()); if (u) S.user = u; } catch (_) {} }
  S.user ? enterApp() : authScreen();
}
window.addEventListener('hashchange', () => { if (/^#\/(marcador|tomar|reloj)/.test(location.hash)) location.reload(); });

/* =====================================================================
   AUTENTICACIÓN (validada contra la base de datos)
   ===================================================================== */
function authScreen(tab = 'login') {
  $('#app').innerHTML = `
  <div class="auth"><div class="langfix">${langBtns()}</div>
    <div class="hero">
      <div class="brand" translate="no" style="padding:0 0 28px">${brandHtml()}</div>
      <h1>Tu pista,<br>tu ranking,<br><b>tu club.</b></h1>
      <p>Reserva cancha, arma partidos, suma 3 puntos por cada victoria y sube de categoría.</p>
      <div class="court"><i></i></div>
    </div>
    <div class="formwrap"><div class="authcard">
      <div class="tabs">
        <button data-a="authTab" data-t="login" class="${tab === 'login' ? 'on' : ''}">Ingresar</button>
        <button data-a="authTab" data-t="reg" class="${tab === 'reg' ? 'on' : ''}">Crear cuenta</button>
      </div>
      ${tab === 'login' ? `
        <label class="f">Cédula o correo</label><input class="in" id="l_ced" autocomplete="username" autocapitalize="none" data-enter="login">
        <label class="f">Contraseña</label><input class="in" id="l_pw" type="password" autocomplete="current-password" data-enter="login">
        <button class="btn full mt" data-a="login">Ingresar</button>
        <p class="mt" style="text-align:center"><a class="link" href="#" data-a="recOpen" onclick="return false">¿Olvidaste tu contraseña?</a></p>` : `
        <label class="f">Nombre completo</label><input class="in" id="r_nom" autocomplete="name">
        <div class="two"><div><label class="f">Cédula</label><input class="in" id="r_ced" inputmode="numeric"></div>
        <div><label class="f">Teléfono</label><input class="in" id="r_tel" inputmode="tel"></div></div>
        <label class="f">Correo</label><input class="in" id="r_mail" type="email" autocomplete="email">
        <label class="f">Sede principal</label><select class="in" id="r_sede">${S.sedes.map(s => `<option value="${s.id}">${esc(s.nombre)}</option>`).join('')}</select>
        <div class="two"><div><label class="f">Contraseña</label><input class="in" id="r_pw" type="password" autocomplete="new-password"></div>
        <div><label class="f">Repetir contraseña</label><input class="in" id="r_pw2" type="password" autocomplete="new-password" data-enter="register"></div></div>
        <button class="btn full mt" data-a="register">Crear cuenta</button>`}
    </div></div>
  </div>`;
}
A.authTab = d => authScreen(d.t);
/* Acepta cédula o correo y devuelve la cédula (el hash de la contraseña se calcula con ella) */
async function cedulaDe(ident) {
  ident = ident.trim();
  return ident.includes('@') ? await db(sb.rpc('app_cedula_por_correo', { p_correo: ident })) : ident;
}
A.login = async () => {
  const ced = $('#l_ced').value.trim(), pw = $('#l_pw').value;
  if (!ced || !pw) throw new Error('Escribe tu cédula o correo y tu contraseña');
  const ced2 = await cedulaDe(ced);
  const u = ced2 && await db(sb.rpc('app_login', { p_cedula: ced2, p_hash: await sha(ced2 + ':' + pw) }));
  if (!u) throw new Error('Cédula, correo o contraseña incorrecta');
  S.user = u; localStorage.setItem('padel_uid', u.id); await loadBase(); enterApp();
};
A.register = async () => {
  const nombre = $('#r_nom').value.trim(), ced = $('#r_ced').value.trim(), tel = $('#r_tel').value.trim(), mail = $('#r_mail').value.trim(), pw = $('#r_pw').value;
  if (nombre.length < 3) throw new Error('Escribe tu nombre completo');
  if (!/^\d{5,12}$/.test(ced)) throw new Error('La cédula debe tener entre 5 y 12 números');
  if (!/^\+?\d{7,15}$/.test(tel.replace(/[\s-]/g, ''))) throw new Error('Teléfono no válido');
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(mail)) throw new Error('Correo no válido');
  if (pw.length < 6) throw new Error('La contraseña debe tener al menos 6 caracteres');
  if (pw !== $('#r_pw2').value) throw new Error('Las contraseñas no coinciden');
  const u = await db(sb.rpc('app_register', { p_nombre: nombre, p_cedula: ced, p_telefono: tel, p_correo: mail, p_hash: await sha(ced + ':' + pw), p_sede: $('#r_sede').value || null }));
  S.user = u; localStorage.setItem('padel_uid', u.id); await loadBase(); toast('¡Cuenta creada! Bienvenido/a', 'ok'); enterApp();
};
A.recOpen = () => modal(`<h2>Recuperar contraseña</h2><p class="muted">Escribe tu cédula o correo. Te mostraremos una contraseña temporal durante 3 segundos.</p>
  <label class="f">Cédula o correo</label><input class="in" id="rc_ced" autocapitalize="none" data-enter="recGo"><button class="btn full mt" data-a="recGo">Recuperar</button>`);
A.recGo = async () => {
  const id = $('#rc_ced').value.trim(); if (!id) throw new Error('Escribe tu cédula o correo');
  const ced = await cedulaDe(id);
  const tmp = String(Math.floor(100000 + Math.random() * 900000));
  const ok = ced && await db(sb.rpc('app_recover', { p_cedula: ced, p_hash: await sha(ced + ':' + tmp) }));
  if (!ok) throw new Error('No hay un jugador con esa cédula o correo (las cuentas de administrador se recuperan desde Supabase)');
  closeModal(); popup3(`<div class="muted">Tu contraseña temporal es</div><b>${tmp}</b><div class="muted">Ingresa con ella y guárdala. Desaparece en 3 segundos.</div>`);
};
/* ---- Perfil: foto de cada usuario ---- */
A.perfil = () => {
  const u = S.user;
  modal(`<h2>Mi perfil</h2>
    <div class="row mt" style="gap:16px;flex-wrap:nowrap"><span id="pf_av">${avatar(u, 'xl')}</span><div><b>${esc(u.nombre)}</b><br><small>${isAdm() ? 'Administrador' : 'C.C. ' + esc(u.cedula)}</small></div></div>
    <label class="f">Foto de perfil (se recorta en cuadrado)</label>
    <input class="in" type="file" accept="image/*" data-c="perfilFoto">
    ${u.foto ? '<button class="btn danger sm mt" data-a="perfilQuitar">Quitar foto</button>' : ''}`);
};
async function guardarFoto(foto) {
  await db(T('app_users').update({ foto }).eq('id', S.user.id));
  S.user.foto = foto; S.users = null; updTop(); closeModal(); toast(foto ? 'Foto actualizada' : 'Foto eliminada', 'ok'); if (S.view) reload();
}
C.perfilFoto = async (v, el) => { const f = el.files[0]; if (!f) return; await guardarFoto(await fitImg(f, 160, true, 'image/jpeg', .72)); };
A.perfilQuitar = () => guardarFoto(null);

A.logout = () => { pushQuitar(); localStorage.removeItem('padel_uid'); S.user = null; clearInterval(S.poll); authScreen(); };

/* =====================================================================
   SHELL DE LA APP
   ===================================================================== */
const NAVP = [['home','Inicio','home'],['reservar','Reservar','cal'],['encuentros','Encuentros','users'],['torneos','Torneos','bracket'],['comunidad','Comunidad','people'],['ranking','Ranking','trophy'],['tienda','Tienda','bag']];
const NAVA = [['dash','Panel','chart'],['conta','Contabilidad','money'],['stats','Estadísticas','pie'],['marcador','Marcador','tv'],['reservar','Reservas','cal'],['encuentros','Encuentros','users'],['torneos','Torneos','bracket'],['ranking','Rankings','trophy'],['tienda','Tienda','bag'],['compras','Compras','check'],['wallets','Wallets','wallet'],['jugadores','Jugadores','people'],['sedes','Sedes','build'],['publicidad','Publicidad','mega'],['ajustes','Ajustes','gear']];
const TITLES = { home:'Inicio', reservar:'Reservar cancha', encuentros:'Encuentros', torneos:'Torneos', comunidad:'Comunidad', ranking:'Ranking', tienda:'Tienda', wallet:'Mi wallet', dash:'Panel', marcador:'Marcador', compras:'Compras por aprobar', wallets:'Wallets', jugadores:'Jugadores', sedes:'Sedes y canchas', ajustes:'Ajustes del club', conta:'Contabilidad', stats:'Estadísticas del negocio', publicidad:'Publicidad' };

function enterApp() {
  const nav = isAdm() ? NAVA : NAVP;
  $('#app').innerHTML = `
  <div class="shell">
    <aside class="side">
      <div class="brand" translate="no">${brandHtml()}</div>
      ${nav.map(n => `<button class="nav" data-a="go" data-v="${n[0]}" id="nv-${n[0]}">${ic(n[2])}<span>${n[1]}</span>${n[0] === 'compras' ? '<span class="bdg" id="bd-compras" style="display:none">0</span>' : ''}</button>`).join('')}
      <div class="sp"></div>
      <div class="who" data-a="perfil" style="cursor:pointer" title="Mi perfil"><div class="pl">${avatar(S.user)}<div><b>${esc(S.user.nombre)}</b><br><small>${isAdm() ? 'Administrador' : 'Cédula ' + esc(S.user.cedula)}</small></div></div></div>
    </aside>
    <section class="main">
      <div class="top"><h1 id="ttl"></h1>
        <div class="row">
          ${langBtns()}
          ${isAdm() ? '' : `<button class="chip" data-a="go" data-v="wallet">${ic('wallet')}<span id="wchip"></span></button>`}
          <button class="ib" data-a="perfil" id="pfb" aria-label="Mi perfil"></button>
          <button class="ib" data-a="bell" aria-label="Notificaciones">${ic('bell')}<span class="bdg" id="bcount" style="display:none">0</span></button>
          <button class="ib" data-a="logout" aria-label="Salir">${ic('out')}</button>
        </div>
      </div>
      <div class="audio" id="audioBn">🔔 Toca en cualquier lugar para activar las alertas con sonido y voz (reservas, cancelaciones, pagos y recargas).</div>
      <div id="view"></div>
    </section>
  </div>`;
  if (isAdm() && !S.audioOk) $('#audioBn').style.display = 'block';
  updTop();
  go(isAdm() ? 'dash' : 'home');
  S.seen = undefined; S.retoSig = undefined; clearInterval(S.poll); S.poll = setInterval(poll, isAdm() ? 4000 : 6000); poll();
  syncAppUrl(); pushSync(); pushBanner();
  if (S.pendingCheckin) { const t = S.pendingCheckin; S.pendingCheckin = null; history.replaceState(null, '', location.pathname + location.search); act(() => checkin(t)); }
}
function updTop() {
  const w = $('#wchip'); if (w) w.textContent = money(S.user.wallet);
  const p = $('#pfb'); if (p) p.innerHTML = avatar(S.user);
  const wh = $('.who'); if (wh) wh.querySelector('.av')?.replaceWith(...new DOMParser().parseFromString(avatar(S.user), 'text/html').body.childNodes);
}
async function go(v) {
  S.view = v;
  $$('.nav').forEach(n => n.classList.toggle('on', n.id === 'nv-' + v || (v === 'wallet' && false)));
  $('#ttl').textContent = TITLES[v] || '';
  const el = $('#view'); el.innerHTML = '<div class="ld">Cargando…</div>';
  try { const html = await V[v](); if (S.view === v) el.innerHTML = html; }
  catch (e) { console.error(e); el.innerHTML = empty('No se pudo cargar: ' + esc(e.message)); }
  window.scrollTo(0, 0);
}
const reload = () => go(S.view);
C.sede = v => { S.sedeId = v; reload(); };

/* ---- Alertas: compras pendientes (admin) y notificaciones ---- */
let lastPend = 0, lastBeep = 0, AC;
const actx = () => AC || (AC = new (window.AudioContext || window.webkitAudioContext)());
function tone(freqs, vol = .35) {   // tres notas cortas; cada tipo de notificación suena distinto (vol más alto = más fuerte)
  try {
    const c = actx(); freqs.forEach((f, i) => {
      const t = i * .22, o = c.createOscillator(), g = c.createGain(); o.type = 'sine'; o.frequency.value = f; o.connect(g); g.connect(c.destination);
      g.gain.setValueAtTime(.0001, c.currentTime + t); g.gain.exponentialRampToValueAtTime(vol, c.currentTime + t + .03); g.gain.exponentialRampToValueAtTime(.0001, c.currentTime + t + .2);
      o.start(c.currentTime + t); o.stop(c.currentTime + t + .22);
    });
  } catch (_) {}
}
const beep = () => tone([880, 1175, 880]);

/* Voz del sistema (una frase a la vez, sin pisarse) */
let voiceQ = [], voiceBusy = false;
function say(text) { voiceQ.push(text); nextVoice(); }
function nextVoice() {
  if (voiceBusy || !voiceQ.length) return;
  if (!('speechSynthesis' in window)) { voiceQ = []; return; }
  voiceBusy = true;
  const fin = () => { if (voiceBusy) { voiceBusy = false; setTimeout(nextVoice, 300); } };
  try {
    const u = new SpeechSynthesisUtterance(voiceQ.shift()); u.lang = 'es-CO'; u.rate = .98; u.onend = fin; u.onerror = fin;
    const v = speechSynthesis.getVoices().find(x => /^es[-_](CO|MX|US|419)/i.test(x.lang)) || speechSynthesis.getVoices().find(x => /^es/i.test(x.lang)); if (v) u.voice = v;
    speechSynthesis.speak(u); setTimeout(fin, 25000);   // por si el navegador nunca avisa que terminó
  } catch (_) { fin(); }
}
function alarm() {
  beep(); setTimeout(() => say('Tienes una compra pendiente por aprobación'), 700);
  toast('🔔 Tienes una compra pendiente por aprobación', 'warn');
}

/* Campanita del admin: reservas nuevas, cancelaciones, pagos y recargas (las crean triggers en la base de datos) */
const NOTIF = {
  reserva_nueva: { ico: '🆕', cls: 'ok', tono: [660, 880, 1100], color: 'var(--ok)' },
  reserva_cancelada: { ico: '❌', cls: 'warn', tono: [880, 660, 440], color: 'var(--red)' },
  pago: { ico: '💳', cls: 'warn', tono: [1047, 1319, 1047], color: 'var(--warn)' },
  recarga: { ico: '💰', cls: 'ok', tono: [784, 988, 1175], color: 'var(--blue)' },
  reto: { ico: '⚔️', cls: 'ok', tono: [784, 988, 1175], color: 'var(--lime)' },
  publicidad: { ico: '📣', cls: 'ok', tono: [1047, 784, 1047, 784, 1319], vol: .7, color: 'var(--blue)' },   // más notas y más volumen: llama la atención como un aviso importante
  marcador: { ico: '🎾', cls: 'ok', tono: [600, 750, 900], color: 'var(--lime)' }
};
function updBell(n) {
  const b = $('#bcount'); if (b) { b.textContent = n; b.style.display = n ? '' : 'none'; }
  const ib = $('.ib[data-a="bell"]'); if (ib) ib.classList.toggle('alert', !!n && isAdm());   // roja mientras haya avisos sin leer
}
function announceNotif(n) {
  const k = NOTIF[n.tipo] || { cls: 'warn', tono: [880, 1175, 880] };
  toast(n.texto, k.cls);
  if (!S.audioOk) return;   // el navegador exige un toque previo en la página para poder sonar
  tone(k.tono, k.vol); setTimeout(() => say(n.voz || n.texto), 700);
}
async function poll() {
  if (!S.user) return;
  try {
    if (isAdm()) {
      const { count } = await T('ordenes').select('id', { count: 'exact', head: true }).eq('estado', 'pendiente');
      const n = count || 0, b = $('#bd-compras'); if (b) { b.textContent = n; b.style.display = n ? '' : 'none'; }
      if (n > 0 && Date.now() - lastBeep > 25000) { alarm(); lastBeep = Date.now(); }   // recordatorio mientras haya compras sin aprobar
      if (S.view === 'compras' && n > lastPend) reload();
      lastPend = n;
      const un = await db(T('notificaciones').select('id,texto,tipo,voz,created_at').eq('user_id', S.user.id).eq('leida', false).order('created_at'));
      updBell(un.length);
      if (!S.seen) S.seen = new Set(un.map(x => x.id));   // lo que ya estaba sin leer al entrar no se lee en voz alta
      else {
        const nuevas = un.filter(x => !S.seen.has(x.id)); nuevas.forEach(x => S.seen.add(x.id));
        nuevas.forEach(announceNotif); if (nuevas.some(x => x.tipo === 'pago')) lastBeep = Date.now();
      }
    } else {
      const un = await db(T('notificaciones').select('id,texto,tipo,voz').eq('user_id', S.user.id).eq('leida', false).order('created_at'));
      updBell(un.length);
      if (!S.seen) S.seen = new Set(un.map(x => x.id));   // lo que ya estaba sin leer al entrar no suena
      else {
        const nuevas = un.filter(x => !S.seen.has(x.id)); nuevas.forEach(x => S.seen.add(x.id));
        nuevas.filter(x => x.tipo === 'publicidad').forEach(announceNotif);   // los avisos del club también suenan fuerte para el jugador
      }
      await pollRetos();   // ventana automática cuando te retan o cuando responden a tu reto
    }
    if (S.view === 'torneos' && S.tid) refreshBracket();
    if (isAdm() && S.match?.status === 'en_juego') await drenarColaMarcador();   // puntos anotados desde fuera del navegador (reloj, atajo…)
  } catch (_) {}
}
/* ---- Notificaciones push: avisos en el celular aunque la app esté cerrada o en segundo plano ---- */
const VAPID_PUB = 'BGtml9BrD14RKJowCAy9ve01PNMPm1l62sYvsC_E0GRTHXhu_XkM3vdB1jGlzxvzZCrgkYMtJy2oxEvxBGpHdZ4';
const u8 = s => { const b = atob((s + '='.repeat((4 - s.length % 4) % 4)).replace(/-/g, '+').replace(/_/g, '/')); return Uint8Array.from([...b].map(c => c.charCodeAt(0))); };
const pushOk = () => 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window && /^https?:$/.test(location.protocol);
let swReg = null;
async function swInit() {
  try { navigator.storage?.persist?.(); } catch (_) {}   // pide al navegador que no borre la sesión guardada
  if (!('serviceWorker' in navigator) || !/^https?:$/.test(location.protocol)) return;
  try {
    swReg = await navigator.serviceWorker.register('sw.js');
    navigator.serviceWorker.addEventListener('message', e => { if (e.data?.type === 'push') poll(); if (e.data?.type === 'push-click' && S.user) poll(); });
  } catch (_) {}
}
async function pushSub(create) {
  const reg = swReg || await navigator.serviceWorker.ready;
  let sub = await reg.pushManager.getSubscription();
  if (!sub && create) sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: u8(VAPID_PUB) });
  if (!sub) return null;
  const j = sub.toJSON();
  await db(sb.rpc('push_guardar', { p_user: S.user.id, p_endpoint: j.endpoint, p_p256dh: j.keys.p256dh, p_auth: j.keys.auth, p_ua: navigator.userAgent }));
  return sub;
}
async function pushEnable() {
  if (!pushOk()) throw new Error('Este navegador no permite notificaciones. En iPhone, primero instala la app: Compartir → “Añadir a pantalla de inicio”.');
  const perm = await Notification.requestPermission();
  if (perm !== 'granted') throw new Error('Las notificaciones están bloqueadas. Actívalas en los ajustes del navegador para este sitio.');
  await pushSub(true); $('#pushBn')?.remove(); toast('🔔 Notificaciones activadas en este dispositivo', 'ok');
}
async function pushSync() { if (pushOk() && Notification.permission === 'granted' && S.user) { try { await pushSub(true); } catch (_) {} } }   // en cada arranque renueva el registro del dispositivo
async function pushQuitar() {
  try { const reg = swReg || await navigator.serviceWorker.ready, sub = await reg.pushManager.getSubscription(); if (sub) { const ep = sub.endpoint; await sub.unsubscribe(); await sb.rpc('push_quitar', { p_endpoint: ep }); } } catch (_) {}
}
function pushBanner() {
  if (!pushOk() || Notification.permission !== 'default' || $('#pushBn')) return;
  try { if (localStorage.getItem('padel_push_no')) return; } catch (_) {}
  $('#view')?.insertAdjacentHTML('beforebegin', `<div class="audio" id="pushBn" style="display:block;background:#0f2a22;border-color:#1f6b4c;color:#b8f5dc">🔔 Activa las notificaciones para recibir avisos <b>aunque la app esté cerrada</b>. <span class="row" style="display:inline-flex;margin-left:6px"><button class="btn sm" data-a="pushOn">Activar</button><button class="btn sec sm" data-a="pushNo">Ahora no</button></span></div>`);
}
A.pushOn = async () => { await pushEnable(); closeModal(); };
A.pushOff = async () => { await pushQuitar(); toast('Notificaciones desactivadas en este dispositivo'); closeModal(); };
A.pushNo = () => { try { localStorage.setItem('padel_push_no', '1'); } catch (_) {} $('#pushBn')?.remove(); };
async function pushEstadoHtml() {
  if (!pushOk()) return '<div class="fac"><small>📵 Este dispositivo no admite avisos con la app cerrada. En iPhone: instala la app (Compartir → “Añadir a pantalla de inicio”) y ábrela desde el ícono.</small></div>';
  let sub = null; try { sub = await (swReg || await navigator.serviceWorker.ready).pushManager.getSubscription(); } catch (_) {}
  if (Notification.permission === 'granted' && sub) return '<div class="fac row between"><span>✅ Avisos activados en este dispositivo</span><button class="btn sec sm" data-a="pushOff">Desactivar</button></div>';
  if (Notification.permission === 'denied') return '<div class="fac"><small>🚫 Las notificaciones están bloqueadas para este sitio. Actívalas en los ajustes del navegador y vuelve a abrir esta ventana.</small></div>';
  return '<div class="fac row between"><span>🔔 Recibe avisos aunque la app esté cerrada</span><button class="btn sm" data-a="pushOn">Activar</button></div>';
}
swInit();

A.bell = async () => {
  const ns = await db(T('notificaciones').select('*').eq('user_id', S.user.id).order('created_at', { ascending: false }).limit(30));
  const ps = await pushEstadoHtml();
  modal(`<h2>Notificaciones</h2>${ps}${ns.length ? ns.map(n => `<div class="card mt" style="padding:12px;${n.tipo && NOTIF[n.tipo] ? 'border-left:4px solid ' + NOTIF[n.tipo].color : ''}${n.leida ? ';opacity:.7' : ''}"><div>${esc(n.texto)}</div><div class="row between mt"><small>${dfmt(n.created_at.slice(0,10), { day:'numeric', month:'short' })} · ${new Date(n.created_at).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}</small>${n.encuentro_id ? `<button class="btn sm" data-a="encJoin" data-id="${n.encuentro_id}">Unirme</button>` : ''}${n.reto_id ? `<button class="btn sm" data-a="retoOpen" data-id="${n.reto_id}">Ver reto</button>` : ''}${n.publicidad_id ? `<button class="btn sm" data-a="pubVer" data-id="${n.publicidad_id}">Ver aviso</button>` : ''}</div></div>`).join('') : empty('No tienes notificaciones')}`);
  if (ns.some(n => !n.leida)) { await T('notificaciones').update({ leida: true }).eq('user_id', S.user.id).eq('leida', false); if (S.seen) ns.forEach(n => S.seen.add(n.id)); poll(); }
};

/* =====================================================================
   VISTAS · JUGADOR
   ===================================================================== */
V.home = async () => {
  const u = S.user, cat = catOf(u.puntos);
  const [res, enc] = await Promise.all([
    db(T('reservas').select('id,fecha,hora,canchas(nombre),sedes(nombre)').eq('user_id', u.id).eq('estado', 'confirmada').gte('fecha', today()).order('fecha').order('hora').limit(3)),
    db(T('encuentros').select('id').eq('estado', 'abierto').gte('fecha', today()))
  ]);
  const next = S.rankings.filter(r => r.min_puntos > u.puntos).sort((a, b) => a.min_puntos - b.min_puntos)[0];
  const pct = next ? Math.min(100, Math.round((u.puntos - cat.min_puntos) / (next.min_puntos - cat.min_puntos) * 100)) : 100;
  const tile = (v, i, t, s) => `<button class="tile" data-a="go" data-v="${v}">${ic(i)}<b>${t}</b><small>${s}</small></button>`;
  return `
  <div class="grid g2">
    <div class="card"><div class="pl">${avatar(u, 'lg')}<div><h3 style="margin:0">Hola, ${esc(u.nombre.split(' ')[0])}</h3>${catBadge(u.puntos)}</div></div>
      <div class="row between mt"><b style="font:800 30px var(--fh)">${u.puntos} <small>puntos</small></b><small>${u.victorias} victorias · ${u.partidos} partidos</small></div>
      <div class="prog"><i style="width:${pct}%"></i></div><small>${next ? `Te faltan ${next.min_puntos - u.puntos} puntos para ${esc(next.nombre)}` : 'Estás en la categoría más alta'}</small></div>
    <div class="wal"><small style="color:#b7c9f5">Saldo de tu wallet</small><b>${money(u.wallet)}</b><p style="color:#b7c9f5;margin:8px 0 14px">Recarga en taquilla y úsalo en la tienda o en tus apuestas.</p><button class="btn sm" data-a="go" data-v="wallet">Ver movimientos</button></div>
  </div>
  ${agentCard()}
  <div class="grid g3 mt">
    ${tile('reservar','cal','Reservar cancha','Elige sede, hora y pista')}
    ${tile('encuentros','users','Encuentros',`${enc.length} abiertos para unirte`)}
    ${tile('comunidad','people','Comunidad','Todos los jugadores del club')}
    ${tile('ranking','trophy','Ranking','Tu posición por categoría')}
    ${tile('tienda','bag','Tienda','Artículos deportivos con tu wallet')}
    ${tile('wallet','wallet','Mi wallet','Saldo y movimientos')}
  </div>
  <h3 class="mt2" style="margin-bottom:10px">Tus próximas reservas</h3>
  ${res.length ? res.map(r => `<div class="card mt" style="padding:14px"><b>${esc(r.canchas?.nombre)}</b> · ${esc(r.sedes?.nombre)}<br><small>${dfc(r.fecha, { weekday:'long', day:'numeric', month:'long' })} · ${hh(r.hora)}</small></div>`).join('') : empty('Aún no tienes reservas. ¡Reserva tu primera cancha!')}`;
};

/* ---------- RESERVAR (jugador y admin) ---------- */
V.reservar = async () => {
  const adm = isAdm(), sede = S.sedes.find(s => s.id === S.sedeId);
  if (!sede) return empty('No hay sedes configuradas.');
  const courts = S.courts.filter(c => c.sede_id === sede.id);
  const rs = courts.length ? await db(T('reservas').select('id,court_id,hora,user_id,nombre_cliente,app_users(nombre)').in('court_id', courts.map(c => c.id)).eq('fecha', S.fecha).eq('estado', 'confirmada')) : [];
  const days = [...Array(10)].map((_, i) => addDays(today(), i)), nowH = new Date().getHours();
  let mine = [], waits = [], live = [];
  if (!adm) {
    [mine, waits] = await Promise.all([
      db(T('reservas').select('id,fecha,hora,uso,inicio_real,fin_real,canchas(nombre),sedes(nombre)').eq('user_id', S.user.id).eq('estado', 'confirmada').gte('fecha', today()).order('fecha').order('hora')),
      db(T('lista_espera').select('id,fecha,hora,estado,canchas(nombre),sedes(nombre)').eq('user_id', S.user.id).in('estado', ['esperando', 'notificado']).gte('fecha', today()).order('fecha').order('hora'))
    ]);
  } else if (courts.length) {
    live = (await db(T('reservas').select('id,court_id,fecha,hora,uso,inicio_real,fin_real,nombre_cliente,canchas(nombre),app_users(nombre)').in('court_id', courts.map(c => c.id)).eq('fecha', today()).eq('estado', 'confirmada')))
      .filter(r => { const c = rsvClock(r), n = Date.now(); return c.estado === 'en_uso' || (c.estado === 'pendiente' && n >= c.s - 15 * 60000 && n < c.e); }).sort((a, b) => a.hora - b.hora);
  }
  return `
  ${agentCard()}
  ${adm ? `<div class="card"><div class="row between"><h3 style="margin:0">Reservas en curso</h3><div class="row"><label class="fl" style="cursor:pointer"><input type="checkbox" data-c="autoIni" ${S.cfg.inicio_auto === '1' ? 'checked' : ''}> Inicio automático del contador</label><button class="btn sm" data-a="scanOpen">📷 Escanear QR</button></div></div>
    ${live.length ? live.map(r => { const c = rsvClock(r); return `<div class="fac"><div class="row between"><div><b>${esc(r.canchas?.nombre)}</b> · ${hh(r.hora)}<br><small>${esc(r.nombre_cliente || r.app_users?.nombre || 'Reservada')}</small></div><div style="text-align:right">${clockHtml(r)}</div></div>
      <div class="row mt">${c.estado === 'pendiente' ? `<button class="btn sm" data-a="rsvStart" data-id="${r.id}">▶ Iniciar ahora</button>` : ''}${c.estado === 'en_uso' ? `<button class="btn sec sm" data-a="rsvEnd" data-id="${r.id}">■ Finalizar</button>` : ''}<button class="btn sec sm" data-a="rsvInfo" data-id="${r.id}">Detalles</button></div></div>`; }).join('') : '<p class="muted mt"><small>No hay reservas en curso ni por iniciar en esta sede. Las reservas aparecen aquí desde 15 minutos antes de su hora.</small></p>'}
    <p class="muted mt"><small>${S.cfg.inicio_auto === '1' ? 'El contador de cada reserva empieza solo a la hora reservada.' : 'El contador empieza cuando escaneas el QR o pulsas “Iniciar ahora”.'}</small></p></div>` : ''}
  <h3 class="${adm ? 'mt2' : ''}" style="margin-bottom:8px">${adm ? 'Sede' : '¿En qué sede quieres reservar?'}</h3>
  <div class="filters">${S.sedes.map(s => `<button class="fl ${s.id === sede.id ? 'on' : ''}" data-a="setSede" data-id="${s.id}">${esc(s.nombre)}${s.ciudad ? ' · ' + esc(s.ciudad) : ''}${adm && s.id === S.user.sede_id ? ' (mi sede)' : ''}</button>`).join('')}</div>
  <div class="days mt">${days.map(d => `<button class="day ${d === S.fecha ? 'on' : ''}" data-a="setFecha" data-f="${d}"><small>${dfmt(d, { weekday:'short' })}</small><b>${dfmt(d, { day:'numeric' })}</b><small>${dfmt(d, { month:'short' })}</small></button>`).join('')}</div>
  ${courts.length ? courts.map(c => `<div class="card mt"><div class="row between"><h3>${esc(c.nombre)}</h3><small>${money(c.precio_hora)} / hora · se paga en taquilla</small></div><div class="slots">
    ${(() => { let o = ''; for (let h = sede.apertura; h < sede.cierre; h++) {
      const r = rs.find(x => x.court_id === c.id && x.hora === h), past = S.fecha === today() && h <= nowH;
      if (r) { const own = r.user_id === S.user.id, wait = !adm && !own && !past; o += `<button class="slot taken ${own ? 'mine' : ''}" ${adm || own ? `data-a="rsvInfo" data-id="${r.id}"` : wait ? `data-a="waitOpen" data-court="${c.id}" data-hora="${h}"` : 'disabled'}>${hh(h)}<small>${adm ? esc(r.nombre_cliente || r.app_users?.nombre || 'Reservada') : own ? 'Tuya' : wait ? '⏳ Lista de espera' : 'Ocupada'}</small></button>`; }
      else o += `<button class="slot" ${past ? 'disabled' : `data-a="rsvOpen" data-court="${c.id}" data-hora="${h}"`}>${hh(h)}<small>Libre</small></button>`;
    } return o; })()}
  </div></div>`).join('') : empty('Esta sede aún no tiene canchas.')}
  ${!adm ? `<h3 class="mt2" style="margin-bottom:10px">Mis reservas</h3>${mine.length ? mine.map(r => `<div class="card mt row between" style="padding:14px"><div><b>${esc(r.canchas?.nombre)}</b> · ${esc(r.sedes?.nombre)}<br><small>${dfc(r.fecha, { weekday:'long', day:'numeric', month:'long' })} · ${hh(r.hora)}</small></div><div class="row" style="justify-content:flex-end">${clockHtml(r)}<button class="btn sec sm" data-a="qrShow" data-id="${r.id}">Ver QR</button><button class="btn danger sm" data-a="rsvCancel" data-id="${r.id}">Cancelar</button></div></div>`).join('') : empty('No tienes reservas próximas.')}
    ${waits.length ? `<h3 class="mt2" style="margin-bottom:10px">Mis listas de espera</h3>${waits.map(w => `<div class="card mt row between" style="padding:14px"><div><b>${esc(w.canchas?.nombre)}</b> · ${esc(w.sedes?.nombre)}<br><small style="text-transform:capitalize">${dfmt(w.fecha, { weekday:'long', day:'numeric', month:'long' })} · ${hh(w.hora)}</small><br><small>${w.estado === 'notificado' ? '📧 Te avisamos por correo: revisa tu bandeja' : '⏳ Esperando que se libere'}</small></div><button class="btn sec sm" data-a="waitLeave" data-id="${w.id}">Salir de la lista</button></div>`).join('')}` : ''}` : ''}`;
};
A.setFecha = d => { S.fecha = d.f; reload(); };
A.setSede = d => { S.sedeId = d.id; reload(); };
A.rsvOpen = async d => {
  const c = S.courts.find(x => x.id === d.court);
  let extra = '';
  if (isAdm()) { const us = await getUsers(); extra = `<label class="f">Jugador (opcional)</label><input class="in" id="rv_user" list="ul" placeholder="Busca por nombre o cédula"><datalist id="ul">${us.filter(u => u.role === 'jugador').map(u => `<option value="${esc(u.nombre)} · ${esc(u.cedula)}">`).join('')}</datalist>
    <label class="f">…o nombre del cliente de mostrador</label><input class="in" id="rv_cli">
    <label class="f">Correo del cliente de mostrador (opcional, para enviarle el QR)</label><input class="in" id="rv_mail" type="email" autocomplete="off">`; }
  const sd = S.sedes.find(s => s.id === c.sede_id);
  modal(`<h2>Confirmar reserva</h2><p><b>Sede:</b> ${esc(sd?.nombre || '')}${sd?.ciudad ? ' · ' + esc(sd.ciudad) : ''}</p><p class="muted">${esc(c.nombre)} · ${dfc(S.fecha, { weekday:'long', day:'numeric', month:'long' })} · ${hh(+d.hora)}</p>
    <p class="mt">Valor: <b>${money(c.precio_hora)}</b> <small>(se paga en taquilla)</small></p>${extra}
    <button class="btn full mt" data-a="rsvGo" data-court="${c.id}" data-hora="${d.hora}">Reservar</button>`);
};
A.rsvGo = async d => {
  const c = S.courts.find(x => x.id === d.court); let uid = S.user.id, cli = null, mailCli = null, hasMail = !!S.user.correo;
  if (isAdm()) {
    uid = null; const v = $('#rv_user').value.trim(), us = await getUsers();
    const u = us.find(x => `${x.nombre} · ${x.cedula}` === v); if (u) uid = u.id; else if (v) throw new Error('Elige un jugador de la lista');
    cli = $('#rv_cli').value.trim() || null; if (!uid && !cli) throw new Error('Indica el jugador o el nombre del cliente');
    mailCli = $('#rv_mail').value.trim() || null; if (mailCli && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(mailCli)) throw new Error('Correo del cliente no válido');
    hasMail = !!(mailCli || (u && u.correo));
  }
  let r;
  try { r = await db(T('reservas').insert({ sede_id: c.sede_id, court_id: c.id, user_id: uid, nombre_cliente: cli, correo_cliente: mailCli, fecha: S.fecha, hora: +d.hora }).select('id').single()); }
  catch (e) { throw new Error(/duplicate|unique/i.test(e.message) ? 'Ese horario acaba de ser reservado. Elige otro.' : e.message); }
  closeModal(); toast('Reserva confirmada', 'ok'); reload();
  if (hasMail) mailReserva(r.id);
};

/* ---- Correos (los envía la Edge Function "correos" desde la cuenta de Gmail del club) ---- */
async function fnCorreos(body) {
  const { data, error } = await sb.functions.invoke('correos', { body });
  if (error) throw new Error(error.message || 'No se pudo contactar el servicio de correo');
  return data;
}
async function mailReserva(id, reenviar) {
  try {
    const r = await fnCorreos({ accion: 'confirmacion', reserva_id: id, reenviar: !!reenviar });
    if (r?.ok) toast(r.ya_enviado ? '📧 El correo de esta reserva ya fue enviado' : '📧 Correo enviado con los detalles y el código QR', 'ok');
    else toast('No se envió el correo: ' + (r?.motivo || 'error desconocido'), 'warn');
  } catch (e) { toast('No se pudo enviar el correo: ' + e.message, 'warn'); }
}
A.mailResend = d => mailReserva(d.id, true);
function syncAppUrl() {   // el admin guarda la dirección pública de la app: la usan los enlaces de los correos y el QR
  if (!/^https?:$/.test(location.protocol) || /^(localhost|127\.|192\.168\.|10\.)/.test(location.hostname)) return;
  const u = location.origin + location.pathname;
  if (isAdm() ? S.cfg.app_url !== u : !S.cfg.app_url) db(T('ajustes').upsert([{ clave: 'app_url', valor: u }], { onConflict: 'clave' })).then(() => { S.cfg.app_url = u; }).catch(() => {});
}

/* ---- Contador de uso de la reserva (1 hora) ---- */
const rsvStart = r => new Date(`${r.fecha}T${pad(r.hora)}:00:00`).getTime();
function rsvClock(r) {   // estado: pendiente | en_uso | finalizada | sin_uso ; ini = instante desde el que corre el conteo
  const s = rsvStart(r), e = s + 3600000, now = Date.now();
  const ini = r.inicio_real ? Date.parse(r.inicio_real) : (S.cfg.inicio_auto === '1' && now >= s ? s : null);
  if (r.uso === 'finalizada' || r.fin_real) return { estado: 'finalizada', s, e, ini };
  if (ini != null) return { estado: now >= e ? 'finalizada' : 'en_uso', s, e, ini };
  return { estado: now >= e ? 'sin_uso' : 'pendiente', s, e, ini: null };
}
function clockHtml(r) {
  const c = rsvClock(r);
  if (c.estado === 'finalizada') return '<span class="st entregada">Finalizada</span>';
  if (c.estado === 'sin_uso') return '<span class="st">Sin uso</span>';
  return `<span class="ck" data-ck data-s="${c.estado === 'en_uso' ? c.ini : c.s}" data-e="${c.e}" ${c.estado === 'pendiente' ? 'data-p="1"' : ''}>…</span>`;
}
const fmtHMS = ms => { const t = Math.max(0, Math.floor(ms / 1000)), h = Math.floor(t / 3600), m = Math.floor(t % 3600 / 60), s = t % 60; return (h ? h + ':' + pad(m) : pad(m)) + ':' + pad(s); };
setInterval(() => {
  const n = Date.now();
  $$('[data-ck]').forEach(el => {
    const s = +el.dataset.s, e = +el.dataset.e;
    el.textContent = n < s ? `Empieza en ${Math.ceil((s - n) / 60000)} min` : n >= e ? 'Finalizada' : el.dataset.p ? 'Por iniciar' : `⏱ ${fmtHMS(n - s)} en uso · quedan ${fmtHMS(e - n)}`;
  });
}, 1000);
C.autoIni = async (v, el) => {
  const val = el.checked ? '1' : '0';
  await db(T('ajustes').upsert([{ clave: 'inicio_auto', valor: val }], { onConflict: 'clave' })); S.cfg.inicio_auto = val;
  toast(val === '1' ? 'Inicio automático activado' : 'Inicio automático desactivado', 'ok'); reload();
};
A.rsvStart = async d => { await db(T('reservas').update({ inicio_real: new Date().toISOString(), uso: 'en_uso' }).eq('id', d.id).eq('uso', 'pendiente')); toast('▶ Conteo iniciado', 'ok'); closeModal(); reload(); };
A.rsvEnd = async d => { await db(T('reservas').update({ fin_real: new Date().toISOString(), uso: 'finalizada' }).eq('id', d.id)); toast('Reserva finalizada'); closeModal(); reload(); };

/* ---- Código QR de la reserva ---- */
const qrPayload = tok => { const b = (S.cfg.app_url || '').replace(/#.*$/, ''); return b ? `${b}#/checkin/${tok}` : `PADEL:${tok}`; };
function qrSvg(txt) {
  if (typeof qrcode !== 'function') throw new Error('No se pudo cargar el generador de QR. Revisa tu conexión.');
  const q = qrcode(0, 'M'); q.addData(txt); q.make(); return q.createSvgTag({ cellSize: 6, margin: 2, scalable: true });
}
A.qrShow = async d => {
  const r = await db(T('reservas').select('qr_token,fecha,hora,canchas(nombre),sedes(nombre)').eq('id', d.id).single());
  modal(`<h2>Código QR de la reserva</h2><p class="muted">${esc(r.canchas?.nombre)} · ${esc(r.sedes?.nombre)}<br>${dfc(r.fecha, { weekday:'long', day:'numeric', month:'long' })} · ${hh(r.hora)}</p>
    <div class="qrbox">${qrSvg(qrPayload(r.qr_token))}</div><p class="muted" style="text-align:center"><small>Muéstralo al administrador al llegar para iniciar el conteo de tu tiempo de juego.</small></p>`);
};

/* ---- Lectura del QR por el administrador (cámara) e inicio de la reserva ---- */
let camStream = null, camRaf = 0;
function stopCam() { cancelAnimationFrame(camRaf); camRaf = 0; if (camStream) { camStream.getTracks().forEach(t => t.stop()); camStream = null; } }
const TOKEN_RE = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;
const loadJsQR = () => window.jsQR ? Promise.resolve() : new Promise((res, rej) => { const s = document.createElement('script'); s.src = 'https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.js'; s.onload = res; s.onerror = rej; document.head.appendChild(s); });
A.scanOpen = async () => {
  if (!isAdm()) return;
  modal(`<h2>Escanear QR de reserva</h2><video id="qv" playsinline muted style="width:100%;border-radius:14px;background:#000;min-height:200px"></video>
    <p class="muted" id="qmsg"><small>Apunta la cámara al código QR del cliente.</small></p>
    <label class="f">…o escribe el código / pega el enlace</label><input class="in" id="qcode" autocomplete="off" data-enter="scanManual"><button class="btn sec full mt" data-a="scanManual">Validar código</button>`, 'wide');
  try { camStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false }); const v = $('#qv'); v.srcObject = camStream; await v.play(); scanLoop(v); }
  catch (_) { const m = $('#qmsg'); if (m) m.innerHTML = '<small>No se pudo abrir la cámara (permiso o navegador). Usa el código manual.</small>'; }
};
async function scanLoop(v) {
  const det = ('BarcodeDetector' in window) ? new BarcodeDetector({ formats: ['qr_code'] }) : null;
  if (!det) { try { await loadJsQR(); } catch (_) { const m = $('#qmsg'); if (m) m.innerHTML = '<small>No se pudo cargar el lector de QR. Usa el código manual.</small>'; return; } }
  const cv = document.createElement('canvas'), cx = cv.getContext('2d', { willReadFrequently: true });
  const tick = async () => {
    if (!camStream) return;
    let tok = null;
    try {
      if (v.readyState >= 2) {
        let txt = null;
        if (det) txt = (await det.detect(v))[0]?.rawValue;
        else { cv.width = v.videoWidth; cv.height = v.videoHeight; cx.drawImage(v, 0, 0); const im = cx.getImageData(0, 0, cv.width, cv.height); txt = window.jsQR(im.data, im.width, im.height)?.data; }
        tok = txt && (txt.match(TOKEN_RE) || [])[0];
      }
    } catch (_) {}
    if (tok) {
      try { await checkin(tok); closeModal(); return; }
      catch (e) { toast(e.message || String(e), 'err'); await new Promise(r => setTimeout(r, 2500)); }
    }
    if (camStream) camRaf = requestAnimationFrame(tick);
  };
  tick();
}
A.scanManual = async () => { const tok = ($('#qcode').value.match(TOKEN_RE) || [])[0]; if (!tok) throw new Error('Código no válido'); await checkin(tok); closeModal(); };
async function checkin(token) {
  if (!isAdm()) throw new Error('Solo el administrador puede iniciar reservas');
  const r = await db(T('reservas').select('id,fecha,hora,estado,uso,inicio_real,nombre_cliente,canchas(nombre),sedes(nombre),app_users(nombre)').eq('qr_token', token).maybeSingle());
  if (!r) throw new Error('Código QR no válido');
  const quien = r.nombre_cliente || r.app_users?.nombre || 'Cliente', s = rsvStart(r), now = Date.now();
  if (r.estado !== 'confirmada') throw new Error('Esta reserva fue cancelada');
  if (r.fecha !== today()) throw new Error(`Esta reserva es para el ${dfmt(r.fecha, { day: 'numeric', month: 'long' })}`);
  if (now >= s + 3600000) throw new Error('El horario de esta reserva ya terminó');
  if (now < s - 15 * 60000) throw new Error(`Aún es muy temprano: empieza a las ${hh(r.hora)} (puedes iniciarla desde 15 minutos antes)`);
  if (r.uso === 'finalizada') throw new Error('Esta reserva ya finalizó');
  if (r.inicio_real) toast(`${quien} · ${r.canchas?.nombre}: ya estaba iniciada`, 'warn');
  else { await db(T('reservas').update({ inicio_real: new Date().toISOString(), uso: 'en_uso' }).eq('id', r.id).eq('uso', 'pendiente')); toast(`▶ Reserva iniciada: ${quien} · ${r.canchas?.nombre}`, 'ok'); }
  if (S.view === 'reservar') reload(); else go('reservar');
}

/* ---- Lista de espera ---- */
A.waitOpen = d => {
  const c = S.courts.find(x => x.id === d.court);
  modal(`<h2>Lista de espera</h2><p class="muted">${esc(c.nombre)} · ${dfc(S.fecha, { weekday:'long', day:'numeric', month:'long' })} · ${hh(+d.hora)}</p>
    <p class="mt">Este horario está ocupado. Déjanos tu correo y, <b>si se libera</b>, te avisamos al instante para que puedas tomarlo.</p>
    <label class="f">Tu correo</label><input class="in" id="w_mail" type="email" autocomplete="email" value="${esc(S.user.correo || '')}" data-enter="waitGo">
    <button class="btn full mt" data-a="waitGo" data-court="${c.id}" data-hora="${d.hora}">Agregarme a la lista de espera</button>`);
};
A.waitGo = async d => {
  const mail = $('#w_mail').value.trim().toLowerCase(), c = S.courts.find(x => x.id === d.court);
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(mail)) throw new Error('Escribe un correo válido');
  try { await db(T('lista_espera').insert({ court_id: c.id, sede_id: c.sede_id, fecha: S.fecha, hora: +d.hora, correo: mail, nombre: S.user.nombre, user_id: S.user.id })); }
  catch (e) { throw new Error(/duplicate|unique/i.test(e.message) ? 'Ya estás en la lista de espera de este horario' : e.message); }
  closeModal(); toast('Listo: te avisaremos por correo si se libera', 'ok'); reload();
  fnCorreos({ accion: 'espera', court_id: c.id, fecha: S.fecha, hora: +d.hora }).catch(() => {});   // por si se liberó justo mientras escribías
};
A.waitLeave = async d => { await db(T('lista_espera').delete().eq('id', d.id)); toast('Saliste de la lista de espera'); reload(); };

/* ---- Ventana "¿Deseas tomar la reserva?" (se abre desde el enlace del correo, no requiere iniciar sesión) ---- */
function takeDraw(html) { $('#app').innerHTML = `<div class="formwrap" style="min-height:100vh"><div class="card authcard" style="text-align:center"><div class="brand" translate="no" style="justify-content:center;padding:0 0 14px">${brandHtml()}</div>${html}</div></div>`; }
async function takeScreen(token) {
  try { await loadBase(); } catch (_) {}
  const info = await db(sb.rpc('espera_info', { p_token: token })).catch(() => null);
  if (!info) return takeDraw('<h2>Enlace no válido</h2><p class="muted mt">Este enlace no existe o ya no está disponible.</p>');
  S.take = { token, info };
  if (info.estado === 'tomada') return takeDraw('<h2>Ya tomaste esta reserva ✅</h2><p class="muted mt">Revisa tu correo: te enviamos los detalles y el código QR.</p>');
  if (!['esperando', 'notificado'].includes(info.estado)) return takeDraw('<h2>Esta oportunidad ya cerró</h2><p class="muted mt">Otra persona de la lista tomó la reserva.</p>');
  if (!info.vigente) return takeDraw('<h2>El horario ya pasó</h2><p class="muted mt">Esta cancha ya no se puede reservar.</p>');
  if (!info.libre) return takeDraw('<h2>Ya no está disponible</h2><p class="muted mt">Otra persona tomó esta cancha antes que tú. Te seguiremos avisando si se libera de nuevo.</p>');
  takeDraw(`<h2>🎾 ¡Se liberó una cancha!</h2><p class="muted mt">Estabas en la lista de espera.</p><button class="btn full mt" data-a="takeAsk">Ver la reserva disponible</button>`);
  takeAsk();
}
function takeAsk() {
  const { token, info } = S.take;
  modal(`<h2>¿Deseas tomar la reserva?</h2>
    <div class="fac"><b>${esc(info.sede)}</b>${info.ciudad ? ' · ' + esc(info.ciudad) : ''}<br>${esc(info.cancha)}<br><span>${dfc(info.fecha, { weekday: 'long', day: 'numeric', month: 'long' })}</span> · <b>${hh(info.hora)}</b><br><small>Valor ${money(info.precio)} · se paga en taquilla</small></div>
    <p class="muted mt"><small>La reserva es para quien la tome primero. Al confirmarla queda bloqueada hasta que termine.</small></p>
    <button class="btn full mt" data-a="takeYes">Sí, tomar la reserva</button><button class="btn sec full mt" data-a="takeNo">No, gracias</button>`);
}
A.takeAsk = takeAsk;
A.takeNo = () => { closeModal(); takeDraw('<h2>Sin problema</h2><p class="muted mt">No tomaste la reserva. Puedes cerrar esta ventana.</p>'); };
A.takeYes = async () => {
  const r = await db(sb.rpc('espera_tomar', { p_token: S.take.token }));
  closeModal();
  if (!r.ok) {
    const m = { ocupada: 'Otra persona tomó esta cancha justo antes que tú.', cerrada: 'Esta oportunidad ya cerró.', vencida: 'El horario ya pasó.', no_existe: 'El enlace no es válido.' }[r.motivo] || 'No se pudo tomar la reserva.';
    return takeDraw(`<h2>Lo sentimos</h2><p class="muted mt">${m}</p>`);
  }
  const i = S.take.info;
  takeDraw(`<h2>✅ ¡Reserva confirmada!</h2><div class="fac mt"><b>${esc(i.sede)}</b><br>${esc(i.cancha)}<br><span>${dfc(i.fecha, { weekday: 'long', day: 'numeric', month: 'long' })}</span> · <b>${hh(i.hora)}</b></div><p class="muted mt">Te enviamos un correo con los detalles y tu código QR. La cancha quedó bloqueada para ti.</p>`);
  fnCorreos({ accion: 'confirmacion', reserva_id: r.reserva_id }).catch(() => {});
};

A.rsvInfo = async d => {
  const r = await db(T('reservas').select('*,canchas(nombre),sedes(nombre),app_users(nombre,telefono,correo)').eq('id', d.id).single());
  const adm = isAdm(), c = rsvClock(r), mail = r.correo_cliente || r.app_users?.correo, now = Date.now();
  const espera = adm ? await db(T('lista_espera').select('id,correo,nombre').eq('court_id', r.court_id).eq('fecha', r.fecha).eq('hora', r.hora).in('estado', ['esperando', 'notificado'])) : [];
  modal(`<h2>${esc(r.canchas?.nombre)}</h2><p class="muted">${esc(r.sedes?.nombre)}<br>${dfc(r.fecha, { weekday:'long', day:'numeric', month:'long' })} · ${hh(r.hora)}</p>
    <p class="mt"><b>${esc(r.nombre_cliente || r.app_users?.nombre || '—')}</b>${r.app_users?.telefono && adm ? `<br><small>Tel. ${esc(r.app_users.telefono)}</small>` : ''}${mail && adm ? `<br><small>${esc(mail)}</small>` : ''}</p>
    <div class="fac"><div class="row between"><b>Tiempo de uso</b>${clockHtml(r)}</div>
      ${adm ? `<div class="row mt">${c.estado === 'pendiente' && now >= c.s - 15 * 60000 ? `<button class="btn sm" data-a="rsvStart" data-id="${r.id}">▶ Iniciar ahora</button>` : ''}${c.estado === 'en_uso' ? `<button class="btn sec sm" data-a="rsvEnd" data-id="${r.id}">■ Finalizar</button>` : ''}${c.estado === 'pendiente' && now < c.s - 15 * 60000 ? '<small class="muted">Se puede iniciar desde 15 minutos antes de la hora.</small>' : ''}</div>` : ''}</div>
    <div class="row mt"><button class="btn sec sm" data-a="qrShow" data-id="${r.id}">Ver QR</button>${mail ? `<button class="btn sec sm" data-a="mailResend" data-id="${r.id}">📧 Reenviar correo</button>` : ''}</div>
    ${adm && espera.length ? `<p class="muted mt"><small>⏳ ${espera.length} en lista de espera (${espera.map(e => esc(e.nombre || e.correo)).join(', ')}). Al liberar la cancha se les avisará por correo.</small></p>` : ''}
    <button class="btn danger full mt" data-a="rsvCancel" data-id="${r.id}">${adm ? 'Liberar cancha (cancelar reserva)' : 'Cancelar reserva'}</button>`);
};
A.rsvCancel = async d => {
  const e = await db(T('encuentros').select('id').eq('reserva_id', d.id).in('estado', ['abierto', 'completo']));
  if (e.length) throw new Error('Esta reserva pertenece a un encuentro. Cancela el encuentro desde la pestaña Encuentros.');
  if (!confirm('¿Cancelar esta reserva?')) return;
  await db(T('reservas').update({ estado: 'cancelada' }).eq('id', d.id)); closeModal(); toast('Reserva cancelada. Si había lista de espera, ya se les avisó.'); reload();
};

/* =====================================================================
   ASISTENTE DE RESERVAS POR VOZ (tarjeta del jugador)
   Entiende frases en español ("mañana a las 7 de la noche"), busca cancha libre,
   propone los siguientes días si está ocupado y espera el sí / no del jugador.
   ===================================================================== */
/*AG-NLU-START*/
const AG_MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
const AG_DIAS = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
const AG_NUM = { una: 1, un: 1, uno: 1, dos: 2, tres: 3, cuatro: 4, cinco: 5, seis: 6, siete: 7, ocho: 8, nueve: 9, diez: 10, once: 11, doce: 12, trece: 13, catorce: 14, quince: 15, dieciseis: 16, diecisiete: 17, dieciocho: 18, diecinueve: 19, veinte: 20, veintiuno: 21, veintidos: 22, veintitres: 23, veinticuatro: 24, veinticinco: 25, veintiseis: 26, veintisiete: 27, veintiocho: 28, veintinueve: 29, treinta: 30 };
const agNorm = s => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[¿?¡!,;()"“”]/g, ' ').replace(/\bsept\b/g, 'septiembre').replace(/\s+/g, ' ').trim();
const agNums = t => t.replace(/\btreinta y uno\b/g, '31').replace(/\bcuarenta y cinco\b/g, '45').replace(/\bveinte y (uno|dos|tres|cuatro|cinco|seis|siete|ocho|nueve)\b/g, (m, u) => String(20 + AG_NUM[u]))
  .replace(new RegExp('\\b(' + Object.keys(AG_NUM).sort((a, b) => b.length - a.length).join('|') + ')\\b', 'g'), w => AG_NUM[w]);
const agYmd = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const agTokens = s => agNorm(s).replace(/[^a-z0-9 ]/g, ' ').split(' ').filter(x => x.length >= 4 && x !== 'sede');

function parseReserva(text, ctx) {
  let t = agNums(agNorm(text)), m;
  const out = { fecha: null, hora: null, horaOpts: null, redondeo: false, sedeId: null, courtId: null };
  const now = ctx.now, hoy = agYmd(now), addD = n => agYmd(new Date(now.getFullYear(), now.getMonth(), now.getDate() + n, 12));

  // sede y cancha mencionadas
  const cand = ctx.sedes.map(s => { const nm = agNorm(s.nombre).replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim(); let sc = t.includes(nm) ? 5 : 0; agTokens(s.nombre).forEach(k => { if (t.includes(k)) sc++; }); const num = (nm.match(/\bsede (\d+)/) || [])[1]; if (num && new RegExp('\\bsede ' + num + '\\b').test(t)) sc += 3; return { s, sc }; }).filter(x => x.sc > 0).sort((a, b) => b.sc - a.sc);
  if (cand.length && (cand.length === 1 || cand[0].sc > cand[1].sc)) out.sedeId = cand[0].s.id;
  const sd = ctx.sedes.find(s => s.id === (out.sedeId || ctx.sedeId)) || ctx.sedes[0], lo = sd ? sd.apertura : 8, hi = sd ? sd.cierre : 23;
  if ((m = t.match(/\b(?:pista|cancha)\s*(?:numero\s*)?(\d{1,2})\b/))) {
    const pool = ctx.courts.filter(c => !out.sedeId || c.sede_id === out.sedeId), c = pool.filter(c => new RegExp('(^|\\D)' + m[1] + '(\\D|$)').test(agNorm(c.nombre)));
    const own = c.filter(x => x.sede_id === (sd && sd.id)); if (own.length === 1) out.courtId = own[0].id; else if (c.length === 1) out.courtId = c[0].id;
    t = t.replace(m[0], ' ');
  }

  // franja del día ("de la noche", "esta tarde"...)
  let part = null;
  if ((m = t.match(/\besta\s+(manana|tarde|noche)\b/))) { part = m[1]; out.fecha = hoy; t = t.replace(m[0], ' '); }
  else if ((m = t.match(/\b(?:de|por|en)\s+la\s+(manana|tarde|noche|madrugada)\b/))) { part = m[1]; t = t.replace(m[0], ' '); }
  if (/\bmediodia\b/.test(t)) { out.hora = 12; t = t.replace(/\bmediodia\b/, ' '); }

  // hora
  let h = null, mi = 0, ap = null, mm;
  if ((mm = t.match(/\b(\d{1,2})[:.](\d{2})\s*(a\.?\s?m\.?|p\.?\s?m\.?)?(?!\d)/))) { h = +mm[1]; mi = +mm[2]; ap = mm[3] || null; t = t.replace(mm[0], ' '); }
  else if ((mm = t.match(/\b(\d{1,2})\s*(a\.?\s?m\.?|p\.?\s?m\.?)(?=\s|$)/))) { h = +mm[1]; ap = mm[2]; t = t.replace(mm[0], ' '); }
  else if ((mm = t.match(/\b(?:a|para|sobre|desde|de)\s+las?\s+(\d{1,2})\b(?:\s+y\s+(media|cuarto|\d{1,2})\b|\s+menos\s+(cuarto|\d{1,2})\b|\s+en\s+punto\b)?/))) {
    h = +mm[1];
    if (mm[2]) mi = mm[2] === 'media' ? 30 : mm[2] === 'cuarto' ? 15 : +mm[2];
    else if (mm[3]) { h -= 1; mi = 60 - (mm[3] === 'cuarto' ? 15 : +mm[3]); }
    t = t.replace(mm[0], ' ');
  } else if (part) {
    for (const x of t.matchAll(/\b(\d{1,2})\b/g)) {
      const before = t.slice(0, x.index), after = t.slice(x.index + x[0].length);
      if (/(?:el|dia|sede|pista|cancha|en|dentro de|proximo)\s*$/.test(before)) continue;
      if (new RegExp('^\\s*(?:de\\s+)?(?:' + AG_MESES.join('|') + '|dias?|personas?|jugadores|horas?)').test(after)) continue;
      h = +x[1]; t = before + ' ' + after; break;
    }
  }
  if (h != null) {
    if (mi) out.redondeo = true;
    const apm = ap ? (ap.replace(/[^a-z]/g, '')[0] === 'p' ? 'p' : 'a') : part ? ((part === 'manana' || part === 'madrugada') ? 'a' : 'p') : null;
    if (h >= 13 || h === 0) out.hora = h;
    else if (apm === 'p') out.hora = h === 12 ? (part === 'noche' ? 24 : 12) : h + 12;
    else if (apm === 'a') out.hora = (h === 12 && ap) ? 0 : h;
    else { const c = h === 12 ? [12] : [h, h + 12], ok = c.filter(x => x >= lo && x < hi); if (ok.length === 1) out.hora = ok[0]; else if (ok.length > 1) out.horaOpts = ok; else out.hora = c[c.length - 1]; }
  }

  // fecha
  if (!out.fecha) {
    if (/\bpasado manana\b/.test(t)) out.fecha = addD(2);
    else if (/\bmanana\b/.test(t)) out.fecha = addD(1);
    else if (/\bhoy\b/.test(t)) out.fecha = hoy;
    else if ((m = t.match(/\b(?:dentro de|en)\s+(\d{1,2})\s+dias?\b/))) out.fecha = addD(+m[1]);
    else if (/\bproxima semana\b|\ben una semana\b|\ben 1 semana\b|\bdentro de 1 semana\b/.test(t)) out.fecha = addD(7);
    else if ((m = t.match(new RegExp('\\b(?:el\\s+)?(\\d{1,2})\\s+de\\s+(' + AG_MESES.join('|') + ')\\b')))) {
      const mes = AG_MESES.indexOf(m[2]); let y = now.getFullYear(), d = new Date(y, mes, +m[1], 12);
      if (agYmd(d) < hoy) d = new Date(y + 1, mes, +m[1], 12);
      if (d.getMonth() === mes) out.fecha = agYmd(d);
    } else if ((m = t.match(/\b(este|proximo|el proximo)?\s*(lunes|martes|miercoles|jueves|viernes|sabado|domingo)\b/))) {
      let diff = (AG_DIAS.indexOf(m[2]) - now.getDay() + 7) % 7; if (diff === 0) diff = m[1] === 'este' ? 0 : 7;
      out.fecha = addD(diff);
    } else if ((m = t.match(/\b(?:el|dia)\s+(\d{1,2})\b/)) && +m[1] >= 1 && +m[1] <= 31) {
      let d = new Date(now.getFullYear(), now.getMonth(), +m[1], 12); if (agYmd(d) < hoy) d = new Date(now.getFullYear(), now.getMonth() + 1, +m[1], 12);
      if (d.getDate() === +m[1]) out.fecha = agYmd(d);
    }
  }
  return out;
}
function agYesNo(text) {   // por voz el dictado suele añadir muletillas ("eh sí", "pues no"): gana la primera palabra clara
  const n = agNorm(text).replace(/[.]/g, ' '), no = n.search(/\b(no|nop|nel|negativo|cancela|cancelar|otra|otro|siguiente|ninguna|nunca|tampoco)\b/),
    si = n.search(/\b(si|sip|claro|dale|confirmo|confirmar|confirma|confirmala|confirmalo|confirmada|ok|okay|listo|perfecto|de una|hagale|reservala|reservalo|reserva la|hazlo|correcto|afirmativo|vale|adelante|por supuesto|esta bien|quiero)\b/);
  if (no < 0 && si < 0) return null;
  if (no >= 0 && (si < 0 || no < si)) return 'no';
  return 'si';
}
const AG_QUIT = /\b(ya no$|ya no (quiero|voy|necesito|me interesa|va)|no (quiero|voy a|voy|necesito) (reservar|jugar|nada)|no voy a reservar|no reservo|dejalo asi|dejalo|olvidalo|olvida eso|olvida|cancela todo|cancelar todo|no quiero nada|hasta luego|adios|chao)\b/;
const agQuit = text => AG_QUIT.test(agNorm(text));   // "ya no quiero reservar", "olvídalo", "adiós"...
const agWantsCancel = text => { const n = agNorm(text); return /\b(cancel\w*|anul\w*|elimin\w*|quit\w*|borr\w*)\b/.test(n) && /\breserva/.test(n); };   // "cancela mi reserva de las 7"
/*AG-NLU-END*/

const AG = { log: [], want: null, pending: null, cancel: null, voice: false, busy: false };
const agCtx = () => ({ now: new Date(), sedes: S.sedes, courts: S.courts, sedeId: S.sedeId || S.user?.sede_id });
const agFecha = f => { const s = dfmt(f, { weekday: 'long', day: 'numeric', month: 'long' }); return s.charAt(0).toUpperCase() + s.slice(1); };
const agNombre = () => { const n = (S.user?.nombre || '').trim().split(/\s+/)[0] || ''; return n.charAt(0).toUpperCase() + n.slice(1).toLowerCase(); };
const agSaludoVoz = () => `Hola ${agNombre()}, te ayudo a reservar hoy. Dime cuándo quieres jugar, por ejemplo: quiero una cancha mañana a las 7 de la noche. Si está ocupada, te propongo los siguientes días y tú me dices sí o no. Y si quieres cancelar una reserva, dime la sede, la hora y el día.`;
/* ---- Cancelar reservas por voz ---- */
const agResTxt = r => `${agFecha(r.fecha).split(',')[0].slice(0, 3)} ${Number(r.fecha.slice(8))} · ${hh(r.hora)} · ${esc(r.canchas?.nombre || '')} (${esc(r.sedes?.nombre || '')})`;
async function agCancelStart(p) {
  AG.want = null; AG.pending = null; const now = Date.now(), nombre = agNombre();
  let rs = await db(T('reservas').select('id,fecha,hora,court_id,sede_id,canchas(nombre),sedes(nombre)').eq('user_id', S.user.id).eq('estado', 'confirmada').gte('fecha', today()).order('fecha').order('hora'));
  rs = rs.filter(r => new Date(`${r.fecha}T${pad(r.hora)}:00:00`).getTime() + 3600000 > now);   // solo las que aún no terminaron
  if (!rs.length) { AG.cancel = null; return agPush('bot', `No tienes reservas próximas para cancelar, ${esc(nombre)}.`, `No tienes reservas próximas para cancelar, ${nombre}.`); }
  const hs = p.hora != null ? [p.hora] : (p.horaOpts || null), filtros = !!(p.sedeId || hs || p.fecha);
  const m = rs.filter(r => (!p.sedeId || r.sede_id === p.sedeId) && (!hs || hs.includes(r.hora)) && (!p.fecha || r.fecha === p.fecha));
  const chips = list => `<div class="row">${list.map(r => `<button class="agchip" data-a="agCancelPick" data-i="${AG.cancel.opts.indexOf(r)}">${agResTxt(r)}</button>`).join('')}</div>`;
  if (filtros && !m.length) {
    AG.cancel = { opts: rs, sel: null };
    return agPush('bot', `No encontré una reserva tuya con esos datos 🤔. Estas son tus reservas próximas; dime <b>la sede, la hora y el día</b> de la que quieres cancelar, o elígela:${chips(rs)}`, `No encontré una reserva tuya con esos datos, ${nombre}. Dime la sede, la hora y el día de la que quieres cancelar.`, true);
  }
  if (m.length === 1 || (!filtros && rs.length === 1)) { AG.cancel = { opts: rs, sel: rs.indexOf(m.length === 1 ? m[0] : rs[0]) }; return agCancelAsk(); }
  AG.cancel = { opts: rs, sel: null };
  agPush('bot', `Tienes varias reservas 📋. ¿Cuál quieres cancelar? Dime <b>la sede, la hora y el día</b>, o elígela:${chips(m.length ? m : rs)}`, `Tienes varias reservas, ${nombre}. ¿Cuál quieres cancelar? Dime la sede, la hora y el día.`, true);
}
function agCancelAsk() {
  const C = AG.cancel, r = C.opts[C.sel];
  agPush('bot', `Encontré tu reserva:<div class="fac"><b>${esc(r.canchas?.nombre)}</b> · ${esc(r.sedes?.nombre)}<br>${esc(agFecha(r.fecha))} · <b>${hh(r.hora)}</b></div><b>¿La cancelo?</b><div class="row"><button class="btn sm" data-a="agCancelYes">Sí, cancelar</button><button class="btn sec sm" data-a="agCancelNo">No, conservarla</button><button class="btn sec sm" data-a="agMic">🎙 Responder por voz</button></div>`,
    `Encontré tu reserva de ${r.canchas?.nombre} en ${r.sedes?.nombre}, ${agFecha(r.fecha)} a las ${hh(r.hora)}. ¿La cancelo? Di sí o no.`, true);
}
async function agCancelConfirm() {
  const C = AG.cancel; if (!C || C.sel == null || AG.confirming) return; const r = C.opts[C.sel], nombre = agNombre(); AG.confirming = true;
  try {
    const enc = await db(T('encuentros').select('id').eq('reserva_id', r.id).in('estado', ['abierto', 'completo']));
    if (enc.length) { AG.cancel = null; return agPush('bot', 'Esa reserva pertenece a un encuentro, así que no puedo cancelarla desde aquí. Cancélala desde la pestaña Encuentros.'); }
    const up = await db(T('reservas').update({ estado: 'cancelada' }).eq('id', r.id).eq('estado', 'confirmada').select('id'));
    AG.cancel = null;
    if (!up.length) return agPush('bot', 'Esa reserva ya estaba cancelada.');
    agPush('bot', `✅ Listo, <b>${esc(nombre)}</b>. Cancelé tu reserva:<div class="fac"><b>${esc(r.canchas?.nombre)}</b> · ${esc(r.sedes?.nombre)}<br>${esc(agFecha(r.fecha))} · <b>${hh(r.hora)}</b></div><small>La cancha quedó libre y ya avisé al administrador.</small>`,
      `Listo, ${nombre}. Cancelé tu reserva de ${r.canchas?.nombre}, ${agFecha(r.fecha)} a las ${hh(r.hora)}. La cancha quedó libre. ¡Te esperamos pronto!`);
    if (S.view === 'reservar' || S.view === 'home') { const y = window.scrollY; go(S.view).then(() => window.scrollTo(0, y)); }
  } finally { AG.confirming = false; }
}
function agCancelKeep() { AG.cancel = null; const n = agNombre(); agPush('bot', `Está bien, <b>${esc(n)}</b>, no cancelé nada. Tu reserva sigue en pie 👍`, `Está bien, ${n}, no cancelé nada. Tu reserva sigue en pie.`); }
A.agCancelYes = () => AG.cancel && AG.cancel.sel != null ? agCancelConfirm() : toast('Esa propuesta ya no está activa', 'warn');
A.agCancelNo = () => AG.cancel && AG.cancel.sel != null ? agCancelKeep() : toast('Esa propuesta ya no está activa', 'warn');
A.agCancelPick = d => { if (!AG.cancel) return; AG.cancel.sel = +d.i; agCancelAsk(); };

function agBye() {
  AG.want = null; AG.pending = null; AG.cancel = null; const n = agNombre();
  agPush('bot', `Lo siento, no pude ayudarte con tu reserva, <b>${esc(n)}</b>. Te esperamos, ¡vuelve pronto! 👋`, `Lo siento, no pude ayudarte con tu reserva, ${n}. Te esperamos, vuelve pronto.`);
}
A.agBye = () => agBye();
const agHtmlToText = h => String(h).replace(/<br\s*\/?>/gi, '. ').replace(/<[^>]+>/g, ' ').replace(/&[a-z#0-9]+;/gi, ' ').replace(/\s+/g, ' ').trim();

function agMsgHtml(m) { return `<div class="agm ${m.role}">${m.html}</div>`; }
function agPush(role, html, say, listen) {   // listen = true: si el jugador habla, tras la pregunta se abre el micrófono para su respuesta
  AG.log.push({ role, html }); if (AG.log.length > 30) AG.log.shift();
  const box = $('#agLog'); if (box) { box.insertAdjacentHTML('beforeend', agMsgHtml({ role, html })); box.scrollTop = box.scrollHeight; }
  if (role === 'bot') agSpeak(say || agHtmlToText(html), listen ? () => agListen(true) : null);
}
function agSpeak(text, then) {
  if (!AG.voice) return;
  let done = false; const fin = () => { if (!done) { done = true; if (then) then(); } };
  if (!('speechSynthesis' in window)) return fin();
  try {
    speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(text); u.lang = 'es-CO'; u.rate = 1.02; u.onend = fin; u.onerror = fin;
    const v = speechSynthesis.getVoices().find(x => /^es[-_](CO|MX|US|419)/i.test(x.lang)) || speechSynthesis.getVoices().find(x => /^es/i.test(x.lang)); if (v) u.voice = v;
    speechSynthesis.speak(u); setTimeout(fin, Math.min(15000, 2500 + text.length * 80));   // por si el navegador no avisa cuando termina de hablar
  } catch (_) { fin(); }
}
function agentCard() {
  if (isAdm()) return '';
  if (!AG.log.length) AG.log.push({ role: 'bot', html: `¡Hola, ${esc(agNombre())}! 👋 <b>Te ayudo a reservar hoy.</b> Pulsa el micrófono y dime <b>cuándo quieres jugar</b>. Por ejemplo: <i>“Quiero una cancha mañana a las 7 de la noche”</i>. Si está ocupada, te propongo los siguientes días y tú me dices <b>sí</b> o <b>no</b>. También puedo <b>cancelar una reserva</b>: dime la sede, la hora y el día.` });
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  return `<div class="card ag mt"><div class="row between"><h3 style="margin:0">🤖 Asistente de reservas por voz</h3><small class="muted">Habla o escribe</small></div>
    <div class="aglog" id="agLog" aria-live="polite">${AG.log.map(agMsgHtml).join('')}</div>
    <div class="agin"><button class="agmic ${agRec ? 'rec' : ''}" id="agMic" data-a="agMic" aria-label="Hablar con el asistente" title="Hablar">🎙</button>
      <input class="in" id="agTxt" autocomplete="off" placeholder="${SR ? 'o escribe aquí: “reserva el viernes a las 6 pm”' : 'Escribe: “reserva el viernes a las 6 pm”'}" data-enter="agSend"><button class="btn sm" data-a="agSend">Enviar</button></div>
    <small class="muted" id="agLive" style="display:block;min-height:18px;margin-top:6px"></small>
    ${SR ? '' : '<small class="muted">Tu navegador no tiene dictado por voz; usa el cuadro de texto (en Chrome o Edge puedes hablar).</small>'}</div>`;
}
function agMicUI(on) { const b = $('#agMic'); if (b) b.classList.toggle('rec', on); }

let agRec = null;
const agLive = t => { const l = $('#agLive'); if (l) l.textContent = t; };
/* Escucha una frase. auto = true cuando el asistente acaba de hacer una pregunta y espera un "sí" o un "no" hablado. */
function agListen(auto, hint) {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR || agRec) return;
  try { speechSynthesis.cancel(); } catch (_) {}
  const r = new SR(); r.lang = 'es-CO'; r.interimResults = true; r.continuous = false; r.maxAlternatives = 1; let txt = '', err = null;
  r.onresult = e => { txt = [...e.results].map(x => x[0].transcript).join(' '); agLive('🎙 ' + txt); };
  r.onerror = e => {
    err = e.error;
    if (auto && e.error === 'no-speech') return agLive('No te escuché. Pulsa 🎙 para responder o usa los botones Sí / No.');
    const m = { 'not-allowed': 'Debes permitir el micrófono en el navegador.', 'service-not-allowed': 'El navegador bloqueó el dictado por voz.', 'no-speech': 'No te escuché. Intenta de nuevo.', 'audio-capture': 'No encuentro un micrófono.', 'network': 'El dictado necesita conexión a internet.' }[e.error];
    if (m) toast(m, 'warn');
  };
  r.onend = () => { agRec = null; agMicUI(false); if (txt.trim()) { agLive(''); agHear(txt, true); } else if (!err) agLive(''); };
  try { r.start(); agRec = r; agMicUI(true); agLive(hint || (auto ? '🎙 Te escucho… di “sí” o “no”' : '🎙 Habla ahora…')); } catch (_) { if (!auto) toast('No se pudo iniciar el micrófono', 'warn'); }
}
A.agMic = () => {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) { toast('Tu navegador no permite dictado por voz. Escribe tu mensaje en el cuadro.', 'warn'); $('#agTxt')?.focus(); return; }
  if (agRec) { agRec.stop(); return; }
  if (!AG.greeted && AG.log.length <= 1) {   // la primera vez que habla: saluda por su nombre en voz alta y luego lo escucha
    AG.greeted = true; AG.voice = true;
    return agSpeak(agSaludoVoz(), () => agListen(true, '🎙 Te escucho… dime cuándo quieres jugar'));
  }
  agListen(false);
};
A.agSend = () => { const i = $('#agTxt'); if (!i) return; const v = i.value; i.value = ''; return agHear(v, false); };

async function agHear(text, viaVoice) {
  text = String(text || '').trim(); if (!text || AG.busy) return;
  AG.voice = !!viaVoice; agPush('user', esc(text)); AG.busy = true;
  try { await agThink(text); }
  catch (e) { console.error(e); agPush('bot', 'Ups, tuve un problema: ' + esc(e.message || e) + '. Intenta de nuevo.'); }
  finally { AG.busy = false; }
}
async function agThink(text) {
  const n = agNorm(text), p = parseReserva(text, agCtx()), has = p.fecha || p.hora != null || p.horaOpts, yn = agYesNo(text);
  // --- cancelar una reserva existente (por voz: sede + hora + día; el sistema ya sabe qué cancha y qué reserva es) ---
  if (AG.cancel && !agWantsCancel(text) && /\b(reservar|reservame|quiero una cancha|necesito una cancha)\b/.test(n)) AG.cancel = null;   // cambió de idea: ahora quiere reservar
  if (agWantsCancel(text) || (AG.cancel && (has || p.sedeId))) return agCancelStart(p);
  if (AG.cancel && AG.cancel.sel != null) {
    if (yn === 'si' || (/\b(cancel\w*|anul\w*|elimin\w*)\b/.test(n) && !/\bno\b/.test(n))) return agCancelConfirm();
    if (yn === 'no') return agCancelKeep();
  }
  if (!has && agQuit(text)) return agBye();                                   // "ya no quiero reservar", "olvídalo", "adiós"
  if (!has && !AG.pending && AG.want && /^(no|nop|nel|negativo|no gracias)\b/.test(n) && !/\botr[oa]s?\b/.test(n)) return agBye();   // dijo que no cuando ya no quedaban opciones ("otro día" NO es despedida)
  if (/\b(empezar de nuevo|nueva reserva|reiniciar)\b/.test(n)) { AG.want = null; AG.pending = null; return agPush('bot', 'Listo, empecemos de nuevo. Dime qué día y a qué hora quieres jugar.', null, true); }
  if (AG.pending && !has) { if (yn === 'si') return agConfirm(); if (yn === 'no') return agNext(); }
  AG.pending = null; AG.cancel = null; AG.want = AG.want || {};
  for (const k of ['fecha', 'sedeId', 'courtId']) if (p[k]) AG.want[k] = p[k];
  if (p.horaOpts) { AG.want.horaOpts = p.horaOpts; AG.want.hora = null; } else if (p.hora != null) { AG.want.hora = p.hora; AG.want.horaOpts = null; }
  if (p.redondeo) AG.want.redondeo = true;
  if (!has && !p.sedeId && !p.courtId) return agPush('bot', 'No logré entender el día y la hora 🤔. Dime, por ejemplo: <i>“mañana a las 7 de la noche”</i> o <i>“el viernes a las 6 pm”</i>.', `Perdona, ${agNombre()}, no logré entender el día y la hora. Dime, por ejemplo: mañana a las 7 de la noche, o el viernes a las 6 de la tarde.`, true);
  return agAdvance();
}
async function agAdvance() {
  const w = AG.want, sede = S.sedes.find(s => s.id === (w.sedeId || S.sedeId || S.user?.sede_id)) || S.sedes[0];
  if (!sede) return agPush('bot', 'Todavía no hay sedes configuradas para reservar.');
  w.sedeId = sede.id;
  if (w.horaOpts) return agPush('bot', `¿A qué hora exactamente?<div class="row">${w.horaOpts.map(h => `<button class="agchip" data-a="agHora" data-h="${h}">${hh(h)}</button>`).join('')}</div>`, `¿A qué hora exactamente? ${w.horaOpts.map(hh).join(' o ')}`, true);
  if (w.hora == null) return agPush('bot', `Perfecto${w.fecha ? ', ' + esc(agFecha(w.fecha)) : ''}. ¿A qué hora quieres jugar?`, null, true);
  if (w.hora < sede.apertura || w.hora >= sede.cierre) { w.hora = null; return agPush('bot', `${esc(sede.nombre)} atiende de <b>${hh(sede.apertura)}</b> a <b>${hh(sede.cierre)}</b>. ¿A qué hora dentro de ese horario?`, null, true); }
  const hoy = today(); let assumed = false;
  if (!w.fecha) { w.fecha = new Date().getHours() < w.hora ? hoy : addDays(hoy, 1); assumed = true; }
  if (w.fecha < hoy) w.fecha = hoy;
  const res = await agSearch(w);
  const nota = (w.redondeo ? '<small class="muted">Las reservas son por hora completa, así que tomé las ' + hh(w.hora) + '.</small><br>' : '') + (assumed ? `<small class="muted">Como no dijiste el día, asumí ${esc(agFecha(w.fecha))}.</small><br>` : '')
    + (res.yaTieneEsaHora ? `<small class="muted">Ya tienes una reserva ese día a las ${hh(w.hora)}, así que te muestro otras opciones.</small><br>` : '');
  if (!res.options.length) { AG.pending = null; return agPush('bot', nota + `No encontré canchas libres en ${esc(res.sede.nombre)} para ${esc(agFecha(w.fecha))} a las ${hh(w.hora)} ni en los siguientes 7 días a esa hora 😕. Prueba con otra hora u otra sede.`); }
  AG.pending = { options: res.options, idx: 0, sede: res.sede, exacta: res.exacta, nota, hora: w.hora, fecha: w.fecha, yaTiene: res.yaTieneEsaHora };
  agPropose();
}
async function agSearch(w) {
  const sede = S.sedes.find(s => s.id === w.sedeId), all = S.courts.filter(c => c.sede_id === sede.id);
  if (!all.length) return { sede, options: [], exacta: false };
  const pref = w.courtId ? all.filter(c => c.id === w.courtId) : all;
  const [rs, mias] = await Promise.all([
    db(T('reservas').select('court_id,fecha,hora').in('court_id', all.map(c => c.id)).eq('estado', 'confirmada').gte('fecha', w.fecha).lte('fecha', addDays(w.fecha, 8))),
    db(T('reservas').select('fecha,hora').eq('user_id', S.user.id).eq('estado', 'confirmada').gte('fecha', w.fecha).lte('fecha', addDays(w.fecha, 8)))   // el jugador no puede estar en dos canchas a la vez
  ]);
  const taken = new Set(rs.map(r => `${r.court_id}|${r.fecha}|${r.hora}`)), yaTiene = new Set(mias.map(r => `${r.fecha}|${r.hora}`)), nowMs = Date.now();
  const past = (f, h) => new Date(`${f}T${pad(h)}:00:00`).getTime() <= nowMs;
  const free = (f, h, list) => (past(f, h) || yaTiene.has(`${f}|${h}`)) ? null : list.find(c => !taken.has(`${c.id}|${f}|${h}`)) || null;
  const mk = (court, fecha, hora, tipo) => ({ court, fecha, hora, tipo }), opts = [];
  const ex = free(w.fecha, w.hora, pref) || (w.courtId ? free(w.fecha, w.hora, all) : null);
  if (ex) opts.push(mk(ex, w.fecha, w.hora, !w.courtId || ex.id === w.courtId ? 'exacta' : 'otra'));
  const nd = []; for (let d = 1; d <= 7 && nd.length < 3; d++) { const f = addDays(w.fecha, d), c = free(f, w.hora, pref) || free(f, w.hora, all); if (c) nd.push(mk(c, f, w.hora, 'dia')); }
  const sh = []; for (const dh of [-1, 1, -2, 2]) { const h = w.hora + dh; if (h < sede.apertura || h >= sede.cierre) continue; const c = free(w.fecha, h, all); if (c) sh.push(mk(c, w.fecha, h, 'hora')); if (sh.length >= 2) break; }
  return { sede, options: [...opts, ...nd, ...sh], exacta: !!opts.length, yaTieneEsaHora: yaTiene.has(`${w.fecha}|${w.hora}`) };
}
function agPropose() {
  const P = AG.pending, o = P.options[P.idx], first = P.idx === 0;
  const card = `<div class="fac"><b>${esc(o.court.nombre)}</b> · ${esc(P.sede.nombre)}<br>${esc(agFecha(o.fecha))} · <b>${hh(o.hora)}</b><br><small>Valor ${money(o.court.precio_hora)} · se paga en taquilla</small></div>`;
  let head, say;
  if (o.tipo === 'exacta' && first) { head = '¡Buenas noticias! Ese horario está <b>libre</b>:'; say = 'Buenas noticias, ese horario está libre.'; }
  else if (o.tipo === 'otra' && first) { head = 'Esa cancha está ocupada, pero hay <b>otra libre</b> a esa hora:'; say = 'Esa cancha está ocupada, pero hay otra libre a esa hora.'; }
  else if (first && P.yaTiene) { head = 'Te propongo esta opción disponible:'; say = 'Te propongo esta opción disponible.'; }
  else if (first) { head = `Ese horario está <b>ocupado</b>. Te propongo la siguiente opción disponible:`; say = 'Ese horario está ocupado. Te propongo la siguiente opción disponible.'; }
  else { head = 'Otra opción:'; say = 'Otra opción.'; }
  const chips = P.options.map((x, i) => i === P.idx ? '' : `<button class="agchip" data-a="agPick" data-i="${i}">${esc(agFecha(x.fecha).split(',')[0].slice(0, 3))} ${Number(x.fecha.slice(8))} · ${hh(x.hora)} · ${esc(x.court.nombre)}</button>`).join('');
  agPush('bot', `${first ? P.nota : ''}${head}${card}<b>¿Confirmas la reserva?</b><div class="row"><button class="btn sm" data-a="agYes">Sí, reservar</button><button class="btn sec sm" data-a="agNo">No</button><button class="btn sec sm" data-a="agMic">🎙 Responder por voz</button></div>${chips ? `<small class="muted" style="display:block;margin-top:8px">O elige otra:</small><div class="row" style="margin-top:4px">${chips}</div>` : ''}<div class="row" style="margin-top:6px"><button class="agchip" data-a="agBye">Ya no quiero reservar</button></div>`,
    `${say} ${o.court.nombre}, ${agFecha(o.fecha)} a las ${hh(o.hora)}. ¿Confirmas la reserva? Di sí o no.`, true);
}
A.agYes = () => AG.pending ? agConfirm() : toast('Esa propuesta ya no está activa', 'warn');
A.agNo = () => AG.pending ? agNext() : toast('Esa propuesta ya no está activa', 'warn');
A.agPick = d => { if (!AG.pending) return; AG.pending.idx = +d.i; agPropose(); };
A.agHora = d => { if (!AG.want) return; AG.want.hora = +d.h; AG.want.horaOpts = null; agPush('user', hh(+d.h)); return agAdvance(); };
function agNext() {
  const P = AG.pending; P.idx++;
  if (P.idx < P.options.length) return agPropose();
  AG.pending = null; agPush('bot', 'Ya no tengo más opciones cercanas. Dime <b>otro día u otra hora</b> y vuelvo a buscar.', null, true);
}
async function agConfirm() {
  const P = AG.pending; if (!P || AG.confirming) return; const o = P.options[P.idx]; AG.confirming = true;
  try {
    let r;
    const dup = await db(T('reservas').select('id').eq('user_id', S.user.id).eq('estado', 'confirmada').eq('fecha', o.fecha).eq('hora', o.hora).limit(1));
    if (dup.length) { agPush('bot', `Ya tienes una reserva el ${esc(agFecha(o.fecha))} a las ${hh(o.hora)}, así que no puedo reservar otra a la misma hora.`); return agNext(); }
    try { r = await db(T('reservas').insert({ sede_id: o.court.sede_id, court_id: o.court.id, user_id: S.user.id, fecha: o.fecha, hora: o.hora }).select('id').single()); }
    catch (e) {
      if (!/duplicate|unique/i.test(e.message)) throw e;
      agPush('bot', 'Justo alguien tomó ese horario 😅. Busco otra opción…'); return agAdvance();
    }
    AG.pending = null; AG.want = null;
    agPush('bot', `✅ <b>¡Reserva confirmada!</b><div class="fac"><b>${esc(o.court.nombre)}</b> · ${esc(P.sede.nombre)}<br>${esc(agFecha(o.fecha))} · <b>${hh(o.hora)}</b></div>${S.user.correo ? `<small>📧 Te enviaré los detalles y tu código QR a ${esc(S.user.correo)}.</small>` : '<small>Registra tu correo en tu perfil para recibir el QR por correo.</small>'}`,
      `¡Listo, ${agNombre()}! Tu reserva quedó confirmada. ${o.court.nombre}, ${agFecha(o.fecha)} a las ${hh(o.hora)}. ¡Que disfrutes tu partido!`);
    if (S.user.correo) mailReserva(r.id);
    if (S.view === 'reservar' || S.view === 'home') { const y = window.scrollY; go(S.view).then(() => window.scrollTo(0, y)); }
  } finally { AG.confirming = false; }
}

/* ---------- ENCUENTROS ---------- */
V.encuentros = async () => {
  const es = await db(T('encuentros').select('*,canchas(nombre),sedes(nombre),creador:app_users!creador_id(nombre),encuentro_jugadores(user_id,equipo,app_users(nombre,puntos,foto))').in('estado', ['abierto', 'completo', 'en_juego']).gte('fecha', today()).order('fecha').order('hora'));
  return `
  <div class="row between"><p class="muted">Arma un partido, fija hora y apuesta, e invita jugadores.</p><button class="btn" data-a="encNew">+ Crear encuentro</button></div>
  <div class="grid g2 mt">${es.length ? es.map(e => {
    const js = e.encuentro_jugadores || [], inn = js.some(j => j.user_id === S.user.id), full = js.length >= 4, mineE = e.creador_id === S.user.id;
    return `<div class="card enc">
      <div class="row between"><h3 style="margin:0">${esc(e.canchas?.nombre)}</h3><span class="st ${e.estado}">${e.estado.replace('_', ' ')}</span></div>
      <small>${esc(e.sedes?.nombre)}</small>
      <p style="margin-top:6px"><b>${dfc(e.fecha, { weekday:'long', day:'numeric', month:'short' })} · ${hh(e.hora)}</b></p>
      <div class="slotsp">${[0,1,2,3].map(i => js[i] ? `<div class="sp1">${avatar(js[i].app_users)}<span>${esc(js[i].app_users?.nombre.split(' ')[0])}</span></div>` : `<div class="sp1"><span class="av empty">+</span><span>Libre</span></div>`).join('')}</div>
      ${e.apuesta > 0 ? `<p>💰 Apuesta <b>${money(e.apuesta)}</b> c/u · Pozo <b>${money(e.apuesta * 4)}</b> <small>(ganadores se lo reparten)</small></p>` : '<small>Sin apuesta</small>'}
      ${e.nota ? `<p class="muted mt">${esc(e.nota)}</p>` : ''}
      <div class="row mt">
        ${!isAdm() && !inn && !full && e.estado === 'abierto' ? `<button class="btn sm" data-a="encJoin" data-id="${e.id}">Unirme</button>` : ''}
        ${!isAdm() && inn && e.estado !== 'en_juego' ? `<button class="btn sec sm" data-a="encLeave" data-id="${e.id}">Salir</button>` : ''}
        ${e.estado === 'abierto' && !full ? `<button class="btn sec sm" data-a="invOpen" data-id="${e.id}">Invitar</button>` : ''}
        ${isAdm() && e.estado === 'completo' ? `<button class="btn blue sm" data-a="mkFromEnc" data-id="${e.id}">Crear marcador</button>` : ''}
        ${mineE || isAdm() ? `<button class="btn danger sm" data-a="encCancel" data-id="${e.id}">Cancelar</button>` : ''}
      </div></div>`;
  }).join('') : `<div style="grid-column:1/-1">${empty('No hay encuentros abiertos. ¡Crea el primero!')}</div>`}</div>`;
};
A.encNew = async () => {
  const hoy = today();
  modal(`<h2>Nuevo encuentro</h2>
    <label class="f">Sede</label><select class="in" id="e_sede" data-c="encSede">${S.sedes.map(s => `<option value="${s.id}" ${s.id === S.sedeId ? 'selected' : ''}>${esc(s.nombre)}</option>`).join('')}</select>
    <div class="two"><div><label class="f">Cancha</label><select class="in" id="e_cancha" data-c="encHours"></select></div>
    <div><label class="f">Fecha</label><input class="in" type="date" id="e_fecha" min="${hoy}" value="${S.fecha}" data-c="encHours"></div></div>
    <div class="two"><div><label class="f">Hora</label><select class="in" id="e_hora"></select></div>
    <div><label class="f">Apuesta por jugador ($)</label><input class="in" type="number" id="e_apuesta" min="0" step="1000" value="0"></div></div>
    <label class="f">Nota (nivel, ambiente…)</label><input class="in" id="e_nota" maxlength="120" placeholder="Ej: nivel intermedio, partido amistoso">
    <p class="muted mt"><small>Al crear el encuentro se reserva la cancha. ${isAdm() ? '' : 'Si hay apuesta, se descuenta de tu wallet y se devuelve si sales o se cancela.'}</small></p>
    <button class="btn full mt" data-a="encCreate">Crear y reservar</button>`);
  C.encSede($('#e_sede').value);
};
C.encSede = async v => {
  $('#e_cancha').innerHTML = S.courts.filter(c => c.sede_id === v).map(c => `<option value="${c.id}">${esc(c.nombre)}</option>`).join('');
  await C.encHours();
};
C.encHours = async () => {
  const sede = S.sedes.find(s => s.id === $('#e_sede').value), court = $('#e_cancha').value, f = $('#e_fecha').value; if (!sede || !court || !f) return;
  const rs = await db(T('reservas').select('hora').eq('court_id', court).eq('fecha', f).eq('estado', 'confirmada')), taken = rs.map(r => r.hora), nowH = new Date().getHours();
  let o = ''; for (let h = sede.apertura; h < sede.cierre; h++) if (!taken.includes(h) && !(f === today() && h <= nowH)) o += `<option value="${h}">${hh(h)}</option>`;
  $('#e_hora').innerHTML = o || '<option value="">Sin horas libres</option>';
};
A.encCreate = async () => {
  const sede = $('#e_sede').value, court = $('#e_cancha').value, fecha = $('#e_fecha').value, hora = parseInt($('#e_hora').value), ap = Math.max(0, +$('#e_apuesta').value || 0), nota = $('#e_nota').value.trim();
  if (!court || !fecha || isNaN(hora)) throw new Error('Completa cancha, fecha y hora');
  const player = !isAdm();
  if (player && ap > 0 && S.user.wallet < ap) throw new Error('Tu saldo no alcanza para la apuesta');
  let r;
  try { r = await db(T('reservas').insert({ sede_id: sede, court_id: court, user_id: S.user.id, fecha, hora }).select().single()); }
  catch (e) { throw new Error(/duplicate|unique/i.test(e.message) ? 'Ese horario ya fue reservado' : e.message); }
  try {
    const e = await db(T('encuentros').insert({ creador_id: S.user.id, sede_id: sede, court_id: court, reserva_id: r.id, fecha, hora, apuesta: ap, nota: nota || null }).select().single());
    if (player) {
      if (ap > 0) await db(sb.rpc('wallet_mov', { p_user: S.user.id, p_monto: -ap, p_tipo: 'apuesta', p_desc: 'Apuesta en encuentro' }));
      await db(T('encuentro_jugadores').insert({ encuentro_id: e.id, user_id: S.user.id, equipo: 1 }));
    }
  } catch (err) { await T('reservas').update({ estado: 'cancelada' }).eq('id', r.id); throw err; }
  closeModal(); await refreshUser(); toast('Encuentro creado y cancha reservada', 'ok'); go('encuentros');
  if (S.user.correo) mailReserva(r.id);
};
A.encJoin = async d => {
  const e = await db(T('encuentros').select('*,encuentro_jugadores(user_id)').eq('id', d.id).single()), js = e.encuentro_jugadores;
  if (e.estado !== 'abierto' || js.length >= 4) throw new Error('El encuentro ya está completo');
  if (js.some(j => j.user_id === S.user.id)) throw new Error('Ya estás en este encuentro');
  if (e.apuesta > 0) await db(sb.rpc('wallet_mov', { p_user: S.user.id, p_monto: -e.apuesta, p_tipo: 'apuesta', p_desc: 'Apuesta en encuentro' }));
  await db(T('encuentro_jugadores').insert({ encuentro_id: e.id, user_id: S.user.id, equipo: js.length < 2 ? 1 : 2 }));
  if (js.length + 1 >= 4) await db(T('encuentros').update({ estado: 'completo' }).eq('id', e.id));
  closeModal(); await refreshUser(); toast('¡Te uniste al encuentro!', 'ok'); go('encuentros');
};
A.encLeave = async d => {
  const e = await db(T('encuentros').select('apuesta,estado').eq('id', d.id).single());
  if (e.estado === 'en_juego') throw new Error('El partido ya empezó');
  if (!confirm('¿Salir del encuentro?' + (e.apuesta > 0 ? ' Se te devolverá la apuesta.' : ''))) return;
  await db(T('encuentro_jugadores').delete().eq('encuentro_id', d.id).eq('user_id', S.user.id));
  if (e.apuesta > 0) await db(sb.rpc('wallet_mov', { p_user: S.user.id, p_monto: e.apuesta, p_tipo: 'reembolso', p_desc: 'Reembolso de apuesta' }));
  await db(T('encuentros').update({ estado: 'abierto' }).eq('id', d.id));
  await refreshUser(); toast('Saliste del encuentro'); reload();
};
A.encCancel = async d => {
  if (!confirm('¿Cancelar el encuentro y liberar la cancha? Se devolverán las apuestas.')) return;
  const e = await db(T('encuentros').select('apuesta,reserva_id,encuentro_jugadores(user_id)').eq('id', d.id).single());
  if (e.apuesta > 0) for (const j of e.encuentro_jugadores) await db(sb.rpc('wallet_mov', { p_user: j.user_id, p_monto: e.apuesta, p_tipo: 'reembolso', p_desc: 'Encuentro cancelado' }));
  if (e.reserva_id) await db(T('reservas').update({ estado: 'cancelada' }).eq('id', e.reserva_id));
  await db(T('encuentros').update({ estado: 'cancelado' }).eq('id', d.id));
  await refreshUser(); toast('Encuentro cancelado'); reload();
};
A.invOpen = async d => {
  const us = (await getUsers()).filter(u => u.role === 'jugador' && u.id !== S.user.id);
  modal(`<h2>Invitar jugadores</h2><input class="in mt" placeholder="Buscar por nombre…" data-i="invFilter"><div id="invList" class="mt">${us.map(u => `<div class="pl row between invr" data-s="${esc(u.nombre.toLowerCase())}" style="padding:8px 0"><div class="pl">${avatar(u)}<div><b>${esc(u.nombre)}</b><br>${catBadge(u.puntos)}</div></div><button class="btn sm" data-a="invSend" data-e="${d.id}" data-u="${u.id}">Invitar</button></div>`).join('')}</div>`);
};
C.invFilter = v => $$('.invr').forEach(el => el.style.display = el.dataset.s.includes(v.toLowerCase()) ? '' : 'none');
A.invSend = async (d, el) => {
  const e = await db(T('encuentros').select('fecha,hora,canchas(nombre),sedes(nombre)').eq('id', d.e).single());
  await db(T('notificaciones').insert({ user_id: d.u, encuentro_id: d.e, texto: `${S.user.nombre} te invitó a jugar: ${e.canchas?.nombre} (${e.sedes?.nombre}) el ${dfmt(e.fecha, { weekday:'long', day:'numeric', month:'long' })} a las ${hh(e.hora)}.` }));
  el.textContent = 'Enviada ✓'; el.disabled = true;
};

/* ---------- TORNEOS (llaves por sede) ---------- */
const ROUND_NAMES = { 1: 'Final', 2: 'Semifinales', 3: 'Cuartos de final', 4: 'Octavos de final', 5: 'Dieciseisavos' };
const ROUND_CODES = { 1: 'F', 2: 'SF', 3: 'QF', 4: 'R16', 5: 'R32' };
const rondaNombre = (r, R) => ROUND_NAMES[R - r + 1] || `Ronda ${r}`;
const mCode = (r, pos, R) => (ROUND_CODES[R - r + 1] || 'R' + r) + (r === R ? '' : pos + 1);
const seedOrder = n => { let a = [1, 2]; while (a.length < n) { const m = a.length * 2 + 1; a = a.flatMap(x => [x, m - x]); } return a; };
const tTeam = t => teamName(t?.jugadores);

async function loadTorneo(id) {
  const [t, ps] = await Promise.all([
    db(T('torneos').select('*').eq('id', id).single()),
    db(T('torneo_partidos').select('*,matches(id,sets,status,ganador),canchas(nombre)').eq('torneo_id', id).order('ronda').order('pos'))
  ]);
  return { t, ps };
}

function matchCard(t, p, R) {
  const m = p.matches, sets = m?.sets || [], done = p.estado === 'finalizado', live = p.estado === 'en_juego';
  const ready = !!(p.equipo1 && p.equipo2), code = mCode(p.ronda, p.pos, R);
  const row = (team, i) => {
    const win = done && p.ganador === i, ph = p.ronda === 1 ? 'Libre (BYE)' : `Ganador ${mCode(p.ronda - 1, 2 * p.pos + i, R)}`;
    return `<div class="bt ${win ? 'w' : done && team && !p.bye ? 'l' : ''}">${team ? `<span class="sd">${team.seed}</span><span class="tn">${esc(tTeam(team))}</span>` : `<span class="tn ph">${ph}</span>`}<span class="sc">${team && m ? sets.map(s => `<b>${s[i]}</b>`).join('') : ''}</span></div>`;
  };
  let act = '';
  if (isAdm() && !p.bye) {
    if (p.estado === 'pendiente' && ready) act = `<button class="btn sm full" data-a="torStart" data-id="${p.id}">Iniciar partido</button>`;
    else if (live && m) act = `<button class="btn blue sm full" data-a="torCtl" data-mid="${m.id}">Controlar marcador</button>`;
  }
  return `<div class="bm ${live ? 'live' : ''} ${!ready && !p.bye ? 'pend' : ''}"><div class="bh"><span>${code}${p.bye ? ' · pasa directo' : ''}</span><span>${live ? '● EN JUEGO' : done && !p.bye ? 'Final' : ''}${p.canchas?.nombre ? ' · ' + esc(p.canchas.nombre) : ''}</span></div>${row(p.equipo1, 0)}${row(p.equipo2, 1)}${act ? `<div class="ba">${act}</div>` : ''}</div>`;
}
function bracketHtml(t, ps) {
  const R = Math.round(Math.log2(t.tam));
  const cols = [...Array(R).keys()].map(i => {
    const r = i + 1, ms = ps.filter(p => p.ronda === r);
    return `<div class="rcol"><div class="rt">${rondaNombre(r, R)}<small>${ms.length} ${ms.length === 1 ? 'partido' : 'partidos'}</small></div><div class="rnd">${ms.map(p => matchCard(t, p, R)).join('')}</div></div>`;
  });
  cols.push(`<div class="rcol rch"><div class="rt">Campeón</div><div class="rnd"><div class="champ"><span style="font-size:26px">${t.campeon ? '🏆' : '◆'}</span><small>CAMPEÓN</small><b>${t.campeon ? esc(tTeam(t.campeon)) : 'Por decidir'}</b></div></div></div>`);
  return `<div class="brk">${cols.join('')}</div>`;
}
async function refreshBracket() {
  const el = $('#brk'); if (!el || !S.tid || $('#modal')) return;
  try { const { t, ps } = await loadTorneo(S.tid); if (S.tid === t.id && $('#brk')) $('#brk').innerHTML = bracketHtml(t, ps); } catch (_) {}
}

V.torneos = async () => {
  if (S.tid) { try { return await torneoDetail(); } catch (e) { S.tid = null; } }
  const ts = await db(T('torneos').select('id,nombre,estado,equipos,campeon,mejor_de,jugadores_por_equipo,created_at').eq('sede_id', S.sedeId).order('created_at', { ascending: false }));
  return `<div class="row between">${sedeSel()}${isAdm() ? '<button class="btn" data-a="torNew">+ Crear torneo</button>' : ''}</div>
  <div class="grid g2 mt">${ts.length ? ts.map(t => `<div class="card"><div class="row between"><h3 style="margin:0">${esc(t.nombre)}</h3><span class="st ${t.estado === 'finalizado' ? 'entregada' : 'en_juego'}">${t.estado === 'finalizado' ? 'Finalizado' : 'En juego'}</span></div>
    <small>${t.equipos.length} ${t.jugadores_por_equipo === 2 ? 'parejas' : 'jugadores'} · mejor de ${t.mejor_de} sets</small>
    ${t.campeon ? `<p class="mt">🏆 <b>${esc(tTeam(t.campeon))}</b></p>` : ''}
    <div class="row mt"><button class="btn sm" data-a="torOpen" data-id="${t.id}">Ver llaves</button>${isAdm() ? `<button class="btn danger sm" data-a="torDel" data-id="${t.id}">Eliminar</button>` : ''}</div></div>`).join('') : `<div style="grid-column:1/-1">${empty('Esta sede aún no tiene torneos.')}</div>`}</div>`;
};
async function torneoDetail() {
  const { t, ps } = await loadTorneo(S.tid), sd = S.sedes.find(s => s.id === t.sede_id);
  const cn = t.canchas.map(id => S.courts.find(c => c.id === id)?.nombre).filter(Boolean).join(', ');
  return `<div class="row between"><button class="btn sec sm" data-a="torBack">← Todos los torneos</button>${isAdm() ? `<button class="btn danger sm" data-a="torDel" data-id="${t.id}">Eliminar torneo</button>` : ''}</div>
  <div class="row between mt"><div><h2 style="margin:0">${esc(t.nombre)}</h2><small>${esc(sd?.nombre || '')} · ${t.equipos.length} ${t.jugadores_por_equipo === 2 ? 'parejas' : 'jugadores'} · mejor de ${t.mejor_de} sets · ${t.punto_oro ? 'punto de oro' : 'con ventajas'}${cn ? ' · pistas: ' + esc(cn) : ''}</small></div><span class="st ${t.estado === 'finalizado' ? 'entregada' : 'en_juego'}">${t.estado === 'finalizado' ? 'Finalizado' : 'En juego'}</span></div>
  <div class="mt" id="brk">${bracketHtml(t, ps)}</div><small class="muted">El cuadro se actualiza solo con los resultados.</small>`;
}
A.torOpen = d => { S.tid = d.id; reload(); };
A.torBack = () => { S.tid = null; reload(); };
A.torDel = async d => {
  if (!confirm('¿Eliminar este torneo y todas sus llaves? Esta acción no se puede deshacer.')) return;
  await db(T('torneos').delete().eq('id', d.id)); S.tid = null; toast('Torneo eliminado'); reload();
};

const courtBoxes = sede => S.courts.filter(c => c.sede_id === sede).map(c => `<label class="fl"><input type="checkbox" class="tcb" value="${c.id}" checked> ${esc(c.nombre)}</label>`).join('') || '<small>Esta sede no tiene pistas activas</small>';
const torRows = (n, per, old = []) => [...Array(n).keys()].map(i => `<div class="row trw" style="flex-wrap:nowrap;margin-bottom:8px"><span class="sd">${i + 1}</span>${[...Array(per).keys()].map(j => `<input class="in tp" list="tul" placeholder="Jugador ${j + 1}" value="${esc(old[i]?.[j] || '')}">`).join('')}</div>`).join('');
const torVals = () => $$('.trw').map(r => $$('.tp', r).map(i => i.value.trim()));
C.torRebuild = () => { const per = +$('#t_per').value, n = Math.max(2, Math.min(32, Math.floor(+$('#t_n').value) || 2)); $('#t_n').value = n; $('#tor_teams').innerHTML = torRows(n, per, torVals()); };
C.torModo = C.torRebuild; C.torN = C.torRebuild;
C.torSede = v => { $('#t_courts').innerHTML = courtBoxes(v); };
A.torNew = async () => {
  const us = (await getUsers()).filter(u => u.role === 'jugador');
  modal(`<h2>Crear torneo</h2>
    <label class="f">Nombre del torneo</label><input class="in" id="t_nom" placeholder="Ej: Copa Club 2ª masculina">
    <div class="two"><div><label class="f">Sede</label><select class="in" id="t_sede" data-c="torSede">${S.sedes.map(s => `<option value="${s.id}" ${s.id === S.sedeId ? 'selected' : ''}>${esc(s.nombre)}</option>`).join('')}</select></div>
    <div><label class="f">Modalidad</label><select class="in" id="t_per" data-c="torModo"><option value="2">Parejas (dobles)</option><option value="1">Individual</option></select></div></div>
    <div class="two"><div><label class="f">Formato</label><select class="in" id="t_best"><option value="3">Mejor de 3 sets</option><option value="1">1 set</option><option value="5">Mejor de 5 sets</option></select></div>
    <div><label class="f">En 40-40</label><select class="in" id="t_oro"><option value="0">Con ventajas</option><option value="1">Punto de oro</option></select></div></div>
    <label class="f">Pistas del torneo</label><div class="row" id="t_courts">${courtBoxes(S.sedeId)}</div>
    <div class="two"><div><label class="f">Cantidad de ${'equipos'} (2 a 32)</label><input class="in" type="number" id="t_n" min="2" max="32" value="4" data-c="torN"></div>
    <div><label class="f">Orden en las llaves</label><select class="in" id="t_ord"><option value="lista">Según la lista (cabezas de serie)</option><option value="sorteo">Sorteo aleatorio</option></select></div></div>
    <datalist id="tul">${us.map(u => `<option value="${esc(u.nombre)} · ${esc(u.cedula)}">`).join('')}</datalist>
    <label class="f">Equipos · elige jugadores registrados (el número es el cabeza de serie)</label><div id="tor_teams">${torRows(4, 2)}</div>
    <p class="muted"><small>Si la cantidad no es potencia de 2, los mejores cabezas de serie pasan directo (BYE). Los partidos del torneo no aparecen en Encuentros.</small></p>
    <button class="btn full mt" data-a="torCreate">Crear torneo y generar llaves</button>`, 'wide');
};
A.torCreate = async () => {
  const nombre = $('#t_nom').value.trim(), sede = $('#t_sede').value, per = +$('#t_per').value;
  if (nombre.length < 3) throw new Error('Escribe el nombre del torneo');
  const canchas = $$('.tcb:checked').map(x => x.value); if (!canchas.length) throw new Error('Selecciona al menos una pista');
  const byLabel = new Map((await getUsers()).map(u => [`${u.nombre} · ${u.cedula}`, u])), used = new Set(), equipos = [];
  torVals().forEach((row, i) => equipos.push({ jugadores: row.map(v => {
    const u = byLabel.get(v); if (!u) throw new Error(`Equipo ${i + 1}: elige a los jugadores de la lista de registrados`);
    if (used.has(u.id)) throw new Error(`${u.nombre} está repetido en los equipos`); used.add(u.id); return { id: u.id, nombre: u.nombre };
  }) }));
  if (equipos.length < 2) throw new Error('Se necesitan al menos 2 equipos');
  if ($('#t_ord').value === 'sorteo') for (let i = equipos.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [equipos[i], equipos[j]] = [equipos[j], equipos[i]]; }
  equipos.forEach((e, i) => e.seed = i + 1);
  const tam = 2 ** Math.ceil(Math.log2(equipos.length)), R = Math.log2(tam), so = seedOrder(tam), rows = [];
  for (let pos = 0; pos < tam / 2; pos++) { const a = equipos[so[2 * pos] - 1] || null, b = equipos[so[2 * pos + 1] - 1] || null; rows.push({ ronda: 1, pos, equipo1: a, equipo2: b, bye: !a || !b, estado: 'pendiente', ganador: null }); }
  for (let r = 2; r <= R; r++) for (let pos = 0; pos < tam / 2 ** r; pos++) rows.push({ ronda: r, pos, equipo1: null, equipo2: null, bye: false, estado: 'pendiente', ganador: null });
  const get = (r, p) => rows.find(x => x.ronda === r && x.pos === p);
  rows.filter(x => x.ronda === 1 && x.bye).forEach(x => { x.estado = 'finalizado'; x.ganador = x.equipo1 ? 0 : 1; if (R > 1) get(2, x.pos >> 1)[x.pos % 2 ? 'equipo2' : 'equipo1'] = x.equipo1 || x.equipo2; });
  const t = await db(T('torneos').insert({ sede_id: sede, nombre, jugadores_por_equipo: per, mejor_de: +$('#t_best').value, punto_oro: $('#t_oro').value === '1', canchas, equipos, tam, created_by: S.user.id }).select().single());
  try { await db(T('torneo_partidos').insert(rows.map(r => ({ ...r, torneo_id: t.id })))); }
  catch (e) { await T('torneos').delete().eq('id', t.id); throw e; }
  S.sedeId = sede; S.tid = t.id; closeModal(); toast('Torneo creado. ¡Llaves generadas!', 'ok'); reload();
};
A.torStart = async d => {
  const p = await db(T('torneo_partidos').select('*,torneos(nombre,canchas,tam)').eq('id', d.id).single());
  if (p.estado !== 'pendiente' || !p.equipo1 || !p.equipo2) throw new Error('Este partido no se puede iniciar');
  const busy = (await db(T('torneo_partidos').select('court_id').eq('torneo_id', p.torneo_id).eq('estado', 'en_juego'))).map(x => x.court_id);
  const cs = p.torneos.canchas.map(id => S.courts.find(c => c.id === id)).filter(Boolean);
  modal(`<h2>Iniciar ${mCode(p.ronda, p.pos, Math.round(Math.log2(p.torneos.tam)))}</h2>
    <p class="mt"><b>${esc(tTeam(p.equipo1))}</b><br><small>vs</small><br><b>${esc(tTeam(p.equipo2))}</b></p>
    <label class="f">Pista</label><select class="in" id="ts_court">${cs.map(c => `<option value="${c.id}" ${busy.includes(c.id) ? 'disabled' : ''}>${esc(c.nombre)}${busy.includes(c.id) ? ' (en uso)' : ''}</option>`).join('')}</select>
    <button class="btn full mt" data-a="torStartGo" data-id="${p.id}">Empezar y abrir marcador</button>`);
};
A.torStartGo = async d => {
  const court = $('#ts_court').value; if (!court) throw new Error('Elige una pista');
  const claim = await db(T('torneo_partidos').update({ estado: 'en_juego', court_id: court }).eq('id', d.id).eq('estado', 'pendiente').select('*,torneos(sede_id,mejor_de,punto_oro)'));
  if (!claim.length) throw new Error('Este partido ya fue iniciado');
  const p = claim[0];
  try {
    const m = await db(T('matches').insert({ sede_id: p.torneos.sede_id, court_id: court, equipo1: p.equipo1.jugadores, equipo2: p.equipo2.jugadores, mejor_de: p.torneos.mejor_de, punto_oro: p.torneos.punto_oro, torneo_partido_id: p.id }).select().single());
    await db(T('torneo_partidos').update({ match_id: m.id }).eq('id', p.id));
    S.mid = m.id;
  } catch (e) { await T('torneo_partidos').update({ estado: 'pendiente', court_id: null }).eq('id', p.id); throw e; }
  HIST.length = 0; closeModal(); toast('Partido del torneo iniciado', 'ok'); go('marcador');
};
A.torCtl = d => { S.mid = d.mid; HIST.length = 0; go('marcador'); };
async function advanceTorneo(m) {
  const p = await db(T('torneo_partidos').select('*').eq('id', m.torneo_partido_id).maybeSingle()); if (!p) return;
  const claim = await db(T('torneo_partidos').update({ estado: 'finalizado', ganador: m.ganador }).eq('id', p.id).neq('estado', 'finalizado').select('id'));
  if (!claim.length) return;
  const win = m.ganador === 0 ? p.equipo1 : p.equipo2, t = await db(T('torneos').select('tam').eq('id', p.torneo_id).single());
  if (p.ronda >= Math.round(Math.log2(t.tam))) { await db(T('torneos').update({ estado: 'finalizado', campeon: win }).eq('id', p.torneo_id)); toast(`🏆 ¡Torneo finalizado! Campeón: ${tTeam(win)}`, 'ok'); }
  else await db(T('torneo_partidos').update({ [p.pos % 2 ? 'equipo2' : 'equipo1']: win }).eq('torneo_id', p.torneo_id).eq('ronda', p.ronda + 1).eq('pos', p.pos >> 1));
}

/* ---------- COMUNIDAD ---------- */
V.comunidad = async () => {
  const yo = S.user.id;
  const [us, rs] = await Promise.all([
    db(T('app_users').select('id,nombre,puntos,victorias,partidos,sede_id,foto').eq('role', 'jugador').order('puntos', { ascending: false }).limit(500)),
    db(T('retos').select(RETO_SEL).or(`retador_id.eq.${yo},retado_id.eq.${yo}`).order('created_at', { ascending: false }).limit(30))
  ]);
  const activos = rs.filter(r => ['pendiente', 'aceptado', 'en_juego'].includes(r.estado)), fin = rs.filter(r => r.estado === 'finalizado').slice(0, 4);
  const fila = r => { const otro = r.retador_id === yo ? r.retado : r.retador; return `<div class="card mt row between" style="padding:14px;gap:12px"><div class="pl" style="min-width:0">${avatar(otro)}<div style="min-width:0"><b>${esc(nomC(otro?.nombre))}</b> <span class="st ${r.estado === 'en_juego' ? 'en_juego' : r.estado === 'finalizado' ? 'entregada' : 'pendiente'}">${r.estado.replace('_', ' ')}</span><br><small>${esc(r.canchas?.nombre)} · ${esc(r.sedes?.nombre)} · ${esc(agFecha(r.fecha))} · ${hh(r.hora)}</small><br><small>${esc(rtEstadoTxt(r))}</small></div></div><button class="btn sm ${r.estado === 'pendiente' && r.retado_id === yo ? '' : 'sec'}" data-a="retoOpen" data-id="${r.id}">${r.estado === 'pendiente' && r.retado_id === yo ? 'Responder' : 'Abrir'}</button></div>`; };
  return `${activos.length || fin.length ? `<h3 style="margin-bottom:4px">⚔️ Mis retos</h3>${activos.map(fila).join('')}${fin.length ? `<small class="muted" style="display:block;margin-top:12px">Últimos resultados</small>${fin.map(fila).join('')}` : ''}<div style="height:18px"></div>` : ''}
  <div class="row between"><p class="muted" style="margin:0">Reta a otro jugador: eligen cancha, día y hora, y pueden apostar saldo de su wallet.</p></div>
  <input class="in mt" placeholder="Buscar jugador…" data-i="plFilter">
  <div class="grid g2 mt">${us.map((u, i) => `<div class="card pl plc" data-s="${esc(u.nombre.toLowerCase())}">${avatar(u, 'lg')}<div class="grow"><b>${esc(u.nombre)}</b> ${u.id === yo ? '<small>(tú)</small>' : ''}<br>${catBadge(u.puntos)} <small>${S.sedes.find(s => s.id === u.sede_id)?.nombre || ''}</small><br><small>${u.victorias} victorias · ${u.partidos} partidos</small>${u.id === yo ? '' : `<div style="margin-top:8px"><button class="btn sm" data-a="retarOpen" data-id="${u.id}">⚔️ Retar / invitar a jugar</button></div>`}</div><div style="text-align:right"><div style="font:800 24px var(--fh);color:var(--lime)">${u.puntos}</div><small>#${i + 1}</small></div></div>`).join('') || empty('Aún no hay jugadores.')}</div>`;
};

/* ---------- RETOS entre jugadores (1 contra 1) con apuesta opcional del wallet ---------- */
const RETO_SEL = 'id,estado,fecha,hora,mensaje,apuesta_monto,apuesta_por,apuesta_bloqueada,ganador_id,retador_id,retado_id,court_id,sede_id,created_at,retador:app_users!retador_id(id,nombre,foto),retado:app_users!retado_id(id,nombre,foto),canchas(nombre),sedes(nombre)';
const nomC = s => String(s || '').replace(/(^|\s)\p{L}/gu, c => c.toUpperCase());
function rtEstadoTxt(r) {
  const yo = S.user.id, otro = nomC((r.retador_id === yo ? r.retado : r.retador)?.nombre) || 'el jugador', m = Number(r.apuesta_monto);
  switch (r.estado) {
    case 'pendiente': return r.retador_id === yo ? `Esperando que ${otro} responda` : `${otro} te retó: ¡responde!`;
    case 'aceptado': return r.apuesta_bloqueada ? `🔒 Apuesta de ${money(m)} c/u confirmada` : m > 0 ? (r.apuesta_por === yo ? `Esperando que ${otro} confirme tu apuesta de ${money(m)}` : `${otro} propone apostar ${money(m)}`) : 'Aceptado · pueden acordar una apuesta (opcional)';
    case 'en_juego': return '🎾 Partido en juego · el ganador cobra solo al terminar';
    case 'finalizado': return r.ganador_id === yo ? `🏆 Ganaste${r.apuesta_bloqueada && m > 0 ? ' +' + money(m * 2) : ''}` : `Ganó ${otro}${r.apuesta_bloqueada && m > 0 ? ' · perdiste ' + money(m) : ''}`;
    case 'rechazado': return 'Rechazado'; default: return 'Cancelado';
  }
}
function retoBody(r) {
  const yo = S.user.id, soyRetador = r.retador_id === yo, otro = soyRetador ? r.retado : r.retador, on = nomC(otro?.nombre), m = Number(r.apuesta_monto), saldo = Number(S.user.wallet || 0);
  const cab = `<h2>⚔️ Reto ${soyRetador ? 'a' : 'de'} ${esc(on)}</h2><div class="fac"><b>${esc(r.canchas?.nombre)}</b> · ${esc(r.sedes?.nombre)}<br>${esc(agFecha(r.fecha))} · <b>${hh(r.hora)}</b>${r.mensaje ? `<br><small>“${esc(r.mensaje)}”</small>` : ''}</div>`;
  const cancel = `<button class="btn danger sm mt" data-a="retoCancelar" data-id="${r.id}">Cancelar reto${r.apuesta_bloqueada && m > 0 ? ' (se devuelve la apuesta)' : ''}</button>`;
  if (r.estado === 'pendiente') return soyRetador
    ? `${cab}<p class="mt">Esperando que <b>${esc(on)}</b> acepte. Cuando acepte, la cancha queda reservada y podrán acordar una apuesta.</p>${cancel}`
    : `${cab}<p class="mt"><b>${esc(on)}</b> te reta a jugar. Si aceptas, <b>la cancha queda reservada</b> y se abre la casilla para acordar una apuesta con el saldo de tu wallet.</p><div class="row mt"><button class="btn" data-a="retoSi" data-id="${r.id}">✅ Aceptar y reservar</button><button class="btn sec" data-a="retoNo" data-id="${r.id}">Rechazar</button></div>`;
  if (r.estado === 'aceptado') {
    let apuesta;
    if (r.apuesta_bloqueada) apuesta = `<div class="fac" style="border-color:var(--ok)"><b>🔒 Apuesta confirmada: ${money(m)} cada uno</b><br><small>Se retuvo de los dos wallets. El ganador se lleva <b>${money(m * 2)}</b> automáticamente al terminar el partido.</small></div>`;
    else {
      const caja = `<label class="f">${m > 0 ? 'Contraproponer un monto ($)' : 'Monto a apostar cada uno ($)'}</label><div class="row" style="flex-wrap:nowrap"><input class="in" type="number" id="rt_monto" min="1000" step="1000" max="${saldo}" placeholder="Ej: 10000" data-enter="retoApostar"><button class="btn sm" data-a="retoApostar" data-id="${r.id}" style="white-space:nowrap">${m > 0 ? 'Contraproponer' : 'Proponer'}</button></div>`;
      apuesta = `<p class="muted">Tu saldo: <b>${money(saldo)}</b></p>` + (m > 0 && r.apuesta_por !== yo
        ? `<div class="fac" style="border-color:var(--warn)"><b>${esc(on)} propone apostar ${money(m)} cada uno</b><br><small>El ganador se lleva ${money(m * 2)}. Al aceptar se retiene ${money(m)} de cada wallet.</small><div class="row mt"><button class="btn" data-a="retoConfirmar" data-id="${r.id}" ${saldo < m ? 'disabled' : ''}>✅ Aceptar apuesta</button><button class="btn sec sm" data-a="retoSinApuesta" data-id="${r.id}">Jugar sin apuesta</button></div>${saldo < m ? `<small style="color:var(--red)">Tu saldo no alcanza para esta apuesta.</small>` : ''}</div>${caja}`
        : m > 0 ? `<div class="fac"><b>Propusiste apostar ${money(m)} cada uno</b><br><small>Esperando que ${esc(on)} la confirme.</small></div>${caja}<button class="btn sec sm mt" data-a="retoSinApuesta" data-id="${r.id}">Retirar apuesta (jugar sin apostar)</button>`
        : `<div class="fac"><b>💰 Apuesta (opcional)</b><br><small>Propón cuánto apostar cada uno. Si ${esc(on)} la acepta, se retiene el dinero de los dos wallets y el ganador se lo lleva al terminar. También pueden jugar sin apostar.</small></div>${caja}`);
    }
    return `${cab}<p class="mt" style="color:var(--ok)">✅ Cancha reservada</p>${apuesta}${cancel}`;
  }
  if (r.estado === 'en_juego') return `${cab}<p class="mt">🎾 <b>Partido en juego.</b>${r.apuesta_bloqueada && m > 0 ? ` El ganador recibirá ${money(m * 2)} en su wallet al terminar.` : ''}</p>`;
  if (r.estado === 'finalizado') return `${cab}<p class="mt" style="font-size:17px"><b>${esc(rtEstadoTxt(r))}</b></p>${r.apuesta_bloqueada && m > 0 ? `<small class="muted">El premio de ${money(m * 2)} se acreditó automáticamente al ganador.</small>` : ''}`;
  return `${cab}<p class="mt muted">${esc(rtEstadoTxt(r))}.</p>`;
}
async function retoModal(id, silencioso) {
  const r = await db(T('retos').select(RETO_SEL).eq('id', id).maybeSingle()); if (!r) return;
  if (silencioso && S.retoOpenId !== id) return;
  await refreshUser(); S.retoOpenId = id; modal(retoBody(r)); S.retoOpenId = id;
}
async function retoAccion(id, fn, okMsg) {
  await fn(); await refreshUser(); if (okMsg) toast(okMsg, 'ok');
  await retoModal(id); if (S.view === 'comunidad') reload();
}
A.retoOpen = d => retoModal(d.id);
A.retoSi = d => retoAccion(d.id, async () => {
  const r = await db(sb.rpc('reto_responder', { p_reto: d.id, p_user: S.user.id, p_acepta: true }));
  if (!r.ok) throw new Error({ ocupada: 'Esa cancha ya fue reservada por alguien más. Pídele a tu rival que te proponga otro horario.', vencido: 'Ese horario ya pasó.', cerrado: 'Este reto ya fue respondido.', no_existe: 'El reto no existe.' }[r.motivo] || 'No se pudo aceptar el reto');
}, '✅ Reto aceptado: la cancha quedó reservada. ¡Acuerden la apuesta!');
A.retoNo = d => retoAccion(d.id, () => db(sb.rpc('reto_responder', { p_reto: d.id, p_user: S.user.id, p_acepta: false })), 'Rechazaste el reto');
A.retoApostar = d => { const v = +($('#rt_monto')?.value || 0); if (!(v >= 1000)) throw new Error('El monto mínimo es $1.000'); if (v > S.user.wallet) throw new Error('Tu saldo no alcanza para apostar ese monto'); return retoAccion(d.id, () => db(sb.rpc('reto_apuesta', { p_reto: d.id, p_user: S.user.id, p_monto: v })), '💰 Apuesta propuesta. Falta que tu rival la confirme.'); };
A.retoSinApuesta = d => retoAccion(d.id, () => db(sb.rpc('reto_apuesta', { p_reto: d.id, p_user: S.user.id, p_monto: 0 })), 'Jugarán sin apuesta');
A.retoConfirmar = d => retoAccion(d.id, () => db(sb.rpc('reto_confirmar_apuesta', { p_reto: d.id, p_user: S.user.id })), '🔒 Apuesta confirmada: se retuvo el dinero de los dos');
A.retoCancelar = d => { if (!confirm('¿Cancelar este reto? Si ya había una apuesta confirmada, se devuelve a los dos jugadores y se libera la cancha.')) return; return retoAccion(d.id, () => db(sb.rpc('reto_cancelar', { p_reto: d.id, p_user: S.user.id })), 'Reto cancelado'); };

/* Ventana para retar: sede, cancha/pista, día y hora */
A.retarOpen = async d => {
  const rival = (await getUsers()).find(u => u.id === d.id); if (!rival) throw new Error('Jugador no encontrado');
  const sedeIni = S.sedes.find(s => s.id === S.sedeId) ? S.sedeId : S.sedes[0]?.id;
  modal(`<h2>⚔️ Retar a ${esc(nomC(rival.nombre))}</h2>
    <p class="muted">Elige dónde y cuándo. ${esc(nomC(rival.nombre.split(' ')[0]))} recibirá una ventana para aceptar; si acepta, <b>la cancha queda reservada</b> y podrán acordar una apuesta con el saldo de sus wallets.</p>
    <div class="two"><div><label class="f">Sede</label><select class="in" id="rt_sede" data-c="rtSede">${S.sedes.map(s => `<option value="${s.id}" ${s.id === sedeIni ? 'selected' : ''}>${esc(s.nombre)}</option>`).join('')}</select></div>
    <div><label class="f">Cancha / pista</label><select class="in" id="rt_court" data-c="rtHours"></select></div></div>
    <div class="two"><div><label class="f">Día</label><input class="in" type="date" id="rt_fecha" min="${today()}" max="${addDays(today(), 30)}" value="${addDays(today(), 1)}" data-c="rtHours"></div>
    <div><label class="f">Hora</label><select class="in" id="rt_hora"></select></div></div>
    <label class="f">Mensaje (opcional)</label><input class="in" id="rt_msg" maxlength="120" placeholder="Ej: ¡a ver quién gana esta vez!" autocomplete="off">
    <button class="btn full mt" data-a="retoEnviar" data-id="${rival.id}">Enviar reto</button>`);
  C.rtSede($('#rt_sede').value);
};
C.rtSede = async v => { $('#rt_court').innerHTML = S.courts.filter(c => c.sede_id === v).map(c => `<option value="${c.id}">${esc(c.nombre)} · ${money(c.precio_hora)}/h</option>`).join('') || '<option value="">Sin canchas</option>'; await C.rtHours(); };
C.rtHours = async () => {
  const sede = S.sedes.find(s => s.id === $('#rt_sede')?.value), court = $('#rt_court')?.value, f = $('#rt_fecha')?.value; if (!sede || !court || !f) return;
  const rs = await db(T('reservas').select('hora').eq('court_id', court).eq('fecha', f).eq('estado', 'confirmada')), taken = rs.map(r => r.hora), nowH = new Date().getHours();
  let o = ''; for (let h = sede.apertura; h < sede.cierre; h++) if (!taken.includes(h) && !(f === today() && h <= nowH)) o += `<option value="${h}">${hh(h)}</option>`;
  $('#rt_hora').innerHTML = o || '<option value="">Sin horas libres</option>';
};
A.retoEnviar = async d => {
  const court = $('#rt_court').value, fecha = $('#rt_fecha').value, hora = parseInt($('#rt_hora').value);
  if (!court || !fecha || isNaN(hora)) throw new Error('Elige cancha, día y una hora libre');
  await db(sb.rpc('reto_crear', { p_retador: S.user.id, p_retado: d.id, p_court: court, p_fecha: fecha, p_hora: hora, p_msg: $('#rt_msg').value.trim() || null }));
  closeModal(); toast('⚔️ Reto enviado. Le aparecerá una ventana para aceptar.', 'ok'); if (S.view === 'comunidad') reload();
};

/* Aviso automático: al jugador retado le sale la ventana para aceptar; al retador, la de la apuesta */
async function pollRetos() {
  const yo = S.user.id;
  const rs = await db(T('retos').select('id,estado,apuesta_monto,apuesta_por,apuesta_bloqueada,retador_id,retado_id').or(`retador_id.eq.${yo},retado_id.eq.${yo}`).order('created_at', { ascending: false }).limit(15));
  S.retoSig = S.retoSig || {};
  for (const r of rs) {
    const sig = [r.estado, Number(r.apuesta_monto), r.apuesta_por, r.apuesta_bloqueada].join('|'), prev = S.retoSig[r.id]; S.retoSig[r.id] = sig;
    const soyRetado = r.retado_id === yo, m = Number(r.apuesta_monto); let abrir = false, msg = '';
    if (prev === undefined) {   // reto que aparece, o que ya estaba esperando tu respuesta cuando abriste la app
      if (r.estado === 'pendiente' && soyRetado) { abrir = true; msg = '⚔️ ¡Te retaron a jugar!'; }
      else if (r.estado === 'aceptado' && !r.apuesta_bloqueada && m > 0 && r.apuesta_por && r.apuesta_por !== yo) { abrir = true; msg = '💰 Te proponen una apuesta'; }
    }
    else if (prev !== sig) {
      const [pe, pm, pp, pb] = prev.split('|');
      if (r.estado === 'aceptado' && pe === 'pendiente' && !soyRetado) { abrir = true; msg = '✅ Aceptaron tu reto: ¡acuerden la apuesta!'; }
      else if (r.estado === 'aceptado' && !r.apuesta_bloqueada && m > 0 && r.apuesta_por && r.apuesta_por !== yo && (Number(pm) !== m || pp !== r.apuesta_por)) { abrir = true; msg = '💰 Te proponen una apuesta'; }
      else if (r.apuesta_bloqueada && pb !== 'true') msg = '🔒 Apuesta confirmada: se retuvo el dinero de los dos';
      else if (r.estado !== pe && ['finalizado', 'rechazado', 'cancelado'].includes(r.estado)) { msg = r.estado === 'finalizado' ? '🏁 Terminó tu reto: revisa el resultado' : r.estado === 'rechazado' ? '🚫 Rechazaron tu reto' : '❌ Se canceló un reto'; refreshUser().catch(() => {}); }
    }
    if (S.retoOpenId === r.id && prev !== undefined && prev !== sig) { retoModal(r.id, true); if (msg) toast(msg, 'ok'); }
    else if (abrir && !$('#modal')) { if (S.audioOk) tone([784, 988, 1175]); toast(msg, 'ok'); retoModal(r.id); }
    else if (msg) toast(msg, 'ok');
  }
}
C.plFilter = v => $$('.plc').forEach(el => el.style.display = el.dataset.s.includes(v.toLowerCase()) ? '' : 'none');

/* ---------- RANKING (jugador y admin) ---------- */
V.ranking = async () => {
  const f = S.rk;
  const users = await db(T('app_users').select('id,nombre,puntos,victorias,partidos,foto').eq('role', 'jugador').order('puntos', { ascending: false }).limit(500));
  let rows;
  if (f.sede === 'all') rows = users.map(u => ({ ...u, pts: u.puntos }));
  else {
    const lg = await db(T('puntos_log').select('user_id,puntos').eq('sede_id', f.sede)), m = {}; lg.forEach(l => m[l.user_id] = (m[l.user_id] || 0) + l.puntos);
    rows = users.filter(u => m[u.id] != null).map(u => ({ ...u, pts: m[u.id] }));
  }
  rows.sort((a, b) => b.pts - a.pts);
  if (f.cat !== 'all') rows = rows.filter(u => catOf(u.puntos).id === f.cat);
  const medal = i => ['🥇', '🥈', '🥉'][i] || i + 1;
  return `
  <div class="filters">
    <button class="fl ${f.sede === 'all' ? 'on' : ''}" data-a="rkSede" data-v="all">Todas las sedes</button>
    ${S.sedes.map(s => `<button class="fl ${f.sede === s.id ? 'on' : ''}" data-a="rkSede" data-v="${s.id}">${esc(s.nombre)}</button>`).join('')}
  </div>
  <div class="filters">
    <button class="fl ${f.cat === 'all' ? 'on' : ''}" data-a="rkCat" data-v="all">General</button>
    ${S.rankings.map(r => `<button class="fl ${f.cat === r.id ? 'on' : ''}" data-a="rkCat" data-v="${r.id}"><span style="color:${r.color}">●</span> ${esc(r.nombre)}</button>`).join('')}
  </div>
  ${rows.length ? rows.map((u, i) => `<div class="rk ${u.id === S.user.id ? 'me' : ''}"><div class="pos">${medal(i)}</div>${avatar(u)}<div class="grow"><b>${esc(u.nombre)}</b><br><small>${u.victorias} victorias · ${u.partidos} partidos</small></div>${catBadge(u.puntos)}<div class="pts">${u.pts}</div></div>`).join('') : empty('Nadie tiene puntos en este filtro todavía.')}
  ${isAdm() ? `
  <h2 class="mt2">Configurar los 4 rankings</h2>
  <p class="muted">Cada jugador pertenece al ranking según su puntaje total. Deja «máx» vacío para no poner tope.</p>
  <div class="card mt">
    <div class="rkrow"><small>Nombre</small><small>Desde (pts)</small><small>Hasta (pts)</small><small>Color</small></div>
    ${S.rankings.map(r => `<div class="rkrow" data-rk="${r.id}"><input class="in" data-f="nombre" value="${esc(r.nombre)}"><input class="in" type="number" min="0" data-f="min" value="${r.min_puntos}"><input class="in" type="number" min="0" data-f="max" value="${r.max_puntos ?? ''}" placeholder="∞"><input class="in" type="color" data-f="color" value="${r.color}"></div>`).join('')}
    <button class="btn mt" data-a="rkSave">Guardar rankings</button>
  </div>` : ''}`;
};
A.rkSede = d => { S.rk.sede = d.v; reload(); };
A.rkCat = d => { S.rk.cat = d.v; reload(); };
A.rkSave = async () => {
  const rows = $$('[data-rk]').map(el => ({ id: el.dataset.rk, nombre: $('[data-f=nombre]', el).value.trim(), min_puntos: +$('[data-f=min]', el).value || 0, max_puntos: $('[data-f=max]', el).value === '' ? null : +$('[data-f=max]', el).value, color: $('[data-f=color]', el).value }));
  if (rows.some(r => !r.nombre)) throw new Error('Todos los rankings necesitan nombre');
  for (const r of rows) if (r.max_puntos != null && r.max_puntos < r.min_puntos) throw new Error(`En «${r.nombre}» el máximo es menor que el mínimo`);
  for (const r of rows) await db(T('rankings').update({ nombre: r.nombre, min_puntos: r.min_puntos, max_puntos: r.max_puntos, color: r.color }).eq('id', r.id));
  await loadBase(); toast('Rankings actualizados', 'ok'); reload();
};

/* ---------- TIENDA ---------- */
const STL = { pendiente: 'Pendiente de aprobación', aprobada: 'Aprobada · reclama en taquilla', rechazada: 'Rechazada', entregada: 'Entregada' };
V.tienda = async () => {
  if (isAdm()) return adminTienda();
  const [ps, os] = await Promise.all([
    db(T('productos').select('*').eq('activo', true).order('nombre')),
    db(T('ordenes').select('id,cantidad,total,estado,created_at,productos(nombre,emoji)').eq('user_id', S.user.id).order('created_at', { ascending: false }).limit(20))
  ]);
  return `<div class="row between"><p class="muted">Paga con tu wallet y reclama tu producto en taquilla.</p><span class="chip">${ic('wallet')}${money(S.user.wallet)}</span></div>
  <div class="grid g3 mt">${ps.length ? ps.map(p => `<div class="card prod"><div class="pic">${p.imagen ? `<img src="${p.imagen}" alt="">` : esc(p.emoji || '🎾')}</div><b>${esc(p.nombre)}</b><small>${esc(p.descripcion || '')}</small><div class="row between"><span class="pr">${money(p.precio)}</span><small>${p.stock > 0 ? p.stock + ' disp.' : 'Agotado'}</small></div><button class="btn sm" ${p.stock > 0 ? '' : 'disabled'} data-a="buyOpen" data-id="${p.id}">Comprar</button></div>`).join('') : `<div style="grid-column:1/-1">${empty('La tienda aún no tiene productos.')}</div>`}</div>
  <h3 class="mt2" style="margin-bottom:10px">Mis compras</h3>
  ${os.length ? os.map(o => `<div class="card mt row between" style="padding:14px"><div><b>${esc(o.productos?.emoji || '')} ${esc(o.productos?.nombre)}</b> × ${o.cantidad}<br><small>${money(o.total)} · ${dfmt(o.created_at.slice(0, 10), { day:'numeric', month:'short' })}</small></div><span class="st ${o.estado}">${STL[o.estado]}</span></div>`).join('') : empty('Todavía no has comprado nada.')}`;
};
A.buyOpen = async d => {
  const p = await db(T('productos').select('*').eq('id', d.id).single()); S.tmpImg = null;
  modal(`<h2>${esc(p.emoji || '')} ${esc(p.nombre)}</h2><p class="muted">${money(p.precio)} c/u · ${p.stock} disponibles</p>
    <label class="f">Cantidad</label><input class="in" type="number" id="b_qty" min="1" max="${p.stock}" value="1" data-i="buyTotal" data-p="${p.precio}">
    <p class="mt">Total: <b id="b_total">${money(p.precio)}</b> · Tu saldo: <b>${money(S.user.wallet)}</b></p>
    <label class="f">Comprobante de pago (imagen)</label><input class="in" type="file" accept="image/*" data-c="pickImg">
    <img id="prev" class="big mt" style="display:none" alt="Vista previa">
    <label class="f">Nota (opcional)</label><input class="in" id="b_nota" maxlength="120">
    <p class="muted mt"><small>El administrador revisará tu comprobante. Al aprobarse, el valor se descuenta de tu wallet y podrás reclamar el artículo en taquilla.</small></p>
    <button class="btn full mt" data-a="buyGo" data-id="${p.id}" data-precio="${p.precio}" data-stock="${p.stock}">Enviar compra</button>`);
};
C.buyTotal = (v, el) => { $('#b_total').textContent = money((+v || 0) * +el.dataset.p); };
C.pickImg = async (v, el) => { if (!el.files[0]) return; S.tmpImg = await resizeImg(el.files[0], 900); const im = $('#prev'); if (im) { im.src = S.tmpImg; im.style.display = 'block'; } };
A.buyGo = async d => {
  const q = parseInt($('#b_qty').value), total = q * +d.precio;
  if (!q || q < 1 || q > +d.stock) throw new Error('Cantidad no válida');
  if (total > S.user.wallet) throw new Error('Tu saldo no alcanza. Recarga tu wallet en taquilla.');
  if (!S.tmpImg) throw new Error('Adjunta el comprobante de pago');
  await db(T('ordenes').insert({ user_id: S.user.id, producto_id: d.id, cantidad: q, total, comprobante: S.tmpImg, nota: $('#b_nota').value.trim() || null }));
  S.tmpImg = null; closeModal(); toast('Compra enviada. Espera la aprobación del administrador', 'ok'); reload();
};

/* ---------- WALLET ---------- */
V.wallet = async () => {
  await refreshUser();
  const tx = await db(T('wallet_tx').select('*').eq('user_id', S.user.id).order('created_at', { ascending: false }).limit(40));
  return `<div class="wal"><small style="color:#b7c9f5">Saldo disponible</small><b>${money(S.user.wallet)}</b><p style="color:#b7c9f5;margin-top:8px">Para recargar, acércate a taquilla con tu cédula <b>${esc(S.user.cedula)}</b>.</p></div>
  <h3 class="mt2" style="margin-bottom:10px">Movimientos</h3>
  ${tx.length ? tx.map(t => `<div class="card mt row between" style="padding:12px 16px"><div><b style="text-transform:capitalize">${esc(t.tipo)}</b><br><small>${esc(t.descripcion || '')} · ${dfmt(t.created_at.slice(0, 10), { day:'numeric', month:'short' })}</small></div><b style="color:${t.monto >= 0 ? 'var(--ok)' : 'var(--red)'}">${t.monto >= 0 ? '+' : ''}${money(t.monto)}</b></div>`).join('') : empty('Aún no tienes movimientos.')}`;
};

/* =====================================================================
   VISTAS · ADMIN
   ===================================================================== */
V.dash = async () => {
  const cnt = async q => (await q).count || 0, h = { count: 'exact', head: true };
  const midnight = new Date(today() + 'T00:00').toISOString();
  const [jug, resH, encA, pend, live, rec] = await Promise.all([
    cnt(T('app_users').select('id', h).eq('role', 'jugador')),
    cnt(T('reservas').select('id', h).eq('fecha', today()).eq('estado', 'confirmada')),
    cnt(T('encuentros').select('id', h).in('estado', ['abierto', 'completo'])),
    cnt(T('ordenes').select('id', h).eq('estado', 'pendiente')),
    cnt(T('matches').select('id', h).eq('status', 'en_juego')),
    db(T('wallet_tx').select('monto').eq('tipo', 'recarga').gte('created_at', midnight))
  ]);
  const st = (n, l, v) => `<button class="stat" style="text-align:left" data-a="go" data-v="${v}"><b>${n}</b><small>${l}</small></button>`;
  const prox = await db(T('reservas').select('hora,nombre_cliente,canchas(nombre),app_users(nombre)').eq('fecha', today()).eq('estado', 'confirmada').order('hora').limit(12));
  return `<div class="grid g3">${st(jug, 'Jugadores registrados', 'jugadores')}${st(resH, 'Reservas de hoy', 'reservar')}${st(encA, 'Encuentros abiertos', 'encuentros')}${st(pend, 'Compras por aprobar', 'compras')}${st(live, 'Partidos en juego', 'marcador')}${st(money(rec.reduce((a, r) => a + +r.monto, 0)), 'Recargado hoy', 'wallets')}</div>
  <h3 class="mt2" style="margin-bottom:10px">Reservas de hoy</h3>
  ${prox.length ? `<div class="card tblw"><table class="tbl"><tr><th>Hora</th><th>Cancha</th><th>Cliente</th></tr>${prox.map(r => `<tr><td>${hh(r.hora)}</td><td>${esc(r.canchas?.nombre)}</td><td>${esc(r.nombre_cliente || r.app_users?.nombre || '—')}</td></tr>`).join('')}</table></div>` : empty('No hay reservas para hoy.')}`;
};

/* ---------- MARCADOR ---------- */
const HIST = [];
const setsNeeded = m => Math.ceil(m.mejor_de / 2);
const setsWon = m => { const w = [0, 0]; m.sets.forEach((s, i) => { if (i < m.sets.length - 1 || m.status === 'finalizado') { if (s[0] > s[1]) w[0]++; else if (s[1] > s[0]) w[1]++; } }); return w; };
function winGame(m, t) {
  const o = 1 - t, cur = m.sets[m.sets.length - 1];
  m.puntos = [0, 0]; m.tiebreak = false; cur[t]++;
  if ((cur[t] >= 6 && cur[t] - cur[o] >= 2) || cur[t] === 7) {
    const w = setsWon({ ...m, status: 'finalizado' });
    if (w[t] >= setsNeeded(m)) { m.status = 'finalizado'; m.ganador = t; m.fin = new Date().toISOString(); }
    else m.sets.push([0, 0]);
  } else if (cur[0] === 6 && cur[1] === 6) m.tiebreak = true;
}
function addPoint(m, t) {
  const o = 1 - t, g = m.puntos;
  if (m.tiebreak) { g[t]++; if (g[t] >= 7 && g[t] - g[o] >= 2) winGame(m, t); return; }
  if (g[t] < 3) { g[t]++; return; }
  if (g[t] === 4) { winGame(m, t); return; }
  if (g[o] < 3 || m.punto_oro) { winGame(m, t); return; }
  if (g[o] === 4) { g[o] = 3; return; }
  g[t] = 4;
}
const gameStr = (m, t) => m.tiebreak ? m.puntos[t] : (m.puntos[t] === 4 ? 'AD' : [0, 15, 30, 40][m.puntos[t]]);
function boardHtml(m, big) {
  const n = m.mejor_de, live = m.status === 'en_juego', cur = m.sets.length - 1;
  const cols = big ? `1fr repeat(${n}, clamp(50px,8vw,120px)) clamp(80px,12vw,180px)` : `1fr repeat(${n}, 54px) 74px`;
  const nm = [teamName(m.equipo1), teamName(m.equipo2)];
  return `<div class="board"><div class="pjh2" style="grid-template-columns:${cols}"><div></div>${[...Array(n).keys()].map(i => `<div>SET ${i + 1}</div>`).join('')}<div>GAME</div></div>
  ${[0, 1].map(t => `<div class="pjr" style="grid-template-columns:${cols}"><div class="pjn">${live && m.ganador == null ? '' : ''}${esc(nm[t])}</div>${[...Array(n).keys()].map(i => `<div class="pjs ${live && i === cur ? 'cur' : ''}">${m.sets[i] ? m.sets[i][t] : '–'}</div>`).join('')}<div class="pjg">${live ? gameStr(m, t) : (m.ganador === t ? '🏆' : '')}</div></div>`).join('')}</div>`;
}
async function saveMatch(m) {
  await db(T('matches').update({ sets: m.sets, puntos: m.puntos, tiebreak: m.tiebreak, status: m.status, ganador: m.ganador, fin: m.fin || null, updated_at: new Date().toISOString() }).eq('id', m.id));
  bc && bc.postMessage(m.id);
}
const scoreLine = m => m.sets.map(s => s.join('-')).join(' ');
/* Avisa a los jugadores del partido (campanita + push, que en un smartwatch emparejado se refleja solo) cada vez
   que se gana un juego o termina el partido — así pueden ver el marcador sin sacar el celular mientras juegan. */
async function notifMarcador(m) {
  const ids = [...m.equipo1, ...m.equipo2].map(p => p.id).filter(Boolean);
  if (!ids.length) return;
  const fin = m.status === 'finalizado';
  const texto = fin ? `🎾 Partido terminado: ${scoreLine(m)} · Ganó ${teamName(m.ganador === 0 ? m.equipo1 : m.equipo2)}`
                     : `🎾 ${teamName(m.equipo1)} vs ${teamName(m.equipo2)} · ${scoreLine(m)}`;
  try { await T('notificaciones').insert(ids.map(id => ({ user_id: id, texto, tipo: 'marcador', voz: texto }))); } catch (_) {}
}
/* Puntos anotados desde fuera del navegador (RPC marcador_anotar: futuro atajo de reloj, etc.). Se aplican
   con la MISMA lógica de juego de siempre (addPoint/saveMatch/finishMatch) para no duplicar la regla en ningún otro lado. */
async function drenarColaMarcador() {
  const m = S.match; if (!m || m.status !== 'en_juego') return;
  const ev = await db(T('marcador_cola').select('id,equipo').eq('match_id', m.id).order('created_at'));
  if (!ev.length) return;
  await T('marcador_cola').delete().in('id', ev.map(x => x.id));   // se retira de la cola apenas se lee, para no aplicarla dos veces
  for (const x of ev) { HIST.push(JSON.stringify({ sets: m.sets, puntos: m.puntos, tiebreak: m.tiebreak })); addPoint(m, x.equipo); }
  $('#ctl') && ($('#ctl').innerHTML = ctlHtml(m));
  await saveMatch(m);
  if (m.puntos[0] === 0 && m.puntos[1] === 0) notifMarcador(m);
  if (m.status === 'finalizado') { await finishMatch(m); $('#ctl') && ($('#ctl').innerHTML = ctlHtml(m)); }
}
async function finishMatch(m) {
  const claim = await db(T('matches').update({ puntos_otorgados: true }).eq('id', m.id).eq('puntos_otorgados', false).select('id'));
  if (!claim.length) { if (m.torneo_partido_id) await advanceTorneo(m); return; } m.puntos_otorgados = true;
  const win = m.ganador === 0 ? m.equipo1 : m.equipo2, lose = m.ganador === 0 ? m.equipo2 : m.equipo1;
  for (const p of win) if (p.id) await db(sb.rpc('registrar_resultado', { p_user: p.id, p_sede: m.sede_id, p_match: m.id, p_pts: PTS_VICTORIA, p_gano: true }));
  for (const p of lose) if (p.id) await db(sb.rpc('registrar_resultado', { p_user: p.id, p_sede: m.sede_id, p_match: m.id, p_pts: 0, p_gano: false }));
  if (m.encuentro_id) {
    const e = await db(T('encuentros').select('apuesta,encuentro_jugadores(user_id)').eq('id', m.encuentro_id).single());
    const pot = e.apuesta * e.encuentro_jugadores.length, ws = win.filter(p => p.id);
    if (pot > 0 && ws.length) { const share = Math.floor(pot / ws.length * 100) / 100; for (const p of ws) await db(sb.rpc('wallet_mov', { p_user: p.id, p_monto: share, p_tipo: 'premio', p_desc: 'Premio de apuesta' })); }
    await db(T('encuentros').update({ estado: 'finalizado' }).eq('id', m.encuentro_id));
  }
  S.users = null; bc && bc.postMessage(m.id);
  if (m.torneo_partido_id) await advanceTorneo(m);
  toast(`Partido finalizado: +${PTS_VICTORIA} puntos para ${teamName(win)}`, 'ok');
  if (m.reto_id) {   // el premio ya lo pagó la base de datos al cerrar el partido; aquí solo se informa
    try {
      const r = await db(T('retos').select('estado,apuesta_monto,apuesta_bloqueada,ganador:app_users!ganador_id(nombre)').eq('id', m.reto_id).single());
      if (r.estado === 'finalizado') toast(`🏆 Reto liquidado: ${nomC(r.ganador?.nombre)} ${r.apuesta_bloqueada && Number(r.apuesta_monto) > 0 ? 'recibió ' + money(r.apuesta_monto * 2) + ' en su wallet' : 'ganó (sin apuesta)'}`, 'ok');
    } catch (_) {}
  }
}
const ctlHtml = m => `
  <div class="row between"><h3 style="margin:0">${esc(m.canchas?.nombre || 'Partido')} ${m.status === 'en_juego' ? '<span class="dot" style="display:inline-block;margin-left:6px"></span>' : '<span class="st entregada">Finalizado</span>'}</h3>
    <div class="row"><button class="btn sec sm" data-a="pjOpen" data-id="${m.id}">Abrir pantalla del marcador</button><button class="btn sec sm" data-a="pjCopy" data-id="${m.id}">Copiar enlace</button></div></div>
  <div class="mt">${boardHtml(m, false)}</div>
  ${m.status === 'en_juego' ? `
  <div class="ptbtns"><button class="btn" data-a="pt" data-t="0">Punto: ${esc(teamName(m.equipo1))}</button><button class="btn blue" data-a="pt" data-t="1">Punto: ${esc(teamName(m.equipo2))}</button></div>
  <div class="row mt"><button class="btn sec sm" data-a="undo">↶ Deshacer</button><span class="grow"></span><small>Terminar ya:</small><button class="btn sec sm" data-a="endNow" data-t="0">Gana equipo 1</button><button class="btn sec sm" data-a="endNow" data-t="1">Gana equipo 2</button></div>
  <div class="row mt"><button class="btn sec sm" data-a="relCopy" data-id="${m.id}">⌚ Copiar enlace para el reloj</button><small class="muted">Ábrelo en el navegador del reloj (WearOS) para anotar desde la muñeca</small></div>
  ${m.reto_id ? `<div class="row mt"><span class="st en_juego">⚔️ Reto con apuesta: el premio pasa solo al ganador al terminar</span><button class="btn danger sm" data-a="retoAnular" data-id="${m.reto_id}">⛔ Anular reto y devolver apuesta</button></div>` : ''}
  <small class="muted">${m.punto_oro ? 'Punto de oro activo' : 'Con ventajas'} · Mejor de ${m.mejor_de} sets · Tie-break a 7 en el 6-6</small>` : `<p class="muted mt">Ganó <b>${esc(teamName(m.ganador === 0 ? m.equipo1 : m.equipo2))}</b>. Se sumaron ${PTS_VICTORIA} puntos a cada ganador.</p>`}`;

V.marcador = async () => {
  const [ms, retos] = await Promise.all([
    db(T('matches').select('*,canchas(nombre),sedes(nombre)').order('created_at', { ascending: false }).limit(15)),
    db(T('retos').select(RETO_SEL).eq('estado', 'aceptado').gte('fecha', today()).order('fecha').order('hora'))
  ]);
  S.match = S.mid ? ms.find(x => x.id === S.mid) || null : null;
  return `<div class="row between"><p class="muted">Lleva el marcador punto a punto. La pantalla del marcador se proyecta en otra ventana.</p><button class="btn" data-a="mkNew">+ Nuevo partido</button></div>
  <div class="card mt" id="ctl" ${S.match ? '' : 'style="display:none"'}>${S.match ? ctlHtml(S.match) : ''}</div>
  ${retos.length ? `<h3 class="mt2" style="margin-bottom:6px">⚔️ Retos por jugar</h3><small class="muted">Al terminar el partido, el premio de la apuesta pasa solo al wallet del ganador.</small>${retos.map(r => `<div class="card mt row between" style="padding:14px;gap:12px"><div><b>${esc(nomC(r.retador?.nombre))}</b> vs <b>${esc(nomC(r.retado?.nombre))}</b><br><small>${esc(r.canchas?.nombre)} · ${esc(r.sedes?.nombre)} · ${esc(agFecha(r.fecha))} · ${hh(r.hora)}</small><br><small>${r.apuesta_bloqueada && Number(r.apuesta_monto) > 0 ? '🔒 Apuesta ' + money(r.apuesta_monto) + ' c/u · premio ' + money(r.apuesta_monto * 2) : 'Sin apuesta confirmada'}</small></div><div class="row" style="flex-wrap:nowrap"><button class="btn sm" data-a="retoIniciar" data-id="${r.id}">▶ Crear marcador</button><button class="btn danger sm" data-a="retoAnular" data-id="${r.id}">Anular</button></div></div>`).join('')}` : ''}
  <h3 class="mt2" style="margin-bottom:10px">Partidos recientes</h3>
  ${ms.length ? ms.map(m => `<div class="card mt row between" style="padding:14px"><div><b>${esc(teamName(m.equipo1))}</b> vs <b>${esc(teamName(m.equipo2))}</b><br><small>${esc(m.canchas?.nombre || '')} · ${scoreLine(m)}</small></div><div class="row"><span class="st ${m.status}">${m.status.replace('_', ' ')}</span><button class="btn sm sec" data-a="mkCtl" data-id="${m.id}">${m.status === 'en_juego' ? 'Controlar' : 'Ver'}</button></div></div>`).join('') : empty('Aún no hay partidos.')}`;
};
A.mkCtl = d => { S.mid = d.id; HIST.length = 0; reload(); };
A.retoAnular = async d => {
  if (!confirm('¿Anular este reto? Si hay una apuesta retenida, se devuelve a los dos jugadores y no se paga premio a nadie.')) return;
  await db(sb.rpc('reto_anular', { p_reto: d.id })); toast('Reto anulado: apuesta devuelta a los dos jugadores', 'ok'); S.mid = null; S.users = null; go('marcador');
};
A.retoIniciar = async d => {
  const mid = await db(sb.rpc('reto_iniciar', { p_reto: d.id, p_mejor_de: 3, p_oro: false }));
  S.mid = mid; HIST.length = 0; toast('Marcador del reto creado', 'ok'); go('marcador');
};
A.pjOpen = d => window.open(location.href.split('#')[0] + '#/marcador/' + d.id, 'marcador', 'width=1280,height=720');
A.pjCopy = async d => { const u = location.href.split('#')[0] + '#/marcador/' + d.id; try { await navigator.clipboard.writeText(u); toast('Enlace copiado. Ábrelo en la pantalla del club', 'ok'); } catch (_) { prompt('Copia este enlace:', u); } };
A.relCopy = async d => { const u = location.href.split('#')[0] + '#/reloj/' + d.id; try { await navigator.clipboard.writeText(u); toast('Enlace copiado. Ábrelo en el navegador del reloj', 'ok'); } catch (_) { prompt('Copia este enlace:', u); } };
A.pt = async d => {
  const m = S.match; if (!m || m.status !== 'en_juego') return;
  HIST.push(JSON.stringify({ sets: m.sets, puntos: m.puntos, tiebreak: m.tiebreak }));
  addPoint(m, +d.t); $('#ctl').innerHTML = ctlHtml(m);
  await saveMatch(m);
  if (m.puntos[0] === 0 && m.puntos[1] === 0) notifMarcador(m);   // se ganó el juego (o el partido): avisa sin bloquear la UI
  if (m.status === 'finalizado') { await finishMatch(m); $('#ctl').innerHTML = ctlHtml(m); }
};
A.undo = async () => {
  const m = S.match; if (!m || m.status !== 'en_juego' || !HIST.length) return toast('No hay nada que deshacer');
  Object.assign(m, JSON.parse(HIST.pop())); $('#ctl').innerHTML = ctlHtml(m); await saveMatch(m);
};
A.endNow = async d => {
  const m = S.match; if (!confirm(`¿Terminar el partido y dar la victoria al equipo ${+d.t + 1}?`)) return;
  m.status = 'finalizado'; m.ganador = +d.t; m.fin = new Date().toISOString();
  await saveMatch(m); notifMarcador(m); await finishMatch(m); $('#ctl').innerHTML = ctlHtml(m);
};
A.mkNew = async () => {
  const us = (await getUsers()).filter(u => u.role === 'jugador');
  const inp = (id, ph) => `<input class="in" id="${id}" list="mul" placeholder="${ph}">`;
  modal(`<h2>Nuevo partido</h2>
    <div class="two"><div><label class="f">Sede</label><select class="in" id="m_sede" data-c="mkSede">${S.sedes.map(s => `<option value="${s.id}" ${s.id === S.sedeId ? 'selected' : ''}>${esc(s.nombre)}</option>`).join('')}</select></div>
    <div><label class="f">Cancha</label><select class="in" id="m_court">${S.courts.filter(c => c.sede_id === S.sedeId).map(c => `<option value="${c.id}">${esc(c.nombre)}</option>`).join('')}</select></div></div>
    <datalist id="mul">${us.map(u => `<option value="${esc(u.nombre)} · ${esc(u.cedula)}">`).join('')}</datalist>
    <label class="f">Equipo 1 · elige un jugador o escribe un nombre</label><div class="two">${inp('m_1a', 'Jugador 1')}${inp('m_1b', 'Jugador 2')}</div>
    <label class="f">Equipo 2</label><div class="two">${inp('m_2a', 'Jugador 3')}${inp('m_2b', 'Jugador 4')}</div>
    <div class="two"><div><label class="f">Formato</label><select class="in" id="m_best"><option value="3">Mejor de 3 sets</option><option value="1">1 set</option><option value="5">Mejor de 5 sets</option></select></div>
    <div><label class="f">En 40-40</label><select class="in" id="m_oro"><option value="0">Con ventajas</option><option value="1">Punto de oro</option></select></div></div>
    <p class="muted mt"><small>Solo los jugadores elegidos de la lista suman puntos.</small></p>
    <button class="btn full mt" data-a="mkGo">Empezar partido</button>`);
};
C.mkSede = v => { $('#m_court').innerHTML = S.courts.filter(c => c.sede_id === v).map(c => `<option value="${c.id}">${esc(c.nombre)}</option>`).join(''); };
A.mkGo = async () => {
  const us = await getUsers(), pl = id => { const v = $('#' + id).value.trim(); if (!v) return null; const u = us.find(x => `${x.nombre} · ${x.cedula}` === v); return u ? { id: u.id, nombre: u.nombre } : { id: null, nombre: v }; };
  const e1 = [pl('m_1a'), pl('m_1b')].filter(Boolean), e2 = [pl('m_2a'), pl('m_2b')].filter(Boolean);
  if (!e1.length || !e2.length) throw new Error('Cada equipo necesita al menos un jugador');
  const m = await db(T('matches').insert({ sede_id: $('#m_sede').value, court_id: $('#m_court').value || null, equipo1: e1, equipo2: e2, mejor_de: +$('#m_best').value, punto_oro: $('#m_oro').value === '1' }).select().single());
  S.mid = m.id; HIST.length = 0; closeModal(); toast('Partido iniciado', 'ok'); go('marcador');
};
A.mkFromEnc = async d => {
  const e = await db(T('encuentros').select('*,encuentro_jugadores(equipo,user_id,app_users(nombre))').eq('id', d.id).single());
  const t = q => e.encuentro_jugadores.filter(j => j.equipo === q).map(j => ({ id: j.user_id, nombre: j.app_users?.nombre }));
  const m = await db(T('matches').insert({ sede_id: e.sede_id, court_id: e.court_id, encuentro_id: e.id, equipo1: t(1), equipo2: t(2) }).select().single());
  await db(T('encuentros').update({ estado: 'en_juego' }).eq('id', e.id));
  S.mid = m.id; HIST.length = 0; toast('Marcador creado desde el encuentro', 'ok'); go('marcador');
};

/* ---------- COMPRAS (con alerta sonora) ---------- */
V.compras = async () => {
  const os = await db(T('ordenes').select('id,cantidad,total,estado,nota,created_at,app_users(nombre,cedula,wallet),productos(nombre,emoji)').order('created_at', { ascending: false }).limit(60));
  const pen = os.filter(o => o.estado === 'pendiente'), rest = os.filter(o => o.estado !== 'pendiente');
  const row = o => `<div class="card mt"><div class="row between"><div><b>${esc(o.productos?.emoji || '')} ${esc(o.productos?.nombre)}</b> × ${o.cantidad} · <b>${money(o.total)}</b><br><small>${esc(o.app_users?.nombre)} · C.C. ${esc(o.app_users?.cedula)} · saldo ${money(o.app_users?.wallet)}</small>${o.nota ? `<br><small>“${esc(o.nota)}”</small>` : ''}</div><span class="st ${o.estado}">${o.estado}</span></div>
    <div class="row mt"><button class="btn sec sm" data-a="ordImg" data-id="${o.id}">Ver comprobante</button>
    ${o.estado === 'pendiente' ? `<button class="btn sm" data-a="ordOk" data-id="${o.id}">Aprobar</button><button class="btn danger sm" data-a="ordNo" data-id="${o.id}">Rechazar</button>` : ''}
    ${o.estado === 'aprobada' ? `<button class="btn blue sm" data-a="ordDeliver" data-id="${o.id}">Marcar entregada</button>` : ''}</div></div>`;
  return `<h3>Pendientes (${pen.length})</h3>${pen.length ? pen.map(row).join('') : empty('No hay compras pendientes.')}
  <h3 class="mt2">Historial</h3>${rest.length ? rest.map(row).join('') : empty('Sin historial todavía.')}`;
};
A.ordImg = async d => { const o = await db(T('ordenes').select('comprobante').eq('id', d.id).single()); modal(o.comprobante ? `<h2>Comprobante</h2><img class="big mt" src="${o.comprobante}" alt="Comprobante">` : empty('Sin imagen'), 'wide'); };
A.ordOk = async d => { await db(sb.rpc('aprobar_compra', { p_orden: d.id })); toast('Compra aprobada y descontada del wallet', 'ok'); S.users = null; lastPend = 0; reload(); poll(); };
A.ordNo = async d => { if (!confirm('¿Rechazar esta compra?')) return; await db(T('ordenes').update({ estado: 'rechazada', resuelta_at: new Date().toISOString() }).eq('id', d.id)); reload(); poll(); };
A.ordDeliver = async d => { await db(T('ordenes').update({ estado: 'entregada' }).eq('id', d.id)); reload(); };

/* ---------- TIENDA (admin) ---------- */
async function adminTienda() {
  const ps = await db(T('productos').select('*').order('nombre'));
  return `<div class="row between"><p class="muted">Administra el marketplace del club.</p><button class="btn" data-a="prodEdit">+ Nuevo producto</button></div>
  <div class="card tblw mt"><table class="tbl"><tr><th></th><th>Producto</th><th>Precio</th><th>Stock</th><th></th></tr>${ps.map(p => `<tr><td style="font-size:28px">${p.imagen ? `<img src="${p.imagen}" style="width:44px;height:44px;border-radius:10px;object-fit:cover" alt="">` : esc(p.emoji || '🎾')}</td><td><b>${esc(p.nombre)}</b><br><small>${esc(p.categoria || '')}</small></td><td>${money(p.precio)}</td><td>${p.stock}</td><td class="row"><span class="st ${p.activo ? 'aprobada' : 'rechazada'}">${p.activo ? 'Activo' : 'Oculto'}</span><button class="btn sec sm" data-a="prodEdit" data-id="${p.id}">Editar</button></td></tr>`).join('')}</table></div>`;
}
A.prodEdit = async d => {
  const p = d.id ? await db(T('productos').select('*').eq('id', d.id).single()) : { nombre: '', descripcion: '', categoria: '', precio: 0, stock: 0, emoji: '🎾', activo: true }; S.tmpImg = p.imagen || null;
  modal(`<h2>${d.id ? 'Editar' : 'Nuevo'} producto</h2>
    <label class="f">Nombre</label><input class="in" id="p_nom" value="${esc(p.nombre)}">
    <label class="f">Descripción</label><input class="in" id="p_desc" value="${esc(p.descripcion || '')}">
    <div class="two"><div><label class="f">Categoría</label><input class="in" id="p_cat" value="${esc(p.categoria || '')}"></div><div><label class="f">Emoji</label><input class="in" id="p_emo" value="${esc(p.emoji || '')}" maxlength="4"></div></div>
    <div class="two"><div><label class="f">Precio ($)</label><input class="in" type="number" id="p_pre" min="0" value="${p.precio}"></div><div><label class="f">Stock</label><input class="in" type="number" id="p_stk" min="0" value="${p.stock}"></div></div>
    <label class="f">Imagen (opcional)</label><input class="in" type="file" accept="image/*" data-c="pickProd">
    <label class="f">Visibilidad</label><select class="in" id="p_act"><option value="1" ${p.activo ? 'selected' : ''}>Visible en la tienda</option><option value="0" ${p.activo ? '' : 'selected'}>Oculto</option></select>
    <button class="btn full mt" data-a="prodSave" data-id="${d.id || ''}">Guardar</button>`);
};
C.pickProd = async (v, el) => { if (el.files[0]) { S.tmpImg = await resizeImg(el.files[0], 500, .75); toast('Imagen cargada', 'ok'); } };
A.prodSave = async d => {
  const row = { nombre: $('#p_nom').value.trim(), descripcion: $('#p_desc').value.trim(), categoria: $('#p_cat').value.trim(), emoji: $('#p_emo').value.trim() || '🎾', precio: +$('#p_pre').value || 0, stock: parseInt($('#p_stk').value) || 0, activo: $('#p_act').value === '1', imagen: S.tmpImg || null };
  if (!row.nombre) throw new Error('El producto necesita un nombre');
  await db(d.id ? T('productos').update(row).eq('id', d.id) : T('productos').insert(row));
  S.tmpImg = null; closeModal(); toast('Producto guardado', 'ok'); reload();
};

/* ---------- WALLETS ---------- */
V.wallets = async () => {
  const [us, tx] = await Promise.all([getUsers(true), db(T('wallet_tx').select('tipo,monto,descripcion,created_at,app_users(nombre)').order('created_at', { ascending: false }).limit(25))]);
  return `<p class="muted">Recarga el saldo de un jugador cuando paga en taquilla.</p>
  <input class="in mt" placeholder="Buscar por nombre o cédula…" data-i="wlFilter">
  <div class="card tblw mt"><table class="tbl"><tr><th>Jugador</th><th>Cédula</th><th>Saldo</th><th></th></tr>${us.filter(u => u.role === 'jugador').map(u => `<tr class="wlr" data-s="${esc((u.nombre + ' ' + u.cedula).toLowerCase())}"><td><b>${esc(u.nombre)}</b></td><td>${esc(u.cedula)}</td><td>${money(u.wallet)}</td><td><button class="btn sm" data-a="wlOpen" data-id="${u.id}">Recargar</button></td></tr>`).join('')}</table></div>
  <h3 class="mt2" style="margin-bottom:10px">Últimos movimientos</h3>
  ${tx.length ? `<div class="card tblw"><table class="tbl">${tx.map(t => `<tr><td>${esc(t.app_users?.nombre)}</td><td style="text-transform:capitalize">${esc(t.tipo)}</td><td><small>${esc(t.descripcion || '')}</small></td><td style="text-align:right;color:${t.monto >= 0 ? 'var(--ok)' : 'var(--red)'}"><b>${t.monto >= 0 ? '+' : ''}${money(t.monto)}</b></td></tr>`).join('')}</table></div>` : empty('Sin movimientos.')}`;
};
C.wlFilter = v => $$('.wlr').forEach(el => el.style.display = el.dataset.s.includes(v.toLowerCase()) ? '' : 'none');
A.wlOpen = async d => {
  const u = (await getUsers()).find(x => x.id === d.id);
  modal(`<h2>Recargar wallet</h2><p class="muted">${esc(u.nombre)} · C.C. ${esc(u.cedula)} · saldo ${money(u.wallet)}</p>
    <label class="f">Monto ($) — usa negativo para un ajuste a la baja</label><input class="in" type="number" id="w_m" step="1000" autofocus>
    <label class="f">Detalle</label><input class="in" id="w_d" value="Recarga en taquilla">
    <button class="btn full mt" data-a="wlGo" data-id="${u.id}">Confirmar</button>`);
};
A.wlGo = async d => {
  const m = +$('#w_m').value; if (!m) throw new Error('Escribe un monto');
  await db(sb.rpc('wallet_mov', { p_user: d.id, p_monto: m, p_tipo: m > 0 ? 'recarga' : 'ajuste', p_desc: $('#w_d').value.trim() || 'Movimiento' }));
  S.users = null; closeModal(); toast('Wallet actualizado', 'ok'); reload();
};

/* ---------- JUGADORES ---------- */
V.jugadores = async () => {
  const us = await getUsers(true);
  return `<div class="row"><input class="in grow" placeholder="Buscar…" data-i="wlFilter"><button class="btn" data-a="userNew">+ Agregar jugador / admin</button></div>
  <div class="card tblw mt"><table class="tbl"><tr><th>Jugador</th><th>Contacto</th><th>Ranking</th><th>Rol</th><th>Sede</th><th></th></tr>${us.map(u => `<tr class="wlr" data-s="${esc((u.nombre + ' ' + u.cedula + ' ' + (u.correo || '')).toLowerCase())}"><td><div class="pl">${avatar(u)}<div><b>${esc(u.nombre)}</b><br><small>C.C. ${esc(u.cedula)}</small></div></div></td><td><small>${esc(u.telefono || '')}<br>${esc(u.correo || '')}</small></td><td>${catBadge(u.puntos)}<br><small>${u.puntos} pts</small></td>
  <td><select class="in" style="min-width:110px" data-c="userRole" data-id="${u.id}"><option value="jugador" ${u.role === 'jugador' ? 'selected' : ''}>Jugador</option><option value="admin" ${u.role === 'admin' ? 'selected' : ''}>Admin</option></select></td>
  <td><select class="in" style="min-width:130px" data-c="userSede" data-id="${u.id}"><option value="">—</option>${S.sedes.map(s => `<option value="${s.id}" ${u.sede_id === s.id ? 'selected' : ''}>${esc(s.nombre)}</option>`).join('')}</select></td>
  <td><div class="row" style="flex-wrap:nowrap"><button class="btn sec sm" data-a="userEdit" data-id="${u.id}">Editar</button>${u.id === S.user.id ? '' : `<button class="btn danger sm" data-a="userDel" data-id="${u.id}">Eliminar</button>`}</div></td></tr>`).join('')}</table></div>`;
};
A.userEdit = async d => {
  const u = (await getUsers()).find(x => x.id === d.id); if (!u) throw new Error('Usuario no encontrado');
  modal(`<h2>Editar usuario</h2>
    <label class="f">Nombre completo</label><input class="in" id="e_nom" value="${esc(u.nombre)}" autocomplete="off">
    <div class="two"><div><label class="f">Cédula</label><input class="in" id="e_ced" value="${esc(u.cedula)}" autocomplete="off"></div>
    <div><label class="f">Teléfono</label><input class="in" id="e_tel" inputmode="tel" value="${esc(u.telefono || '')}" autocomplete="off"></div></div>
    <label class="f">Correo</label><input class="in" id="e_mail" type="email" value="${esc(u.correo || '')}" autocomplete="off">
    <div class="two"><div><label class="f">Rol</label><select class="in" id="e_rol"><option value="jugador" ${u.role === 'jugador' ? 'selected' : ''}>Jugador</option><option value="admin" ${u.role === 'admin' ? 'selected' : ''}>Admin</option></select></div>
    <div><label class="f">Sede</label><select class="in" id="e_sede"><option value="">—</option>${S.sedes.map(s => `<option value="${s.id}" ${u.sede_id === s.id ? 'selected' : ''}>${esc(s.nombre)}</option>`).join('')}</select></div></div>
    <label class="f">Nueva contraseña (déjala vacía para no cambiarla)</label><input class="in" id="e_pw" type="password" autocomplete="new-password" data-enter="userSave">
    <p class="muted"><small>Si cambias la cédula debes escribir una nueva contraseña, porque la contraseña está ligada a la cédula.</small></p>
    <button class="btn full mt" data-a="userSave" data-id="${u.id}">Guardar cambios</button>`);
};
A.userSave = async d => {
  const cur = (await getUsers()).find(x => x.id === d.id); if (!cur) throw new Error('Usuario no encontrado');
  const nombre = $('#e_nom').value.trim(), ced = $('#e_ced').value.trim(), tel = $('#e_tel').value.trim(), mail = $('#e_mail').value.trim(), rol = $('#e_rol').value, sede = $('#e_sede').value || null, pw = $('#e_pw').value;
  if (nombre.length < 3) throw new Error('Escribe el nombre completo');
  if (!/^\d{5,12}$/.test(ced) && !(rol === 'admin' && /^[\w.-]{3,30}$/.test(ced))) throw new Error('La cédula debe tener entre 5 y 12 números');
  if (tel && !/^\+?\d{7,15}$/.test(tel.replace(/[\s-]/g, ''))) throw new Error('Teléfono no válido');
  if (mail && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(mail)) throw new Error('Correo no válido');
  if (rol === 'admin' && !sede) throw new Error('Un administrador debe tener sede');
  if (cur.id === S.user.id && rol !== 'admin') throw new Error('No puedes quitarte el rol de admin a ti mismo');
  if (ced !== cur.cedula && !pw) throw new Error('Al cambiar la cédula escribe una nueva contraseña');
  if (pw && pw.length < 6) throw new Error('La contraseña debe tener al menos 6 caracteres');
  await db(sb.rpc('admin_update_user', { p_id: cur.id, p_nombre: nombre, p_cedula: ced, p_telefono: tel, p_correo: mail, p_role: rol, p_sede: sede, p_hash: pw ? await sha(ced + ':' + pw) : null }));
  S.users = null; closeModal(); if (cur.id === S.user.id) await refreshUser(); toast('Usuario actualizado', 'ok'); reload();
};
A.userDel = async d => {
  const u = (await getUsers()).find(x => x.id === d.id); if (!u) throw new Error('Usuario no encontrado');
  if (u.id === S.user.id) throw new Error('No puedes eliminar tu propia cuenta');
  if (!confirm(`¿Eliminar a ${u.nombre}?\n\nSe borrarán su wallet (${money(u.wallet)}), sus puntos, compras y notificaciones. Sus reservas quedarán sin dueño. Esta acción no se puede deshacer.`)) return;
  await db(sb.rpc('admin_delete_user', { p_id: u.id }));
  S.users = null; toast('Usuario eliminado'); reload();
};
C.userRole = async (v, el) => {
  const id = el.dataset.id, u = S.users?.find(x => x.id === id);
  if (id === S.user.id && v !== 'admin') { toast('No puedes quitarte el rol de admin a ti mismo', 'err'); return reload(); }
  if (v === 'admin' && !u?.sede_id) return adminSedeModal(id, u?.nombre);
  await db(T('app_users').update({ role: v }).eq('id', id)); S.users = null; toast('Rol actualizado', 'ok'); reload();
};
function adminSedeModal(id, nombre) {
  modal(`<h2>Sede del administrador</h2><p class="muted">${esc(nombre || 'Este usuario')} será admin. Elige a qué sede pertenece.</p>
    <label class="f">Sede</label><select class="in" id="as_sede">${S.sedes.map(s => `<option value="${s.id}">${esc(s.nombre)}${s.ciudad ? ' · ' + esc(s.ciudad) : ''}</option>`).join('')}</select>
    <button class="btn full mt" data-a="adminSedeGo" data-id="${id}">Asignar como admin</button>
    <button class="btn sec full mt" data-a="adminSedeNo">Cancelar</button>`);
}
A.adminSedeGo = async d => {
  const sede = $('#as_sede').value; if (!sede) throw new Error('Elige una sede');
  await db(T('app_users').update({ role: 'admin', sede_id: sede }).eq('id', d.id));
  S.users = null; closeModal(); toast('Admin asignado a su sede', 'ok'); reload();
};
A.adminSedeNo = () => { closeModal(); reload(); };
A.userNew = () => modal(`<h2>Agregar jugador o administrador</h2>
  <label class="f">Nombre completo</label><input class="in" id="n_nom" autocomplete="off">
  <div class="two"><div><label class="f">Cédula</label><input class="in" id="n_ced" inputmode="numeric" autocomplete="off"></div>
  <div><label class="f">Teléfono</label><input class="in" id="n_tel" inputmode="tel" autocomplete="off"></div></div>
  <label class="f">Correo</label><input class="in" id="n_mail" type="email" autocomplete="off">
  <div class="two"><div><label class="f">Rol</label><select class="in" id="n_rol"><option value="jugador">Jugador</option><option value="admin">Admin</option></select></div>
  <div><label class="f">Sede</label><select class="in" id="n_sede">${S.sedes.map(s => `<option value="${s.id}" ${s.id === S.sedeId ? 'selected' : ''}>${esc(s.nombre)}</option>`).join('')}</select></div></div>
  <label class="f">Contraseña (mín. 6 caracteres)</label><input class="in" id="n_pw" type="password" autocomplete="new-password" data-enter="userCreate">
  <button class="btn full mt" data-a="userCreate">Crear usuario</button>`);
A.userCreate = async () => {
  const nombre = $('#n_nom').value.trim(), ced = $('#n_ced').value.trim(), tel = $('#n_tel').value.trim(), mail = $('#n_mail').value.trim(), pw = $('#n_pw').value, rol = $('#n_rol').value;
  if (nombre.length < 3) throw new Error('Escribe el nombre completo');
  if (!/^\d{5,12}$/.test(ced) && !(rol === 'admin' && /^[\w.-]{3,30}$/.test(ced))) throw new Error('La cédula debe tener entre 5 y 12 números');
  if (tel && !/^\+?\d{7,15}$/.test(tel.replace(/[\s-]/g, ''))) throw new Error('Teléfono no válido');
  if (mail && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(mail)) throw new Error('Correo no válido');
  if (pw.length < 6) throw new Error('La contraseña debe tener al menos 6 caracteres');
  const u = await db(sb.rpc('app_register', { p_nombre: nombre, p_cedula: ced, p_telefono: tel, p_correo: mail, p_hash: await sha(ced + ':' + pw), p_sede: $('#n_sede').value || null }));
  if (rol === 'admin') { if (!$('#n_sede').value) throw new Error('Un administrador debe tener sede'); await db(T('app_users').update({ role: 'admin' }).eq('id', u.id)); }
  S.users = null; closeModal(); toast(`Usuario creado (${rol === 'admin' ? 'Admin' : 'Jugador'})`, 'ok'); reload();
};
C.userSede = async (v, el) => {
  const u = S.users?.find(x => x.id === el.dataset.id);
  if (u?.role === 'admin' && !v) { toast('Un administrador debe tener sede', 'err'); return reload(); }
  await db(T('app_users').update({ sede_id: v || null }).eq('id', el.dataset.id)); S.users = null; toast('Sede actualizada', 'ok'); reload();
};

/* ---------- PUBLICIDAD ---------- */
/* Avisos del club: llegan a la campanita de los jugadores como notificación normal y, si activaron los avisos,
   también como notificación push (aunque tengan la app cerrada o en segundo plano). La sesión ya queda guardada
   en el navegador (localStorage.padel_uid) y el dispositivo suscrito a push no se olvida al cerrar la app. */
V.publicidad = async () => {
  const ps = await db(T('publicidad').select('id,titulo,mensaje,imagen,enviados,created_at,sedes(nombre)').order('created_at', { ascending: false }).limit(30));
  return `<div class="row between"><p class="muted">Envía un aviso a todos los jugadores (o a una sola sede): aparece en su campanita y como alerta push, aunque tengan la app cerrada.</p><button class="btn" data-a="pubNew">+ Nuevo aviso</button></div>
  <h3 class="mt2">Enviados</h3>
  ${ps.length ? ps.map(p => `<div class="card mt"><div class="row between"><div><b>📣 ${esc(p.titulo)}</b><br><small>${esc(p.mensaje)}</small></div>${p.imagen ? `<img src="${p.imagen}" style="width:44px;height:44px;border-radius:10px;object-fit:cover;flex:none" alt="">` : ''}</div>
  <div class="row between mt"><small>${p.sedes ? esc(p.sedes.nombre) : 'Todas las sedes'} · ${p.enviados} jugador${p.enviados === 1 ? '' : 'es'}</small><small>${dfmt(p.created_at.slice(0, 10), { day: 'numeric', month: 'short', year: 'numeric' })}</small></div></div>`).join('') : empty('Todavía no has enviado ningún aviso.')}`;
};
A.pubNew = () => {
  S.tmpImg = null;
  modal(`<h2>Nuevo aviso publicitario</h2>
    <label class="f">Título</label><input class="in" id="pb_tit" maxlength="80" placeholder="Ej: 2x1 en la tienda este fin de semana" autofocus>
    <label class="f">Mensaje</label><textarea class="in" id="pb_msg" rows="4" maxlength="500" placeholder="Detalles del aviso…"></textarea>
    <label class="f">Imagen (opcional)</label><input class="in" type="file" accept="image/*" data-c="pickPub">
    <label class="f">Destinatarios</label><select class="in" id="pb_sede"><option value="">Todos los jugadores (todas las sedes)</option>${S.sedes.map(s => `<option value="${s.id}">${esc(s.nombre)}</option>`).join('')}</select>
    <p class="muted mt"><small>Llega de inmediato a la campanita de cada jugador y como notificación push a quienes las tengan activadas.</small></p>
    <button class="btn full mt" data-a="pubSend">Enviar aviso</button>`);
};
C.pickPub = async (v, el) => { if (el.files[0]) { S.tmpImg = await resizeImg(el.files[0], 900, .72); toast('Imagen cargada', 'ok'); } };
A.pubSend = async () => {
  const tit = $('#pb_tit').value.trim(), msg = $('#pb_msg').value.trim(), sede = $('#pb_sede').value || null;
  if (!tit) throw new Error('Escribe un título');
  if (!msg) throw new Error('Escribe un mensaje');
  const n = await db(sb.rpc('publicidad_enviar', { p_titulo: tit, p_mensaje: msg, p_imagen: S.tmpImg || null, p_sede: sede, p_creador: S.user.id }));
  S.tmpImg = null; closeModal(); toast(`Aviso enviado a ${n} jugador${n === 1 ? '' : 'es'}`, 'ok'); reload();
};
A.pubVer = async d => {
  const p = await db(T('publicidad').select('titulo,mensaje,imagen,created_at').eq('id', d.id).single());
  modal(`<h2>📣 ${esc(p.titulo)}</h2>${p.imagen ? `<img class="big mt" src="${p.imagen}" alt="">` : ''}<p class="mt">${esc(p.mensaje)}</p><p class="muted mt"><small>${dfmt(p.created_at.slice(0, 10), { day: 'numeric', month: 'short', year: 'numeric' })}</small></p>`, 'wide');
};

/* ---------- CONTABILIDAD ---------- */
const CT = { tab: 'panel', mes: today().slice(0, 7), sede: 'all' };
const METODOS = { efectivo: 'Efectivo', transferencia: 'Transferencia', datafono: 'Datáfono', pasarela: 'Pasarela de pago' };
const CONCEPTOS = { venta: 'Venta', inscripcion: 'Inscripción', mensualidad: 'Mensualidad', reserva: 'Reserva de cancha', otro: 'Otro' };
const CATEG = { servicio_publico: 'Servicios públicos', arriendo: 'Arriendos', otro: 'Otros gastos fijos' };
const SUG = { servicio_publico: ['Agua', 'Energía', 'Gas', 'Internet', 'Teléfono', 'Aseo'], arriendo: ['Arriendo del local', 'Arriendo de canchas', 'Arriendo de bodega'], otro: ['Nómina', 'Seguros', 'Publicidad', 'Mantenimiento'] };
const CTABS = [['panel', 'Panel contable'], ['ingresos', 'Ingresos'], ['facturas', 'Facturas de proveedores'], ['notas', 'Notas crédito'], ['gastos', 'Gastos fijos'], ['proveedores', 'Proveedores']];
const optList = (o, sel) => Object.entries(o).map(([k, v]) => `<option value="${k}" ${k === sel ? 'selected' : ''}>${v}</option>`).join('');
const sedeOpts = (sel, all) => (all ? `<option value="all" ${sel === 'all' ? 'selected' : ''}>Todas las sedes</option>` : '') + S.sedes.map(s => `<option value="${s.id}" ${s.id === sel ? 'selected' : ''}>${esc(s.nombre)}</option>`).join('');
const sedeNom = id => S.sedes.find(s => s.id === id)?.nombre || '—';
const rango = () => { if (!CT.mes) return null; const [y, m] = CT.mes.split('-').map(Number); return [CT.mes + '-01', m === 12 ? `${y + 1}-01-01` : `${y}-${pad(m + 1)}-01`]; };
const fSede = q => CT.sede === 'all' ? q : q.eq('sede_id', CT.sede);
const fRango = (q, col = 'fecha') => { const r = rango(); return r ? q.gte(col, r[0]).lt(col, r[1]) : q; };
const flt = (q, col) => fSede(fRango(q, col));
const sum = (a, k = 'valor') => a.reduce((s, x) => s + Number(x[k] || 0), 0);
const saldoDe = f => Number(f.valor) - sum(f.notas_credito || []);
const fdate = s => s ? dfmt(s, { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
const fileImg = id => { const f = $(id)?.files?.[0]; return f ? resizeImg(f, 1000, .72) : Promise.resolve(null); };
const crow = (l, v, t, n) => `<div class="crow"><span>${l}${n != null ? ` <small>(${n})</small>` : ''}</span><div class="prog"><i style="width:${t > 0 ? Math.min(100, Math.round(v / t * 100)) : 0}%"></i></div><b>${money(v)}</b></div>`;
const kpi = (l, v, sub, cls = '') => `<div class="kpi ${cls}"><small>${l}</small><b>${v}</b>${sub ? `<small>${sub}</small>` : ''}</div>`;
const pdet = (id, o) => o[id] || id;

const ctBar = () => `<div class="tabs" style="overflow-x:auto">${CTABS.map(t => `<button data-a="ctTab" data-t="${t[0]}" class="${CT.tab === t[0] ? 'on' : ''}" style="flex:none;white-space:nowrap;padding:10px 14px">${t[1]}</button>`).join('')}</div>
  <div class="row mt"><input type="month" class="in" style="max-width:180px" value="${CT.mes}" data-c="ctMes"><button class="fl ${CT.mes ? '' : 'on'}" data-a="ctTodo">Todo el historial</button>
  <select class="in" style="max-width:240px" data-c="ctSede">${sedeOpts(CT.sede, true)}</select></div>`;
V.conta = async () => ctBar() + await ({ panel: ctPanel, ingresos: ctIngresos, facturas: ctFacturas, notas: ctNotas, gastos: ctGastos, proveedores: ctProveedores }[CT.tab])();
A.ctTab = d => { CT.tab = d.t; CT.ingLim = 100; reload(); };
A.ctTodo = () => { CT.mes = ''; CT.ingLim = 100; reload(); };
C.ctMes = v => { CT.mes = v; CT.ingLim = 100; reload(); };
C.ctSede = v => { CT.sede = v; CT.ingLim = 100; reload(); };

/* --- Panel contable --- */
async function ctPanel() {
  const r = rango(), ts = r ? [r[0] + 'T00:00:00', r[1] + 'T00:00:00'] : null;
  const [ing, gas, fpag, fpen, rec, ord] = await Promise.all([
    allRows(() => flt(T('ingresos').select('valor,concepto,metodo').order('id'))),      // por páginas: Supabase entrega máx. 1000 filas por consulta
    allRows(() => flt(T('gastos').select('valor,categoria').order('id'))),
    allRows(() => flt(T('facturas_proveedor').select('valor_pagado').eq('estado', 'pagada').order('id'), 'fecha_pago')),
    allRows(() => fSede(T('facturas_proveedor').select('valor,fecha_vencimiento,notas_credito(valor)').eq('estado', 'pendiente').order('id'))),
    allRows(() => (ts ? T('wallet_tx').select('monto').eq('tipo', 'recarga').gte('created_at', ts[0]).lt('created_at', ts[1]) : T('wallet_tx').select('monto').eq('tipo', 'recarga')).order('id')),
    allRows(() => (ts ? T('ordenes').select('total').in('estado', ['aprobada', 'entregada']).gte('resuelta_at', ts[0]).lt('resuelta_at', ts[1]) : T('ordenes').select('total').in('estado', ['aprobada', 'entregada'])).order('id'))
  ]);
  const tot = sum(ing), byM = k => ing.filter(x => x.metodo === k), byC = k => ing.filter(x => x.concepto === k), byG = k => sum(gas.filter(g => g.categoria === k));
  const egProv = sum(fpag, 'valor_pagado'), egr = egProv + sum(gas);
  const porPagar = fpen.reduce((s, f) => s + saldoDe(f), 0), venc = fpen.filter(f => f.fecha_vencimiento && f.fecha_vencimiento < today()).length, neto = tot - egr;
  return `<div class="grid g3 mt">
    ${kpi('Total de transacciones (ingresos)', money(tot), `${ing.length} transacciones`)}
    ${kpi('Egresos del período', money(egr), 'Proveedores + gastos fijos')}
    ${kpi('Resultado neto', money(neto), 'Ingresos − egresos', neto >= 0 ? 'pos' : 'neg')}
    ${kpi('Por pagar a proveedores', money(porPagar), `${fpen.length} facturas pendientes`)}
    ${kpi('Facturas vencidas', String(venc), venc ? 'Requieren pago' : 'Todo al día', venc ? 'neg' : '')}
    ${kpi('Efectivo · Transferencias', money(sum(byM('efectivo'))) + ' · ' + money(sum(byM('transferencia'))), 'del período')}
  </div>
  <div class="grid g2 mt">
    <div class="card"><h3>Ingresos por método de pago</h3>${Object.entries(METODOS).map(([k, l]) => crow(l, sum(byM(k)), tot, byM(k).length)).join('')}</div>
    <div class="card"><h3>Ingresos por concepto</h3>${crow('Inscripciones', sum(byC('inscripcion')), tot, byC('inscripcion').length)}${crow('Mensualidades', sum(byC('mensualidad')), tot, byC('mensualidad').length)}${crow('Ventas', sum(byC('venta')), tot, byC('venta').length)}${crow('Reservas de cancha', sum(byC('reserva')), tot, byC('reserva').length)}${crow('Otros', sum(byC('otro')), tot, byC('otro').length)}</div>
    <div class="card"><h3>Egresos</h3>${crow('Pago a proveedores', egProv, egr, fpag.length)}${crow('Servicios públicos', byG('servicio_publico'), egr)}${crow('Arriendos', byG('arriendo'), egr)}${crow('Otros gastos fijos', byG('otro'), egr)}</div>
    <div class="card"><h3>Movimiento de la plataforma</h3><p class="muted"><small>Informativo: no se suma a los ingresos registrados.</small></p>${crow('Recargas de wallet', sum(rec, 'monto'), Math.max(sum(rec, 'monto'), sum(ord, 'total')), rec.length)}${crow('Compras aprobadas en la tienda', sum(ord, 'total'), Math.max(sum(rec, 'monto'), sum(ord, 'total')), ord.length)}</div>
  </div>`;
}

/* --- Ingresos --- */
async function ctIngresos() {
  const lim = CT.ingLim || 100;
  const [rows, todos] = await Promise.all([   // la lista se muestra por partes; los totales salen de TODAS las filas del período
    db(flt(T('ingresos').select('id,valor,concepto,motivo,metodo,fecha,sede_id').order('fecha', { ascending: false }).order('created_at', { ascending: false }).limit(lim))),
    allRows(() => flt(T('ingresos').select('valor').order('id')))
  ]);
  return `<div class="card mt"><h3>Registrar ingreso</h3>
    <div class="two"><div><label class="f">Valor ($)</label><input class="in" type="number" id="i_val" min="1" step="1000" inputmode="numeric"></div>
    <div><label class="f">Método de pago</label><select class="in" id="i_met">${optList(METODOS)}</select></div></div>
    <div class="two"><div><label class="f">Concepto</label><select class="in" id="i_con">${optList(CONCEPTOS)}</select></div>
    <div><label class="f">Fecha</label><input class="in" type="date" id="i_fec" value="${today()}"></div></div>
    <label class="f">Motivo de la venta</label><input class="in" id="i_mot" maxlength="140" placeholder="Ej: Inscripción torneo copa club, mensualidad de octubre…" data-enter="ingSave">
    <label class="f">Sede</label><select class="in" id="i_sede">${sedeOpts(CT.sede !== 'all' ? CT.sede : S.sedeId)}</select>
    <button class="btn mt" data-a="ingSave">Registrar ingreso</button></div>
  <div class="card tblw mt"><div class="row between" style="margin-bottom:8px"><h3 style="margin:0">Ingresos del período</h3><b>${money(sum(todos))} <small>· ${todos.length} transacciones</small></b></div>
  ${rows.length ? `<table class="tbl"><tr><th>Fecha</th><th>Motivo</th><th>Concepto</th><th>Método</th><th>Sede</th><th>Valor</th><th></th></tr>${rows.map(x => `<tr><td>${fdate(x.fecha)}</td><td>${esc(x.motivo)}</td><td><span class="st">${pdet(x.concepto, CONCEPTOS)}</span></td><td>${pdet(x.metodo, METODOS)}</td><td><small>${esc(sedeNom(x.sede_id))}</small></td><td><b>${money(x.valor)}</b></td><td><button class="btn danger sm" data-a="ingDel" data-id="${x.id}">Eliminar</button></td></tr>`).join('')}</table>
  <div class="row between mt"><small class="muted">Mostrando ${rows.length} de ${todos.length}</small>${rows.length < todos.length ? '<button class="btn sec sm" data-a="ingMas">Ver 100 más</button>' : ''}</div>` : empty('No hay ingresos en este período.')}</div>`;
}
A.ingMas = () => { CT.ingLim = (CT.ingLim || 100) + 100; reload(); };
A.ingSave = async () => {
  const valor = +$('#i_val').value, mot = $('#i_mot').value.trim();
  if (!(valor > 0)) throw new Error('Escribe el valor');
  if (mot.length < 3) throw new Error('Escribe el motivo de la venta');
  await db(T('ingresos').insert({ valor, concepto: $('#i_con').value, motivo: mot, metodo: $('#i_met').value, fecha: $('#i_fec').value || today(), sede_id: $('#i_sede').value || null, created_by: S.user.id }));
  toast('Ingreso registrado', 'ok'); reload();
};
A.ingDel = async d => { if (!confirm('¿Eliminar este ingreso?')) return; await db(T('ingresos').delete().eq('id', d.id)); toast('Ingreso eliminado'); reload(); };

/* --- Facturas de proveedores (por pagar / pagadas) --- */
async function ctFacturas() {
  const [pen, pag] = await Promise.all([
    db(fSede(T('facturas_proveedor').select('id,numero,concepto,valor,fecha_emision,fecha_vencimiento,sede_id,proveedores(nombre),notas_credito(valor)').eq('estado', 'pendiente').order('fecha_vencimiento', { nullsFirst: false }))),
    allRows(() => flt(T('facturas_proveedor').select('id,numero,concepto,valor,valor_pagado,fecha_pago,metodo_pago,tiene_comp,proveedores(nombre)').eq('estado', 'pagada').order('fecha_pago', { ascending: false }).order('id'), 'fecha_pago'))
  ]);
  const totPen = pen.reduce((s, f) => s + saldoDe(f), 0);
  return `<div class="row between mt"><p class="muted">Facturas de proveedores por pagar y ya pagadas.</p><button class="btn" data-a="facNew">+ Nueva factura</button></div>
  <details class="card mt" open><summary><span>Facturas pendientes por pagar (${pen.length})</span><span style="color:var(--warn)">${money(totPen)}</span></summary><div class="dbody">
    ${pen.length ? pen.map(f => { const sal = saldoDe(f), nc = sum(f.notas_credito || []), ven = f.fecha_vencimiento && f.fecha_vencimiento < today();
      return `<div class="fac ${ven ? 'venc' : ''}"><div class="row between"><div><b>${esc(f.proveedores?.nombre || '—')}</b> · Factura N° ${esc(f.numero)}<br><small>${esc(f.concepto || '')} · emitida ${fdate(f.fecha_emision)} · vence ${fdate(f.fecha_vencimiento)}${ven ? ' <b style="color:var(--red)">· VENCIDA</b>' : ''}</small></div>
        <div style="text-align:right"><b style="font:800 20px var(--fh)">${money(sal)}</b>${nc ? `<br><small>Valor ${money(f.valor)} − notas crédito ${money(nc)}</small>` : ''}</div></div>
        <div class="row mt"><button class="btn sm" data-a="facPay" data-id="${f.id}">Marcar como pagada</button><button class="btn sec sm" data-a="ncFor" data-id="${f.id}">Nota crédito</button><button class="btn danger sm" data-a="facDel" data-id="${f.id}">Eliminar</button></div></div>`; }).join('') : empty('No hay facturas pendientes. 🎉')}
  </div></details>
  <details class="card mt" open><summary><span>Facturas pagadas (${pag.length})</span><span style="color:var(--ok)">${money(sum(pag, 'valor_pagado'))}</span></summary><div class="dbody">
    ${pag.length ? pag.map(f => `<div class="fac"><div class="row between"><div><b>${esc(f.proveedores?.nombre || '—')}</b> · Factura N° ${esc(f.numero)}<br><small>${esc(f.concepto || '')} · pagada el ${fdate(f.fecha_pago)} · ${f.metodo_pago === 'nota_credito' ? 'cubierta por nota crédito' : pdet(f.metodo_pago, METODOS)}</small></div>
      <div style="text-align:right"><b style="font:800 20px var(--fh)">${money(f.valor_pagado)}</b><br><span class="st aprobada">Pagada</span></div></div>
      <div class="row mt">${f.tiene_comp ? `<button class="btn sec sm" data-a="compVer" data-t="facturas_proveedor" data-id="${f.id}">Ver comprobante</button>` : '<small class="muted">Sin comprobante</small>'}</div></div>`).join('') : empty('Aún no hay facturas pagadas en este período.')}
  </div></details>`;
}
A.facNew = async () => {
  const ps = await db(T('proveedores').select('id,nombre').order('nombre'));
  if (!ps.length) { CT.tab = 'proveedores'; toast('Primero registra un proveedor', 'warn'); return reload(); }
  modal(`<h2>Nueva factura de proveedor</h2>
    <label class="f">Proveedor</label><select class="in" id="f_prov">${ps.map(p => `<option value="${p.id}">${esc(p.nombre)}</option>`).join('')}</select>
    <div class="two"><div><label class="f">N° de factura</label><input class="in" id="f_num"></div><div><label class="f">Valor ($)</label><input class="in" type="number" id="f_val" min="1" step="1000"></div></div>
    <label class="f">Concepto</label><input class="in" id="f_con" maxlength="140" placeholder="Ej: Pelotas, mantenimiento de canchas…">
    <div class="two"><div><label class="f">Fecha de emisión</label><input class="in" type="date" id="f_ems" value="${today()}"></div><div><label class="f">Vence</label><input class="in" type="date" id="f_ven" value="${addDays(today(), 30)}"></div></div>
    <label class="f">Sede</label><select class="in" id="f_sede"><option value="">— General —</option>${sedeOpts(CT.sede !== 'all' ? CT.sede : S.sedeId)}</select>
    <button class="btn full mt" data-a="facSave">Guardar factura</button>`);
};
A.facSave = async () => {
  const numero = $('#f_num').value.trim(), valor = +$('#f_val').value;
  if (!numero) throw new Error('Escribe el número de factura'); if (!(valor > 0)) throw new Error('Escribe el valor de la factura');
  try { await db(T('facturas_proveedor').insert({ proveedor_id: $('#f_prov').value, numero, concepto: $('#f_con').value.trim() || null, valor, fecha_emision: $('#f_ems').value || today(), fecha_vencimiento: $('#f_ven').value || null, sede_id: $('#f_sede').value || null })); }
  catch (e) { throw new Error(/duplicate|unique/i.test(e.message) ? 'Ese proveedor ya tiene una factura con ese número' : e.message); }
  closeModal(); toast('Factura registrada', 'ok'); reload();
};
A.facDel = async d => { if (!confirm('¿Eliminar esta factura y sus notas crédito?')) return; await db(T('facturas_proveedor').delete().eq('id', d.id)); toast('Factura eliminada'); reload(); };
A.facPay = async d => {
  const f = await db(T('facturas_proveedor').select('id,numero,valor,estado,proveedores(nombre),notas_credito(valor)').eq('id', d.id).single());
  if (f.estado !== 'pendiente') throw new Error('Esta factura ya fue pagada');
  modal(`<h2>Pagar factura N° ${esc(f.numero)}</h2><p class="muted">${esc(f.proveedores?.nombre || '')} · a pagar <b>${money(saldoDe(f))}</b></p>
    <div class="two"><div><label class="f">Método de pago</label><select class="in" id="p_met">${optList(METODOS)}</select></div><div><label class="f">Fecha de pago</label><input class="in" type="date" id="p_fec" value="${today()}"></div></div>
    <label class="f">Foto del comprobante</label><input class="in" type="file" id="p_img" accept="image/*">
    <p class="muted"><small>Al confirmar, la factura pasa a “Facturas pagadas”.</small></p>
    <button class="btn full mt" data-a="facPayGo" data-id="${f.id}">Confirmar pago</button>`);
};
A.facPayGo = async d => {
  const f = await db(T('facturas_proveedor').select('valor,estado,notas_credito(valor)').eq('id', d.id).single());
  if (f.estado !== 'pendiente') throw new Error('Esta factura ya fue pagada');
  const img = await fileImg('#p_img');
  const ok = await db(T('facturas_proveedor').update({ estado: 'pagada', fecha_pago: $('#p_fec').value || today(), metodo_pago: $('#p_met').value, valor_pagado: saldoDe(f), comprobante: img, tiene_comp: !!img }).eq('id', d.id).eq('estado', 'pendiente').select('id'));
  if (!ok.length) throw new Error('Esta factura ya fue pagada');
  closeModal(); toast('Factura pagada' + (img ? ' con comprobante' : ''), 'ok'); reload();
};
A.compVer = async d => {
  if (!['facturas_proveedor', 'gastos'].includes(d.t)) return;
  const r = await db(T(d.t).select('comprobante').eq('id', d.id).single());
  if (!r?.comprobante || !IMG_OK.test(r.comprobante)) throw new Error('No hay comprobante guardado');
  modal(`<h2>Comprobante</h2><img class="big mt" src="${r.comprobante}" alt="Comprobante">`);
};

/* --- Notas crédito (asociadas a una factura pendiente) --- */
async function ctNotas(pre) {
  const r = rango();
  const [pen, ncs] = await Promise.all([
    db(T('facturas_proveedor').select('id,numero,valor,proveedores(nombre),notas_credito(valor)').eq('estado', 'pendiente').order('numero')),
    allRows(() => (r ? T('notas_credito').select('id,numero,valor,motivo,fecha,factura_id,facturas_proveedor(numero,proveedores(nombre))').gte('fecha', r[0]).lt('fecha', r[1]) : T('notas_credito').select('id,numero,valor,motivo,fecha,factura_id,facturas_proveedor(numero,proveedores(nombre))')).order('fecha', { ascending: false }).order('id'))
  ]);
  return `<div class="card mt"><h3>Registrar nota crédito</h3>
    ${pen.length ? `<label class="f">Factura asociada (N° de factura)</label><select class="in" id="n_fac">${pen.map(f => `<option value="${f.id}" ${f.id === S.ncPre ? 'selected' : ''}>N° ${esc(f.numero)} · ${esc(f.proveedores?.nombre || '')} · saldo ${money(saldoDe(f))}</option>`).join('')}</select>
    <div class="two"><div><label class="f">N° de nota crédito</label><input class="in" id="n_num"></div><div><label class="f">Valor ($)</label><input class="in" type="number" id="n_val" min="1" step="1000"></div></div>
    <div class="two"><div><label class="f">Motivo</label><input class="in" id="n_mot" maxlength="140" placeholder="Ej: devolución de mercancía"></div><div><label class="f">Fecha</label><input class="in" type="date" id="n_fec" value="${today()}"></div></div>
    <button class="btn mt" data-a="ncSave">Registrar nota crédito</button>` : empty('No hay facturas pendientes a las que asociar una nota crédito.')}</div>
  <div class="card tblw mt"><div class="row between" style="margin-bottom:8px"><h3 style="margin:0">Notas crédito del período</h3><b>${money(sum(ncs))}</b></div>
  ${ncs.length ? `<table class="tbl"><tr><th>Fecha</th><th>N° NC</th><th>Factura</th><th>Proveedor</th><th>Motivo</th><th>Valor</th><th></th></tr>${ncs.map(n => `<tr><td>${fdate(n.fecha)}</td><td>${esc(n.numero || '—')}</td><td>N° ${esc(n.facturas_proveedor?.numero || '')}</td><td>${esc(n.facturas_proveedor?.proveedores?.nombre || '')}</td><td>${esc(n.motivo || '')}</td><td><b>${money(n.valor)}</b></td><td><button class="btn danger sm" data-a="ncDel" data-id="${n.id}">Eliminar</button></td></tr>`).join('')}</table>` : empty('No hay notas crédito en este período.')}</div>`;
}
A.ncFor = d => { S.ncPre = d.id; CT.tab = 'notas'; reload(); };
A.ncSave = async () => {
  const fid = $('#n_fac').value, valor = +$('#n_val').value;
  if (!(valor > 0)) throw new Error('Escribe el valor de la nota crédito');
  const f = await db(T('facturas_proveedor').select('valor,estado,notas_credito(valor)').eq('id', fid).single());
  if (f.estado !== 'pendiente') throw new Error('La factura ya fue pagada');
  const sal = saldoDe(f); if (valor > sal) throw new Error(`La nota crédito no puede superar el saldo de la factura (${money(sal)})`);
  await db(T('notas_credito').insert({ factura_id: fid, numero: $('#n_num').value.trim() || null, valor, motivo: $('#n_mot').value.trim() || null, fecha: $('#n_fec').value || today() }));
  if (sal - valor <= 0) { await db(T('facturas_proveedor').update({ estado: 'pagada', fecha_pago: today(), metodo_pago: 'nota_credito', valor_pagado: 0 }).eq('id', fid)); toast('La nota crédito cubre toda la factura: quedó pagada', 'ok'); }
  else toast('Nota crédito registrada. Nuevo saldo: ' + money(sal - valor), 'ok');
  S.ncPre = null; reload();
};
A.ncDel = async d => {
  if (!confirm('¿Eliminar esta nota crédito? El saldo de la factura vuelve a subir.')) return;
  const n = await db(T('notas_credito').select('factura_id').eq('id', d.id).single());
  await db(T('notas_credito').delete().eq('id', d.id));
  await db(T('facturas_proveedor').update({ estado: 'pendiente', fecha_pago: null, metodo_pago: null, valor_pagado: null }).eq('id', n.factura_id).eq('metodo_pago', 'nota_credito'));
  toast('Nota crédito eliminada'); reload();
};

/* --- Gastos fijos: servicios públicos, arriendos y otros --- */
async function ctGastos() {
  const rows = await allRows(() => flt(T('gastos').select('id,categoria,concepto,valor,fecha,metodo,tiene_comp,notas,sede_id').order('fecha', { ascending: false }).order('id')));
  return `<div class="grid g2 mt">${Object.entries(CATEG).map(([cat, nom]) => { const rs = rows.filter(g => g.categoria === cat);
    return `<div class="card" ${cat === 'otro' ? 'style="grid-column:1/-1"' : ''}><div class="row between"><h3 style="margin:0">${nom}</h3><button class="btn sm" data-a="gasNew" data-cat="${cat}">+ Registrar</button></div>
      <p style="margin:8px 0"><b style="font:800 22px var(--fh)">${money(sum(rs))}</b> <small>· ${rs.length} registros</small></p>
      ${rs.length ? `<div class="tblw"><table class="tbl">${rs.map(g => `<tr><td>${fdate(g.fecha)}</td><td><b>${esc(g.concepto)}</b>${g.notas ? `<br><small>${esc(g.notas)}</small>` : ''}<br><small>${esc(sedeNom(g.sede_id))}${g.metodo ? ' · ' + pdet(g.metodo, METODOS) : ''}</small></td><td><b>${money(g.valor)}</b></td><td><div class="row" style="flex-wrap:nowrap">${g.tiene_comp ? `<button class="btn sec sm" data-a="compVer" data-t="gastos" data-id="${g.id}">Comprobante</button>` : ''}<button class="btn danger sm" data-a="gasDel" data-id="${g.id}">✕</button></div></td></tr>`).join('')}</table></div>` : empty('Sin registros en este período.')}</div>`; }).join('')}</div>`;
}
A.gasNew = d => modal(`<h2>${pdet(d.cat, CATEG)}</h2>
  <label class="f">Concepto</label><input class="in" id="g_con" list="g_sug" maxlength="100" placeholder="${d.cat === 'servicio_publico' ? 'Ej: Energía' : d.cat === 'arriendo' ? 'Ej: Arriendo del local' : 'Concepto del gasto'}"><datalist id="g_sug">${SUG[d.cat].map(x => `<option value="${x}">`).join('')}</datalist>
  <div class="two"><div><label class="f">Valor ($)</label><input class="in" type="number" id="g_val" min="1" step="1000"></div><div><label class="f">Fecha</label><input class="in" type="date" id="g_fec" value="${today()}"></div></div>
  <div class="two"><div><label class="f">Método de pago</label><select class="in" id="g_met">${optList(METODOS)}</select></div><div><label class="f">Sede</label><select class="in" id="g_sede"><option value="">— General —</option>${sedeOpts(CT.sede !== 'all' ? CT.sede : S.sedeId)}</select></div></div>
  <label class="f">Notas (opcional)</label><input class="in" id="g_not" maxlength="140">
  <label class="f">Foto del comprobante (opcional)</label><input class="in" type="file" id="g_img" accept="image/*">
  <button class="btn full mt" data-a="gasSave" data-cat="${d.cat}">Guardar</button>`);
A.gasSave = async d => {
  const con = $('#g_con').value.trim(), valor = +$('#g_val').value;
  if (con.length < 2) throw new Error('Escribe el concepto'); if (!(valor > 0)) throw new Error('Escribe el valor');
  const img = await fileImg('#g_img');
  await db(T('gastos').insert({ categoria: d.cat, concepto: con, valor, fecha: $('#g_fec').value || today(), metodo: $('#g_met').value, sede_id: $('#g_sede').value || null, notas: $('#g_not').value.trim() || null, comprobante: img, tiene_comp: !!img }));
  closeModal(); toast('Gasto registrado', 'ok'); reload();
};
A.gasDel = async d => { if (!confirm('¿Eliminar este gasto?')) return; await db(T('gastos').delete().eq('id', d.id)); toast('Gasto eliminado'); reload(); };

/* --- Proveedores (base de datos) --- */
async function ctProveedores() {
  const [ps, fs] = await Promise.all([db(T('proveedores').select('*').order('nombre')), db(T('facturas_proveedor').select('proveedor_id,valor,notas_credito(valor)').eq('estado', 'pendiente'))]);
  const deuda = {}; fs.forEach(f => deuda[f.proveedor_id] = (deuda[f.proveedor_id] || 0) + saldoDe(f));
  return `<div class="row between mt"><input class="in grow" placeholder="Buscar proveedor…" data-i="provFilter"><button class="btn" data-a="provEdit">+ Nuevo proveedor</button></div>
  <div class="grid g2 mt">${ps.length ? ps.map(p => `<div class="card provc" data-s="${esc((p.nombre + ' ' + (p.nit || '')).toLowerCase())}"><div class="row between"><h3 style="margin:0">${esc(p.nombre)}</h3>${deuda[p.id] ? `<span class="st pendiente">Debe ${money(deuda[p.id])}</span>` : ''}</div>
    <small>${p.nit ? 'NIT ' + esc(p.nit) : ''}${p.contacto ? ' · ' + esc(p.contacto) : ''}</small><br><small>${esc(p.telefono || '')}${p.correo ? ' · ' + esc(p.correo) : ''}</small>${p.direccion ? `<br><small>${esc(p.direccion)}</small>` : ''}${p.notas ? `<p class="muted mt"><small>${esc(p.notas)}</small></p>` : ''}
    <div class="row mt"><button class="btn sec sm" data-a="provEdit" data-id="${p.id}">Editar</button><button class="btn danger sm" data-a="provDel" data-id="${p.id}">Eliminar</button></div></div>`).join('') : `<div style="grid-column:1/-1">${empty('Aún no hay proveedores. Crea el primero.')}</div>`}</div>`;
}
C.provFilter = v => $$('.provc').forEach(el => el.style.display = el.dataset.s.includes(v.toLowerCase()) ? '' : 'none');
A.provEdit = async d => {
  const p = d.id ? await db(T('proveedores').select('*').eq('id', d.id).single()) : {};
  modal(`<h2>${d.id ? 'Editar' : 'Nuevo'} proveedor</h2>
    <label class="f">Nombre o razón social</label><input class="in" id="pv_nom" value="${esc(p.nombre || '')}">
    <div class="two"><div><label class="f">NIT / Cédula</label><input class="in" id="pv_nit" value="${esc(p.nit || '')}"></div><div><label class="f">Persona de contacto</label><input class="in" id="pv_con" value="${esc(p.contacto || '')}"></div></div>
    <div class="two"><div><label class="f">Teléfono</label><input class="in" id="pv_tel" inputmode="tel" value="${esc(p.telefono || '')}"></div><div><label class="f">Correo</label><input class="in" id="pv_mail" type="email" value="${esc(p.correo || '')}"></div></div>
    <label class="f">Dirección</label><input class="in" id="pv_dir" value="${esc(p.direccion || '')}">
    <label class="f">Notas</label><input class="in" id="pv_not" value="${esc(p.notas || '')}">
    <button class="btn full mt" data-a="provSave" data-id="${d.id || ''}">Guardar proveedor</button>`);
};
A.provSave = async d => {
  const r = { nombre: $('#pv_nom').value.trim(), nit: $('#pv_nit').value.trim() || null, contacto: $('#pv_con').value.trim() || null, telefono: $('#pv_tel').value.trim() || null, correo: $('#pv_mail').value.trim() || null, direccion: $('#pv_dir').value.trim() || null, notas: $('#pv_not').value.trim() || null };
  if (r.nombre.length < 2) throw new Error('Escribe el nombre del proveedor');
  if (r.correo && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(r.correo)) throw new Error('Correo no válido');
  await db(d.id ? T('proveedores').update(r).eq('id', d.id) : T('proveedores').insert(r));
  closeModal(); toast('Proveedor guardado', 'ok'); reload();
};
A.provDel = async d => {
  if (!confirm('¿Eliminar este proveedor?')) return;
  try { await db(T('proveedores').delete().eq('id', d.id)); }
  catch (e) { throw new Error(/foreign|violates/i.test(e.message) ? 'No se puede eliminar: el proveedor tiene facturas registradas' : e.message); }
  toast('Proveedor eliminado'); reload();
};

/* ---------- ESTADÍSTICAS (gráficos financieros y de operación) ---------- */
const ST = { n: 6, sede: 'all' };
const VC = { s1: '#3987e5', s2: '#d95926', s3: '#199e70', s4: '#c98500', s5: '#d55181', neg: '#e66767' };   // paleta validada sobre la tarjeta oscura
const HEAT = ['#184f95', '#1c5cab', '#256abf', '#2a78d6', '#3987e5', '#5598e7', '#6da7ec', '#86b6ef'];        // rampa secuencial azul (600 → 250)
const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
const cmpF = new Intl.NumberFormat('es-CO', { notation: 'compact', maximumFractionDigits: 1 });
const fc = v => (v < 0 ? '−$' : '$') + cmpF.format(Math.abs(v));
const fnum = v => cmpF.format(v);
const niceMax = v => { if (v <= 0) return 1; const p = 10 ** Math.floor(Math.log10(v)), f = v / p; return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10) * p; };
const dayDiff = (a, b) => Math.round((new Date(b + 'T12:00') - new Date(a + 'T12:00')) / 864e5);
const monthName = k => { const [y, m] = k.split('-').map(Number); return new Date(y, m - 1, 1).toLocaleDateString('es-CO', { month: 'long', year: 'numeric' }); };
const monthShort = (k, withYear) => { const [y, m] = k.split('-').map(Number); return new Date(y, m - 1, 1).toLocaleDateString('es-CO', { month: 'short' }).replace('.', '') + (withYear ? ' ' + String(y).slice(2) : ''); };

/* --- Tooltip (un solo elemento; los textos se insertan con textContent) --- */
let TIP = {};
const tipReg = (id, i, title, rows) => { (TIP[id] = TIP[id] || [])[i] = { title, rows }; };
function tipEl() { let e = $('#vt'); if (!e) { e = document.createElement('div'); e.id = 'vt'; e.className = 'vt'; e.setAttribute('role', 'tooltip'); document.body.appendChild(e); } return e; }
function tipHide() { const e = $('#vt'); if (e) e.style.display = 'none'; }
function tipShow(x, y, d) {
  const e = tipEl(); e.textContent = '';
  const t = document.createElement('div'); t.className = 't'; t.textContent = d.title; e.appendChild(t);
  d.rows.forEach(r => {
    const row = document.createElement('div'); row.className = 'r';
    if (r.c) { const k = document.createElement('i'); k.style.background = r.c; row.appendChild(k); }
    const l = document.createElement('span'); l.textContent = r.l; const v = document.createElement('b'); v.textContent = r.v; row.append(l, v); e.appendChild(row);
  });
  e.style.display = 'block';
  const w = e.offsetWidth, h = e.offsetHeight;
  e.style.left = Math.max(8, Math.min(innerWidth - w - 8, x + 14)) + 'px';
  e.style.top = Math.max(8, Math.min(innerHeight - h - 8, y + 14)) + 'px';
}
const tipFor = el => { const t = el?.closest?.('[data-tp]'); if (!t) return null; const [id, i] = t.dataset.tp.split(':'); const d = TIP[id]?.[+i]; return d ? { t, d } : null; };
['pointermove', 'pointerdown'].forEach(ev => document.addEventListener(ev, e => { const r = tipFor(e.target); r ? tipShow(e.clientX, e.clientY, r.d) : tipHide(); }));
document.addEventListener('focusin', e => { const r = tipFor(e.target); if (r) { const b = r.t.getBoundingClientRect(); tipShow(b.left + b.width / 2, b.top, r.d); } });
document.addEventListener('focusout', tipHide);
window.addEventListener('scroll', tipHide, { passive: true });

/* --- Piezas de gráfico --- */
const vbar = (x, w, y0, y1, r) => {
  const top = Math.min(y0, y1), bot = Math.max(y0, y1), h = bot - top; if (h < .5) return '';
  const rr = Math.min(r, h / 2, w / 2);
  return y1 <= y0
    ? `M${x},${y0}V${top + rr}Q${x},${top} ${x + rr},${top}H${x + w - rr}Q${x + w},${top} ${x + w},${top + rr}V${y0}Z`
    : `M${x},${y0}V${bot - rr}Q${x},${bot} ${x + rr},${bot}H${x + w - rr}Q${x + w},${bot} ${x + w},${bot - rr}V${y0}Z`;
};
const legend = items => `<div class="lg">${items.map(i => `<span><i style="background:${i.c}"></i>${esc(i.l)}</span>`).join('')}</div>`;
const tblView = (head, rows) => `<details class="tv"><summary>Ver como tabla</summary><div class="tblw"><table class="tbl"><tr>${head.map(h => `<th>${esc(h)}</th>`).join('')}</tr>${rows.map(r => `<tr>${r.map((c, i) => `<td${i ? ' style="text-align:right"' : ''}>${esc(c)}</td>`).join('')}</tr>`).join('')}</table></div></details>`;
const chartCard = (title, sub, lg, svg, table) => `<div class="card cc mt"><h3>${title}</h3><small>${sub}</small>${lg || ''}<div class="cwrap">${svg}</div>${table || ''}</div>`;

function yAxis(m, W, y, ticks) { return ticks.map(t => `<line class="${t === 0 ? 'ax' : 'gl'}" x1="${m.l}" x2="${W - m.r}" y1="${y(t)}" y2="${y(t)}"/><text x="${m.l - 8}" y="${y(t) + 4}" text-anchor="end">${o_fmtY(t)}</text>`).join(''); }
let o_fmtY = fc;

/* Columnas: agrupadas, apiladas, simples o divergentes (positivo/negativo) */
function colChart(id, o) {
  const W = 720, H = 280, m = { l: 62, r: 12, t: 16, b: 30 }, pw = W - m.l - m.r, ph = H - m.t - m.b, n = o.labels.length, ser = o.series, k = ser.length;
  const stack = o.mode === 'stack', sgn = o.mode === 'diverge', tot = i => ser.reduce((a, s) => a + s.vals[i], 0);
  const maxV = Math.max(0, ...(stack ? o.labels.map((_, i) => tot(i)) : ser.flatMap(s => s.vals))), minV = Math.min(0, ...ser.flatMap(s => s.vals));
  let hi, lo; if (minV < 0) { hi = niceMax(Math.max(maxV, -minV)); lo = -hi; } else { hi = niceMax(maxV); lo = 0; }
  const y = v => m.t + ph * (hi - v) / (hi - lo), ticks = [...Array(5).keys()].map(i => lo + (hi - lo) * i / 4);
  const bw = pw / n, cw = (stack || k === 1) ? Math.min(24, bw * .55) : Math.min(20, (bw * .7 - 2 * (k - 1)) / k), step = n > 14 ? Math.ceil(n / 12) : 1;
  let bars = '', hits = '', xl = '', labs = '';
  o.labels.forEach((lb, i) => {
    const cx = m.l + bw * i + bw / 2;
    if (stack) {
      let cum = 0; const topJ = ser.map((s, j) => s.vals[i] > 0 ? j : -1).filter(j => j >= 0).pop();
      ser.forEach((s, j) => { const v = s.vals[i]; if (v <= 0) return; const y0 = y(cum) - (cum > 0 ? 2 : 0), y1 = y(cum + v); cum += v; if (y0 - y1 >= 1) bars += `<path d="${vbar(cx - cw / 2, cw, y0, y1, j === topJ ? 4 : 0)}" fill="${s.color}"/>`; });
    } else ser.forEach((s, j) => { const v = s.vals[i], x0 = cx - (k * cw + (k - 1) * 2) / 2 + j * (cw + 2); if (v) bars += `<path d="${vbar(x0, cw, y(0), y(v), 4)}" fill="${sgn && v < 0 ? VC.neg : s.color}"/>`; });
    if ((o.label || []).includes(i)) { const v = stack ? tot(i) : ser[0].vals[i]; labs += `<text class="v" x="${cx}" y="${v >= 0 ? y(v) - 6 : y(v) + 15}" text-anchor="middle">${o.fmt(v)}</text>`; }
    if (i % step === 0) xl += `<text x="${cx}" y="${H - 9}" text-anchor="middle">${esc(lb)}</text>`;
    hits += `<rect class="hit" x="${m.l + bw * i}" y="${m.t}" width="${bw}" height="${ph}" data-tp="${id}:${i}" tabindex="0"/>`;
    tipReg(id, i, o.titles?.[i] || lb, [...ser.map(s => ({ c: sgn && s.vals[i] < 0 ? VC.neg : s.color, l: s.name, v: money(s.vals[i]) })), ...(stack ? [{ c: null, l: 'Total', v: money(tot(i)) }] : [])]);
  });
  o_fmtY = o.fmtY || fc;
  return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(o.aria)}">${yAxis(m, W, y, ticks)}${bars}${labs}${xl}${hits}</svg>`;
}

/* Línea + área con cruz (crosshair), punto final y línea de promedio */
function lineChart(id, o) {
  const W = 720, H = 250, m = { l: 62, r: 22, t: 18, b: 30 }, pw = W - m.l - m.r, ph = H - m.t - m.b, n = o.vals.length;
  const hi = niceMax(Math.max(...o.vals, 1)), y = v => m.t + ph * (hi - v) / hi, x = i => n === 1 ? m.l + pw / 2 : m.l + pw * i / (n - 1);
  const ticks = [0, 1, 2, 3, 4].map(i => hi * i / 4), line = 'M' + o.vals.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`).join('L');
  const area = n > 1 ? `${line}L${x(n - 1).toFixed(1)},${y(0)}L${x(0).toFixed(1)},${y(0)}Z` : '', avg = o.vals.reduce((a, b) => a + b, 0) / n, bw = n === 1 ? pw : pw / (n - 1);
  let hits = '', xl = ''; const shown = new Set([...Array(Math.min(6, n)).keys()].map(j => Math.round(j * (n - 1) / Math.max(1, Math.min(6, n) - 1))));
  o.vals.forEach((v, i) => {
    const hx = Math.max(m.l, x(i) - bw / 2), hw = Math.min(m.l + pw, x(i) + bw / 2) - hx;
    hits += `<g><rect class="hit" x="${hx.toFixed(1)}" y="${m.t}" width="${hw.toFixed(1)}" height="${ph}" data-tp="${id}:${i}" tabindex="0"/><g class="xh"><line class="ax" x1="${x(i).toFixed(1)}" x2="${x(i).toFixed(1)}" y1="${m.t}" y2="${m.t + ph}"/><circle class="ring" cx="${x(i).toFixed(1)}" cy="${y(v).toFixed(1)}" r="4" fill="${o.color}"/></g></g>`;
    if (shown.has(i)) xl += `<text x="${x(i).toFixed(1)}" y="${H - 9}" text-anchor="${i === 0 ? 'start' : i === n - 1 ? 'end' : 'middle'}">${esc(o.labels[i])}</text>`;
    tipReg(id, i, o.titles[i], [{ c: o.color, l: o.name, v: money(v) }]);
  });
  o_fmtY = fc;
  const last = o.vals[n - 1];
  return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(o.aria)}">${yAxis(m, W, y, ticks)}
    <line x1="${m.l}" x2="${W - m.r}" y1="${y(avg).toFixed(1)}" y2="${y(avg).toFixed(1)}" stroke="#4b5f95" stroke-width="1"/>
    ${area ? `<path d="${area}" fill="${o.color}" fill-opacity=".10"/>` : ''}<path d="${line}" fill="none" stroke="${o.color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <circle class="ring" cx="${x(n - 1).toFixed(1)}" cy="${y(last).toFixed(1)}" r="4.5" fill="${o.color}"/><text class="v" x="${(x(n - 1) - 8).toFixed(1)}" y="${(y(last) - 10).toFixed(1)}" text-anchor="end">${fc(last)}</text>${xl}${hits}</svg>`;
}

/* Barras horizontales ordenadas (una sola serie → un solo color) */
function hbar(id, o) {
  const W = 720, rowH = 36, m = { l: 178, r: 104, t: 6, b: 6 }, n = o.rows.length, H = m.t + m.b + n * rowH, pw = W - m.l - m.r, max = Math.max(1, ...o.rows.map(r => r.value)), total = o.rows.reduce((a, r) => a + r.value, 0) || 1;
  let out = `<line class="ax" x1="${m.l}" x2="${m.l}" y1="${m.t}" y2="${H - m.b}"/>`;
  o.rows.forEach((r, i) => {
    const cy = m.t + i * rowH + rowH / 2, bh = 18, bw = r.value / max * pw, rr = Math.min(4, bw / 2), x1 = m.l + bw;
    if (bw >= 1) out += `<path d="M${m.l},${cy - bh / 2}H${x1 - rr}Q${x1},${cy - bh / 2} ${x1},${cy - bh / 2 + rr}V${cy + bh / 2 - rr}Q${x1},${cy + bh / 2} ${x1 - rr},${cy + bh / 2}H${m.l}Z" fill="${o.color}"/>`;
    const lb = r.label.length > 24 ? r.label.slice(0, 23) + '…' : r.label;
    out += `<text x="${m.l - 10}" y="${cy + 4}" text-anchor="end" style="fill:var(--txt)">${esc(lb)}</text><text class="v" x="${x1 + 8}" y="${cy + 4}">${o.fmt(r.value)}</text><rect class="hit" x="0" y="${m.t + i * rowH}" width="${W}" height="${rowH}" data-tp="${id}:${i}" tabindex="0"/>`;
    tipReg(id, i, r.label, [{ c: o.color, l: o.name, v: o.money ? money(r.value) : String(r.value) }, { c: null, l: 'Participación', v: (r.value / total * 100).toFixed(1) + '%' }]);
  });
  return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(o.aria)}">${out}</svg>`;
}

/* Mapa de calor: día de la semana × hora */
function heat(id, o) {
  const W = 720, m = { l: 74, r: 8, t: 8, b: 26 }, nh = o.hours.length, cw = (W - m.l - m.r) / nh, chh = 30, H = m.t + m.b + 7 * chh, flat = o.grid.flat(), max = Math.max(1, ...flat);
  let out = '';
  o.grid.forEach((row, d) => {
    out += `<text x="${m.l - 10}" y="${m.t + d * chh + chh / 2 + 4}" text-anchor="end" style="fill:var(--txt)">${DIAS[d].slice(0, 3)}</text>`;
    row.forEach((v, j) => {
      const bin = Math.min(7, Math.floor(v / max * 7.999));
      out += `<rect class="hcell" x="${(m.l + j * cw + 1).toFixed(1)}" y="${m.t + d * chh + 1}" width="${(cw - 2).toFixed(1)}" height="${chh - 2}" rx="4" fill="${v ? HEAT[bin] : '#0b1630'}" data-tp="${id}:${d * nh + j}" tabindex="0"/>`;
      tipReg(id, d * nh + j, `${DIAS[d]} · ${hh(o.hours[j])}`, [{ c: v ? HEAT[bin] : null, l: 'Reservas', v: String(v) }]);
    });
  });
  o.hours.forEach((h, j) => { if (nh <= 12 || j % 2 === 0) out += `<text x="${(m.l + j * cw + cw / 2).toFixed(1)}" y="${H - 8}" text-anchor="middle">${h}</text>`; });
  return { svg: `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(o.aria)}">${out}</svg>`, max };
}

/* --- Datos y vista --- */
function stRange() {
  const d = new Date(), y = d.getFullYear(), m = d.getMonth(), n = ST.n === 'ytd' ? m + 1 : ST.n, iso = x => `${x.getFullYear()}-${pad(x.getMonth() + 1)}-01`;
  return { n, from: iso(new Date(y, m - n + 1, 1)), to: iso(new Date(y, m + 1, 1)), prev: iso(new Date(y, m - 2 * n + 1, 1)), months: [...Array(n).keys()].map(i => { const x = new Date(y, m - n + 1 + i, 1); return `${x.getFullYear()}-${pad(x.getMonth() + 1)}`; }) };
}
const allRows = async mk => { let out = [], i = 0; for (;;) { const r = await db(mk().range(i, i + 999)); out = out.concat(r); if (r.length < 1000 || out.length >= 30000) return out; i += 1000; } };
const stSede = q => ST.sede === 'all' ? q : q.eq('sede_id', ST.sede);
const delta = (cur, prev, upGood = true) => { if (!prev) return '<small>Sin datos del período anterior</small>'; const p = (cur - prev) / Math.abs(prev) * 100, up = p >= 0; return `<small class="dl ${up === upGood ? 'ok' : 'bad'}">${up ? '▲' : '▼'} ${Math.abs(p).toFixed(0)}% vs período anterior</small>`; };
const tile = (label, val, sub, full) => `<div class="kpi"${full ? ` title="${esc(full)}"` : ''}><small>${label}</small><b>${val}</b>${sub || ''}</div>`;
const stBar = () => `<div class="row"><div class="filters" style="margin:0">${[[3, 'Últimos 3 meses'], [6, 'Últimos 6 meses'], [12, 'Últimos 12 meses'], ['ytd', 'Este año']].map(([n, l]) => `<button class="fl ${ST.n === n ? 'on' : ''}" data-a="stN" data-n="${n}">${l}</button>`).join('')}</div><select class="in" style="max-width:240px" data-c="stSede">${sedeOpts(ST.sede, true)}</select></div>`;
async function stRefresh() { const el = $('#view'); el.style.opacity = '.55'; try { const h = await V.stats(); if (S.view === 'stats') el.innerHTML = h; } finally { el.style.opacity = ''; } }
A.stN = d => { ST.n = d.n === 'ytd' ? 'ytd' : +d.n; return stRefresh(); };
C.stSede = v => { ST.sede = v; return stRefresh(); };

V.stats = async () => {
  TIP = {}; const R = stRange(), ts = [R.prev + 'T00:00:00', R.to + 'T00:00:00'];
  const [ing, gas, fpag, fpen, res, mat, usr, ord, top, tot] = await Promise.all([
    allRows(() => stSede(T('ingresos').select('valor,concepto,metodo,fecha').gte('fecha', R.prev).lt('fecha', R.to).order('fecha'))),
    allRows(() => stSede(T('gastos').select('valor,categoria,fecha').gte('fecha', R.prev).lt('fecha', R.to).order('fecha'))),
    allRows(() => stSede(T('facturas_proveedor').select('valor_pagado,fecha_pago').eq('estado', 'pagada').gte('fecha_pago', R.prev).lt('fecha_pago', R.to).order('fecha_pago'))),
    db(stSede(T('facturas_proveedor').select('valor,fecha_vencimiento,notas_credito(valor)').eq('estado', 'pendiente'))),
    allRows(() => stSede(T('reservas').select('fecha,hora,court_id').eq('estado', 'confirmada').gte('fecha', R.prev).lt('fecha', R.to).order('fecha'))),
    allRows(() => stSede(T('matches').select('created_at').eq('status', 'finalizado').gte('created_at', ts[0]).lt('created_at', ts[1]).order('created_at'))),
    allRows(() => T('app_users').select('created_at').eq('role', 'jugador').gte('created_at', ts[0]).lt('created_at', ts[1]).order('created_at')),
    allRows(() => T('ordenes').select('total,resuelta_at').in('estado', ['aprobada', 'entregada']).gte('resuelta_at', ts[0]).lt('resuelta_at', ts[1]).order('resuelta_at')),
    db(T('app_users').select('id,nombre,puntos,victorias,partidos,foto').eq('role', 'jugador').order('puntos', { ascending: false }).limit(5)),
    T('app_users').select('id', { count: 'exact', head: true }).eq('role', 'jugador')
  ]);
  const cur = (rows, k) => rows.filter(r => r[k] >= R.from), prv = (rows, k) => rows.filter(r => r[k] < R.from);
  const monthly = (rows, k, val) => { const m = Object.fromEntries(R.months.map(x => [x, 0])); rows.forEach(r => { const key = r[k].slice(0, 7); if (key in m) m[key] += val(r); }); return R.months.map(x => m[x]); };
  const cI = cur(ing, 'fecha'), cG = cur(gas, 'fecha'), cF = cur(fpag, 'fecha_pago'), cR = cur(res, 'fecha');
  const sI = sum(cI), sPI = sum(prv(ing, 'fecha')), sE = sum(cG) + sum(cF, 'valor_pagado'), sPE = sum(prv(gas, 'fecha')) + sum(prv(fpag, 'fecha_pago'), 'valor_pagado'), neto = sI - sE, netoP = sPI - sPE;
  const ingM = monthly(cI, 'fecha', x => +x.valor), egM = monthly(cG, 'fecha', x => +x.valor).map((v, i) => v + monthly(cF, 'fecha_pago', x => +x.valor_pagado)[i]), netM = ingM.map((v, i) => v - egM[i]);
  const wide = R.n > 6, labels = R.months.map(k => monthShort(k, wide)), titles = R.months.map(monthName);
  const today0 = today(), end = R.to > addDays(today0, 1) ? addDays(today0, 1) : R.to, dias = Math.max(1, dayDiff(R.from, end));
  const porPagar = fpen.reduce((s, f) => s + saldoDe(f), 0), venc = fpen.filter(f => f.fecha_vencimiento && f.fecha_vencimiento < today0).length;
  const empty0 = sI === 0 && sE === 0;

  // Tendencia de ingresos (diaria; semanal si el período es largo)
  const weekly = dias > 100, bucket = {}, keys = [];
  for (let i = 0; i < dias; i++) { const dte = addDays(R.from, i), k = weekly ? addDays(dte, -((new Date(dte + 'T12:00').getDay() + 6) % 7)) : dte; if (!(k in bucket)) { bucket[k] = 0; keys.push(k); } }
  cI.forEach(x => { const k = weekly ? addDays(x.fecha, -((new Date(x.fecha + 'T12:00').getDay() + 6) % 7)) : x.fecha; if (k in bucket) bucket[k] += +x.valor; });
  const tv = keys.map(k => bucket[k]), tl = keys.map(k => dfmt(k, { day: 'numeric', month: 'short' })), tt = keys.map(k => weekly ? 'Semana del ' + dfmt(k, { day: 'numeric', month: 'long' }) : dfmt(k, { weekday: 'long', day: 'numeric', month: 'long' }));

  // Ingresos por método (apilado por mes)
  const metS = Object.entries(METODOS).map(([k, l], i) => ({ name: l, color: [VC.s1, VC.s2, VC.s3, VC.s4][i], key: k, vals: monthly(cI.filter(x => x.metodo === k), 'fecha', x => +x.valor) }));
  metS.forEach(s => s.total = sum(s.vals.map(v => ({ valor: v }))));
  // Rankings
  const conRows = Object.entries(CONCEPTOS).map(([k, l]) => ({ label: l, value: sum(cI.filter(x => x.concepto === k)) })).sort((a, b) => b.value - a.value);
  const egRows = [{ label: 'Pago a proveedores', value: sum(cF, 'valor_pagado') }, ...Object.entries(CATEG).map(([k, l]) => ({ label: l, value: sum(cG.filter(g => g.categoria === k)) }))].sort((a, b) => b.value - a.value);

  // Operación
  const nameCourt = id => S.courts.find(c => c.id === id)?.nombre || 'Cancha';
  const sedesSel = S.sedes.filter(s => ST.sede === 'all' || s.id === ST.sede);
  const cap = sedesSel.reduce((a, s) => a + S.courts.filter(c => c.sede_id === s.id).length * Math.max(0, s.cierre - s.apertura) * dias, 0), usadas = cR.filter(r => r.fecha < end).length, occ = cap ? Math.min(100, usadas / cap * 100) : 0;
  const h0 = sedesSel.length ? Math.min(...sedesSel.map(s => s.apertura)) : 6, h1 = sedesSel.length ? Math.max(...sedesSel.map(s => s.cierre)) : 22, hours = [...Array(Math.max(1, h1 - h0)).keys()].map(i => h0 + i);
  const grid = [...Array(7)].map(() => hours.map(() => 0)); cR.forEach(r => { const d = (new Date(r.fecha + 'T12:00').getDay() + 6) % 7, j = hours.indexOf(r.hora); if (j >= 0) grid[d][j]++; });
  const resM = monthly(cR, 'fecha', () => 1), cM = cur(mat, 'created_at'), matM = monthly(cM, 'created_at', () => 1), cU = cur(usr, 'created_at'), usrM = monthly(cU, 'created_at', () => 1);
  const cO = cur(ord, 'resuelta_at'), sO = sum(cO, 'total'), sPO = sum(prv(ord, 'resuelta_at'), 'total');
  const cancha = {}; cR.forEach(r => cancha[r.court_id] = (cancha[r.court_id] || 0) + 1);
  const canRows = Object.entries(cancha).map(([id, v]) => ({ label: nameCourt(id), value: v })).sort((a, b) => b.value - a.value).slice(0, 8);
  const hm = heat('heat', { grid, hours, aria: 'Mapa de calor de reservas por día de la semana y hora' });

  const S1 = (name, color, vals) => [{ name, color, vals }], lastI = n => n.length - 1;
  const maxIdx = a => a.indexOf(Math.max(...a)), minIdx = a => a.indexOf(Math.min(...a));
  const rk = top.map((u, i) => `<div class="rk"><div class="pos">${['🥇', '🥈', '🥉'][i] || i + 1}</div>${avatar(u)}<div class="grow"><b>${esc(u.nombre)}</b><br><small>${u.victorias} victorias · ${u.partidos} partidos</small></div>${catBadge(u.puntos)}<div class="pts">${u.puntos}</div></div>`).join('');
  const nota = '<small class="muted">Períodos anteriores del mismo tamaño se usan para los porcentajes de cambio.</small>';

  return `<div class="viz">${stBar()}
  ${empty0 && !cR.length ? `<div class="mt">${empty('Todavía no hay movimientos en este período. Registra ingresos en Contabilidad para ver las gráficas.')}</div>` : ''}
  <h3 class="mt2" style="margin-bottom:10px">Finanzas</h3>
  <div class="grid g3">
    <div class="kpi hero" title="${esc(money(neto))}"><small>Resultado neto del período (ingresos − egresos)</small><b>${fc(neto)}</b>${delta(neto, netoP)}</div>
    ${tile('Ingresos', fc(sI), delta(sI, sPI), money(sI))}
    ${tile('Egresos', fc(sE), delta(sE, sPE, false), money(sE))}
    ${tile('Margen neto', sI ? (neto / sI * 100).toFixed(1) + '%' : '—', '<small>Resultado sobre ingresos</small>')}
    ${tile('Ticket promedio', cI.length ? fc(sI / cI.length) : '—', `<small>${cI.length} transacciones</small>`, cI.length ? money(sI / cI.length) : '')}
    ${tile('Ingreso promedio mensual', fc(sI / R.n), `<small>Promedio diario ${fc(sI / dias)}</small>`, money(sI / R.n))}
    ${tile('Gasto promedio mensual', fc(sE / R.n), `<small>Promedio diario ${fc(sE / dias)}</small>`, money(sE / R.n))}
    ${tile('Por pagar a proveedores', fc(porPagar), `<small>${fpen.length} facturas · ${venc} vencidas</small>`, money(porPagar))}
  </div>
  ${chartCard('Ingresos vs egresos por mes', 'Comparación mensual del dinero que entra y del que sale.', legend([{ c: VC.s1, l: 'Ingresos' }, { c: VC.s2, l: 'Egresos' }]),
    colChart('flujo', { labels, titles, mode: 'group', series: [{ name: 'Ingresos', color: VC.s1, vals: ingM }, { name: 'Egresos', color: VC.s2, vals: egM }], aria: 'Ingresos y egresos por mes' }),
    tblView(['Mes', 'Ingresos', 'Egresos', 'Neto'], R.months.map((k, i) => [monthName(k), money(ingM[i]), money(egM[i]), money(netM[i])])))}
  ${chartCard('Resultado neto por mes', 'Ingresos menos egresos: azul si hubo ganancia, rojo si hubo pérdida.', legend([{ c: VC.s1, l: 'Ganancia' }, { c: VC.neg, l: 'Pérdida' }]),
    colChart('neto', { labels, titles, mode: 'diverge', series: S1('Resultado neto', VC.s1, netM), label: [...new Set([maxIdx(netM), minIdx(netM)])], fmt: fc, aria: 'Resultado neto por mes' }),
    tblView(['Mes', 'Resultado neto'], R.months.map((k, i) => [monthName(k), money(netM[i])])))}
  ${chartCard(weekly ? 'Tendencia semanal de ingresos' : 'Tendencia diaria de ingresos', `La línea gris horizontal marca el promedio: ${fc(tv.reduce((a, b) => a + b, 0) / (tv.length || 1))} por ${weekly ? 'semana' : 'día'}.`, '',
    lineChart('tend', { labels: tl, titles: tt, vals: tv, color: VC.s1, name: 'Ingresos', aria: 'Tendencia de ingresos' }),
    tblView([weekly ? 'Semana' : 'Día', 'Ingresos'], keys.map((k, i) => [tt[i], money(tv[i])])))}
  ${chartCard('Ingresos por método de pago', 'Cómo pagan los clientes, mes a mes.', legend(metS.map(s => ({ c: s.color, l: `${s.name} · ${sI ? Math.round(s.total / sI * 100) : 0}%` }))),
    colChart('metodo', { labels, titles, mode: 'stack', series: metS, aria: 'Ingresos por método de pago y mes' }),
    tblView(['Método', 'Total', '% del total', 'Transacciones'], metS.map(s => [s.name, money(s.total), sI ? (s.total / sI * 100).toFixed(1) + '%' : '0%', String(cI.filter(x => x.metodo === s.key).length)])))}
  ${sI ? chartCard('Ingresos por concepto', 'Inscripciones, mensualidades, ventas y más.', '', hbar('conc', { rows: conRows, color: VC.s1, name: 'Ingresos', fmt: fc, money: true, aria: 'Ingresos por concepto' }),
    tblView(['Concepto', 'Total'], conRows.map(r => [r.label, money(r.value)]))) : ''}
  ${sE ? chartCard('Egresos por categoría', 'Proveedores, servicios públicos, arriendos y otros gastos fijos.', '', hbar('egr', { rows: egRows, color: VC.s2, name: 'Egresos', fmt: fc, money: true, aria: 'Egresos por categoría' }),
    tblView(['Categoría', 'Total'], egRows.map(r => [r.label, money(r.value)]))) : ''}

  <h3 class="mt2" style="margin-bottom:10px">Operación del club</h3>
  <div class="grid g3">
    ${tile('Reservas confirmadas', fnum(cR.length), delta(cR.length, prv(res, 'fecha').length))}
    ${tile('Ocupación de canchas', cap ? occ.toFixed(1) + '%' : '—', `<small>${usadas} de ${fnum(cap)} horas disponibles</small>`)}
    ${tile('Jugadores registrados', fnum(tot.count || 0), `${delta(cU.length, prv(usr, 'created_at').length)}<small> · ${cU.length} nuevos</small>`)}
    ${tile('Partidos jugados', fnum(cM.length), delta(cM.length, prv(mat, 'created_at').length))}
    ${tile('Ventas de la tienda', fc(sO), delta(sO, sPO), money(sO))}
  </div>
  ${chartCard('Ocupación por día y hora', 'Cuántas reservas hay en cada franja: más claro significa más reservas.', `<div class="lg">Menos <span class="hs">${HEAT.map(c => `<i style="background:${c}"></i>`).join('')}</span> Más (${hm.max})</div>`, hm.svg,
    tblView(['Día', 'Reservas', 'Hora pico'], grid.map((row, d) => { const t = row.reduce((a, b) => a + b, 0), p = row.indexOf(Math.max(...row)); return [DIAS[d], String(t), t ? hh(hours[p]) : '—']; })))}
  ${canRows.length ? chartCard('Reservas por cancha', 'Las canchas más usadas del período.', '', hbar('can', { rows: canRows, color: VC.s3, name: 'Reservas', fmt: fnum, money: false, aria: 'Reservas por cancha' }), tblView(['Cancha', 'Reservas'], canRows.map(r => [r.label, String(r.value)]))) : ''}
  ${chartCard('Reservas por mes', '', '', colChart('resm', { labels, titles, mode: 'single', series: S1('Reservas', VC.s3, resM), label: [lastI(resM)], fmt: fnum, fmtY: fnum, aria: 'Reservas por mes' }), tblView(['Mes', 'Reservas'], R.months.map((k, i) => [monthName(k), String(resM[i])])))}
  ${chartCard('Jugadores nuevos por mes', 'Crecimiento de la comunidad.', '', colChart('usrm', { labels, titles, mode: 'single', series: S1('Jugadores nuevos', VC.s5, usrM), label: [lastI(usrM)], fmt: fnum, fmtY: fnum, aria: 'Jugadores nuevos por mes' }), tblView(['Mes', 'Jugadores nuevos'], R.months.map((k, i) => [monthName(k), String(usrM[i])])))}
  ${chartCard('Partidos jugados por mes', 'Partidos finalizados con marcador.', '', colChart('matm', { labels, titles, mode: 'single', series: S1('Partidos', VC.s4, matM), label: [lastI(matM)], fmt: fnum, fmtY: fnum, aria: 'Partidos jugados por mes' }), tblView(['Mes', 'Partidos'], R.months.map((k, i) => [monthName(k), String(matM[i])])))}
  <h3 class="mt2" style="margin-bottom:10px">Mejores jugadores</h3>${rk || empty('Aún no hay jugadores con puntos.')}
  <p class="mt">${nota}</p></div>`;
};

/* ---------- AJUSTES DEL CLUB (nombre y logo) ---------- */
V.ajustes = async () => {
  S.ajLogo = undefined;
  return `<div class="card" style="max-width:560px"><h3>Marca del club</h3>
    <p class="muted">Cambia el nombre y el logo que ven todos los usuarios. Los colores se conservan.</p>
    <label class="f">Nombre</label><input class="in" id="aj_nom" maxlength="60" value="${esc(appName())}">
    <label class="f">Dirección pública de la aplicación (la usan los botones de los correos y el QR)</label><input class="in" id="aj_url" inputmode="url" autocomplete="off" placeholder="https://tu-sitio.com/index.html" value="${esc(S.cfg.app_url || '')}">
    <label class="f">Logo (PNG o JPG; se ajusta a 256 px)</label>
    <div class="row" style="flex-wrap:nowrap;gap:16px"><div class="brand" id="aj_prev" style="padding:0;min-width:0">${brandHtml()}</div></div>
    <input class="in mt" type="file" accept="image/*" data-c="ajLogo">
    <div class="row mt"><button class="btn" data-a="ajSave">Guardar</button><button class="btn sec" data-a="ajQuitar">Quitar logo</button><button class="btn sec" data-a="ajNombre">Nombre por defecto</button></div></div>`;
};
C.ajLogo = async (v, el) => {
  const f = el.files[0]; if (!f) return;
  S.ajLogo = await fitImg(f, 256, false, 'image/png');
  $('#aj_prev').innerHTML = `<img class="logo" src="${S.ajLogo}" alt="" style="width:64px;height:64px"><span class="bn" style="margin-left:6px"><small>Vista previa</small></span>`;
};
A.ajQuitar = () => { S.ajLogo = ''; $('#aj_prev').innerHTML = '<i></i><span class="bn"><small>Se usará el logo por defecto</small></span>'; };
A.ajNombre = () => { $('#aj_nom').value = DEF_NAME; };
A.ajSave = async () => {
  const nombre = $('#aj_nom').value.trim(); if (nombre.length < 3) throw new Error('Escribe el nombre del club');
  const url = $('#aj_url').value.trim().replace(/#.*$/, '');
  if (url && !/^https?:\/\/[^\s]+\.[^\s]+$/i.test(url)) throw new Error('La dirección debe empezar por https:// (por ejemplo https://tu-sitio.com/index.html)');
  const rows = [{ clave: 'nombre_app', valor: nombre }, { clave: 'app_url', valor: url }]; if (S.ajLogo !== undefined) rows.push({ clave: 'logo', valor: S.ajLogo });
  await db(T('ajustes').upsert(rows, { onConflict: 'clave' }));
  S.cfg.nombre_app = nombre; S.cfg.app_url = url; if (S.ajLogo !== undefined) S.cfg.logo = S.ajLogo; S.ajLogo = undefined;
  applyBrand(); const b = $('.side .brand'); if (b) b.innerHTML = brandHtml();
  toast('Marca del club actualizada', 'ok'); reload();
};

/* ---------- SEDES Y CANCHAS ---------- */
V.sedes = async () => {
  const [ss, cs] = await Promise.all([db(T('sedes').select('*').order('nombre')), db(T('canchas').select('*').order('nombre'))]);
  return `<div class="row between"><p class="muted">Define sedes, horario de atención y canchas.</p><button class="btn" data-a="sedeEdit">+ Nueva sede</button></div>
  ${ss.map(s => `<div class="card mt"><div class="row between"><div><h3 style="margin:0">${esc(s.nombre)} ${s.activa ? '' : '<span class="st rechazada">Inactiva</span>'}</h3><small>${esc(s.ciudad || '')} · abre ${hh(s.apertura)} · cierra ${hh(s.cierre)}</small></div><div class="row"><button class="btn sec sm" data-a="sedeEdit" data-id="${s.id}">Editar</button><button class="btn sm" data-a="courtEdit" data-sede="${s.id}">+ Cancha</button></div></div>
    <div class="row mt">${cs.filter(c => c.sede_id === s.id).map(c => `<button class="fl ${c.activa ? '' : 'on'}" data-a="courtEdit" data-id="${c.id}" data-sede="${s.id}">${esc(c.nombre)} · ${money(c.precio_hora)}${c.activa ? '' : ' (inactiva)'}</button>`).join('') || '<small>Sin canchas</small>'}</div></div>`).join('')}`;
};
A.sedeEdit = async d => {
  const s = d.id ? await db(T('sedes').select('*').eq('id', d.id).single()) : { nombre: '', ciudad: '', apertura: 8, cierre: 23, activa: true };
  modal(`<h2>${d.id ? 'Editar' : 'Nueva'} sede</h2>
    <label class="f">Nombre</label><input class="in" id="s_nom" value="${esc(s.nombre)}"><label class="f">Ciudad</label><input class="in" id="s_ciu" value="${esc(s.ciudad || '')}">
    <div class="two"><div><label class="f">Abre (hora, 0-23)</label><input class="in" type="number" id="s_ap" min="0" max="23" value="${s.apertura}"></div><div><label class="f">Cierra (hora, 1-24)</label><input class="in" type="number" id="s_ci" min="1" max="24" value="${s.cierre}"></div></div>
    <label class="f">Estado</label><select class="in" id="s_act"><option value="1" ${s.activa ? 'selected' : ''}>Activa</option><option value="0" ${s.activa ? '' : 'selected'}>Inactiva</option></select>
    <button class="btn full mt" data-a="sedeSave" data-id="${d.id || ''}">Guardar</button>`);
};
A.sedeSave = async d => {
  const r = { nombre: $('#s_nom').value.trim(), ciudad: $('#s_ciu').value.trim(), apertura: +$('#s_ap').value, cierre: +$('#s_ci').value, activa: $('#s_act').value === '1' };
  if (!r.nombre) throw new Error('La sede necesita un nombre'); if (r.cierre <= r.apertura) throw new Error('El cierre debe ser después de la apertura');
  await db(d.id ? T('sedes').update(r).eq('id', d.id) : T('sedes').insert(r)); await loadBase(); closeModal(); toast('Sede guardada', 'ok'); reload();
};
A.courtEdit = async d => {
  const c = d.id ? await db(T('canchas').select('*').eq('id', d.id).single()) : { nombre: '', precio_hora: 0, activa: true };
  modal(`<h2>${d.id ? 'Editar' : 'Nueva'} cancha</h2><label class="f">Nombre</label><input class="in" id="c_nom" value="${esc(c.nombre)}">
    <label class="f">Precio por hora ($)</label><input class="in" type="number" id="c_pre" min="0" value="${c.precio_hora}">
    <label class="f">Estado</label><select class="in" id="c_act"><option value="1" ${c.activa ? 'selected' : ''}>Activa</option><option value="0" ${c.activa ? '' : 'selected'}>Inactiva</option></select>
    <button class="btn full mt" data-a="courtSave" data-id="${d.id || ''}" data-sede="${d.sede}">Guardar</button>`);
};
A.courtSave = async d => {
  const r = { nombre: $('#c_nom').value.trim(), precio_hora: +$('#c_pre').value || 0, activa: $('#c_act').value === '1' }; if (!r.nombre) throw new Error('La cancha necesita un nombre');
  await db(d.id ? T('canchas').update(r).eq('id', d.id) : T('canchas').insert({ ...r, sede_id: d.sede })); await loadBase(); closeModal(); toast('Cancha guardada', 'ok'); reload();
};

/* =====================================================================
   PANTALLA INDEPENDIENTE DEL MARCADOR  (#/marcador/<id>)
   ===================================================================== */
async function projector(id) {
  try { S.cfg = Object.fromEntries((await db(T('ajustes').select('*'))).map(x => [x.clave, x.valor])); } catch (_) {}
  applyBrand(); document.title = 'Marcador · ' + appName(); document.body.classList.add('pjb');
  $('#app').innerHTML = '<div class="pj" id="pj"></div>';
  const el = $('#pj'), sel = 'id,sedes(nombre),canchas(nombre),equipo1,equipo2,sets,puntos,tiebreak,mejor_de,status,ganador,inicio,fin,updated_at';
  const draw = m => {
    if (!m) { el.innerHTML = `<div class="pjw"><div class="pjt">${esc(appName())}</div><p>Esperando un partido en juego…</p></div>`; return; }
    const title = m.canchas?.nombre || 'Partido';
    if (m.status === 'finalizado') {
      const g = [0, 1].map(t => m.sets.reduce((a, s) => a + s[t], 0)), sw = setsWon(m), tot = (g[0] + g[1]) || 1;
      const w = m.ganador, mins = m.fin ? Math.max(1, Math.round((new Date(m.fin) - new Date(m.inicio)) / 60000)) : null;
      el.innerHTML = `<div class="pjbox pjend"><div class="tr">🏆</div><p>PARTIDO FINALIZADO</p><h2>${esc(teamName(w === 0 ? m.equipo1 : m.equipo2))}</h2><p>gana a ${esc(teamName(w === 0 ? m.equipo2 : m.equipo1))}</p>
        <div class="mt2">${boardHtml(m, true)}</div>
        <div class="pjstats"><div><span>${sw[0]}</span><span>SETS</span><span>${sw[1]}</span></div><div><span>${g[0]}</span><span>GAMES</span><span>${g[1]}</span></div><div><span>${Math.round(g[0] / tot * 100)}%</span><span>% GAMES</span><span>${Math.round(g[1] / tot * 100)}%</span></div></div>${mins ? `<p class="mt">${mins} min</p>` : ''}</div>`;
    } else {
      el.innerHTML = `<div class="pjbox"><div class="pjttl">${esc(title)}</div><div class="pjsub"><span class="dot"></span>PARTIDO EN VIVO${m.sedes?.nombre ? ' · ' + esc(m.sedes.nombre) : ''}</div>${boardHtml(m, true)}</div>`;
    }
  };
  let last = '';
  async function tick() {
    try {
      let m;
      if (id) m = await db(T('matches').select(sel).eq('id', id).maybeSingle());
      else { const r = await db(T('matches').select(sel).eq('status', 'en_juego').order('updated_at', { ascending: false }).limit(1)); m = r[0] || null; }
      const k = JSON.stringify(m); if (k !== last) { last = k; draw(m); }
    } catch (e) { console.error(e); }
  }
  tick(); setInterval(tick, 1500); bc && (bc.onmessage = tick);
  document.addEventListener('dblclick', () => { document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen?.(); });
}

/* =====================================================================
   PANTALLA MINI PARA RELOJ  (#/reloj/<id>) — botones gigantes para anotar
   sin abrir la app completa; pensada para el navegador de un smartwatch (WearOS).
   No repite la regla del juego: solo llama a marcador_anotar (ver drenarColaMarcador).
   ===================================================================== */
async function relojScreen(id) {
  document.title = 'Anotar · ' + (S.cfg?.nombre_app || 'Cashless-Sport');
  const el = $('#app'), sel = 'id,equipo1,equipo2,sets,puntos,tiebreak,status,ganador';
  const draw = m => {
    if (!m) { el.innerHTML = `<div class="relojwrap"><p>Partido no encontrado.</p></div>`; return; }
    if (m.status === 'finalizado') {
      el.innerHTML = `<div class="relojwrap relojend"><h2>🏆 Partido terminado</h2><p>${esc(teamName(m.ganador === 0 ? m.equipo1 : m.equipo2))} ganó</p><p class="relojscore">${scoreLine(m)}</p></div>`;
      return;
    }
    el.innerHTML = `<div class="relojwrap">
      <div class="relojscore">${scoreLine(m)} · ${gameStr(m, 0)}–${gameStr(m, 1)}</div>
      <button class="relojbtn a" data-a="relojPt" data-id="${m.id}" data-t="0">${esc(teamName(m.equipo1))}<small>Toca para sumar 1 punto</small></button>
      <button class="relojbtn b" data-a="relojPt" data-id="${m.id}" data-t="1">${esc(teamName(m.equipo2))}<small>Toca para sumar 1 punto</small></button>
    </div>`;
  };
  async function tick() {
    try { draw(await db(T('matches').select(sel).eq('id', id).maybeSingle())); }
    catch (e) { el.innerHTML = `<div class="relojwrap"><p>${esc(e.message)}</p></div>`; }
  }
  tick(); setInterval(tick, 3000);
}
A.relojPt = async (d, el) => {
  el.disabled = true; try { navigator.vibrate?.(60); } catch (_) {}
  try { await db(sb.rpc('marcador_anotar', { p_match: d.id, p_equipo: +d.t, p_origen: 'reloj' })); }
  finally { setTimeout(() => { if (el.isConnected) el.disabled = false; }, 700); }
};

boot();
