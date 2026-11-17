-- PENDENTE DE AUTORIZAÇÃO: executar separadamente no SQL Editor.
-- Permite consultar o produto reservado somente aos participantes do pedido.
-- Não altera tabelas nem concede acesso público a anúncios pausados.
begin;
drop policy if exists "participantes consultam produtos dos pedidos" on public.anuncios;
create policy "participantes consultam produtos dos pedidos"
on public.anuncios for select to authenticated
using (exists (
    select 1 from public.itens_pedido i
    join public.pedidos p on p.id = i.pedido_id
    where i.anuncio_id = anuncios.id
      and (p.comprador_id = (select auth.uid()) or p.vendedor_id = (select auth.uid()))
));
-- Consulta mínima do nome público do vendedor. A tabela usuarios permanece privada.
-- A implementação fica no schema privado porque precisa ler nomes de outros perfis;
-- o filtro por auth.uid() limita o resultado aos vendedores de compras da conta.
create or replace function retech_private.listar_vendedores_pedidos()
returns table(id uuid, nome text)
language sql stable security definer set search_path = ''
as $$
    select u.id, u.nome::text
    from public.usuarios u
    where (select auth.uid()) is not null
      and exists (
          select 1 from public.pedidos p
          where p.comprador_id = (select auth.uid()) and p.vendedor_id = u.id
      );
$$;
revoke all on function retech_private.listar_vendedores_pedidos() from public, anon;
grant execute on function retech_private.listar_vendedores_pedidos() to authenticated;

create or replace function public.listar_vendedores_pedidos()
returns table(id uuid, nome text)
language sql stable security invoker set search_path = ''
as $$
    select * from retech_private.listar_vendedores_pedidos();
$$;
revoke all on function public.listar_vendedores_pedidos() from public, anon;
grant execute on function public.listar_vendedores_pedidos() to authenticated;
commit;
