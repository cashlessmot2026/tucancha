const fs = require('fs');
const d = __dirname;
const h = fs.readFileSync('C:/Users/victo/OneDrive/Desktop/padel/index.html', 'utf8');
const ms = [...h.matchAll(/<script>([\s\S]*?)<\/script>/g)];
const js = ms[ms.length - 1][1];
fs.writeFileSync(d + '/app.js', js);
const css = h.match(/<style>([\s\S]*?)<\/style>/)[1];
const a = js.indexOf('/* ---------- ESTAD');
const b = js.indexOf('/* --- Datos y vista --- */');
if (a < 0 || b < 0) throw new Error('no se encontraron los marcadores');
const chart = js.slice(a, b);

const stub = `
const $=(s,el=document)=>el.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const pad=n=>String(n).padStart(2,'0');
const money=n=>'$'+Number(n||0).toLocaleString('es-CO',{maximumFractionDigits:0});
const hh=h=>pad(h)+':00';
const METODOS={efectivo:'Efectivo',transferencia:'Transferencia',datafono:'Datáfono',pasarela:'Pasarela de pago'};
`;

const sample = `
const months=['2026-04','2026-05','2026-06','2026-07','2026-08','2026-09'];
const labels=months.map(k=>monthShort(k,false)), titles=months.map(monthName);
const ing=[4200000,5100000,4800000,6900000,7400000,8600000], eg=[3900000,4300000,5200000,5600000,6100000,6400000];
const met=[[1800000,2000000,1900000,2600000,2800000,3300000],[1500000,1900000,1600000,2500000,2700000,3100000],[700000,900000,900000,1300000,1400000,1600000],[200000,300000,400000,500000,500000,600000]];
const ms=Object.values(METODOS).map((n,i)=>({name:n,color:[VC.s1,VC.s2,VC.s3,VC.s4][i],vals:met[i]}));
let seed=7; const rnd=()=>{seed=(seed*16807)%2147483647;return seed/2147483647;};
const tv=[...Array(30).keys()].map(i=>Math.round(150000+Math.sin(i/3)*70000+rnd()*90000)); const tl=tv.map((_,i)=>(i+1)+' sep'); const tt=tv.map((_,i)=>'Día '+(i+1));
const hours=[...Array(15).keys()].map(i=>8+i);
const grid=[...Array(7)].map((_,d)=>hours.map((h,j)=>Math.max(0,Math.round((d>=4?9:5)*Math.exp(-Math.pow(h-19,2)/18)+(rnd()*2-0.5)))));
const hm=heat('heat',{grid,hours,aria:'Mapa'});
const card=(t,s,lg,svg)=>'<div class="card cc mt"><h3>'+t+'</h3><small>'+s+'</small>'+(lg||'')+'<div class="cwrap">'+svg+'</div></div>';
document.getElementById('app').innerHTML='<div class="viz" style="padding:24px;max-width:1080px;margin:auto">'+
'<div class="grid g3"><div class="kpi hero"><small>Resultado neto del período (ingresos − egresos)</small><b>'+fc(2200000)+'</b><small class="dl ok">▲ 18% vs período anterior</small></div>'+
'<div class="kpi"><small>Ingresos</small><b>'+fc(37000000)+'</b><small class="dl ok">▲ 22% vs período anterior</small></div><div class="kpi"><small>Egresos</small><b>'+fc(31500000)+'</b><small class="dl bad">▲ 9% vs período anterior</small></div><div class="kpi"><small>Margen neto</small><b>14.9%</b></div></div>'+
card('Ingresos vs egresos por mes','Comparación mensual.',legend([{c:VC.s1,l:'Ingresos'},{c:VC.s2,l:'Egresos'}]),colChart('flujo',{labels,titles,mode:'group',series:[{name:'Ingresos',color:VC.s1,vals:ing},{name:'Egresos',color:VC.s2,vals:eg}],aria:'x'}))+
card('Resultado neto por mes','Azul ganancia, rojo pérdida.',legend([{c:VC.s1,l:'Ganancia'},{c:VC.neg,l:'Pérdida'}]),colChart('neto',{labels,titles,mode:'diverge',series:[{name:'Neto',color:VC.s1,vals:[300000,800000,-400000,1300000,1300000,2200000]}],label:[2,5],fmt:fc,aria:'x'}))+
card('Tendencia diaria de ingresos','Promedio.','',lineChart('tend',{labels:tl,titles:tt,vals:tv,color:VC.s1,name:'Ingresos',aria:'x'}))+
card('Ingresos por método de pago','Mes a mes.',legend(ms.map(s=>({c:s.color,l:s.name+' · 40%'}))),colChart('metodo',{labels,titles,mode:'stack',series:ms,aria:'x'}))+
card('Ingresos por concepto','','',hbar('conc',{rows:[{label:'Mensualidades',value:14200000},{label:'Inscripciones',value:9800000},{label:'Reserva de cancha',value:7100000},{label:'Venta',value:4300000},{label:'Otro',value:1600000}],color:VC.s1,name:'Ingresos',fmt:fc,money:true,aria:'x'}))+
card('Egresos por categoría','','',hbar('egr',{rows:[{label:'Pago a proveedores',value:16000000},{label:'Arriendos',value:9000000},{label:'Servicios públicos',value:4800000},{label:'Otros gastos fijos',value:1700000}],color:VC.s2,name:'Egresos',fmt:fc,money:true,aria:'x'}))+
card('Ocupación por día y hora','Más claro = más reservas.','<div class="lg">Menos <span class="hs">'+HEAT.map(c=>'<i style="background:'+c+'"></i>').join('')+'</span> Más ('+hm.max+')</div>',hm.svg)+
card('Reservas por cancha','','',hbar('can',{rows:[{label:'Pista 1',value:64},{label:'Pista 2',value:51},{label:'Pista 3 con un nombre bastante largo',value:38}],color:VC.s3,name:'Reservas',fmt:fnum,money:false,aria:'x'}))+
card('Reservas por mes','','',colChart('resm',{labels,titles,mode:'single',series:[{name:'Reservas',color:VC.s3,vals:[120,150,140,190,210,260]}],label:[5],fmt:fnum,fmtY:fnum,aria:'x'}))+'</div>';
`;

const html = '<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"><style>' + css + '</style></head><body><div id="app"></div><div id="toasts"></div><script>\n' + stub + '\n' + chart + '\n' + sample + '\n</script></body></html>';
fs.writeFileSync(d + '/charts_test.html', html);
console.log('harness escrito, bytes:', html.length);
