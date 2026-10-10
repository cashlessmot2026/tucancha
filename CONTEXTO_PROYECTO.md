# TuCancha — canchas sintéticas de fútbol y microfútbol (clon adaptado de Cashless-Sport Pádel)

> **ADAPTACIÓN A FÚTBOL (octubre 2026).** Este repositorio es el clon de la PWA de pádel convertido a canchas sintéticas.
> - Supabase nuevo: `https://cmnympltpkxbrxqvgter.supabase.co` (las tablas del proyecto que ya existían no se tocan; `schema.sql` solo crea objetos nuevos).
> - Marca: **TuCancha**, moneda COP, ciudad por defecto Santa Marta (editable en Ajustes).
> - **Canchas con tipo** (Fútbol 5/6/7/8/11, Microfútbol), **precio por hora de día y desde las 6 pm** (`canchas.precio_noche`), reserva por bloques de 1 hora, lista de espera, QR y contador de 1 h igual que antes.
> - **Marcador a goles**: `matches.sets[0] = [goles1, goles2]`; `mejor_de` = duración en minutos; se termina con "Finalizar partido"; empate = 1 punto c/u (en retos y torneos el empate se define por penales). `puntos`, `tiebreak`, `punto_oro` quedan sin uso por compatibilidad.
> - **Encuentros**: el cupo depende del tipo de cancha (F5 = 10, F7 = 14, F8 = 16, F11 = 22, Micro = 10); el admin puede crear marcador con ≥ 2 jugadores.
> - **Torneos**: cada equipo = nombre del equipo + capitán registrado; partidos de 20–60 min; eliminación directa.
> - Las Edge Functions (`correos`, `push`) siguen en `funciones/` y hay que desplegarlas en el nuevo proyecto con sus secretos (Gmail y VAPID) si se quieren correos/avisos push.
> - El resto de este documento describe la base original de pádel (la arquitectura y las convenciones siguen vigentes; donde diga "pádel/pista/sets" léase fútbol/cancha/goles).

# (Documento original) Cashless-Sport (Pádel) Santa Marta — Contexto del proyecto

> Documento de traspaso para seguir trabajando. **Léelo primero** en la próxima sesión.
> Última actualización: 2026-09-21. Idioma de la app y del equipo: **español**.
> **No contiene claves.** Los secretos viven en Supabase (ver §9) y algunas se pegaron en el chat: hay que revocarlas (§12).

---

## 1. Qué es

App web de un club de pádel (reservas, encuentros, torneos, ranking, tienda, wallet, contabilidad, estadísticas, retos con apuesta, asistente por voz, notificaciones push).

- **Una sola página**: `index.html` (HTML + CSS + JS, sin framework ni build) + Supabase (Postgres + Edge Functions).
- **Publicada en**: `https://cashless-sports.github.io/cashless-sport/` (GitHub Pages).
- **Supabase**: proyecto `oshhdrnkegmhnasgwbpg` → `https://oshhdrnkegmhnasgwbpg.supabase.co`.
- Marca configurable desde la app (Ajustes): nombre por defecto **"Cashless-Sport (Pádel) Santa Marta"**, logo neón verde de Cashless Colombia. Colores base: fondo `#060d1c`, lima `#b8f22a`, azul `#2f6bff`.

## 2. Archivos del proyecto (carpeta `Desktop\padel`)

| Archivo | Para qué sirve | ¿Se publica? |
|---|---|---|
| `index.html` | TODA la aplicación (~240 KB) | **Sí** |
| `sw.js` | Service worker: recibe avisos push y los muestra con la app cerrada | **Sí** (misma carpeta que index.html) |
| `manifest.webmanifest` | Manifiesto de la app instalable (PWA) | **Sí** |
| `icon-192.png`, `icon-512.png` | Íconos de la app instalada (generados del logo) | **Sí** |
| `schema.sql` | Esquema COMPLETO de la base, en orden de creación (idempotente en su mayoría) | No (se ejecuta en Supabase) |
| `funciones/correos/index.ts` | Edge Function de correos (Gmail SMTP + QR) | No (se despliega) |
| `funciones/push/index.ts` | Edge Function de notificaciones push | No (se despliega) |
| `herramientas/` | Scripts de prueba/despliegue (sin claves; ver §11) | No |
| imágenes `.png/.jpeg/.svg` | Capturas y logo originales del cliente (referencia) | No |
| `CONTEXTO_PROYECTO.md` | Este documento | No |

**Para publicar cambios del front**: subir a GitHub Pages `index.html`, `sw.js`, `manifest.webmanifest`, `icon-192.png`, `icon-512.png`. La base y las funciones del servidor ya están aplicadas en Supabase.

## 3. Arquitectura y decisiones clave

- **Sin Supabase Auth.** Login propio: tabla `app_users`; contraseña = **SHA-256 de `"cedula:contraseña"`** calculado en el navegador; RPC `app_login`. La sesión es `localStorage.padel_uid` (solo el id). Se puede entrar con **cédula o correo** (`app_cedula_por_correo` resuelve el correo a cédula porque el hash usa la cédula).
- **Modelo abierto**: la llave `anon` está en el HTML y las tablas tienen RLS con política "abierto" para `anon`. Lo sensible pasa por **funciones `security definer`** (wallet, login, retos, push…). Ver riesgos en §12.
- **Todo lo que mueve dinero es atómico en SQL** (`wallet_mov`, `aprobar_compra`, funciones de retos): "todo o nada".
- **Notificaciones y avisos se generan con triggers** en la base (funcionan aunque el cambio venga de cualquier cliente) y llegan por: campanita (tabla `notificaciones`), voz/sonido en la app, y push (Edge Function `push` vía `pg_net`).
- **Zona horaria**: la lógica del servidor usa `America/Bogota` (UTC-5); el navegador usa la hora del dispositivo.
- **Traducción**: botones ES/EN/PT/FR con el widget oculto de Google Translate (cookie `googtrans`); requiere internet.

### Convenciones del código en `index.html` (para editarlo sin perderse)
- Estado global `S`; tablas con `T('tabla')` (= `sb.from`); `db(promesa)` lanza error si Supabase falla; `act(fn)` muestra el error en un toast.
- **Eventos delegados**: `data-a="nombre"` → `A.nombre(dataset, el)` (clic); `data-c="nombre"` → `C.nombre(valor, el)` (change); `data-i="nombre"` → `C.nombre` (input); `data-enter="accion"` (Enter dispara ese botón).
- **Vistas** en `V.nombre = async () => html` (las pinta `go('nombre')`; `reload()` repinta la actual).
- Utilidades: `esc()` (escapar SIEMPRE datos de usuario), `money()`, `hh(h)` ("08:00"), `dfmt/dfc` (fechas es-CO; `dfc` capitaliza solo la primera letra), `today()`, `addDays()`, `modal(html,cls)`, `closeModal()`, `toast(msg,tipo)`, `avatar(userOObjeto)`, `tone()/say()` (sonido y voz).
- Secciones marcadas con comentarios `/* ---------- NOMBRE ---------- */` (buscar por texto).
- NLU del asistente entre marcadores `/*AG-NLU-START*/ … /*AG-NLU-END*/` (así se puede probar aparte en Node).

## 4. Base de datos (Supabase/Postgres)

### Tablas
- **Núcleo**: `sedes`, `canchas`, `rankings`, `app_users` (+`foto`), `reservas`, `encuentros`, `encuentro_jugadores`, `matches`, `puntos_log`, `wallet_tx`, `productos`, `ordenes`, `notificaciones`.
- **Torneos**: `torneos`, `torneo_partidos` (`matches.torneo_partido_id` sin FK).
- **Marca**: `ajustes` (clave/valor: `nombre_app`, `logo`, `app_url`, `inicio_auto`).
- **Contabilidad**: `proveedores`, `facturas_proveedor`, `notas_credito`, `ingresos`, `gastos`.
- **Reservas avanzadas**: columnas en `reservas` (`correo_cliente`, `qr_token`, `uso`, `inicio_real`, `fin_real`, `conf_enviada`, `recordatorio_enviado`); tabla `lista_espera` (el `token` NO es legible por `anon`).
- **Push**: `push_subs` (sin acceso directo para `anon`; solo por RPC).
- **Retos**: `retos` (solo lectura para `anon`; escritura solo por RPC); `matches.reto_id`, `notificaciones.reto_id`.
- `notificaciones` extra: `tipo`, `voz`, `reto_id`, `publicidad_id`.
- **Publicidad**: `publicidad` (solo lectura para `anon`; escritura solo por RPC) — historial de avisos del club (`titulo`, `mensaje`, `imagen` opcional, `sede_id` opcional = null quiere decir todas las sedes, `enviados`).

### Funciones RPC (`security definer`)
`app_login`, `app_register`, `app_recover`, `app_cedula_por_correo`, `admin_update_user`, `admin_delete_user`, `wallet_mov`, `registrar_resultado`, `aprobar_compra`, `espera_info`, `espera_tomar`, `push_guardar`, `push_quitar`, `reto_crear`, `reto_responder`, `reto_apuesta`, `reto_confirmar_apuesta`, `reto_cancelar`, `reto_iniciar`, `reto_anular`, `publicidad_enviar`, `marcador_anotar`.
Ayudantes: `fecha_es`, `hora_es`, `notificar_admins`, `_nom`, `_pesos`, `_reto_detalle`, `_reto_aviso`, `_reto_reembolsar`.

### Triggers
| Trigger | Efecto |
|---|---|
| `reservas_liberada` | al cancelarse una reserva con lista de espera → llama a la Edge Function `correos` (acción `espera`) |
| `reservas_notif_ins/upd` | reserva nueva/cancelada → notificación a **todos los admins** (`tipo` reserva_nueva / reserva_cancelada, con frase `voz`) |
| `wallet_notif` | recarga de wallet → notificación a admins |
| `orden_notif` | compra nueva por aprobar → notificación a admins (tipo `pago`) |
| `notif_push` | cada notificación nueva → Edge Function `push` (si el usuario tiene dispositivos suscritos) |
| `matches_reto` | al terminar un partido ligado a un reto → **paga el premio al ganador** |
| `reservas_reto_cancel` | si se cancela la reserva de un reto → cancela el reto y devuelve la apuesta |

### Tarea programada
`pg_cron` job **`recordatorios-reservas`** (cada minuto) → `net.http_post` a la Edge Function `correos` con `{"accion":"recordatorios"}`.

## 5. Edge Functions (Deno; `verify_jwt=false`; se despliegan por la API de gestión)

- **`correos`** (`funciones/correos/index.ts`): `POST {accion:'confirmacion', reserva_id, reenviar?}`, `{accion:'recordatorios'}`, `{accion:'espera', court_id, fecha, hora}`, `{accion:'estado'}`; `GET ?qr=<token>` devuelve el PNG del QR. Envía por **Gmail SMTP puerto 465** con `denomailer`. **Asuntos y remitente solo en ASCII** (la librería codifica mal tildes/emojis en encabezados). El QR de los correos se sirve como imagen desde esta misma función.
- **`push`** (`funciones/push/index.ts`): `POST {notif_id}` envía Web Push (`npm:web-push`) a los dispositivos del usuario; borra suscripciones muertas (404/410). `{accion:'estado'}` = diagnóstico.

Despliegue: `node herramientas/deploy2.cjs <slug> <carpeta>` con `SB_TOKEN` en el entorno (tarda 1–3 min).

## 6. Funcionalidades (por rol)

### Jugador
- **Inicio**: saldo, categoría, próximas reservas, **🤖 asistente de reservas por voz** (tarjeta).
- **Reservar**: elegir sede (botones), día, hora; ve horarios ocupados y **⏳ lista de espera**; "Mis reservas" con contador, **QR** y cancelar; "Mis listas de espera".
- **Encuentros** (partidos abiertos con apuesta), **Torneos** (llaves en vivo), **Comunidad** (ranking de jugadores + **⚔️ Retar** + "Mis retos"), **Ranking**, **Tienda**, **Wallet**, **Perfil** (foto).
- **Campanita** con notificaciones; activar **avisos push** (banner y estado).

### Administrador
- **Panel**, **Contabilidad** (Panel contable, Ingresos, Facturas de proveedores, Notas crédito, Gastos fijos, Proveedores), **Estadísticas** (13 gráficos SVG propios + KPIs, filtros 3/6/12 meses o año y sede), **Marcador** (punto a punto, pantalla de proyección `#/marcador/<id>`, "Retos por jugar"), **Reservas** ("Reservas en curso", contador, escáner de QR, inicio automático), **Encuentros**, **Rankings**, **Tienda**, **Compras** (aprobación con alerta sonora), **Wallets** (recargas), **Jugadores** (crear/editar/eliminar, rol y sede; login por correo o cédula), **Sedes** y canchas, **Torneos**, **Publicidad** (avisos del club a los jugadores, ver más abajo), **Ajustes** (nombre, logo, dirección pública `app_url`).
- **Campanita roja** con sonido y **voz** al llegar: reserva nueva, cancelación, pago por aprobar, recarga.

## 7. Flujos importantes

**Reserva → correo → QR → contador**
1. Al reservar (jugador/admin/encuentro/lista de espera) se llama a `correos` (`confirmacion`): correo con detalles + QR (`<app_url>#/checkin/<token>`).
2. Recordatorio 10 min antes por `pg_cron` (no se envía si la reserva se hizo con menos de 10 min de antelación).
3. El admin escanea el QR (cámara con `BarcodeDetector` o `jsQR`; o pega el código) o pulsa "Iniciar ahora"; con "Inicio automático" el contador corre solo desde la hora reservada. El contador es de 1 hora (elapsed + restante).
4. `app_url` (dirección pública) se guarda en `ajustes` (campo en Ajustes o automático al abrir la app desde una URL real).

**Lista de espera**: cliente se anota con su correo → si se libera la cancha (trigger) le llega un correo con botón → enlace `#/tomar/<token>` abre la ventana "¿Deseas tomar la reserva?" (sin login) → `espera_tomar` (el primero gana; el resto se cierra).

**Retos con apuesta (1 vs 1)**: `reto_crear` → el retado ve ventana automática y acepta (`reto_responder`: reserva la cancha a nombre del retador) → se acuerda apuesta (`reto_apuesta`, el otro confirma con `reto_confirmar_apuesta`: **retiene el dinero de los dos**) → el admin crea el marcador (`reto_iniciar`) → al terminar el partido el trigger `matches_reto` paga **2× apuesta** al ganador. Cancelaciones devuelven el dinero; `reto_anular` (admin) devuelve la apuesta de un reto en juego.

**Notificaciones push**: cada dispositivo activa permisos → `push_guardar` → trigger `notif_push` → función `push` → `sw.js` muestra la notificación (si la app está visible no duplica). En iPhone hay que **instalar la app** (Compartir → Añadir a pantalla de inicio, iOS 16.4+).

**Publicidad (avisos del club)**: pestaña de admin nueva (`V.publicidad`). El admin escribe título + mensaje + imagen opcional y elige destinatarios (todos los jugadores o una sola sede) → RPC `publicidad_enviar` guarda el aviso en `publicidad` (historial) y crea una fila en `notificaciones` (`tipo:'publicidad'`) para cada jugador destinatario **y también para TODOS los administradores** (sin filtrar por sede, igual que `notificar_admins`, como respaldo de que se envió) → el trigger `notif_push` ya existente dispara el push a cada dispositivo suscrito, igual que cualquier otra notificación. Al jugador (y al admin) le llega: alerta push (si la activó), aparece en su campanita, y con "Ver aviso" abre el detalle completo (con imagen si tiene). El contador "enviados" que se ve en el historial solo cuenta jugadores, no admins. No requiere que el jugador tenga la app abierta: la sesión queda guardada en `localStorage` y el dispositivo sigue suscrito a push en segundo plano, igual que el resto de avisos del sistema. Solo mueve información, no dinero.
Si a un jugador/admin no le llega el push (aunque sí vea la notificación en la campanita), lo primero a revisar es si ese usuario tiene algún dispositivo en `push_subs` (columna `dispositivos_suscritos` en una consulta como la usada para depurar esto) — si no tiene ninguno, nunca activó "Activar notificaciones" en ese navegador/celular.

**Marcador en vivo hacia el jugador (para verlo en un smartwatch emparejado)**: cada vez que se gana un juego (o termina el partido) en `V.marcador`, el cliente inserta directamente en `notificaciones` (`tipo:'marcador'`, sin RPC, igual que la invitación a un encuentro) una fila para cada jugador del partido que tenga cuenta (`notifMarcador()` en `index.html`). El trigger `notif_push` ya existente manda el push; la función `push` usa un **tag fijo por jugador** (`marcador-<user_id>`) para que cada actualización **reemplace** la anterior en vez de acumularse. Como los relojes (Apple Watch, WearOS) reflejan automáticamente las notificaciones del celular emparejado, el jugador ve el marcador actualizarse en la muñeca sin sacar el teléfono ni instalar nada en el reloj — es de solo lectura, no permite anotar puntos desde ahí. **Endpoint compartido para anotar desde fuera del navegador (ya construido)**: RPC `marcador_anotar(p_match uuid, p_equipo smallint, p_origen text)` — valida que el partido exista y esté `en_juego`, y encola el punto en la tabla `marcador_cola` (no repite la regla del juego). El panel del marcador, mientras está abierto y el partido en curso, la revisa dentro de su `poll()` normal (`drenarColaMarcador()`) y aplica los puntos pendientes con las mismas `addPoint`/`saveMatch`/`finishMatch` de siempre — por eso sigue habiendo una sola fuente de verdad para las reglas del juego. Se puede llamar por REST con la llave `anon`:
```
POST https://oshhdrnkegmhnasgwbpg.supabase.co/rest/v1/rpc/marcador_anotar
headers: apikey, Authorization: Bearer <llave anon>, Content-Type: application/json
body: {"p_match":"<id del partido>","p_equipo":0,"p_origen":"watch"}   // p_equipo: 0 = equipo1, 1 = equipo2
```
**Interfaz para WearOS (ya construida)**: pantalla `#/reloj/<id del partido>` — dos botones gigantes con el nombre de cada equipo, marcador compacto arriba, se actualiza sola cada 3 s. No necesita login. En el panel del marcador (admin), botón "⌚ Copiar enlace para el reloj" copia esa URL; se abre en el navegador del reloj (o del celular, para probar). Probada de punta a punta con Edge headless contra un partido real de prueba.

**Interfaz para Apple Watch (Atajo de Siri — hay que armarla a mano en el iPhone, no se puede instalar por código)**:
1. En el iPhone: app **Atajos** → **+** (nuevo atajo).
2. Agrega la acción **"Obtener contenido de URL"**.
3. URL: `https://oshhdrnkegmhnasgwbpg.supabase.co/rest/v1/rpc/marcador_anotar`
4. Toca **"Mostrar más"** → Método: **POST**.
5. Encabezados (dos):
   - `apikey` → la llave anon (está en `index.html`, constante `SB_KEY`, empieza por `eyJ...`)
   - `Authorization` → `Bearer ` + la misma llave anon
   - `Content-Type` → `application/json`
6. Cuerpo de la petición → tipo **JSON**, con estos campos:
   - `p_match` → el id del partido (texto fijo; lo cambias antes de cada partido — se copia con "⌚ Copiar enlace para el reloj" en el panel del admin, y te quedas con lo que va después del último `/`)
   - `p_equipo` → `0` si el atajo es para tu equipo, `1` si es para el rival
   - `p_origen` → `"watch_ios"`
7. Nombra el atajo (p. ej. "Anota para mí"), y en sus ajustes activa **"Mostrar en Watch"** y, si quieres dispararlo por voz, **"Añadir a Siri"** con una frase como "anota punto".
8. Repite el atajo completo para el equipo rival (`p_equipo: 1`), con otro nombre y otra frase.
9. Antes de cada partido: abre el atajo en edición y pega el id del partido nuevo (los atajos no saben cuál partido está en juego automáticamente).

Es más manual que la versión de WearOS (que no necesita configurar nada por partido, solo abrir el enlace), porque Apple no permite que un atajo lea un parámetro desde una URL abierta ni desde un navegador — hay que dejarlo escrito dentro del atajo. Nota de seguridad: igual que el resto de la app (modelo abierto), cualquiera que tenga el id del partido puede anotar puntos por esa vía — aceptable porque no mueve dinero real.

**Asistente por voz**: reglas propias en español (fechas, horas, sede, cancha, sí/no, despedidas, cancelar reservas). Busca cancha libre; si está ocupada propone **siguientes días** y horas cercanas; pide confirmación **sí/no** (por voz o botones); saluda por el nombre y se despide si el jugador ya no quiere reservar; **cancela reservas** diciendo sede + hora + día (el sistema sabe cuál es). Usa `SpeechRecognition` (Chrome/Edge) y `speechSynthesis`.

## 8. Contabilidad y estadísticas (detalles)
- Ingresos: método (efectivo/transferencia/datáfono/pasarela) y concepto (venta/inscripción/mensualidad/reserva/otro). Facturas: pendientes/pagadas con foto de comprobante; notas crédito bajan el saldo (si lo cubren, la factura queda pagada). Gastos fijos: servicios públicos, arriendos, otros.
- Las consultas grandes usan `allRows()` (paginación de 1000 en 1000, porque Supabase corta en 1000 filas).
- Gráficos: paleta validada sobre la tarjeta oscura (azul ingresos, naranja egresos, etc.), tooltips, tabla alternativa. Skill usada: `dataviz`.

## 9. Secretos y credenciales (NOMBRES, no valores)
- Secretos de Supabase (Edge Functions): `GMAIL_APP_PASSWORD`, `GMAIL_USER` (=`glideappsnuevo2025@gmail.com`), `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT`.
- La clave VAPID **pública** está en `index.html` (`VAPID_PUB`). La llave `anon` de Supabase también (es pública por diseño).
- Usuarios: hay **2 administradores**; el original tiene cédula `admin` y correo `cashlesscolombia@gmail.com`. La contraseña inicial que creaba `schema.sql` era `admin123` (**cambiarla si no se ha hecho**).
- Para operar la base desde herramientas se usó un token personal de gestión de Supabase (`sbp_…`) → **ya no está en el proyecto**; pásalo por la variable de entorno `SB_TOKEN` cuando haga falta.

## 10. Pruebas realizadas y cómo repetirlas
Se probó con **Edge headless** (`msedge --headless=new --dump-dom`), datos temporales marcados (`PRUEBA-BORRAR`, `DEMO-BORRAR`) y **limpieza + restauración de saldos** al final.
- Unitarias en Node: parser del asistente (`nlu_test.cjs`: ~70 frases), service worker (`sw_test.cjs`, 12 casos), lógica de dinero de retos (`retos_test.cjs`, 40 comprobaciones).
- De extremo a extremo: correos reales enviados a la cuenta remitente; recordatorio en vivo (llegó a `cashlesscolombia@gmail.com` a los 9,7 min); notificaciones push probadas hasta el servicio push con una suscripción falsa; PWA sobre `http://localhost` (service worker, manifest, íconos); flujo de retos con dos jugadores reales y el admin.
- **NO probado con hardware real**: micrófono físico, cámara para el QR, aviso push llegando a un celular real, iPhone.

## 11. Herramientas (`herramientas/`)
Copias **sin claves**; exportar `SB_TOKEN` antes de usarlas (`$env:SB_TOKEN='sbp_...'` en PowerShell).
- `q.cjs "<sql>"` — ejecuta SQL en el proyecto (API de gestión).
- `deploy2.cjs <slug> <carpeta>` — despliega una Edge Function.
- `build.cjs` — extrae el `<script>` de `index.html` a `app.js` para `node --check` (verificar sintaxis).
- `nlu_test.cjs`, `sw_test.cjs`, `retos_test.cjs` — pruebas descritas arriba.
Regla que se siguió siempre: **tras cada edición → `node --check` del script** y prueba real con datos temporales que se borran.

## 12. Riesgos, límites y pendientes

**Seguridad (lo más importante antes de manejar dinero real)**
- Modelo abierto: cualquiera con la llave `anon` (visible en el HTML) puede leer/modificar casi todas las tablas (contabilidad, roles, reservas…). Ya protegidos por RPC: wallet, login/hash, retos, push, `password_hash`. **Pendiente recomendado**: quitar de `anon` el UPDATE de `role`/`wallet` y de tablas contables, o migrar a **Supabase Auth** con permisos por rol. Los tokens de reserva (`qr_token`) también son legibles.
- **Revocar**: el token `sbp_…` de Supabase (Account → Access Tokens) y la contraseña de aplicación de Gmail (myaccount.google.com/apppasswords) si ya no se necesitan, porque se pegaron en el chat.
- Hash de contraseña SHA-256 sin sal fuerte (débil frente a fuerza bruta).

**Límites conocidos**
- El asistente **no usa un LLM** (el cliente no puede pagar API): entiende lenguaje habitual pero puede fallar con frases raras. Posible mejora: función que use la API de Claude (`ANTHROPIC_API_KEY` como secreto) con las reglas como respaldo.
- Voz: dictado solo en Chrome/Edge (Safari/iPhone limitado); la voz **no puede leer avisos con la app cerrada** (en segundo plano solo suena/vibra la notificación del sistema).
- Retos: solo 1 vs 1; el admin crea el marcador (si nadie lo inicia, la apuesta queda retenida hasta cancelar/anular).
- Las acciones del propio admin también generan sus notificaciones (el sistema no distingue quién actúa).
- Los íconos de la app instalada son archivos: si cambia el logo en Ajustes hay que regenerarlos.
- Google Translate puede traducir nombres propios; los `confirm()` nativos quedan en español.
- Correos: los primeros pueden caer en spam; límite ~500/día de Gmail.
- `Comunidad` y `Ranking` cargan hasta 500 jugadores.

**Ideas pendientes / siguientes pasos posibles**
1. Endurecer seguridad (arriba).
2. Probar en un celular real: instalar la PWA, activar avisos, escanear QR, hablar con el asistente.
3. Retos por parejas (2 vs 2) y/o marcador propio de los jugadores.
4. Exportar contabilidad a CSV/PDF.
5. Storage de Supabase para comprobantes/fotos (hoy son imágenes reducidas dentro de la base).
6. LLM opcional para el asistente.

## 13. Historial de lo pedido y hecho (orden cronológico)
1. Revisar `index.html` y verificar conexión con Supabase → tablas, RPC y llave OK.
2. Dar acceso con token de gestión; asociar `cashlesscolombia@gmail.com` al admin.
3. Pestaña Jugadores: crear usuarios y asignar rol jugador/admin; admin con sede obligatoria; en Reservas el cliente elige la sede con botones.
4. **Torneos** por sede: llaves de eliminación con BYEs, pistas, avance automático según marcador.
5. **Foto de perfil** para todos; **logo y nombre** editables por el admin (Ajustes); nombre por defecto Cashless-Sport (Pádel) Santa Marta.
6. Jugadores: **editar y eliminar** usuarios; **login con correo o cédula**.
7. **Contabilidad** completa + **botones de idioma** (ES/EN/PT/FR).
8. **Estadísticas** con gráficos financieros y operativos.
9. **Reservas avanzadas**: correo con QR, contador de uso (manual/automático/QR), recordatorio 10 min antes, **lista de espera** con enlace "tomar reserva" (Edge Function + Gmail + pg_cron).
10. Logo real del cliente como logo de la app; asuntos de correo limpios (solo ASCII).
11. **Asistente de reservas por voz** (sin API de pago): reserva, siguientes días si está ocupado, sí/no por voz (micrófono automático), saludo con nombre, despedida, **cancelar reservas por voz**.
12. Pulidos: fechas ("21 de septiembre"), paginación real en contabilidad (límite de 1000 filas), aviso "ya tienes una reserva".
13. **Campanita del admin** (reservas, cancelaciones, pagos, recargas) con sonido, voz y color rojo.
14. **PWA + notificaciones push** para recibir avisos con la app cerrada; sesión persistente.
15. **Retos entre jugadores** con ventana de reserva, aceptación, apuesta del wallet retenida y pago automático al ganador; anulación por el admin.
16. Este documento y las herramientas.
17. **Pestaña "Publicidad"** en el panel del admin: avisos del club que llegan como notificación push y en la campanita de los jugadores (tabla `publicidad` + RPC `publicidad_enviar`); solo mueve información, no dinero. También notifica a todos los administradores (respaldo de envío). Sonido del aviso reforzado (más fuerte y más largo) tanto para admin como jugador, y el push queda fijo en pantalla con vibración más insistente hasta que lo toquen.
18. **Marcador en vivo hacia el smartwatch**: cada juego ganado (o fin de partido) manda un aviso a los dos jugadores; como los relojes reflejan las notificaciones del celular, ven el marcador actualizarse en la muñeca sin sacar el teléfono (de solo lectura).
19. **Endpoint para anotar puntos desde fuera del navegador** (`marcador_anotar` + tabla `marcador_cola`, ver arriba): listo y probado.
20. **Interfaces de reloj**: pantalla `#/reloj/<id>` para WearOS (lista, probada) + guía del Atajo de Siri para Apple Watch (ver arriba; hay que armarlo a mano en el iPhone).

## 14. Cómo continuar en una sesión nueva
1. Abre este archivo y `schema.sql`; el estado real de la base se puede consultar con `q.cjs`.
2. Para cualquier cambio de front: editar `index.html` → `node herramientas/build.cjs` + `node --check app.js` → probar → subir los 5 archivos a GitHub Pages.
3. Para cambios de base: agregarlos **también** a `schema.sql`; para funciones del servidor: editar `funciones/*/index.ts` y desplegar.
4. Mantener: textos en español, `esc()` en todo dato de usuario, dinero solo por funciones SQL atómicas, pruebas con datos temporales que se limpian.
