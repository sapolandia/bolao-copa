-- ============================================================
-- Bolão da Copa 2026 — Schema + RLS + Funções
-- Executar no SQL Editor do Supabase
-- ============================================================

-- ---- Tipos ----
create type fase_jogo as enum ('grupos', 'oitavas', 'quartas', 'semi', 'terceiro', 'final');
create type status_jogo as enum ('agendado', 'encerrado');

-- ---- Participantes ----
create table participantes (
  id          uuid primary key references auth.users(id) on delete cascade,
  nome        text not null,
  email       text not null unique,
  is_admin    boolean not null default false,
  created_at  timestamptz not null default now()
);

-- Trigger: criar participante ao confirmar e-mail
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.participantes(id, nome, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'nome', split_part(new.email, '@', 1)),
    new.email
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- ---- Allowlist de convidados ----
create table convidados (
  email       text primary key,
  created_at  timestamptz not null default now()
);

-- Hook: bloquear signup de e-mails não convidados
-- (configurar no Supabase Auth > Hooks > Before Email OTP)
create or replace function check_convidado(event jsonb)
returns jsonb language plpgsql security definer as $$
begin
  if not exists (select 1 from convidados where email = event->>'email') then
    return jsonb_build_object('error', jsonb_build_object(
      'http_code', 422,
      'message', 'Acesso restrito a convidados.'
    ));
  end if;
  return event;
end;
$$;

-- ---- Jogos ----
create table jogos (
  id                  uuid primary key default gen_random_uuid(),
  fase                fase_jogo not null,
  mandante            text not null,  -- código do time, ex: 'BRA'
  visitante           text not null,
  kickoff_at          timestamptz not null,
  placar_mandante     integer,
  placar_visitante    integer,
  classificado        text,           -- só mata-mata; código do time classificado
  status              status_jogo not null default 'agendado',
  created_at          timestamptz not null default now()
);

-- ---- Palpites ----
create table palpites (
  id                  uuid primary key default gen_random_uuid(),
  participante_id     uuid not null references participantes(id) on delete cascade,
  jogo_id             uuid not null references jogos(id) on delete cascade,
  placar_mandante     integer not null default 0,
  placar_visitante    integer not null default 0,
  classificado        text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  unique (participante_id, jogo_id)
);

-- ---- Palpite artilheiro ----
create table palpite_artilheiro (
  id                  uuid primary key default gen_random_uuid(),
  participante_id     uuid not null references participantes(id) on delete cascade unique,
  jogador             text not null,
  created_at          timestamptz not null default now()
);

-- ---- Artilheiro real ----
create table artilheiro_real (
  id          uuid primary key default gen_random_uuid(),
  jogador     text not null,
  definido_em timestamptz not null default now()
);

-- ============================================================
-- RLS
-- ============================================================

alter table participantes enable row level security;
alter table jogos enable row level security;
alter table palpites enable row level security;
alter table palpite_artilheiro enable row level security;
alter table convidados enable row level security;

-- Participantes: leitura para todos autenticados
create policy "participantes_select" on participantes
  for select to authenticated using (true);

-- Participantes: só o próprio pode atualizar nome
create policy "participantes_update_self" on participantes
  for update to authenticated using (auth.uid() = id);

-- Jogos: leitura pública para autenticados
create policy "jogos_select" on jogos
  for select to authenticated using (true);

-- Jogos: só admin pode inserir/atualizar
create policy "jogos_insert_admin" on jogos
  for insert to authenticated
  with check ((select is_admin from participantes where id = auth.uid()));

create policy "jogos_update_admin" on jogos
  for update to authenticated
  using ((select is_admin from participantes where id = auth.uid()));

-- Palpites: participante sempre lê/escreve os próprios
create policy "palpites_select_own" on palpites
  for select to authenticated
  using (participante_id = auth.uid());

-- Palpites: lê palpites de terceiros SÓ após a trava do jogo
create policy "palpites_select_others_after_lock" on palpites
  for select to authenticated
  using (
    participante_id != auth.uid() and
    exists (
      select 1 from jogos j
      where j.id = jogo_id
        and j.kickoff_at <= now()
    )
  );

-- Palpites: insert/update só antes da trava do dia
create policy "palpites_insert" on palpites
  for insert to authenticated
  with check (
    participante_id = auth.uid() and
    exists (
      select 1 from jogos j
      where j.id = jogo_id
        and j.kickoff_at > now()
    )
  );

create policy "palpites_update" on palpites
  for update to authenticated
  using (
    participante_id = auth.uid() and
    exists (
      select 1 from jogos j
      where j.id = jogo_id
        and j.kickoff_at > now()
    )
  );

-- Artilheiro: participante vê/escreve o próprio
create policy "artilheiro_select_own" on palpite_artilheiro
  for select to authenticated
  using (participante_id = auth.uid());

-- Artilheiro de terceiros: visível após o início da Copa
-- (ajustar a data para o kickoff do primeiro jogo)
create policy "artilheiro_select_after_start" on palpite_artilheiro
  for select to authenticated
  using (
    participante_id != auth.uid() and
    now() >= '2026-06-11 13:00:00-03'::timestamptz
  );

-- Artilheiro: insert/update antes do início da Copa
create policy "artilheiro_insert" on palpite_artilheiro
  for insert to authenticated
  with check (
    participante_id = auth.uid() and
    now() < '2026-06-11 13:00:00-03'::timestamptz
  );

create policy "artilheiro_update" on palpite_artilheiro
  for update to authenticated
  using (
    participante_id = auth.uid() and
    now() < '2026-06-11 13:00:00-03'::timestamptz
  );

-- Convidados: só admin acessa
create policy "convidados_admin" on convidados
  for all to authenticated
  using ((select is_admin from participantes where id = auth.uid()));

-- ============================================================
-- Funções de pontuação e ranking
-- ============================================================

create or replace function pontos_palpite(p palpites, j jogos)
returns integer language plpgsql immutable as $$
declare
  pts integer := 0;
  res_real integer;
  res_palp integer;
begin
  if j.placar_mandante is null or j.placar_visitante is null then
    return 0;
  end if;

  if j.fase = 'grupos' then
    if p.placar_mandante = j.placar_mandante and p.placar_visitante = j.placar_visitante then
      return 3;
    end if;
    res_real := sign(j.placar_mandante - j.placar_visitante);
    res_palp := sign(p.placar_mandante - p.placar_visitante);
    if res_real = res_palp then return 1; end if;
    return 0;
  end if;

  -- Mata-mata
  if p.placar_mandante = j.placar_mandante and p.placar_visitante = j.placar_visitante then
    pts := pts + 2;
  end if;

  res_real := sign(j.placar_mandante - j.placar_visitante);
  res_palp := sign(p.placar_mandante - p.placar_visitante);
  if res_real = res_palp then
    pts := pts + 1;
  end if;

  if j.classificado is not null and p.classificado = j.classificado then
    pts := pts + 2;
  end if;

  return pts;
end;
$$;

create or replace function calcular_ranking()
returns table (
  participante_id   uuid,
  nome              text,
  pontos            integer,
  placares_exatos   integer,
  acertos_resultado integer,
  posicao           integer
) language sql security definer as $$
  select
    par.id as participante_id,
    par.nome,
    coalesce(sum(pontos_palpite(pal, j)), 0)::integer as pontos,
    coalesce(sum(case
      when j.placar_mandante is not null
       and pal.placar_mandante = j.placar_mandante
       and pal.placar_visitante = j.placar_visitante then 1
      else 0
    end), 0)::integer as placares_exatos,
    coalesce(sum(case
      when j.placar_mandante is not null
       and sign(pal.placar_mandante - pal.placar_visitante) = sign(j.placar_mandante - j.placar_visitante)
       then 1 else 0
    end), 0)::integer as acertos_resultado,
    row_number() over (
      order by
        coalesce(sum(pontos_palpite(pal, j)), 0) desc,
        coalesce(sum(case when j.placar_mandante is not null and pal.placar_mandante = j.placar_mandante and pal.placar_visitante = j.placar_visitante then 1 else 0 end), 0) desc,
        coalesce(sum(case when j.placar_mandante is not null and sign(pal.placar_mandante - pal.placar_visitante) = sign(j.placar_mandante - j.placar_visitante) then 1 else 0 end), 0) desc
    )::integer as posicao
  from participantes par
  left join palpites pal on pal.participante_id = par.id
  left join jogos j on j.id = pal.jogo_id and j.status = 'encerrado'
  group by par.id, par.nome
  order by pontos desc, placares_exatos desc, acertos_resultado desc;
$$;
