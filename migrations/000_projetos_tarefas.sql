-- Estrutura inicial do OrganizaAI.
-- Executar ANTES de migrations/001_autenticacao.sql.
-- CREATE TABLE IF NOT EXISTS não modifica tabelas já existentes.
-- Se houver um banco legado, confira a estrutura e faça backup antes de migrar.

begin;

create table if not exists public.projetos (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  descricao text not null default '',
  criado_em timestamptz not null default now()
);

create table if not exists public.tarefas (
  id uuid primary key default gen_random_uuid(),
  projeto_id uuid not null
    references public.projetos(id) on delete cascade,
  titulo text not null,
  concluida boolean not null default false,
  criada_em timestamptz not null default now()
);

create index if not exists tarefas_projeto_id_idx
  on public.tarefas(projeto_id);

commit;
