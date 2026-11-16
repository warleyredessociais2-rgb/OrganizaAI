-- Limites de tentativas compartilhados entre todas as replicas Node.js.
-- Nenhum IP ou e-mail em claro e salvo; as chaves sao HMAC-SHA256.
-- Namespace separado do esquema publico exposto pela API do Supabase.
BEGIN;

CREATE SCHEMA IF NOT EXISTS organizaai_interno;

CREATE TABLE IF NOT EXISTS organizaai_interno.limites_autenticacao (
  chave varchar(64) PRIMARY KEY,
  tentativas integer NOT NULL CHECK (tentativas >= 1),
  expira_em timestamptz NOT NULL
);

CREATE INDEX IF NOT EXISTS limites_autenticacao_expira_em_idx
  ON organizaai_interno.limites_autenticacao (expira_em);

COMMIT;
