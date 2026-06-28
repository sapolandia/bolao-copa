-- Adicionar coluna api_fixture_id em jogos para upsert idempotente
alter table jogos
  add column if not exists api_fixture_id integer unique,
  add column if not exists status_text text; -- status raw da API (FT, 1H, HT, ...)

-- Adicionar status ao_vivo (a enum já tem agendado e encerrado)
-- Opção mais simples: guardar como texto na coluna status_text e
-- manter a enum atual sem alteração. A coluna status (enum) continua
-- sendo a fonte de verdade para RLS/regras de negócio.
-- status_text é apenas informativo para exibir "ao vivo" na UI.
