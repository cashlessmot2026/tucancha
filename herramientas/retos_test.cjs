// Prueba de la lógica de retos y apuestas (vía las mismas funciones que usa la app). Restaura saldos y borra lo creado.
const TOK = process.env.SB_TOKEN;
const U = 'https://oshhdrnkegmhnasgwbpg.supabase.co';
const K = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zaGhkcm5rZWdtaG5hc2d3YnBnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk5MzA4MTEsImV4cCI6MjEwNTUwNjgxMX0.Zvzx47E1emgtyTyUQH6mQEqBm_9u8kNgqkSP2_bAims';
const sql = async q => { const r = await (await fetch('https://api.supabase.com/v1/projects/oshhdrnkegmhnasgwbpg/database/query', { method: 'POST', headers: { Authorization: 'Bearer ' + TOK, 'Content-Type': 'application/json' }, body: JSON.stringify({ query: q }) })).json(); if (r && r.message) throw new Error(r.message); return r; };
const rpc = async (n, b) => { const r = await fetch(U + '/rest/v1/rpc/' + n, { method: 'POST', headers: { apikey: K, Authorization: 'Bearer ' + K, 'Content-Type': 'application/json' }, body: JSON.stringify(b) }); const t = await r.text(); let j; try { j = JSON.parse(t); } catch (_) { j = t; } return { ok: r.ok, j }; };
let fails = 0; const ok = (c, m) => { console.log(c ? '✔' : '✘', m); if (!c) fails++; };
const msg = x => (x.j && x.j.message) || String(x.j);
(async () => {
  const t0 = (await sql(`select now()::text t`))[0].t;
  const ps = await sql(`select id, nombre, wallet from app_users where role='jugador' order by created_at limit 2`);
  const [A, B] = ps, orig = Object.fromEntries(ps.map(p => [p.id, p.wallet]));
  const wal = async id => Number((await sql(`select wallet from app_users where id='${id}'`))[0].wallet);
  const setW = async (id, v) => sql(`update app_users set wallet=${v} where id='${id}'`);
  try {
    const c = (await sql(`select c.id, s.apertura, s.cierre from canchas c join sedes s on s.id=c.sede_id where c.activa and s.activa order by s.nombre limit 1`))[0];
    const fecha = (await sql(`select ((now() at time zone 'America/Bogota')::date + 5)::text f`))[0].f, H = Math.min(c.cierre - 1, c.apertura + 3);
    await setW(A.id, 30000); await setW(B.id, 30000);
    console.log(`Jugadores: ${A.nombre} (retador) y ${B.nombre} (retado) · cancha ${c.id.slice(0, 8)} · ${fecha} ${H}:00\n`);
    // ---- validaciones al crear ----
    let r = await rpc('reto_crear', { p_retador: A.id, p_retado: A.id, p_court: c.id, p_fecha: fecha, p_hora: H }); ok(!r.ok && /ti mismo/.test(msg(r)), 'no se puede retar a sí mismo');
    r = await rpc('reto_crear', { p_retador: A.id, p_retado: B.id, p_court: c.id, p_fecha: '2020-01-01', p_hora: H }); ok(!r.ok && /ya pasó/.test(msg(r)), 'no acepta un horario pasado');
    r = await rpc('reto_crear', { p_retador: A.id, p_retado: B.id, p_court: c.id, p_fecha: fecha, p_hora: c.cierre + 0 }); ok(!r.ok && /fuera del horario/.test(msg(r)), 'no acepta una hora fuera del horario de la sede');
    // ---- reto feliz ----
    r = await rpc('reto_crear', { p_retador: A.id, p_retado: B.id, p_court: c.id, p_fecha: fecha, p_hora: H, p_msg: 'revancha' }); ok(r.ok && typeof r.j === 'string', 'reto creado'); const R1 = r.j;
    r = await rpc('reto_crear', { p_retador: A.id, p_retado: B.id, p_court: c.id, p_fecha: fecha, p_hora: H }); ok(!r.ok && /Ya le enviaste/.test(msg(r)), 'no permite enviar el mismo reto dos veces');
    let n = await sql(`select tipo, texto, voz from notificaciones where user_id='${B.id}' and reto_id='${R1}'`); ok(n.length === 1 && n[0].tipo === 'reto' && /te retó a jugar/.test(n[0].texto), 'el retado recibe la notificación: «' + (n[0] && n[0].texto) + '»');
    r = await rpc('reto_responder', { p_reto: R1, p_user: A.id, p_acepta: true }); ok(!r.ok && /Solo el jugador retado/.test(msg(r)), 'el retador NO puede aceptar su propio reto');
    r = await rpc('reto_responder', { p_reto: R1, p_user: B.id, p_acepta: true }); ok(r.ok && r.j.ok && r.j.estado === 'aceptado', 'el retado acepta');
    const res = await sql(`select r.estado, r.user_id from reservas r join retos t on t.reserva_id=r.id where t.id='${R1}'`); ok(res.length === 1 && res[0].estado === 'confirmada' && res[0].user_id === A.id, 'al aceptar se reservó la cancha (a nombre del retador)');
    r = await rpc('reto_responder', { p_reto: R1, p_user: B.id, p_acepta: true }); ok(r.ok && r.j.motivo === 'cerrado', 'no se puede aceptar dos veces');
    n = await sql(`select texto from notificaciones where user_id='${A.id}' and reto_id='${R1}'`); ok(n.some(x => /aceptó tu reto/.test(x.texto)), 'el retador recibe «aceptó tu reto»');
    // ---- apuesta ----
    r = await rpc('reto_apuesta', { p_reto: R1, p_user: A.id, p_monto: 99999999 }); ok(!r.ok && /alcanza|no válido/.test(msg(r)), 'no permite apostar más de lo que tiene / monto absurdo');
    r = await rpc('reto_apuesta', { p_reto: R1, p_user: A.id, p_monto: 10000 }); ok(r.ok, 'el retador propone apostar $10.000');
    r = await rpc('reto_confirmar_apuesta', { p_reto: R1, p_user: A.id }); ok(!r.ok && /el otro jugador/.test(msg(r)), 'quien propone NO puede confirmar su propia apuesta');
    ok(await wal(A.id) === 30000 && await wal(B.id) === 30000, 'mientras no se confirma, nadie pierde dinero');
    r = await rpc('reto_confirmar_apuesta', { p_reto: R1, p_user: B.id }); ok(r.ok, 'el retado confirma la apuesta');
    ok(await wal(A.id) === 20000 && await wal(B.id) === 20000, 'se retuvieron $10.000 de cada uno (saldos 20.000 / 20.000)');
    const tx = await sql(`select tipo from wallet_tx where created_at >= '${t0}' and user_id in ('${A.id}','${B.id}') and tipo='apuesta'`); ok(tx.length === 2, 'quedaron 2 movimientos «apuesta» en el historial de wallet');
    r = await rpc('reto_apuesta', { p_reto: R1, p_user: B.id, p_monto: 5000 }); ok(!r.ok && /ya está confirmada/.test(msg(r)), 'con la apuesta confirmada ya no se puede cambiar');
    // ---- jugar y pagar ----
    r = await rpc('reto_iniciar', { p_reto: R1 }); ok(r.ok && typeof r.j === 'string', 'el admin crea el marcador del reto'); const M1 = r.j;
    const m = (await sql(`select equipo1, equipo2, reto_id from matches where id='${M1}'`))[0]; ok(m.equipo1[0].id === A.id && m.equipo2[0].id === B.id && m.reto_id === R1, 'marcador: equipo 1 = retador, equipo 2 = retado, ligado al reto');
    r = await rpc('reto_cancelar', { p_reto: R1, p_user: A.id }); ok(!r.ok && /ya no se puede cancelar/.test(msg(r)), 'un reto en juego ya no se puede cancelar');
    await sql(`update matches set status='finalizado', ganador=1, fin=now() where id='${M1}'`);        // gana el equipo 2 = el retado (B)
    ok(await wal(B.id) === 40000 && await wal(A.id) === 20000, 'AL TERMINAR: el ganador (retado) recibió $20.000 → 40.000; el perdedor queda en 20.000');
    let rr = (await sql(`select estado, ganador_id, pagado_at is not null as pagado from retos where id='${R1}'`))[0]; ok(rr.estado === 'finalizado' && rr.ganador_id === B.id && rr.pagado, 'el reto quedó finalizado, con ganador y fecha de pago');
    const pr = await sql(`select tipo, monto from wallet_tx where created_at >= '${t0}' and user_id='${B.id}' and tipo='premio'`); ok(pr.length === 1 && Number(pr[0].monto) === 20000, 'un solo movimiento «premio» de $20.000');
    await sql(`update matches set status='finalizado', ganador=0 where id='${M1}'`);                    // repetir la actualización no debe pagar de nuevo
    ok(await wal(B.id) === 40000 && await wal(A.id) === 20000, 'no se paga dos veces aunque el marcador se actualice otra vez');
    n = await sql(`select user_id, texto from notificaciones where reto_id='${R1}' and texto like '%Ganaste%' or (reto_id='${R1}' and texto like '%ganó el reto%')`); ok(n.length === 2, 'ambos reciben aviso del resultado: «' + n.map(x => x.texto).join(' | ').slice(0, 130) + '»');
    // ---- cancelar con apuesta retenida ----
    const H2 = H + 1 < c.cierre ? H + 1 : H - 1;
    let R2 = (await rpc('reto_crear', { p_retador: B.id, p_retado: A.id, p_court: c.id, p_fecha: fecha, p_hora: H2 })).j;
    await rpc('reto_responder', { p_reto: R2, p_user: A.id, p_acepta: true }); await rpc('reto_apuesta', { p_reto: R2, p_user: B.id, p_monto: 15000 }); await rpc('reto_confirmar_apuesta', { p_reto: R2, p_user: A.id });
    ok(await wal(A.id) === 5000 && await wal(B.id) === 25000, 'segundo reto: apuesta de $15.000 retenida (A 5.000 · B 25.000)');
    r = await rpc('reto_cancelar', { p_reto: R2, p_user: A.id }); ok(r.ok, 'uno de los dos cancela el reto');
    ok(await wal(A.id) === 20000 && await wal(B.id) === 40000, 'se devolvió la apuesta a los DOS jugadores (20.000 / 40.000)');
    ok((await sql(`select r.estado from reservas r join retos t on t.reserva_id=r.id where t.id='${R2}'`))[0].estado === 'cancelada', 'la reserva de la cancha también se canceló');
    // ---- saldo insuficiente: todo o nada ----
    await setW(A.id, 3000); await setW(B.id, 30000);
    const H3 = Math.min(c.cierre - 1, c.apertura + 6);
    let R3 = (await rpc('reto_crear', { p_retador: B.id, p_retado: A.id, p_court: c.id, p_fecha: fecha, p_hora: H2 })).j;
    if (typeof R3 !== 'string') throw new Error('no se pudo crear el reto 3: ' + msg({ j: R3 }));
    await rpc('reto_responder', { p_reto: R3, p_user: A.id, p_acepta: true });
    r = await rpc('reto_apuesta', { p_reto: R3, p_user: A.id, p_monto: 10000 }); ok(!r.ok && /alcanza/.test(msg(r)), 'quien no tiene saldo no puede proponer esa apuesta');
    await rpc('reto_apuesta', { p_reto: R3, p_user: B.id, p_monto: 10000 });
    r = await rpc('reto_confirmar_apuesta', { p_reto: R3, p_user: A.id }); ok(!r.ok && /Saldo insuficiente/.test(msg(r)), 'si el otro no tiene saldo al confirmar, se rechaza');
    ok(await wal(A.id) === 3000 && await wal(B.id) === 30000, 'TODO O NADA: no se le descontó a nadie (3.000 / 30.000)');
    // ---- el admin libera la cancha ----
    await setW(A.id, 30000);
    await rpc('reto_apuesta', { p_reto: R3, p_user: B.id, p_monto: 10000 }); await rpc('reto_confirmar_apuesta', { p_reto: R3, p_user: A.id });
    ok(await wal(A.id) === 20000 && await wal(B.id) === 20000, 'tercer reto con apuesta retenida');
    await sql(`update reservas set estado='cancelada' where id=(select reserva_id from retos where id='${R3}')`);
    ok(await wal(A.id) === 30000 && await wal(B.id) === 30000 && (await sql(`select estado from retos where id='${R3}'`))[0].estado === 'cancelado', 'si el admin cancela la reserva → el reto se cancela y se devuelve el dinero a ambos');
    // ---- sin apuesta ----
    let R4 = (await rpc('reto_crear', { p_retador: A.id, p_retado: B.id, p_court: c.id, p_fecha: fecha, p_hora: H2 })).j;
    if (typeof R4 !== 'string') throw new Error('no se pudo crear el reto 4: ' + msg({ j: R4 }));
    await rpc('reto_responder', { p_reto: R4, p_user: B.id, p_acepta: true });
    const M4 = (await rpc('reto_iniciar', { p_reto: R4 })).j; await sql(`update matches set status='finalizado', ganador=0 where id='${M4}'`);
    ok(await wal(A.id) === 30000 && await wal(B.id) === 30000 && (await sql(`select estado, ganador_id from retos where id='${R4}'`))[0].ganador_id === A.id, 'reto SIN apuesta: se juega y se registra el ganador, sin mover dinero');
    // ---- rechazar ----
    let R5 = (await rpc('reto_crear', { p_retador: A.id, p_retado: B.id, p_court: c.id, p_fecha: fecha, p_hora: H3 })).j;
    if (typeof R5 !== 'string') throw new Error('no se pudo crear el reto 5: ' + msg({ j: R5 }));
    r = await rpc('reto_responder', { p_reto: R5, p_user: B.id, p_acepta: false }); ok(r.ok && r.j.estado === 'rechazado', 'el retado puede rechazar');
    ok((await sql(`select count(*) c from reservas r join retos t on t.reserva_id=r.id where t.id='${R5}'`))[0].c == 0, 'al rechazar no se reserva ninguna cancha');
  } catch (e) { console.log('ERROR', e.message); fails++; }
  finally {
    await sql(`delete from matches where reto_id in (select id from retos where created_at >= '${t0}')`);
    await sql(`delete from retos where created_at >= '${t0}'`);
    await sql(`delete from notificaciones where created_at >= '${t0}'`);
    await sql(`delete from reservas where created_at >= '${t0}'`);
    await sql(`delete from wallet_tx where created_at >= '${t0}' and user_id in ('${ps.map(p => p.id).join("','")}')`);
    for (const id in orig) await sql(`update app_users set wallet=${orig[id]} where id='${id}'`);
    const chk = await sql(`select (select count(*) from retos where created_at >= '${t0}') retos, (select count(*) from notificaciones where created_at >= '${t0}') notif, (select count(*) from reservas where created_at >= '${t0}') reservas, (select count(*) from wallet_tx where created_at >= '${t0}') tx, (select json_agg(wallet) from app_users where id in ('${ps.map(p => p.id).join("','")}')) saldos`);
    console.log('\nlimpieza ->', JSON.stringify(chk[0]), '· saldos originales:', JSON.stringify(Object.values(orig)));
    console.log(fails ? `\n${fails} FALLOS` : '\nTODO OK');
  }
})();
