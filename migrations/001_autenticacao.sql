begin;

create table if not exists public.usuarios (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  email text not null unique,
  senha_hash text not null,
  criado_em timestamptz not null default now()
);

alter table public.projetos
add column if not exists usuario_id uuid;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'projetos_usuario_id_fkey'
      and conrelid = 'public.projetos'::regclass
  ) then
    alter table public.projetos
    add constraint projetos_usuario_id_fkey
    foreign key (usuario_id)
    references public.usuarios(id)
    on delete cascade;
  end if;
end
$$;

create index if not exists projetos_usuario_id_idx
on public.projetos(usuario_id);

create table if not exists public.sessoes (
  sid varchar not null primary key,
  sess json not null,
  expire timestamp(6) not null
);

create index if not exists sessoes_expire_idx
on public.sessoes(expire);

commit;