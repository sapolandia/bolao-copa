-- ============================================================
-- Migração v2: telefone, campeão, simplificação de regras
-- ============================================================

-- Telefone para WhatsApp (formato internacional, ex: 5511999999999)
alter table participantes
  add column if not exists telefone text;

-- Palpite de campeão da Copa (1 por participante, bloqueado após início)
create table if not exists palpite_campeao (
  id                uuid primary key default gen_random_uuid(),
  participante_id   uuid not null references participantes(id) on delete cascade unique,
  time_campeao      text not null,
  created_at        timestamptz not null default now()
);

alter table palpite_campeao enable row level security;

create policy "campeao_select_own" on palpite_campeao
  for select to authenticated using (participante_id = auth.uid());

-- Todos veem após início da Copa (11 jun 2026 13:00 BRT = 16:00 UTC)
create policy "campeao_select_after_start" on palpite_campeao
  for select to authenticated
  using (participante_id != auth.uid() and now() >= '2026-06-11T16:00:00Z');

create policy "campeao_insert" on palpite_campeao
  for insert to authenticated
  with check (participante_id = auth.uid() and now() < '2026-06-11T16:00:00Z');

create policy "campeao_update" on palpite_campeao
  for update to authenticated
  using (participante_id = auth.uid() and now() < '2026-06-11T16:00:00Z');

-- Resultado real do campeão (admin preenche ao fim da Copa)
create table if not exists campeao_real (
  id          uuid primary key default gen_random_uuid(),
  time_campeao text not null,
  definido_em  timestamptz not null default now()
);

-- Remover coluna classificado dos palpites (não usamos mais prorrogação/pênaltis)
-- (deixamos a coluna para não quebrar dados existentes, mas o scoring ignora)

-- ============================================================
-- Atualizar função de pontuação: 3pts exato, 1pt resultado
-- somente tempo regulamentar (90min) — sem distinção de fase
-- ============================================================
create or replace function pontos_palpite(p palpites, j jogos)
returns integer language plpgsql immutable as $$
declare
  res_real integer;
  res_palp integer;
begin
  if j.placar_mandante is null or j.placar_visitante is null then
    return 0;
  end if;

  -- Placar exato = 3 pontos
  if p.placar_mandante = j.placar_mandante and p.placar_visitante = j.placar_visitante then
    return 3;
  end if;

  -- Resultado certo (quem ganhou ou empate) = 1 ponto
  res_real := sign(j.placar_mandante - j.placar_visitante);
  res_palp := sign(p.placar_mandante - p.placar_visitante);
  if res_real = res_palp then return 1; end if;

  return 0;
end;
$$;

-- ============================================================
-- Recalcular ranking incluindo pontos do campeão
-- ============================================================
create or replace function calcular_ranking()
returns table (
  participante_id   uuid,
  nome              text,
  pontos            integer,
  placares_exatos   integer,
  acertos_resultado integer,
  posicao           integer
) language sql security definer as $$
  with pts_jogos as (
    select
      par.id,
      par.nome,
      coalesce(sum(pontos_palpite(pal, j)), 0)::integer as pts,
      coalesce(sum(case
        when j.placar_mandante is not null
         and pal.placar_mandante = j.placar_mandante
         and pal.placar_visitante = j.placar_visitante then 1 else 0
      end), 0)::integer as exatos,
      coalesce(sum(case
        when j.placar_mandante is not null
         and sign(pal.placar_mandante - pal.placar_visitante) = sign(j.placar_mandante - j.placar_visitante)
         then 1 else 0
      end), 0)::integer as resultados
    from participantes par
    left join palpites pal on pal.participante_id = par.id
    left join jogos j on j.id = pal.jogo_id and j.status = 'encerrado'
    group by par.id, par.nome
  ),
  pts_campeao as (
    select
      pc.participante_id,
      case when cr.time_campeao = pc.time_campeao then 10 else 0 end as bonus
    from palpite_campeao pc
    left join campeao_real cr on true
  )
  select
    pj.id as participante_id,
    pj.nome,
    (pj.pts + coalesce(pc.bonus, 0))::integer as pontos,
    pj.exatos as placares_exatos,
    pj.resultados as acertos_resultado,
    row_number() over (
      order by (pj.pts + coalesce(pc.bonus, 0)) desc, pj.exatos desc, pj.resultados desc
    )::integer as posicao
  from pts_jogos pj
  left join pts_campeao pc on pc.participante_id = pj.id
  order by pontos desc, placares_exatos desc, acertos_resultado desc;
$$;
