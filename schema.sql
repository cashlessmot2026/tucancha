-- =====================================================================
--  TUCANCHA · Canchas sintéticas de fútbol y microfútbol · Esquema para Supabase
--  Proyecto: https://cmnympltpkxbrxqvgter.supabase.co
--  Ejecutar completo en: Supabase > SQL Editor > New query > Run
--  Se puede volver a ejecutar sin romper nada (usa IF NOT EXISTS).
-- =====================================================================

create extension if not exists pgcrypto with schema extensions;

-- ---------- SEDES Y CANCHAS ----------
create table if not exists sedes (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  ciudad text,
  apertura int not null default 8  check (apertura between 0 and 23),
  cierre   int not null default 23 check (cierre between 1 and 24),
  activa boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists canchas (
  id uuid primary key default gen_random_uuid(),
  sede_id uuid not null references sedes(id) on delete cascade,
  nombre text not null,
  precio_hora numeric(12,2) not null default 0,     -- precio por hora de día
  precio_noche numeric(12,2) not null default 0,    -- precio por hora desde las 6 pm (iluminación); 0 = igual al de día
  tipo text not null default 'Fútbol 5',            -- Fútbol 5 · 6 · 7 · 8 · 11 · Microfútbol
  activa boolean not null default true
);
-- por si la tabla ya existía de una versión anterior
alter table canchas add column if not exists precio_noche numeric(12,2) not null default 0;
alter table canchas add column if not exists tipo text not null default 'Fútbol 5';

-- ---------- USUARIOS (sin proveedor de auth externo) ----------
-- La contraseña se guarda como SHA-256 de "cedula:contraseña". Nunca en texto plano.
create table if not exists app_users (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  cedula text not null unique,
  telefono text,
  correo text,
  password_hash text not null,
  role text not null default 'jugador' check (role in ('jugador','admin')),
  wallet numeric(12,2) not null default 0 check (wallet >= 0),
  puntos int not null default 0,
  partidos int not null default 0,
  victorias int not null default 0,
  sede_id uuid references sedes(id) on delete set null,
  created_at timestamptz not null default now()
);

-- ---------- RANKINGS (4 categorías por puntaje, editables por el admin) ----------
create table if not exists rankings (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  min_puntos int not null default 0,
  max_puntos int,                       -- null = sin tope
  color text not null default '#b8f22a',
  orden int not null default 1
);

-- ---------- RESERVAS ----------
create table if not exists reservas (
  id uuid primary key default gen_random_uuid(),
  sede_id uuid not null references sedes(id) on delete cascade,
  court_id uuid not null references canchas(id) on delete cascade,
  user_id uuid references app_users(id) on delete set null,
  nombre_cliente text,
  fecha date not null,
  hora int not null check (hora between 0 and 23),
  estado text not null default 'confirmada' check (estado in ('confirmada','cancelada')),
  created_at timestamptz not null default now()
);
create unique index if not exists reservas_unica
  on reservas (court_id, fecha, hora) where estado = 'confirmada';

-- ---------- ENCUENTROS (invitar jugadores + reservar + apuesta) ----------
create table if not exists encuentros (
  id uuid primary key default gen_random_uuid(),
  creador_id uuid references app_users(id) on delete set null,
  sede_id uuid not null references sedes(id) on delete cascade,
  court_id uuid not null references canchas(id) on delete cascade,
  reserva_id uuid references reservas(id) on delete set null,
  fecha date not null,
  hora int not null,
  apuesta numeric(12,2) not null default 0,   -- valor por jugador
  nota text,
  estado text not null default 'abierto'
    check (estado in ('abierto','completo','en_juego','finalizado','cancelado')),
  created_at timestamptz not null default now()
);

create table if not exists encuentro_jugadores (
  encuentro_id uuid not null references encuentros(id) on delete cascade,
  user_id uuid not null references app_users(id) on delete cascade,
  equipo smallint not null default 1,
  primary key (encuentro_id, user_id)
);

-- ---------- PARTIDOS / MARCADOR ----------
create table if not exists matches (
  id uuid primary key default gen_random_uuid(),
  sede_id uuid references sedes(id) on delete set null,
  court_id uuid references canchas(id) on delete set null,
  encuentro_id uuid references encuentros(id) on delete set null,
  equipo1 jsonb not null default '[]',        -- [{id,nombre}]
  equipo2 jsonb not null default '[]',
  sets jsonb not null default '[[0,0]]',      -- FÚTBOL: sets[0] = [goles equipo 1, goles equipo 2]
  puntos jsonb not null default '[0,0]',      -- sin uso en fútbol (compatibilidad)
  tiebreak boolean not null default false,    -- sin uso en fútbol (compatibilidad)
  punto_oro boolean not null default false,   -- sin uso en fútbol (compatibilidad)
  mejor_de int not null default 60,           -- FÚTBOL: duración del partido en minutos
  status text not null default 'en_juego' check (status in ('en_juego','finalizado')),
  ganador smallint,                           -- 0 = equipo1, 1 = equipo2
  puntos_otorgados boolean not null default false,
  inicio timestamptz not null default now(),
  fin timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists puntos_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references app_users(id) on delete cascade,
  sede_id uuid references sedes(id) on delete set null,
  match_id uuid references matches(id) on delete set null,
  puntos int not null,
  created_at timestamptz not null default now()
);

-- ---------- WALLET ----------
create table if not exists wallet_tx (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references app_users(id) on delete cascade,
  tipo text not null,                          -- recarga | compra | apuesta | premio | reembolso | ajuste
  monto numeric(12,2) not null,                -- positivo suma, negativo resta
  descripcion text,
  saldo_final numeric(12,2),
  created_at timestamptz not null default now()
);

-- ---------- TIENDA ----------
create table if not exists productos (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  descripcion text,
  categoria text,
  precio numeric(12,2) not null default 0,
  stock int not null default 0,
  emoji text default '🎾',
  imagen text,                                 -- data URL o URL
  activo boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists ordenes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references app_users(id) on delete cascade,
  producto_id uuid not null references productos(id) on delete cascade,
  cantidad int not null default 1 check (cantidad > 0),
  total numeric(12,2) not null,
  comprobante text,                            -- imagen del comprobante (data URL)
  nota text,
  estado text not null default 'pendiente'
    check (estado in ('pendiente','aprobada','rechazada','entregada')),
  created_at timestamptz not null default now(),
  resuelta_at timestamptz
);

-- ---------- NOTIFICACIONES / INVITACIONES ----------
create table if not exists notificaciones (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references app_users(id) on delete cascade,
  texto text not null,
  encuentro_id uuid references encuentros(id) on delete cascade,
  leida boolean not null default false,
  created_at timestamptz not null default now()
);

-- =====================================================================
--  FUNCIONES (atómicas)
-- =====================================================================

create or replace function app_login(p_cedula text, p_hash text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare u app_users;
begin
  select * into u from app_users where cedula = p_cedula and password_hash = p_hash;
  if not found then return null; end if;
  return to_jsonb(u) - 'password_hash';
end $$;

create or replace function app_register(p_nombre text, p_cedula text, p_telefono text,
                                        p_correo text, p_hash text, p_sede uuid)
returns jsonb language plpgsql security definer set search_path = public as $$
declare u app_users;
begin
  if exists (select 1 from app_users where cedula = p_cedula) then
    raise exception 'Esa cédula ya está registrada';
  end if;
  insert into app_users (nombre, cedula, telefono, correo, password_hash, sede_id)
  values (p_nombre, p_cedula, p_telefono, p_correo, p_hash, p_sede)
  returning * into u;
  return to_jsonb(u) - 'password_hash';
end $$;

-- Recuperar contraseña: el cliente genera una clave temporal y la envía ya hasheada.
create or replace function app_recover(p_cedula text, p_hash text)
returns boolean language plpgsql security definer set search_path = public as $$
begin
  update app_users set password_hash = p_hash
   where cedula = p_cedula and role <> 'admin';
  return found;
end $$;

create or replace function wallet_mov(p_user uuid, p_monto numeric, p_tipo text, p_desc text)
returns numeric language plpgsql security definer set search_path = public as $$
declare v numeric;
begin
  update app_users set wallet = wallet + p_monto
   where id = p_user and wallet + p_monto >= 0
   returning wallet into v;
  if v is null then raise exception 'Saldo insuficiente'; end if;
  insert into wallet_tx (user_id, tipo, monto, descripcion, saldo_final)
  values (p_user, p_tipo, p_monto, p_desc, v);
  return v;
end $$;

create or replace function registrar_resultado(p_user uuid, p_sede uuid, p_match uuid,
                                               p_pts int, p_gano boolean)
returns void language plpgsql security definer set search_path = public as $$
begin
  update app_users
     set puntos = puntos + p_pts,
         partidos = partidos + 1,
         victorias = victorias + (case when p_gano then 1 else 0 end)
   where id = p_user;
  insert into puntos_log (user_id, sede_id, match_id, puntos) values (p_user, p_sede, p_match, p_pts);
end $$;

create or replace function aprobar_compra(p_orden uuid)
returns void language plpgsql security definer set search_path = public as $$
declare o ordenes; p productos;
begin
  select * into o from ordenes where id = p_orden for update;
  if not found or o.estado <> 'pendiente' then raise exception 'La compra ya fue procesada'; end if;
  select * into p from productos where id = o.producto_id for update;
  if p.stock < o.cantidad then raise exception 'Sin stock suficiente'; end if;
  perform wallet_mov(o.user_id, -o.total, 'compra', 'Compra: ' || p.nombre || ' x' || o.cantidad);
  update productos set stock = stock - o.cantidad where id = p.id;
  update ordenes set estado = 'aprobada', resuelta_at = now() where id = o.id;
end $$;

-- =====================================================================
--  PERMISOS
-- =====================================================================
-- Tablas normales: acceso abierto para la llave anon (la app no usa Supabase Auth).
do $$
declare t text;
begin
  foreach t in array array['sedes','canchas','rankings','reservas','encuentros','encuentro_jugadores',
                           'matches','productos','ordenes','notificaciones','app_users','wallet_tx','puntos_log']
  loop
    execute format('alter table %I enable row level security', t);
    execute format('drop policy if exists "abierto" on %I', t);
    execute format('create policy "abierto" on %I for all to anon using (true) with check (true)', t);
  end loop;
end $$;

grant usage on schema public to anon;
grant all on sedes, canchas, rankings, reservas, encuentros, encuentro_jugadores,
             matches, productos, ordenes, notificaciones to anon;

-- app_users: el hash de la contraseña NUNCA es legible; el saldo y los puntos solo cambian por funciones.
revoke all on app_users from anon;
grant select (id, nombre, cedula, telefono, correo, role, wallet, puntos, partidos, victorias, sede_id, created_at)
  on app_users to anon;
grant update (nombre, telefono, correo, role, sede_id) on app_users to anon;

-- Historiales: solo lectura directa.
revoke all on wallet_tx, puntos_log from anon;
grant select on wallet_tx, puntos_log to anon;

grant execute on function app_login(text,text), app_register(text,text,text,text,text,uuid),
                          app_recover(text,text), wallet_mov(uuid,numeric,text,text),
                          registrar_resultado(uuid,uuid,uuid,int,boolean), aprobar_compra(uuid) to anon;

-- =====================================================================
--  DATOS INICIALES
-- =====================================================================
insert into sedes (nombre, ciudad, apertura, cierre)
select 'Complejo TuCancha', 'Santa Marta', 7, 24
where not exists (select 1 from sedes);

insert into canchas (sede_id, nombre, tipo, precio_hora, precio_noche)
select s.id, v.nombre, v.tipo, v.dia, v.noche
from sedes s, (values
  ('Cancha 1 · Fútbol 5',  'Fútbol 5',    70000,  90000),
  ('Cancha 2 · Fútbol 5',  'Fútbol 5',    70000,  90000),
  ('Cancha 3 · Fútbol 7',  'Fútbol 7',   110000, 140000),
  ('Cancha 4 · Microfútbol','Microfútbol', 60000,  80000)
) v(nombre, tipo, dia, noche)
where not exists (select 1 from canchas);

insert into rankings (nombre, min_puntos, max_puntos, color, orden)
select * from (values
  ('Bronce',   0,   29,  '#c98a52', 1),
  ('Plata',    30,  89,  '#b9c4d8', 2),
  ('Oro',      90,  179, '#f5c542', 3),
  ('Platino',  180, null,'#5fe0d0', 4)
) v(nombre, min_puntos, max_puntos, color, orden)
where not exists (select 1 from rankings);

insert into productos (nombre, descripcion, categoria, precio, stock, emoji)
select * from (values
  ('Balón de fútbol',        'Balón sintético tamaño 5 (alquiler)',  'Accesorios',  5000, 20, '⚽'),
  ('Juego de petos',         'Petos de colores x10 (alquiler)',       'Accesorios', 10000, 20, '🎽'),
  ('Arbitraje',              'Árbitro para tu partido',               'Servicios',  25000, 50, '🟨'),
  ('Gatorade 500 ml',        'Bebida hidratante',                     'Bebidas',     6000, 100,'🥤'),
  ('Agua 600 ml',            'Agua natural',                          'Bebidas',     2500, 150,'💧'),
  ('Cerveza',                'Cerveza nacional (tercer tiempo)',      'Bebidas',     5000, 120,'🍺'),
  ('Canilleras',             'Par de canilleras',                     'Ropa',       15000, 25, '🦵')
) v(nombre, descripcion, categoria, precio, stock, emoji)
where not exists (select 1 from productos);

-- Administrador inicial  ·  cédula: admin   ·  contraseña: admin123   (¡cámbiala!)
insert into app_users (nombre, cedula, telefono, correo, password_hash, role, sede_id)
select 'Administrador', 'admin', '0000000', 'admin@club.local',
       encode(extensions.digest('admin:admin123', 'sha256'), 'hex'), 'admin',
       (select id from sedes order by created_at limit 1)
where not exists (select 1 from app_users where cedula = 'admin');

-- =====================================================================
--  TORNEOS
-- =====================================================================
-- ---------- TORNEOS (llaves de eliminación directa, por sede) ----------
create table if not exists torneos (
  id uuid primary key default gen_random_uuid(),
  sede_id uuid not null references sedes(id) on delete cascade,
  nombre text not null,
  jugadores_por_equipo smallint not null default 2 check (jugadores_por_equipo in (1,2)),
  mejor_de int not null default 3,
  punto_oro boolean not null default false,
  canchas jsonb not null default '[]',        -- ids de las pistas habilitadas para el torneo
  equipos jsonb not null default '[]',        -- [{seed, jugadores:[{id,nombre}]}]
  tam int not null,                           -- tamaño del cuadro (potencia de 2)
  estado text not null default 'en_juego' check (estado in ('en_juego','finalizado')),
  campeon jsonb,
  created_by uuid references app_users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists torneo_partidos (
  id uuid primary key default gen_random_uuid(),
  torneo_id uuid not null references torneos(id) on delete cascade,
  ronda int not null,                         -- 1 = primera ronda
  pos int not null,                           -- posición dentro de la ronda (0..)
  equipo1 jsonb,                              -- {seed, jugadores:[...]} o null si aún no se define
  equipo2 jsonb,
  bye boolean not null default false,         -- pasó directo (sin rival)
  estado text not null default 'pendiente' check (estado in ('pendiente','en_juego','finalizado')),
  ganador smallint,                           -- 0 = equipo1, 1 = equipo2
  court_id uuid references canchas(id) on delete set null,
  match_id uuid references matches(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (torneo_id, ronda, pos)
);

-- enlace (sin FK, para no duplicar relaciones) del marcador hacia su partido de torneo
alter table matches add column if not exists torneo_partido_id uuid;

alter table torneos enable row level security;
alter table torneo_partidos enable row level security;
drop policy if exists "abierto" on torneos;
drop policy if exists "abierto" on torneo_partidos;
create policy "abierto" on torneos for all to anon using (true) with check (true);
create policy "abierto" on torneo_partidos for all to anon using (true) with check (true);
grant all on torneos, torneo_partidos to anon;

notify pgrst, 'reload schema';

-- =====================================================================
--  FOTO DE PERFIL Y AJUSTES DEL CLUB (nombre / logo)
-- =====================================================================
alter table app_users add column if not exists foto text;
grant select (foto) on app_users to anon;
grant update (foto) on app_users to anon;

create table if not exists ajustes (
  clave text primary key,
  valor text
);
alter table ajustes enable row level security;
drop policy if exists "abierto" on ajustes;
create policy "abierto" on ajustes for all to anon using (true) with check (true);
grant all on ajustes to anon;
insert into ajustes (clave, valor) values ('nombre_app', 'TuCancha') on conflict (clave) do nothing;

-- =====================================================================
--  GESTIÓN DE USUARIOS: editar, eliminar y login con correo o cédula
-- =====================================================================

-- Un correo no puede repetirse (ignorando mayúsculas); los vacíos no cuentan.
create unique index if not exists app_users_correo_unico
  on app_users (lower(correo)) where correo is not null and correo <> '';

-- Login con correo: devuelve la cédula asociada (el hash de la contraseña se calcula con ella).
create or replace function app_cedula_por_correo(p_correo text)
returns text language sql stable security definer set search_path = public as $$
  select cedula from app_users where lower(correo) = lower(trim(p_correo)) limit 1
$$;

-- El registro ahora también rechaza correos repetidos.
create or replace function app_register(p_nombre text, p_cedula text, p_telefono text,
                                        p_correo text, p_hash text, p_sede uuid)
returns jsonb language plpgsql security definer set search_path = public as $$
declare u app_users;
begin
  if exists (select 1 from app_users where cedula = p_cedula) then
    raise exception 'Esa cédula ya está registrada';
  end if;
  if coalesce(p_correo, '') <> '' and exists (select 1 from app_users where lower(correo) = lower(p_correo)) then
    raise exception 'Ese correo ya está registrado';
  end if;
  insert into app_users (nombre, cedula, telefono, correo, password_hash, sede_id)
  values (p_nombre, p_cedula, p_telefono, nullif(p_correo, ''), p_hash, p_sede)
  returning * into u;
  return to_jsonb(u) - 'password_hash';
end $$;

-- Editar un usuario. Si cambia la cédula hay que enviar un hash nuevo (el hash usa "cedula:contraseña").
create or replace function admin_update_user(p_id uuid, p_nombre text, p_cedula text, p_telefono text,
                                             p_correo text, p_role text, p_sede uuid, p_hash text default null)
returns void language plpgsql security definer set search_path = public as $$
declare cur app_users;
begin
  select * into cur from app_users where id = p_id;
  if not found then raise exception 'Usuario no encontrado'; end if;
  if p_role not in ('jugador','admin') then raise exception 'Rol no válido'; end if;
  if p_role = 'admin' and p_sede is null then raise exception 'Un administrador debe tener sede'; end if;
  if cur.role = 'admin' and p_role <> 'admin' and (select count(*) from app_users where role = 'admin') <= 1 then
    raise exception 'Debe existir al menos un administrador';
  end if;
  if exists (select 1 from app_users where cedula = p_cedula and id <> p_id) then
    raise exception 'Esa cédula ya está registrada';
  end if;
  if coalesce(p_correo, '') <> '' and exists (select 1 from app_users where lower(correo) = lower(p_correo) and id <> p_id) then
    raise exception 'Ese correo ya está registrado';
  end if;
  if p_cedula <> cur.cedula and p_hash is null then
    raise exception 'Al cambiar la cédula debes definir una nueva contraseña';
  end if;
  update app_users
     set nombre = p_nombre, cedula = p_cedula, telefono = p_telefono, correo = nullif(p_correo, ''),
         role = p_role, sede_id = p_sede, password_hash = coalesce(p_hash, password_hash)
   where id = p_id;
end $$;

-- Eliminar un usuario (sus reservas quedan sin dueño; wallet, notificaciones y puntos se borran con él).
create or replace function admin_delete_user(p_id uuid)
returns void language plpgsql security definer set search_path = public as $$
declare cur app_users;
begin
  select * into cur from app_users where id = p_id;
  if not found then raise exception 'Usuario no encontrado'; end if;
  if cur.role = 'admin' and (select count(*) from app_users where role = 'admin') <= 1 then
    raise exception 'No puedes eliminar al único administrador';
  end if;
  delete from app_users where id = p_id;
end $$;

grant execute on function app_cedula_por_correo(text),
                          app_register(text,text,text,text,text,uuid),
                          admin_update_user(uuid,text,text,text,text,text,uuid,text),
                          admin_delete_user(uuid) to anon;

notify pgrst, 'reload schema';

-- =====================================================================
--  CONTABILIDAD: ingresos, proveedores, facturas, notas crédito, gastos fijos
-- =====================================================================

-- ---------- PROVEEDORES ----------
create table if not exists proveedores (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  nit text,
  contacto text,
  telefono text,
  correo text,
  direccion text,
  notas text,
  created_at timestamptz not null default now()
);

-- ---------- FACTURAS DE PROVEEDORES (por pagar / pagadas) ----------
create table if not exists facturas_proveedor (
  id uuid primary key default gen_random_uuid(),
  proveedor_id uuid not null references proveedores(id) on delete restrict,
  sede_id uuid references sedes(id) on delete set null,
  numero text not null,
  concepto text,
  valor numeric(14,2) not null check (valor > 0),
  fecha_emision date not null default current_date,
  fecha_vencimiento date,
  estado text not null default 'pendiente' check (estado in ('pendiente','pagada')),
  fecha_pago date,
  metodo_pago text,                            -- efectivo | transferencia | datafono | pasarela | nota_credito
  valor_pagado numeric(14,2),                  -- valor de la factura menos notas crédito
  comprobante text,                            -- foto del comprobante (data URL)
  tiene_comp boolean not null default false,
  created_at timestamptz not null default now(),
  unique (proveedor_id, numero)
);

-- ---------- NOTAS CRÉDITO (asociadas a una factura) ----------
create table if not exists notas_credito (
  id uuid primary key default gen_random_uuid(),
  factura_id uuid not null references facturas_proveedor(id) on delete cascade,
  numero text,
  valor numeric(14,2) not null check (valor > 0),
  motivo text,
  fecha date not null default current_date,
  created_at timestamptz not null default now()
);

-- ---------- INGRESOS ----------
create table if not exists ingresos (
  id uuid primary key default gen_random_uuid(),
  sede_id uuid references sedes(id) on delete set null,
  valor numeric(14,2) not null check (valor > 0),
  concepto text not null default 'venta' check (concepto in ('venta','inscripcion','mensualidad','reserva','otro')),
  motivo text not null,
  metodo text not null check (metodo in ('efectivo','transferencia','datafono','pasarela')),
  fecha date not null default current_date,
  created_by uuid references app_users(id) on delete set null,
  created_at timestamptz not null default now()
);

-- ---------- GASTOS FIJOS (servicios públicos, arriendos, otros) ----------
create table if not exists gastos (
  id uuid primary key default gen_random_uuid(),
  sede_id uuid references sedes(id) on delete set null,
  categoria text not null check (categoria in ('servicio_publico','arriendo','otro')),
  concepto text not null,
  valor numeric(14,2) not null check (valor > 0),
  fecha date not null default current_date,
  metodo text check (metodo in ('efectivo','transferencia','datafono','pasarela')),
  notas text,
  comprobante text,
  tiene_comp boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists ingresos_fecha on ingresos (fecha);
create index if not exists gastos_fecha on gastos (fecha);
create index if not exists facturas_estado on facturas_proveedor (estado);

do $$
declare t text;
begin
  foreach t in array array['proveedores','facturas_proveedor','notas_credito','ingresos','gastos']
  loop
    execute format('alter table %I enable row level security', t);
    execute format('drop policy if exists "abierto" on %I', t);
    execute format('create policy "abierto" on %I for all to anon using (true) with check (true)', t);
    execute format('grant all on %I to anon', t);
  end loop;
end $$;

notify pgrst, 'reload schema';

-- =====================================================================
--  RESERVAS: correos automáticos, QR de inicio, contador de uso y lista de espera
-- =====================================================================
create extension if not exists pg_net with schema extensions;
create extension if not exists pg_cron;

-- ---------- Campos nuevos en reservas ----------
alter table reservas add column if not exists correo_cliente text;               -- correo opcional (cliente de mostrador)
alter table reservas add column if not exists qr_token uuid not null default gen_random_uuid();
create unique index if not exists reservas_qr_token_uk on reservas (qr_token);
alter table reservas add column if not exists uso text not null default 'pendiente' check (uso in ('pendiente','en_uso','finalizada'));
alter table reservas add column if not exists inicio_real timestamptz;           -- cuando el admin inició el conteo (QR o manual)
alter table reservas add column if not exists fin_real timestamptz;
alter table reservas add column if not exists conf_enviada boolean not null default false;
alter table reservas add column if not exists recordatorio_enviado boolean not null default false;

-- ---------- Lista de espera ----------
create table if not exists lista_espera (
  id uuid primary key default gen_random_uuid(),
  court_id uuid not null references canchas(id) on delete cascade,
  sede_id uuid references sedes(id) on delete cascade,
  fecha date not null,
  hora int not null,
  correo text not null,
  nombre text,
  user_id uuid references app_users(id) on delete set null,
  token uuid not null default gen_random_uuid() unique,   -- va solo en el correo; nunca se lee desde la app
  estado text not null default 'esperando' check (estado in ('esperando','notificado','tomada','cerrada')),
  notificado_at timestamptz,
  created_at timestamptz not null default now(),
  unique (court_id, fecha, hora, correo)
);
alter table lista_espera enable row level security;
drop policy if exists "abierto" on lista_espera;
create policy "abierto" on lista_espera for all to anon using (true) with check (true);
revoke all on lista_espera from anon;
grant select (id, court_id, sede_id, fecha, hora, correo, nombre, user_id, estado, created_at) on lista_espera to anon;
grant insert (court_id, sede_id, fecha, hora, correo, nombre, user_id) on lista_espera to anon;
grant delete on lista_espera to anon;

-- ---------- Ventana "¿Deseas tomar la reserva?" (se abre desde el enlace del correo) ----------
create or replace function espera_info(p_token uuid)
returns jsonb language plpgsql security definer set search_path = public as $$
declare e lista_espera; c canchas; s sedes; libre boolean; vigente boolean;
begin
  select * into e from lista_espera where token = p_token;
  if not found then return null; end if;
  select * into c from canchas where id = e.court_id;
  select * into s from sedes where id = e.sede_id;
  libre := not exists (select 1 from reservas where court_id = e.court_id and fecha = e.fecha and hora = e.hora and estado = 'confirmada');
  vigente := (e.fecha + make_interval(hours => e.hora)) > (now() at time zone 'America/Bogota');
  return jsonb_build_object('estado', e.estado, 'cancha', c.nombre, 'sede', s.nombre, 'ciudad', s.ciudad,
                            'fecha', e.fecha, 'hora', e.hora, 'precio', case when c.precio_noche > 0 and e.hora >= 18 then c.precio_noche else c.precio_hora end, 'libre', libre, 'vigente', vigente);
end $$;

-- El primero que acepta se queda con la cancha; el resto de la lista se cierra.
create or replace function espera_tomar(p_token uuid)
returns jsonb language plpgsql security definer set search_path = public as $$
declare e lista_espera; rid uuid;
begin
  select * into e from lista_espera where token = p_token for update;
  if not found then return jsonb_build_object('ok', false, 'motivo', 'no_existe'); end if;
  if e.estado not in ('esperando','notificado') then return jsonb_build_object('ok', false, 'motivo', 'cerrada'); end if;
  if (e.fecha + make_interval(hours => e.hora)) <= (now() at time zone 'America/Bogota') then
    update lista_espera set estado = 'cerrada' where id = e.id;
    return jsonb_build_object('ok', false, 'motivo', 'vencida');
  end if;
  begin
    insert into reservas (sede_id, court_id, user_id, nombre_cliente, correo_cliente, fecha, hora)
    values (coalesce(e.sede_id, (select sede_id from canchas where id = e.court_id)), e.court_id, e.user_id,
            case when e.user_id is null then coalesce(e.nombre, e.correo) end, e.correo, e.fecha, e.hora)
    returning id into rid;
  exception when unique_violation then
    return jsonb_build_object('ok', false, 'motivo', 'ocupada');
  end;
  update lista_espera set estado = 'tomada' where id = e.id;
  update lista_espera set estado = 'cerrada'
   where court_id = e.court_id and fecha = e.fecha and hora = e.hora and id <> e.id and estado in ('esperando','notificado');
  return jsonb_build_object('ok', true, 'reserva_id', rid);
end $$;
grant execute on function espera_info(uuid), espera_tomar(uuid) to anon;

-- ---------- Al liberarse una cancha, avisar a la lista de espera (por correo, vía Edge Function) ----------
create or replace function trg_reserva_liberada()
returns trigger language plpgsql security definer set search_path = public, extensions as $$
begin
  if old.estado = 'confirmada' and new.estado = 'cancelada'
     and exists (select 1 from lista_espera where court_id = new.court_id and fecha = new.fecha and hora = new.hora and estado = 'esperando') then
    perform net.http_post(
      url := 'https://cmnympltpkxbrxqvgter.supabase.co/functions/v1/correos',
      headers := '{"Content-Type":"application/json"}'::jsonb,
      body := jsonb_build_object('accion', 'espera', 'court_id', new.court_id, 'fecha', new.fecha, 'hora', new.hora));
  end if;
  return new;
end $$;
drop trigger if exists reservas_liberada on reservas;
create trigger reservas_liberada after update of estado on reservas for each row execute function trg_reserva_liberada();

-- ---------- Recordatorio 10 minutos antes (cada minuto) ----------
select cron.unschedule('recordatorios-reservas') where exists (select 1 from cron.job where jobname = 'recordatorios-reservas');
select cron.schedule('recordatorios-reservas', '* * * * *', $cron$
  select net.http_post(url := 'https://cmnympltpkxbrxqvgter.supabase.co/functions/v1/correos',
                       headers := '{"Content-Type":"application/json"}'::jsonb,
                       body := '{"accion":"recordatorios"}'::jsonb)
$cron$);

notify pgrst, 'reload schema';

-- =====================================================================
--  NOTIFICACIONES DEL ADMIN (campanita): reservas nuevas, cancelaciones, pagos y recargas
-- =====================================================================
alter table notificaciones add column if not exists tipo text;   -- reserva_nueva | reserva_cancelada | pago | recarga
alter table notificaciones add column if not exists voz text;    -- frase que dice el asistente en voz alta
create index if not exists notif_user_leida on notificaciones (user_id, leida);

create or replace function fecha_es(d date) returns text language sql immutable as $$
  select (array['domingo','lunes','martes','miércoles','jueves','viernes','sábado'])[extract(dow from d)::int + 1]
         || ' ' || extract(day from d)::int || ' de '
         || (array['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'])[extract(month from d)::int]
$$;

create or replace function hora_es(h int) returns text language sql immutable as $$
  select case when h = 12 then '12 del mediodía' when h = 0 then '12 de la noche'
              when h < 12 then h || ' de la mañana' when h < 19 then (h - 12) || ' de la tarde'
              else (h - 12) || ' de la noche' end
$$;

create or replace function notificar_admins(p_tipo text, p_texto text, p_voz text)
returns void language sql security definer set search_path = public as $$
  insert into notificaciones (user_id, texto, tipo, voz)
  select id, p_texto, p_tipo, p_voz from app_users where role = 'admin'
$$;

-- Reservas: nueva y cancelada
create or replace function trg_notif_reserva() returns trigger
language plpgsql security definer set search_path = public as $$
declare who text; cn text; sn text; det text; detv text;
begin
  who := initcap(coalesce(new.nombre_cliente, (select nombre from app_users where id = new.user_id), 'un cliente'));
  cn := coalesce((select nombre from canchas where id = new.court_id), 'una cancha');
  sn := coalesce((select nombre from sedes where id = new.sede_id), '');
  det  := cn || ' · ' || sn || ' · ' || fecha_es(new.fecha) || ' · ' || lpad(new.hora::text, 2, '0') || ':00';
  detv := cn || ', ' || sn || ', ' || fecha_es(new.fecha) || ' a las ' || hora_es(new.hora);
  if tg_op = 'INSERT' and new.estado = 'confirmada' then
    perform notificar_admins('reserva_nueva', '🆕 Reserva nueva de ' || who || ': ' || det, 'Tienes una reserva nueva de ' || who || ': ' || detv);
  elsif tg_op = 'UPDATE' and old.estado = 'confirmada' and new.estado = 'cancelada' then
    perform notificar_admins('reserva_cancelada', '❌ ' || who || ' está cancelando la reserva: ' || det, who || ' está cancelando la reserva de ' || detv);
  end if;
  return new;
end $$;
drop trigger if exists reservas_notif_ins on reservas;
drop trigger if exists reservas_notif_upd on reservas;
create trigger reservas_notif_ins after insert on reservas for each row execute function trg_notif_reserva();
create trigger reservas_notif_upd after update of estado on reservas for each row when (old.estado is distinct from new.estado) execute function trg_notif_reserva();

-- Recargas de wallet
create or replace function trg_notif_wallet() returns trigger
language plpgsql security definer set search_path = public as $$
declare who text;
begin
  if new.tipo = 'recarga' then
    who := initcap(coalesce((select nombre from app_users where id = new.user_id), 'un jugador'));
    perform notificar_admins('recarga',
      '💰 Recarga de $' || replace(to_char(new.monto, 'FM999,999,999'), ',', '.') || ' para ' || who,
      'Se registró una recarga de ' || new.monto::bigint || ' pesos para ' || who);
  end if;
  return new;
end $$;
drop trigger if exists wallet_notif on wallet_tx;
create trigger wallet_notif after insert on wallet_tx for each row execute function trg_notif_wallet();

-- Pagos: compras de la tienda por aprobar
create or replace function trg_notif_orden() returns trigger
language plpgsql security definer set search_path = public as $$
declare who text; prod text;
begin
  who := initcap(coalesce((select nombre from app_users where id = new.user_id), 'un jugador'));
  prod := coalesce((select nombre from productos where id = new.producto_id), 'un producto');
  perform notificar_admins('pago',
    '💳 Pago por aprobar de ' || who || ': ' || prod || ' x' || new.cantidad || ' · $' || replace(to_char(new.total, 'FM999,999,999'), ',', '.'),
    'Tienes un pago nuevo por aprobar de ' || who || ': ' || prod || ', ' || new.total::bigint || ' pesos');
  return new;
end $$;
drop trigger if exists orden_notif on ordenes;
create trigger orden_notif after insert on ordenes for each row execute function trg_notif_orden();

notify pgrst, 'reload schema';


-- =====================================================================
--  NOTIFICACIONES PUSH (avisos en el celular aunque la app esté cerrada)
-- =====================================================================
create table if not exists push_subs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references app_users(id) on delete cascade,
  endpoint text not null unique,          -- dirección del servicio push del navegador de ese dispositivo
  p256dh text not null,
  auth text not null,
  ua text,
  created_at timestamptz not null default now()
);
alter table push_subs enable row level security;
revoke all on push_subs from anon;        -- la app no lee ni escribe esta tabla directamente: solo por las funciones de abajo

create or replace function push_guardar(p_user uuid, p_endpoint text, p_p256dh text, p_auth text, p_ua text default null)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from app_users where id = p_user) then raise exception 'Usuario no válido'; end if;
  if p_endpoint !~ '^https://' then raise exception 'Suscripción no válida'; end if;
  insert into push_subs (user_id, endpoint, p256dh, auth, ua) values (p_user, p_endpoint, p_p256dh, p_auth, left(p_ua, 200))
  on conflict (endpoint) do update set user_id = excluded.user_id, p256dh = excluded.p256dh, auth = excluded.auth, ua = excluded.ua;
end $$;

create or replace function push_quitar(p_endpoint text)
returns void language sql security definer set search_path = public as $$
  delete from push_subs where endpoint = p_endpoint
$$;
grant execute on function push_guardar(uuid,text,text,text,text), push_quitar(text) to anon;

-- Cada notificación nueva dispara el envío push (solo si el usuario tiene algún dispositivo suscrito)
create or replace function trg_push_notif() returns trigger
language plpgsql security definer set search_path = public, extensions as $$
begin
  if exists (select 1 from push_subs where user_id = new.user_id) then
    perform net.http_post(
      url := 'https://cmnympltpkxbrxqvgter.supabase.co/functions/v1/push',
      headers := '{"Content-Type":"application/json"}'::jsonb,
      body := jsonb_build_object('notif_id', new.id));
  end if;
  return new;
end $$;
drop trigger if exists notif_push on notificaciones;
create trigger notif_push after insert on notificaciones for each row execute function trg_push_notif();

notify pgrst, 'reload schema';

-- =====================================================================
--  RETOS ENTRE JUGADORES (1 contra 1) con apuesta opcional del wallet
--  Flujo: retar -> el retado acepta (se reserva la cancha) -> acuerdan apuesta (se retiene el dinero)
--         -> el admin juega el partido con el marcador -> al terminar, el premio pasa solo al ganador.
-- =====================================================================
create table if not exists retos (
  id uuid primary key default gen_random_uuid(),
  retador_id uuid not null references app_users(id) on delete cascade,
  retado_id uuid not null references app_users(id) on delete cascade,
  sede_id uuid not null references sedes(id) on delete cascade,
  court_id uuid not null references canchas(id) on delete cascade,
  fecha date not null,
  hora int not null check (hora between 0 and 23),
  mensaje text,
  estado text not null default 'pendiente'
    check (estado in ('pendiente','aceptado','en_juego','finalizado','rechazado','cancelado')),
  reserva_id uuid references reservas(id) on delete set null,
  apuesta_monto numeric(12,2) not null default 0 check (apuesta_monto >= 0),
  apuesta_por uuid references app_users(id) on delete set null,    -- quién propuso la apuesta vigente
  apuesta_bloqueada boolean not null default false,                -- ambos confirmaron: el dinero ya está retenido
  ganador_id uuid references app_users(id) on delete set null,
  match_id uuid,                                                   -- marcador del partido (sin FK para no duplicar relaciones)
  pagado_at timestamptz,
  created_at timestamptz not null default now(),
  constraint retos_distintos check (retador_id <> retado_id)
);
create index if not exists retos_retador on retos (retador_id, estado);
create index if not exists retos_retado on retos (retado_id, estado);

alter table matches add column if not exists reto_id uuid;
alter table notificaciones add column if not exists reto_id uuid;

-- Solo lectura directa: todo lo que mueve dinero o estados pasa por las funciones de abajo.
alter table retos enable row level security;
drop policy if exists "abierto" on retos;
create policy "abierto" on retos for select to anon using (true);
revoke all on retos from anon;
grant select on retos to anon;

-- ---------- utilidades ----------
create or replace function _nom(p_id uuid) returns text language sql stable security definer set search_path = public as $$
  select initcap(coalesce((select nombre from app_users where id = p_id), 'un jugador'))
$$;
create or replace function _pesos(p numeric) returns text language sql immutable as $$
  select '$' || replace(to_char(p, 'FM999,999,999'), ',', '.')
$$;
create or replace function _reto_detalle(r retos) returns text language sql stable security definer set search_path = public as $$
  select coalesce((select nombre from canchas where id = r.court_id), 'una cancha') || ', ' ||
         coalesce((select nombre from sedes where id = r.sede_id), '') || ', ' || fecha_es(r.fecha) || ' a las ' || hora_es(r.hora)
$$;
create or replace function _reto_aviso(p_user uuid, p_reto uuid, p_texto text, p_voz text default null) returns void
language sql security definer set search_path = public as $$
  insert into notificaciones (user_id, texto, tipo, voz, reto_id) values (p_user, p_texto, 'reto', coalesce(p_voz, p_texto), p_reto)
$$;

-- devuelve el dinero retenido (si lo hay) a los dos jugadores
create or replace function _reto_reembolsar(r retos, p_motivo text) returns void
language plpgsql security definer set search_path = public as $$
begin
  if r.apuesta_bloqueada and r.apuesta_monto > 0 then
    perform wallet_mov(r.retador_id, r.apuesta_monto, 'reembolso', 'Apuesta devuelta: ' || p_motivo);
    perform wallet_mov(r.retado_id, r.apuesta_monto, 'reembolso', 'Apuesta devuelta: ' || p_motivo);
  end if;
end $$;

-- ---------- 1) retar ----------
create or replace function reto_crear(p_retador uuid, p_retado uuid, p_court uuid, p_fecha date, p_hora int, p_msg text default null)
returns uuid language plpgsql security definer set search_path = public as $$
declare c canchas; s sedes; rid uuid; r retos;
begin
  if p_retador = p_retado then raise exception 'No puedes retarte a ti mismo'; end if;
  if not exists (select 1 from app_users where id = p_retador and role = 'jugador') then raise exception 'Jugador no válido'; end if;
  if not exists (select 1 from app_users where id = p_retado and role = 'jugador') then raise exception 'El jugador retado no existe'; end if;
  select * into c from canchas where id = p_court and activa;  if not found then raise exception 'La cancha no está disponible'; end if;
  select * into s from sedes where id = c.sede_id and activa;  if not found then raise exception 'La sede no está disponible'; end if;
  if p_hora < s.apertura or p_hora >= s.cierre then raise exception 'Esa hora está fuera del horario de la sede'; end if;
  if (p_fecha + make_interval(hours => p_hora)) <= (now() at time zone 'America/Bogota') then raise exception 'Ese horario ya pasó'; end if;
  if exists (select 1 from reservas where court_id = p_court and fecha = p_fecha and hora = p_hora and estado = 'confirmada') then
    raise exception 'Esa cancha ya está reservada a esa hora'; end if;
  if exists (select 1 from retos where retador_id = p_retador and retado_id = p_retado and court_id = p_court and fecha = p_fecha and hora = p_hora and estado = 'pendiente') then
    raise exception 'Ya le enviaste este reto'; end if;
  insert into retos (retador_id, retado_id, sede_id, court_id, fecha, hora, mensaje)
  values (p_retador, p_retado, c.sede_id, p_court, p_fecha, p_hora, nullif(trim(p_msg), '')) returning * into r;
  perform _reto_aviso(p_retado, r.id,
    '⚔️ ' || _nom(p_retador) || ' te retó a jugar: ' || replace(_reto_detalle(r), ', ', ' · '),
    _nom(p_retador) || ' te retó a jugar. ' || _reto_detalle(r) || '. Abre la aplicación para aceptar o rechazar.');
  return r.id;
end $$;

-- ---------- 2) aceptar / rechazar (al aceptar se reserva la cancha) ----------
create or replace function reto_responder(p_reto uuid, p_user uuid, p_acepta boolean)
returns jsonb language plpgsql security definer set search_path = public as $$
declare r retos; rid uuid;
begin
  select * into r from retos where id = p_reto for update;
  if not found then return jsonb_build_object('ok', false, 'motivo', 'no_existe'); end if;
  if r.retado_id <> p_user then raise exception 'Solo el jugador retado puede responder'; end if;
  if r.estado <> 'pendiente' then return jsonb_build_object('ok', false, 'motivo', 'cerrado'); end if;
  if not p_acepta then
    update retos set estado = 'rechazado' where id = r.id;
    perform _reto_aviso(r.retador_id, r.id, '🚫 ' || _nom(r.retado_id) || ' rechazó tu reto');
    return jsonb_build_object('ok', true, 'estado', 'rechazado');
  end if;
  if (r.fecha + make_interval(hours => r.hora)) <= (now() at time zone 'America/Bogota') then
    update retos set estado = 'cancelado' where id = r.id;
    return jsonb_build_object('ok', false, 'motivo', 'vencido');
  end if;
  begin
    insert into reservas (sede_id, court_id, user_id, fecha, hora) values (r.sede_id, r.court_id, r.retador_id, r.fecha, r.hora) returning id into rid;
  exception when unique_violation then
    return jsonb_build_object('ok', false, 'motivo', 'ocupada');
  end;
  update retos set estado = 'aceptado', reserva_id = rid where id = r.id;
  perform _reto_aviso(r.retador_id, r.id, '✅ ' || _nom(r.retado_id) || ' aceptó tu reto. La cancha quedó reservada; ahora pueden acordar una apuesta.');
  return jsonb_build_object('ok', true, 'estado', 'aceptado');
end $$;

-- ---------- 3) apuesta: proponer (o contraproponer) ----------
create or replace function reto_apuesta(p_reto uuid, p_user uuid, p_monto numeric)
returns void language plpgsql security definer set search_path = public as $$
declare r retos; otro uuid; saldo numeric;
begin
  select * into r from retos where id = p_reto for update;
  if not found then raise exception 'Reto no encontrado'; end if;
  if p_user not in (r.retador_id, r.retado_id) then raise exception 'No participas en este reto'; end if;
  if r.estado <> 'aceptado' then raise exception 'La apuesta solo se puede acordar cuando el reto está aceptado y aún no empezó'; end if;
  if r.apuesta_bloqueada then raise exception 'La apuesta ya está confirmada y el dinero retenido'; end if;
  if p_monto is null or p_monto < 0 or p_monto > 10000000 then raise exception 'Monto no válido'; end if;
  otro := case when p_user = r.retador_id then r.retado_id else r.retador_id end;
  if p_monto = 0 then
    update retos set apuesta_monto = 0, apuesta_por = null where id = r.id;
    perform _reto_aviso(otro, r.id, '🤝 ' || _nom(p_user) || ' propone jugar sin apuesta');
    return;
  end if;
  select wallet into saldo from app_users where id = p_user;
  if saldo < p_monto then raise exception 'Tu saldo (%) no alcanza para apostar %', _pesos(saldo), _pesos(p_monto); end if;
  update retos set apuesta_monto = p_monto, apuesta_por = p_user where id = r.id;
  perform _reto_aviso(otro, r.id, '💰 ' || _nom(p_user) || ' propone apostar ' || _pesos(p_monto) || ' cada uno. El ganador se lleva ' || _pesos(p_monto * 2) || '.',
    _nom(p_user) || ' propone apostar ' || p_monto::bigint || ' pesos cada uno en tu reto. Abre la aplicación para aceptar.');
end $$;

-- ---------- 3b) el otro jugador confirma la apuesta: se retiene el dinero de los dos ----------
create or replace function reto_confirmar_apuesta(p_reto uuid, p_user uuid)
returns void language plpgsql security definer set search_path = public as $$
declare r retos;
begin
  select * into r from retos where id = p_reto for update;
  if not found then raise exception 'Reto no encontrado'; end if;
  if p_user not in (r.retador_id, r.retado_id) then raise exception 'No participas en este reto'; end if;
  if r.estado <> 'aceptado' then raise exception 'El reto ya no admite apuestas'; end if;
  if r.apuesta_bloqueada then return; end if;
  if r.apuesta_monto <= 0 or r.apuesta_por is null then raise exception 'Todavía no hay una apuesta propuesta'; end if;
  if r.apuesta_por = p_user then raise exception 'Debe confirmarla el otro jugador'; end if;
  -- si alguno no tiene saldo, wallet_mov falla y NO se descuenta a nadie (todo o nada)
  perform wallet_mov(r.retador_id, -r.apuesta_monto, 'apuesta', 'Apuesta retenida: reto contra ' || _nom(r.retado_id));
  perform wallet_mov(r.retado_id,  -r.apuesta_monto, 'apuesta', 'Apuesta retenida: reto contra ' || _nom(r.retador_id));
  update retos set apuesta_bloqueada = true where id = r.id;
  perform _reto_aviso(r.apuesta_por, r.id, '🔒 Apuesta confirmada: ' || _pesos(r.apuesta_monto) || ' cada uno. El ganador se lleva ' || _pesos(r.apuesta_monto * 2) || '.');
end $$;

-- ---------- 4) cancelar (con devolución del dinero retenido) ----------
create or replace function reto_cancelar(p_reto uuid, p_user uuid)
returns void language plpgsql security definer set search_path = public as $$
declare r retos; otro uuid;
begin
  select * into r from retos where id = p_reto for update;
  if not found then raise exception 'Reto no encontrado'; end if;
  if p_user not in (r.retador_id, r.retado_id) then raise exception 'No participas en este reto'; end if;
  if r.estado not in ('pendiente','aceptado') then raise exception 'Este reto ya no se puede cancelar'; end if;
  otro := case when p_user = r.retador_id then r.retado_id else r.retador_id end;
  perform _reto_reembolsar(r, 'reto cancelado');
  update retos set estado = 'cancelado' where id = r.id;
  if r.reserva_id is not null then update reservas set estado = 'cancelada' where id = r.reserva_id and estado = 'confirmada'; end if;
  perform _reto_aviso(otro, r.id, '❌ ' || _nom(p_user) || ' canceló el reto' || case when r.apuesta_bloqueada and r.apuesta_monto > 0 then '. Se te devolvió tu apuesta de ' || _pesos(r.apuesta_monto) else '' end);
end $$;

-- Si el admin cancela la reserva de un reto, el reto se cancela y se devuelve el dinero
create or replace function trg_reto_reserva_cancelada() returns trigger
language plpgsql security definer set search_path = public as $$
declare r retos;
begin
  select * into r from retos where reserva_id = new.id and estado in ('pendiente','aceptado') for update;
  if found then
    perform _reto_reembolsar(r, 'se canceló la reserva');
    update retos set estado = 'cancelado' where id = r.id;
    perform _reto_aviso(r.retador_id, r.id, '❌ Se canceló la reserva del reto contra ' || _nom(r.retado_id) || '. El reto se canceló' || case when r.apuesta_bloqueada and r.apuesta_monto > 0 then ' y se devolvió tu apuesta' else '' end);
    perform _reto_aviso(r.retado_id, r.id, '❌ Se canceló la reserva del reto contra ' || _nom(r.retador_id) || '. El reto se canceló' || case when r.apuesta_bloqueada and r.apuesta_monto > 0 then ' y se devolvió tu apuesta' else '' end);
  end if;
  return new;
end $$;
drop trigger if exists reservas_reto_cancel on reservas;
create trigger reservas_reto_cancel after update of estado on reservas for each row
  when (old.estado = 'confirmada' and new.estado = 'cancelada') execute function trg_reto_reserva_cancelada();

-- ---------- 5) el admin inicia el partido: crea el marcador ligado al reto ----------
create or replace function reto_iniciar(p_reto uuid, p_mejor_de int default 3, p_oro boolean default false)
returns uuid language plpgsql security definer set search_path = public as $$
declare r retos; mid uuid;
begin
  select * into r from retos where id = p_reto for update;
  if not found then raise exception 'Reto no encontrado'; end if;
  if r.estado <> 'aceptado' then raise exception 'El reto no está listo para jugarse (estado: %)', r.estado; end if;
  insert into matches (sede_id, court_id, equipo1, equipo2, mejor_de, punto_oro, reto_id)
  values (r.sede_id, r.court_id,
          jsonb_build_array(jsonb_build_object('id', r.retador_id, 'nombre', _nom(r.retador_id))),
          jsonb_build_array(jsonb_build_object('id', r.retado_id,  'nombre', _nom(r.retado_id))),
          p_mejor_de, p_oro, r.id) returning id into mid;
  update retos set estado = 'en_juego', match_id = mid where id = r.id;
  return mid;
end $$;

-- ---------- 6) al terminar el partido, el premio pasa solo al ganador ----------
create or replace function trg_reto_liquidar() returns trigger
language plpgsql security definer set search_path = public as $$
declare r retos; win uuid; lose uuid; pot numeric := 0;
begin
  select * into r from retos where id = new.reto_id for update;
  if not found or r.estado <> 'en_juego' then return new; end if;        -- ya liquidado o no aplica
  win  := case when new.ganador = 0 then r.retador_id else r.retado_id end;
  lose := case when new.ganador = 0 then r.retado_id else r.retador_id end;
  if r.apuesta_bloqueada and r.apuesta_monto > 0 then
    pot := r.apuesta_monto * 2;
    perform wallet_mov(win, pot, 'premio', 'Premio del reto contra ' || _nom(lose));
  end if;
  update retos set estado = 'finalizado', ganador_id = win, pagado_at = case when pot > 0 then now() end where id = r.id;
  perform _reto_aviso(win,  r.id, '🏆 ¡Ganaste el reto contra ' || _nom(lose) || '!' || case when pot > 0 then ' Se acreditaron ' || _pesos(pot) || ' a tu wallet.' else '' end);
  perform _reto_aviso(lose, r.id, '🎾 ' || _nom(win) || ' ganó el reto.' || case when pot > 0 then ' Perdiste tu apuesta de ' || _pesos(r.apuesta_monto) || '.' else ' ¡A la revancha!' end);
  return new;
end $$;
drop trigger if exists matches_reto on matches;
create trigger matches_reto after update of status on matches for each row
  when (new.status = 'finalizado' and old.status is distinct from 'finalizado' and new.reto_id is not null and new.ganador is not null)
  execute function trg_reto_liquidar();

grant execute on function reto_crear(uuid,uuid,uuid,date,int,text), reto_responder(uuid,uuid,boolean), reto_apuesta(uuid,uuid,numeric),
                          reto_confirmar_apuesta(uuid,uuid), reto_cancelar(uuid,uuid), reto_iniciar(uuid,int,boolean) to anon;
revoke execute on function _reto_reembolsar(retos,text), _reto_aviso(uuid,uuid,text,text) from anon, public;

notify pgrst, 'reload schema';

-- El administrador puede anular un reto (aceptado o ya en juego) y se devuelve la apuesta retenida a los dos jugadores.
create or replace function reto_anular(p_reto uuid)
returns void language plpgsql security definer set search_path = public as $$
declare r retos; con_dinero boolean;
begin
  select * into r from retos where id = p_reto for update;
  if not found then raise exception 'Reto no encontrado'; end if;
  if r.estado not in ('aceptado', 'en_juego') then raise exception 'Este reto no se puede anular (estado: %)', r.estado; end if;
  con_dinero := r.apuesta_bloqueada and r.apuesta_monto > 0;
  perform _reto_reembolsar(r, 'reto anulado por el administrador');
  update retos set estado = 'cancelado' where id = r.id;
  if r.match_id is not null then update matches set status = 'finalizado', fin = now() where id = r.match_id and status <> 'finalizado'; end if;
  if r.reserva_id is not null and r.estado = 'aceptado' then update reservas set estado = 'cancelada' where id = r.reserva_id and estado = 'confirmada'; end if;
  perform _reto_aviso(r.retador_id, r.id, '⛔ El administrador anuló tu reto contra ' || _nom(r.retado_id) || case when con_dinero then '. Se te devolvió tu apuesta de ' || _pesos(r.apuesta_monto) else '' end);
  perform _reto_aviso(r.retado_id, r.id, '⛔ El administrador anuló tu reto contra ' || _nom(r.retador_id) || case when con_dinero then '. Se te devolvió tu apuesta de ' || _pesos(r.apuesta_monto) else '' end);
end $$;
grant execute on function reto_anular(uuid) to anon;
notify pgrst, 'reload schema';

-- =====================================================================
--  PUBLICIDAD (avisos del club a los jugadores)
--  El admin escribe un aviso -> queda en `publicidad` (historial) y se crea una notificación
--  para cada jugador destinatario -> el trigger notif_push (ya existente) manda el push a cada
--  dispositivo suscrito. No mueve dinero real, solo información.
-- =====================================================================
create table if not exists publicidad (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  mensaje text not null,
  imagen text,                                          -- opcional, igual que las fotos de productos/comprobantes
  sede_id uuid references sedes(id) on delete set null,  -- null = todas las sedes
  creado_por uuid references app_users(id) on delete set null,
  enviados int not null default 0,
  created_at timestamptz not null default now()
);
alter table publicidad enable row level security;
drop policy if exists "abierto" on publicidad;
create policy "abierto" on publicidad for select to anon using (true);   -- solo lectura directa; se escribe por la función de abajo
grant select on publicidad to anon;

alter table notificaciones add column if not exists publicidad_id uuid references publicidad(id) on delete cascade;

create or replace function publicidad_enviar(p_titulo text, p_mensaje text, p_imagen text default null,
                                              p_sede uuid default null, p_creador uuid default null)
returns int language plpgsql security definer set search_path = public as $$
declare v_id uuid; v_n int;
begin
  if coalesce(trim(p_titulo), '') = '' then raise exception 'Escribe un título'; end if;
  if coalesce(trim(p_mensaje), '') = '' then raise exception 'Escribe un mensaje'; end if;
  insert into publicidad (titulo, mensaje, imagen, sede_id, creado_por)
  values (trim(p_titulo), trim(p_mensaje), p_imagen, p_sede, p_creador)
  returning id into v_id;
  insert into notificaciones (user_id, texto, tipo, voz, publicidad_id)
  select id, '📣 ' || trim(p_titulo) || ': ' || trim(p_mensaje), 'publicidad', trim(p_titulo) || '. ' || trim(p_mensaje), v_id
    from app_users
   where role = 'jugador' and (p_sede is null or sede_id = p_sede);
  get diagnostics v_n = row_count;
  -- Además, queda registrado en la campanita de TODOS los administradores (igual que reservas, pagos y recargas),
  -- como respaldo de que el aviso se envió; no cuenta para "enviados" (esa cifra es solo jugadores).
  insert into notificaciones (user_id, texto, tipo, voz, publicidad_id)
  select id, '📣 ' || trim(p_titulo) || ': ' || trim(p_mensaje), 'publicidad', trim(p_titulo) || '. ' || trim(p_mensaje), v_id
    from app_users
   where role = 'admin';
  update publicidad set enviados = v_n where id = v_id;
  return v_n;
end $$;
grant execute on function publicidad_enviar(text,text,text,uuid,uuid) to anon;
notify pgrst, 'reload schema';

-- =====================================================================
--  COLA DEL MARCADOR (para anotar puntos desde fuera del navegador: smartwatch, atajos, etc.)
--  La regla del juego (15-30-40, ventajas, sets, tie-break) sigue viviendo solo en index.html.
--  Esta función NO la repite: solo dispara un aviso "sumar un punto al equipo X del partido Y",
--  que el panel del marcador (ya abierto en el navegador de quien lo controla) recoge y aplica con
--  su misma lógica de siempre. Así nunca hay dos copias de la regla del juego que se puedan desincronizar.
-- =====================================================================
create table if not exists marcador_cola (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references matches(id) on delete cascade,
  equipo smallint not null check (equipo in (0, 1)),
  origen text,                    -- de dónde vino: 'watch', 'shortcut', etc. (informativo)
  created_at timestamptz not null default now()
);
alter table marcador_cola enable row level security;
drop policy if exists "abierto" on marcador_cola;
drop policy if exists "borrar" on marcador_cola;
create policy "abierto" on marcador_cola for select to anon using (true);      -- se escribe solo por la función
create policy "borrar" on marcador_cola for delete to anon using (true);      -- se borra al consumirla desde el navegador
grant select, delete on marcador_cola to anon;

create or replace function marcador_anotar(p_match uuid, p_equipo smallint, p_origen text default null)
returns void language plpgsql security definer set search_path = public as $$
begin
  if p_equipo not in (0, 1) then raise exception 'Equipo inválido'; end if;
  if not exists (select 1 from matches where id = p_match and status = 'en_juego') then
    raise exception 'Este partido no está en juego';
  end if;
  insert into marcador_cola (match_id, equipo, origen) values (p_match, p_equipo, p_origen);
end $$;
grant execute on function marcador_anotar(uuid,smallint,text) to anon;
notify pgrst, 'reload schema';

-- =====================================================================
--  ANUNCIOS EMERGENTES (pop-up al entrar el jugador): imágenes formato historia 9:16 o post 1:1,
--  N segundos c/u, enlace opcional. Solo se muestran las que el admin deje `activo`. No mueve dinero.
-- =====================================================================
create table if not exists pop_ads (
  id uuid primary key default gen_random_uuid(),
  imagen text not null,
  enlace text,
  formato text not null default 'historia' check (formato in ('historia','post')),
  segundos int not null default 3 check (segundos between 2 and 15),
  sede_id uuid references sedes(id) on delete set null,   -- null = todas las sedes
  activo boolean not null default false,
  orden bigint not null default 0,
  created_at timestamptz not null default now()
);
alter table pop_ads enable row level security;
drop policy if exists "abierto" on pop_ads;
create policy "abierto" on pop_ads for all to anon using (true) with check (true);   -- modelo abierto, igual que el resto de tablas
grant select, insert, update, delete on pop_ads to anon;
notify pgrst, 'reload schema';

-- =====================================================================
--  CUENTA DE CONSUMO POR RESERVA  +  BANNER EDITABLE  (TuCancha)
-- =====================================================================
alter table reservas add column if not exists cuenta_estado text not null default 'abierta';
alter table reservas add column if not exists cuenta_total numeric(14,2);
alter table reservas add column if not exists cuenta_metodo text;
alter table reservas add column if not exists cuenta_pagada_at timestamptz;

create table if not exists cuenta_items (
  id uuid primary key default gen_random_uuid(),
  reserva_id uuid not null references reservas(id) on delete cascade,
  producto_id uuid references productos(id) on delete set null,
  nombre text not null,
  precio numeric(12,2) not null default 0,
  cantidad int not null default 1 check (cantidad > 0),
  created_by uuid references app_users(id) on delete set null,
  created_at timestamptz not null default now()
);
create index if not exists cuenta_items_reserva on cuenta_items (reserva_id);
alter table cuenta_items enable row level security;
drop policy if exists "abierto" on cuenta_items;
create policy "abierto" on cuenta_items for all to anon using (true) with check (true);
grant select, insert, update, delete on cuenta_items to anon;

create table if not exists banner (
  id uuid primary key default gen_random_uuid(),
  imagen text not null,              -- data URL (JPG reducido) o URL pública
  titulo text,
  subtitulo text,
  orden int not null default 0,
  activo boolean not null default true,
  created_at timestamptz not null default now()
);
alter table banner enable row level security;
drop policy if exists "abierto" on banner;
create policy "abierto" on banner for all to anon using (true) with check (true);
grant select, insert, update, delete on banner to anon;
notify pgrst, 'reload schema';
