# Conversación del 24-sep-2026 — resumen para seguir

Contexto general del proyecto: ver `CONTEXTO_PROYECTO.md`. Este archivo solo resume lo de esta sesión.

## 1. Cámara y transmisión en vivo (hecho y luego QUITADO)
- Se construyó en Encuentros: detección de cámaras USB/web, IP de la cámara Wi-Fi iCam365 (modelo Q101, RTSP 554), un puente local (`camara_puente.cjs`) y un marco para YouTube/TikTok en vivo.
- **Decisión del usuario: "quita todo lo de la cámara y las transmisiones en vivo".** Se eliminó todo de `index.html` y se borró `herramientas/camara_puente.cjs`.
- Se conserva el lector de QR con cámara del admin (función original, aparte).
- En el escaneo de red se vio un dispositivo con RTSP abierto en `192.168.1.67` (no confirmado como la iCam365). ffmpeg no está instalado en el PC.
- Si algún día se retoma: ffmpeg + usuario/clave RTSP; para transmitir a jugadores lo mejor era YouTube Live "No listado" con OBS, con un enlace por encuentro (requiere columna nueva).

## 2. Marcador, WearOS y Apple Watch (confirmado, sin cambios)
- El admin anota puntos en el panel "Controlar" del marcador (`A.pt`, `A.undo`); "Crear marcador" desde un encuentro completo lo pone en juego y al terminar reparte el pozo.
- WearOS: pantalla `#/reloj/<id>` lista (probada en Edge, no en reloj físico).
- Apple Watch: Atajo de Siri hecho a mano en el iPhone (guía en `CONTEXTO_PROYECTO.md`).
- Cada juego ganado manda aviso push a los jugadores (solo lectura en el reloj).

## 3. Notificaciones push no llegan con la app cerrada en Android (PENDIENTE de diagnosticar)
- El servidor funciona: función `push` responde, claves VAPID puestas, 5 dispositivos suscritos.
- Nunca se ha probado en un celular real. Causas probables: ahorro de batería / apps en suspensión (Samsung, Xiaomi…), notificaciones bloqueadas, suscripción vieja, "Forzar detención".
- Cambios hechos: `sw.js` maneja `pushsubscriptionchange`; la app re-registra el dispositivo al volver a primer plano; en la campanita (solo Android) hay guía de batería y botón "📲 Instalar app".
- Una web no puede quedarse viva en segundo plano; la alternativa sería una app nativa con Capacitor (no construida).
- Para seguir: pasar `SB_TOKEN` para revisar `push_subs` y mandar un aviso de prueba; saber marca del celular y si la app está instalada.

## 4. Anuncios emergentes (pop-up) — HECHO
- Admin → pestaña **Publicidad** → sección "🖼️ Anuncios emergentes": nuevo anuncio con imagen, formato **historia 9:16** o **post 1:1**, enlace opcional, segundos (3 por defecto, 2–15), sede, y switch **Activo**. Botones Vista previa y Eliminar.
- Jugador: al entrar a la app (una vez por sesión del navegador, clave `padel_pop_<id>` en sessionStorage) salen a pantalla completa los anuncios activos de su sede, uno tras otro, con barras de progreso tipo historia; tocar la imagen abre el enlace; hay × para cerrar.
- Interpretación: "entrar a su perfil" = entrar a su cuenta. Si se quiere al abrir "Mi perfil", cambiar el disparador (`popEntrada()` se llama tras el login en `index.html`).
- Código: `A.popNew/popSave/popDel/popPrev`, `C.popAct/pickPop`, `popShow`, `popEntrada` (antes de la sección CONTABILIDAD).
- Base: tabla `pop_ads` (al final de `schema.sql`), acceso abierto para `anon` como el resto. **Ya creada en Supabase** (el editor respondió "No rows returned", que es éxito).

## Pendientes / próximos pasos
1. Volver a desplegar `index.html` y `sw.js` en GitHub Pages (misma carpeta).
2. Probar los anuncios: crear uno como admin, ver vista previa, entrar como jugador en sesión nueva.
3. Diagnosticar push en Android (punto 3).
4. Probar con hardware real: micrófono, cámara del QR, push en celular, iPhone, reloj.
5. Añadir estas novedades a `CONTEXTO_PROYECTO.md` si se quiere un único documento.

## Notas técnicas
- Verificación hecha: `node --check` del script de `index.html` y de `sw.js` sin errores (no hay prueba en navegador de lo nuevo).
- Los tokens/claves no se guardan en archivos: el token de gestión de Supabase va por la variable `SB_TOKEN` (`herramientas/q.cjs`).
