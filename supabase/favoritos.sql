begin;

create table public.favoritos (
    usuario_id uuid not null references auth.users(id) on delete cascade,
    anuncio_id bigint not null references public.anuncios(id) on delete cascade,
    created_at timestamptz not null default now(),
    primary key (usuario_id, anuncio_id)
);

create index favoritos_anuncio_id_idx on public.favoritos (anuncio_id);

alter table public.favoritos enable row level security;

revoke all on public.favoritos from public, anon, authenticated;
grant select, delete on public.favoritos to authenticated;
grant insert (usuario_id, anuncio_id) on public.favoritos to authenticated;

create policy "usuarios consultam seus favoritos"
on public.favoritos for select to authenticated
using (usuario_id = (select auth.uid()));

create policy "usuarios adicionam seus favoritos"
on public.favoritos for insert to authenticated
with check (
    usuario_id = (select auth.uid())
    and exists (
        select 1 from public.anuncios a
        where a.id = anuncio_id and a.status = 'ativo'
    )
);

create policy "usuarios removem seus favoritos"
on public.favoritos for delete to authenticated
using (usuario_id = (select auth.uid()));

commit;
