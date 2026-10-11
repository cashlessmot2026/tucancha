// Edge Function "push": envía notificaciones push web (celular/PC) cuando nace una fila en `notificaciones`.
//   POST {notif_id}        -> envía esa notificación a todos los dispositivos suscritos de su usuario
//   POST {accion:'estado'} -> diagnóstico
// Secretos: VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT.  La llama el trigger notif_push (pg_net).
import webpush from 'npm:web-push@3.6.7';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';

// Prefiere TUCANCHA_<NOMBRE>; si no existe usa <NOMBRE> (el proyecto comparte secretos con otras apps)
const envT = (n: string) => Deno.env.get('TUCANCHA_' + n) || Deno.env.get(n);
const sb = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, { auth: { persistSession: false } });
const PUB = envT('VAPID_PUBLIC_KEY') || '', PRIV = envT('VAPID_PRIVATE_KEY') || '';
if (PUB && PRIV) webpush.setVapidDetails(envT('VAPID_SUBJECT') || 'mailto:eduth4846@gmail.com', PUB, PRIV);
const CORS = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type', 'Access-Control-Allow-Methods': 'POST, OPTIONS' };
const json = (o: unknown) => new Response(JSON.stringify(o), { headers: { ...CORS, 'Content-Type': 'application/json' } });
const TITULOS: Record<string, string> = { reserva_nueva: '🆕 Reserva nueva', reserva_cancelada: '❌ Reserva cancelada', pago: '💳 Pago por aprobar', recarga: '💰 Recarga registrada', reto: '⚔️ Reto', publicidad: '📣 Nuevo aviso', marcador: '🎾 Marcador' };
const sinEmoji = (s: string) => String(s || '').replace(/^[^\p{L}\p{N}]+/u, '').trim();

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  try {
    if (!PUB || !PRIV) return json({ ok: false, motivo: 'Faltan los secretos VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY' });
    const body = await req.json().catch(() => ({}));
    if (body.accion === 'estado') {
      const { count } = await sb.from('push_subs').select('id', { count: 'exact', head: true });
      return json({ ok: true, clave_publica: PUB, dispositivos_suscritos: count ?? 0 });
    }
    const { data: n } = await sb.from('notificaciones').select('id,user_id,texto,tipo').eq('id', body.notif_id).maybeSingle();
    if (!n) return json({ ok: false, motivo: 'Notificación no encontrada' });
    const { data: subs } = await sb.from('push_subs').select('id,endpoint,p256dh,auth').eq('user_id', n.user_id);
    if (!subs?.length) return json({ ok: true, enviados: 0, motivo: 'Sin dispositivos suscritos' });
    const { data: aj } = await sb.from('ajustes').select('valor').eq('clave', 'app_url').maybeSingle();
    const app = (aj?.valor || '').replace(/#.*$/, '');
    // El marcador de un mismo jugador reemplaza el aviso anterior (mismo "tag") en vez de amontonarse: así el
    // reloj/celular siempre muestra el último resultado y no se llena de avisos, uno por cada juego ganado.
    const payload = JSON.stringify({
      title: TITULOS[n.tipo] || '🔔 Notificación', body: sinEmoji(n.texto),
      tag: n.tipo === 'marcador' ? 'marcador-' + n.user_id : 'n-' + n.id,
      tipo: n.tipo === 'reto' ? 'pago' : (n.tipo || null),   // los retos también se quedan en pantalla hasta tocarlos
      url: app || './', icon: app ? new URL('icon-192.png', app).href : 'icon-192.png',
    });
    let enviados = 0, quitados = 0; const errores: string[] = [];
    await Promise.all(subs.map(async (s) => {
      try { await webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, payload, { TTL: 86400, urgency: 'high' }); enviados++; }
      catch (e) {
        // deno-lint-ignore no-explicit-any
        const code = (e as any).statusCode;
        if (code === 404 || code === 410) { await sb.from('push_subs').delete().eq('id', s.id); quitados++; }   // el dispositivo ya no existe
        // deno-lint-ignore no-explicit-any
        else errores.push(`${code ?? ''} ${String((e as any).body || (e as Error).message).slice(0, 140)}`);
      }
    }));
    return json({ ok: true, enviados, quitados, errores });
  } catch (e) { return json({ ok: false, motivo: (e as Error).message }); }
});
