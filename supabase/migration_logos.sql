alter table jogos
  add column if not exists logo_mandante  text,
  add column if not exists logo_visitante text;
