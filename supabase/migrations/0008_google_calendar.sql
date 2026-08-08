-- Integración Google Calendar: tokens OAuth por profesional + referencia al
-- evento creado en cada cita. Ver docs/plan.md para contexto general.

-- ─── Tablas ─────────────────────────────────────────────────────────────

create table profesional_google_tokens (
  profesional_id uuid primary key references profesionales (id) on delete cascade,
  email text not null,
  calendar_id text not null default 'primary',
  refresh_token text not null,
  access_token text,
  access_token_expira timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table citas add column google_event_id text;

-- ─── RLS ────────────────────────────────────────────────────────────────
-- Igual que el resto de las tablas de agenda: solo admin por RLS. En la
-- práctica, el módulo src/lib/google/* accede con el cliente service-role
-- (necesario porque el push se dispara también desde flujos de paciente).

alter table profesional_google_tokens enable row level security;

create policy "profesional_google_tokens: admin gestiona" on profesional_google_tokens
  for all using (es_admin());
