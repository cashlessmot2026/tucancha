const fs = require('fs');
const html = fs.readFileSync('C:/Users/victo/OneDrive/Desktop/padel/index.html', 'utf8');
const js = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].pop()[1];
const a = js.indexOf('/*AG-NLU-START*/'), b = js.indexOf('/*AG-NLU-END*/');
if (a < 0 || b < 0) throw new Error('no se encontró el bloque NLU');
eval(js.slice(a, b) + ';globalThis.parseReserva=parseReserva;globalThis.agYesNo=agYesNo;');

const sedes = [{ id: 'S1', nombre: 'Sede Principal', ciudad: '', apertura: 8, cierre: 23 }, { id: 'S2', nombre: 'sede 2 · santa marta', ciudad: '', apertura: 8, cierre: 23 }];
const courts = [{ id: 'C1', sede_id: 'S1', nombre: 'Pista 1' }, { id: 'C2', sede_id: 'S1', nombre: 'Pista 2' }, { id: 'C3', sede_id: 'S2', nombre: 'cancha 1' }, { id: 'C4', sede_id: 'S2', nombre: 'cancha2' }];
const now = new Date(2026, 8, 21, 10, 0, 0);          // lunes 21 sep 2026, 10:00
const ctx = { now, sedes, courts, sedeId: 'S1' };
let fails = 0;
const T = (frase, esp) => {
  const r = parseReserva(frase, ctx), got = { fecha: r.fecha, hora: r.hora, opts: r.horaOpts && r.horaOpts.join('/'), sede: r.sedeId, cancha: r.courtId, red: r.redondeo || undefined };
  const bad = Object.entries(esp).filter(([k, v]) => String(got[k] ?? null) !== String(v ?? null));
  if (bad.length) { fails++; console.log('✘', JSON.stringify(frase), '\n    esperado', JSON.stringify(esp), '\n    obtuvo  ', JSON.stringify(got)); } else console.log('✔', JSON.stringify(frase));
};
T('quiero reservar mañana a las 7 de la noche', { fecha: '2026-09-22', hora: 19 });
T('reserva pasado mañana a las ocho de la mañana', { fecha: '2026-09-23', hora: 8 });
T('el viernes a las 6 pm', { fecha: '2026-09-25', hora: 18 });
T('hoy a las 9', { fecha: '2026-09-21', hora: null, opts: '9/21' });
T('el sábado a las siete y media de la noche', { fecha: '2026-09-26', hora: 19, red: true });
T('para el 25 de septiembre a las 20:00', { fecha: '2026-09-25', hora: 20 });
T('mañana en la mañana a las 10', { fecha: '2026-09-22', hora: 10 });
T('esta noche a las 8', { fecha: '2026-09-21', hora: 20 });
T('dentro de 3 días a las 5 de la tarde', { fecha: '2026-09-24', hora: 17 });
T('lunes a las 7 de la noche', { fecha: '2026-09-28', hora: 19 });
T('el 30 a las 6 pm', { fecha: '2026-09-30', hora: 18 });
T('el 10 a las 6 pm', { fecha: '2026-10-10', hora: 18 });
T('a las 3 de la tarde', { fecha: null, hora: 15 });
T('mañana a la una de la tarde', { fecha: '2026-09-22', hora: 13 });
T('mañana a las ocho menos cuarto de la noche', { fecha: '2026-09-22', hora: 19, red: true });
T('el próximo miércoles a las 19:30', { fecha: '2026-09-23', hora: 19, red: true });
T('sede principal mañana 7 de la noche', { fecha: '2026-09-22', hora: 19, sede: 'S1' });
T('pista 2 mañana a las 6 pm', { fecha: '2026-09-22', hora: 18, cancha: 'C2' });
T('en la sede 2 cancha 1 mañana a las 5 pm', { fecha: '2026-09-22', hora: 17, sede: 'S2', cancha: 'C3' });
T('el domingo a las 4 de la tarde', { fecha: '2026-09-27', hora: 16 });
T('mañana a las 12 del mediodía', { fecha: '2026-09-22', hora: 12 });
T('hoy a las 7 pm por favor', { fecha: '2026-09-21', hora: 19 });
T('quiero una cancha el 25 de septiembre a las 6 de la tarde', { fecha: '2026-09-25', hora: 18 });
T('a las 18:00', { fecha: null, hora: 18 });
T('este lunes a las 8 de la noche', { fecha: '2026-09-21', hora: 20 });
T('mañana a las 7', { fecha: '2026-09-22', hora: 19 });
T('hola buenas', { fecha: null, hora: null });
T('el 25', { fecha: '2026-09-25', hora: null });
T('a las 10', { fecha: null, hora: null, opts: '10/22' });
T('en una semana a las 6 de la tarde', { fecha: '2026-09-28', hora: 18 });
console.log('--- sí / no ---');
for (const [f, e] of [['sí', 'si'], ['sí.', 'si'], ['Sí, reserva la', 'si'], ['dale', 'si'], ['confirmo', 'si'], ['claro que sí', 'si'], ['eh sí quiero', 'si'], ['pues sí, confírmala', 'si'], ['está bien', 'si'], ['sí por favor', 'si'], ['listo', 'si'], ['no', 'no'], ['No.', 'no'], ['no gracias', 'no'], ['mejor no', 'no'], ['otra opción', 'no'], ['siguiente', 'no'], ['pues no', 'no'], ['eh no, gracias', 'no'], ['no, mejor otro día', 'no'], ['no quiero', 'no'], ['no sí', 'no'], ['sí no', 'si'], ['hola', null], ['mañana a las 7', null]]) {
  const g = agYesNo(f); if (g !== e) { fails++; console.log('✘', f, 'esperado', e, 'obtuvo', g); } else console.log('✔', JSON.stringify(f), '->', g);
}
console.log('--- despedida (ya no quiere reservar) ---');
eval(js.slice(a, js.indexOf('/*AG-NLU-END*/')) + ';globalThis.agQuit=agQuit;');
for (const [f, e] of [['ya no quiero reservar', true], ['ya no voy a reservar', true], ['olvídalo', true], ['no quiero reservar', true], ['déjalo así', true], ['no voy a reservar', true], ['cancela todo', true], ['adiós', true], ['hasta luego', true], ['gracias, ya no', true],
  ['no', false], ['no gracias', false], ['otra opción', false], ['mañana a las 7', false], ['sí', false], ['el viernes', false], ['no voy a poder mañana, mejor el viernes', false]]) {
  const g = agQuit(f); if (g !== e) { fails++; console.log('✘', JSON.stringify(f), 'esperado', e, 'obtuvo', g); } else console.log('✔', JSON.stringify(f), '->', g);
}
console.log('--- cancelar reserva ---');
eval(js.slice(a, js.indexOf('/*AG-NLU-END*/')) + ';globalThis.agWantsCancel=agWantsCancel;');
for (const [f, e] of [['cancela mi reserva de las 7 de la noche en la sede principal', true], ['quiero cancelar la reserva', true], ['anula mi reserva del jueves', true], ['elimina mi reserva', true], ['cancelar reserva de mañana a las 6 pm', true], ['borra la reserva', true],
  ['reserva mañana a las 7', false], ['cancelar', false], ['no', false], ['quiero una cancha el viernes', false], ['sí', false]]) {
  const g = agWantsCancel(f); if (g !== e) { fails++; console.log('✘', JSON.stringify(f), 'esperado', e, 'obtuvo', g); } else console.log('✔', JSON.stringify(f), '->', g);
}
// lo que el asistente extrae de la frase de cancelar (sede + hora + día)
T('cancela mi reserva de las 7 de la noche en la sede principal', { hora: 19, sede: 'S1' });
T('cancela mi reserva del jueves a las 6 pm en la sede 2', { fecha: '2026-09-24', hora: 18, sede: 'S2' });
T('quiero cancelar la reserva de mañana a las 5 de la tarde', { fecha: '2026-09-22', hora: 17 });
console.log(fails ? `\n${fails} FALLOS` : '\nTODO OK');
process.exit(fails ? 1 : 0);
