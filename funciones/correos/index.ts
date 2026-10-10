// Edge Function "correos": envía por Gmail (SMTP) los correos de reservas.
//   POST {accion:'confirmacion', reserva_id, reenviar?}  -> confirmación + QR
//   POST {accion:'recordatorios'}                         -> aviso 10 min antes (lo llama pg_cron cada minuto)
//   POST {accion:'espera', court_id, fecha, hora}         -> avisa a la lista de espera (lo llama el trigger)
//   POST {accion:'estado'}                                -> diagnóstico (¿SMTP configurado?)
//   GET  ?qr=<token>                                      -> imagen PNG del código QR de la reserva
// Secretos: GMAIL_USER (opcional), GMAIL_APP_PASSWORD (contraseña de aplicación de 16 caracteres).
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';
import { SMTPClient } from 'https://deno.land/x/denomailer@1.6.0/mod.ts';
import QRCode from 'npm:qrcode@1.5.3';

const SB_URL = Deno.env.get('SUPABASE_URL')!;
const sb = createClient(SB_URL, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, { auth: { persistSession: false } });
const TZ = '-05:00'; // Colombia (sin horario de verano)
const CORS = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type', 'Access-Control-Allow-Methods': 'POST, GET, OPTIONS' };
const json = (o: unknown, status = 200) => new Response(JSON.stringify(o), { status, headers: { ...CORS, 'Content-Type': 'application/json' } });

const pad = (n: number) => String(n).padStart(2, '0');
const esc = (s: unknown) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
const money = (n: number) => '$' + Number(n || 0).toLocaleString('es-CO', { maximumFractionDigits: 0 });
const hh = (h: number) => pad(h) + ':00';
const fechaLarga = (f: string) => new Date(`${f}T12:00:00${TZ}`).toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'America/Bogota' });
const startMs = (f: string, h: number) => Date.parse(`${f}T${pad(h)}:00:00${TZ}`);
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
// Los encabezados del correo (asunto, remitente) van SOLO en ASCII: la librería SMTP codifica mal tildes, "·" y emojis.
const ascii = (s: unknown) => String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^\x20-\x7E]/g, '').replace(/\s+/g, ' ').trim();
const DIAS_C = ['dom', 'lun', 'mar', 'mie', 'jue', 'vie', 'sab'], MESES_C = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
const fechaCorta = (f: string) => { const d = new Date(`${f}T12:00:00${TZ}`); return `${DIAS_C[d.getUTCDay()]} ${Number(f.slice(8, 10))} ${MESES_C[Number(f.slice(5, 7)) - 1]} ${f.slice(0, 4)}`; };
// deno-lint-ignore no-explicit-any
const nombreCancha = (r: any) => `${ascii(r.canchas?.nombre)}${r.sedes?.nombre ? ' (' + ascii(r.sedes.nombre) + ')' : ''}`;
const hoyBogota = (extraDias = 0) => new Date(Date.now() - 5 * 3600e3 + extraDias * 864e5).toISOString().slice(0, 10);

async function cfg(): Promise<Record<string, string>> {
  const { data } = await sb.from('ajustes').select('clave,valor');
  return Object.fromEntries((data ?? []).map((x: { clave: string; valor: string }) => [x.clave, x.valor]));
}
const appUrl = (c: Record<string, string>) => (c.app_url || Deno.env.get('APP_URL') || '').replace(/#.*$/, '');
const brandName = (c: Record<string, string>) => c.nombre_app || 'TuCancha';

async function sendMail(c: Record<string, string>, to: string, subject: string, html: string, text: string) {
  const user = Deno.env.get('GMAIL_USER') || 'glideappsnuevo2025@gmail.com';
  const pass = (Deno.env.get('GMAIL_APP_PASSWORD') || '').replace(/\s+/g, '');
  if (!pass) throw new Error('SMTP no configurado: falta el secreto GMAIL_APP_PASSWORD');
  const client = new SMTPClient({ connection: { hostname: 'smtp.gmail.com', port: 465, tls: true, auth: { username: user, password: pass } } });
  try { await client.send({ from: `"${ascii(brandName(c)).replace(/["<>]/g, '') || 'Reservas'}" <${user}>`, to, subject: ascii(subject), content: text, html }); }
  finally { try { await client.close(); } catch (_) { /* ignorar */ } }
}

/* ---------- Plantillas ---------- */
function layout(c: Record<string, string>, titulo: string, cuerpo: string) {
  return `<!DOCTYPE html><html lang="es"><body style="margin:0;background:#eef2fb;font-family:Arial,Helvetica,sans-serif;color:#0b1220">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#eef2fb;padding:24px 12px"><tr><td align="center">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden">
    <tr><td style="background:#060d1c;padding:22px 26px"><div style="font-size:20px;font-weight:800;color:#b8f22a">${esc(brandName(c))}</div></td></tr>
    <tr><td style="padding:26px"><h1 style="margin:0 0 14px;font-size:22px;color:#0b1220">${titulo}</h1>${cuerpo}</td></tr>
    <tr><td style="padding:16px 26px;background:#f5f7fc;color:#6b7896;font-size:12px">Este es un mensaje automático de ${esc(brandName(c))}. Si no reconoces esta reserva, ignora este correo.</td></tr>
  </table></td></tr></table></body></html>`;
}
const fila = (k: string, v: string) => `<tr><td style="padding:8px 0;color:#6b7896;font-size:14px;width:38%">${k}</td><td style="padding:8px 0;font-size:15px;font-weight:700;color:#0b1220">${v}</td></tr>`;
const boton = (href: string, txt: string) => `<p style="margin:22px 0"><a href="${esc(href)}" style="background:#b8f22a;color:#0b1b00;font-weight:800;text-decoration:none;padding:14px 26px;border-radius:12px;display:inline-block">${esc(txt)}</a></p>`;

// deno-lint-ignore no-explicit-any
function detalles(r: any) {
  const nombre = r.nombre_cliente || r.app_users?.nombre || 'cliente';
  const tabla = `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #e3e8f5;border-bottom:1px solid #e3e8f5;margin:10px 0">
    ${fila('Sede', esc(r.sedes?.nombre) + (r.sedes?.ciudad ? ' · ' + esc(r.sedes.ciudad) : ''))}
    ${fila('Cancha', esc(r.canchas?.nombre))}
    ${fila('Fecha', esc(cap(fechaLarga(r.fecha))))}
    ${fila('Hora', `${hh(r.hora)} a ${hh(r.hora + 1)}`)}
    ${fila('Valor', `${money(r.canchas?.precio_hora)} <span style="font-weight:400;color:#6b7896;font-size:12px">(se paga en taquilla)</span>`)}
    ${fila('Código', esc(String(r.id).slice(0, 8).toUpperCase()))}
  </table>`;
  return { nombre, tabla };
}
const qrImg = (r: { qr_token: string }) => `<div style="text-align:center;margin:18px 0"><img src="${SB_URL}/functions/v1/correos?qr=${r.qr_token}" width="200" height="200" alt="Código QR de tu reserva" style="border:1px solid #e3e8f5;border-radius:12px;padding:8px;background:#fff"><div style="color:#6b7896;font-size:12px;margin-top:6px">Muestra este código al administrador al llegar</div></div>`;
const RESERVA_SELECT = '*, canchas(nombre,precio_hora), sedes(nombre,ciudad), app_users(nombre,correo)';

/* ---------- Acciones ---------- */
// deno-lint-ignore no-explicit-any
async function confirmacion(body: any) {
  const { data: r } = await sb.from('reservas').select(RESERVA_SELECT).eq('id', body.reserva_id).maybeSingle();
  if (!r) return { ok: false, motivo: 'Reserva no encontrada' };
  if (r.estado !== 'confirmada') return { ok: false, motivo: 'La reserva no está activa' };
  const to = r.correo_cliente || r.app_users?.correo;
  if (!to) return { ok: false, motivo: 'Esta reserva no tiene un correo asociado' };
  if (r.conf_enviada && !body.reenviar) return { ok: true, ya_enviado: true };
  const c = await cfg(), { nombre, tabla } = detalles(r), url = appUrl(c);
  const html = layout(c, 'Tu reserva está confirmada ✅', `<p style="font-size:15px;line-height:1.5">Hola <b>${esc(nombre)}</b>, estos son los detalles de tu reserva:</p>${tabla}${qrImg(r)}
    <p style="font-size:14px;line-height:1.5;color:#3b4763">Al llegar, el administrador puede <b>escanear este QR</b> para iniciar el conteo de tu tiempo de juego (es opcional: también puede iniciarlo manualmente). Te enviaremos un recordatorio 10 minutos antes.</p>${url ? boton(url, 'Abrir la aplicación') : ''}`);
  const text = `Tu reserva está confirmada\n\nSede: ${r.sedes?.nombre}\nCancha: ${r.canchas?.nombre}\nFecha: ${cap(fechaLarga(r.fecha))}\nHora: ${hh(r.hora)} a ${hh(r.hora + 1)}\nCódigo: ${String(r.id).slice(0, 8).toUpperCase()}\n\nMuestra el código QR al administrador al llegar.`;
  const asunto = `Reserva confirmada - ${nombreCancha(r)} - ${fechaCorta(r.fecha)}, ${hh(r.hora)}`;
  await sendMail(c, to, asunto, html, text);
  await sb.from('reservas').update({ conf_enviada: true }).eq('id', r.id);
  return { ok: true, asunto: ascii(asunto) };
}

async function recordatorios() {
  const { data } = await sb.from('reservas').select(RESERVA_SELECT).eq('estado', 'confirmada').eq('recordatorio_enviado', false).gte('fecha', hoyBogota(-1)).lte('fecha', hoyBogota(1));
  const c = await cfg(), url = appUrl(c), now = Date.now(); let enviados = 0, omitidos = 0; const errores: string[] = [];
  for (const r of data ?? []) {
    const start = startMs(r.fecha, r.hora), mins = (start - now) / 60000;
    if (mins > 10.5) continue;                                   // todavía falta
    const to = r.correo_cliente || r.app_users?.correo;
    const tarde = mins <= 0 || Date.parse(r.created_at) > start - 10 * 60000;  // ya empezó, o se reservó con menos de 10 min
    if (!to || tarde) { await sb.from('reservas').update({ recordatorio_enviado: true }).eq('id', r.id); omitidos++; continue; }
    try {
      const { nombre, tabla } = detalles(r);
      const html = layout(c, '⏰ Tu reserva empieza en 10 minutos', `<p style="font-size:15px;line-height:1.5">Hola <b>${esc(nombre)}</b>, te recordamos tu reserva de hoy:</p>${tabla}${qrImg(r)}${url ? boton(url, 'Abrir la aplicación') : ''}`);
      await sendMail(c, to, `Recordatorio: tu reserva empieza en 10 minutos - ${nombreCancha(r)} - ${hh(r.hora)}`, html, `Tu reserva empieza en 10 minutos.\n\nSede: ${r.sedes?.nombre}\nCancha: ${r.canchas?.nombre}\nFecha: ${cap(fechaLarga(r.fecha))}\nHora: ${hh(r.hora)} a ${hh(r.hora + 1)}`);
      await sb.from('reservas').update({ recordatorio_enviado: true }).eq('id', r.id); enviados++;
    } catch (e) { errores.push(`${r.id}: ${(e as Error).message}`); }   // se reintenta en el siguiente minuto
  }
  return { ok: true, enviados, omitidos, errores };
}

// deno-lint-ignore no-explicit-any
async function espera(body: any) {
  const { court_id, fecha, hora } = body;
  if (!court_id || !fecha || hora == null) return { ok: false, motivo: 'Faltan datos' };
  if (startMs(fecha, hora) <= Date.now()) return { ok: true, enviados: 0, motivo: 'El horario ya pasó' };
  const { data: ocupada } = await sb.from('reservas').select('id').eq('court_id', court_id).eq('fecha', fecha).eq('hora', hora).eq('estado', 'confirmada').limit(1);
  if (ocupada?.length) return { ok: true, enviados: 0, motivo: 'La cancha sigue ocupada' };
  const { data: cancha } = await sb.from('canchas').select('nombre,precio_hora,sedes(nombre,ciudad)').eq('id', court_id).single();
  const { data: lista } = await sb.from('lista_espera').select('*').eq('court_id', court_id).eq('fecha', fecha).eq('hora', hora).eq('estado', 'esperando').order('created_at');
  const c = await cfg(), url = appUrl(c); let enviados = 0; const errores: string[] = [];
  for (const e of lista ?? []) {
    try {
      // deno-lint-ignore no-explicit-any
      const sede = (cancha as any)?.sedes;
      const tabla = `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #e3e8f5;border-bottom:1px solid #e3e8f5;margin:10px 0">
        ${fila('Sede', esc(sede?.nombre) + (sede?.ciudad ? ' · ' + esc(sede.ciudad) : ''))}${fila('Cancha', esc(cancha?.nombre))}
        ${fila('Fecha', esc(cap(fechaLarga(fecha))))}${fila('Hora', `${hh(hora)} a ${hh(hora + 1)}`)}${fila('Valor', money(cancha?.precio_hora ?? 0))}</table>`;
      const link = url ? `${url}#/tomar/${e.token}` : '';
      const html = layout(c, '🎾 ¡Se liberó una cancha!', `<p style="font-size:15px;line-height:1.5">Hola${e.nombre ? ` <b>${esc(e.nombre)}</b>` : ''}, estabas en la lista de espera y <b>se liberó</b> este horario:</p>${tabla}
        <p style="font-size:14px;line-height:1.5;color:#3b4763">La reserva es para quien la tome primero. Pulsa el botón para ver el horario y confirmar si deseas tomarla.</p>${link ? boton(link, 'Ver y tomar la reserva') : '<p style="color:#b3261e">El administrador aún no configuró la dirección de la aplicación.</p>'}`);
      const nom = `${ascii(cancha?.nombre)}${sede?.nombre ? ' (' + ascii(sede.nombre) + ')' : ''}`;
      await sendMail(c, e.correo, `Se libero una cancha - ${nom} - ${fechaCorta(fecha)}, ${hh(hora)}`, html, `Se liberó ${cancha?.nombre}${sede?.nombre ? ' (' + sede.nombre + ')' : ''} el ${fechaLarga(fecha)} a las ${hh(hora)}.\n\nToma la reserva aquí: ${link}`);
      await sb.from('lista_espera').update({ estado: 'notificado', notificado_at: new Date().toISOString() }).eq('id', e.id); enviados++;
    } catch (err) { errores.push(`${e.correo}: ${(err as Error).message}`); }
  }
  return { ok: true, enviados, errores };
}

async function estado() {
  const c = await cfg();
  return { ok: true, smtp_configurado: !!(Deno.env.get('GMAIL_APP_PASSWORD') || '').replace(/\s+/g, ''), remitente: Deno.env.get('GMAIL_USER') || 'glideappsnuevo2025@gmail.com', app_url: appUrl(c) || null };
}

/* ---------- Servidor ---------- */
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  const url = new URL(req.url);
  try {
    const qr = url.searchParams.get('qr');
    if (req.method === 'GET' && qr) {
      if (!/^[0-9a-f-]{36}$/i.test(qr)) return new Response('bad token', { status: 400, headers: CORS });
      const { data: r } = await sb.from('reservas').select('qr_token').eq('qr_token', qr).maybeSingle();
      if (!r) return new Response('not found', { status: 404, headers: CORS });
      const base = appUrl(await cfg());
      const png: Uint8Array = await QRCode.toBuffer(base ? `${base}#/checkin/${qr}` : `PADEL:${qr}`, { type: 'png', width: 400, margin: 2, errorCorrectionLevel: 'M' });
      return new Response(png, { headers: { ...CORS, 'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=86400' } });
    }
    if (req.method !== 'POST') return json({ ok: false, motivo: 'Método no permitido' }, 405);
    const body = await req.json().catch(() => ({}));
    switch (body.accion) {
      case 'confirmacion': return json(await confirmacion(body));
      case 'recordatorios': return json(await recordatorios());
      case 'espera': return json(await espera(body));
      case 'estado': return json(await estado());
      default: return json({ ok: false, motivo: 'Acción desconocida' }, 400);
    }
  } catch (e) {
    return json({ ok: false, motivo: (e as Error).message }, 200);
  }
});
