-- ReTech: politicas RLS, GRANTs e Storage para o banco existente.
-- Este arquivo nao cria nem altera tabelas, colunas ou buckets.

alter table public.usuarios enable row level security;
alter table public.anuncios enable row level security;
alter table public.categorias enable row level security;
alter table public.carrinho enable row level security;
alter table public.pedidos enable row level security;
alter table public.itens_pedido enable row level security;
alter table public.solicitacoes enable row level security;
alter table public.mensagens enable row level security;
alter table public.artigos enable row level security;
alter table public.newsletter enable row level security;
alter table public.contatos enable row level security;

-- Perfis: somente o proprio usuario pode ler/editar os dados privados.
drop policy if exists "usuarios gerenciam seu perfil" on public.usuarios;
drop policy if exists "usuarios podem criar seu perfil" on public.usuarios;
drop policy if exists "usuarios podem editar seu perfil" on public.usuarios;
drop policy if exists "usuarios podem ler perfis publicos" on public.usuarios;
drop policy if exists "usuarios podem ler seu perfil" on public.usuarios;
drop policy if exists "usuarios leem seu perfil" on public.usuarios;
drop policy if exists "usuarios criam seu perfil" on public.usuarios;
drop policy if exists "usuarios atualizam seu perfil" on public.usuarios;
drop policy if exists "usuarios excluem seu perfil" on public.usuarios;
create policy "usuarios leem seu perfil"
on public.usuarios for select
using (auth.uid() = id);
create policy "usuarios criam seu perfil"
on public.usuarios for insert
with check (auth.uid() = id);
create policy "usuarios atualizam seu perfil"
on public.usuarios for update
using (auth.uid() = id)
with check (auth.uid() = id);
create policy "usuarios excluem seu perfil"
on public.usuarios for delete
using (auth.uid() = id);

-- View publica restrita a nome, foto e localizacao. SECURITY BARRIER impede
-- vazamento de linhas por filtros externos; a view nao expoe telefone ou sobre.
drop view if exists public.vendedores_publicos;
create view public.vendedores_publicos
with (security_barrier = true, security_invoker = true)
as
select id, nome, foto_url, local
from public.usuarios;
grant select (id, nome, foto_url, local) on public.vendedores_publicos to anon, authenticated;

-- RPC segura: expõe apenas os campos públicos dos vendedores informados.
-- A função não retorna telefone, sobre, email ou outras colunas privadas.
drop function if exists public.listar_vendedores_publicos(uuid[]);
create function public.listar_vendedores_publicos(p_ids uuid[] default null)
returns table(id uuid, nome text, foto_url text, local text)
language sql
stable
security definer
set search_path = pg_catalog, public
as $$
  select u.id, u.nome, u.foto_url, u.local
  from public.usuarios u
  where p_ids is null or u.id = any(p_ids);
$$;
revoke all on function public.listar_vendedores_publicos(uuid[]) from public;
grant execute on function public.listar_vendedores_publicos(uuid[]) to anon, authenticated;

-- Categorias publicas.
drop policy if exists "categorias sao publicas" on public.categorias;
drop policy if exists "categorias publicas" on public.categorias;
create policy "categorias publicas"
on public.categorias for select using (true);

-- Funcoes de protecao para impedir alteracoes arbitrarias.
drop trigger if exists anuncios_protege_status on public.anuncios;
create or replace function public.retech_protege_status_anuncio()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    new.status := 'ativo';
  elsif tg_op = 'UPDATE' then
    if new.status is distinct from old.status then
      if old.status = 'ativo' and new.status in ('ativo', 'vendido', 'pausado') then
        null;
      elsif old.status = 'pausado' and new.status in ('ativo', 'vendido', 'pausado') then
        null;
      elsif old.status = 'vendido' and new.status = 'vendido' then
        null;
      else
        raise exception 'Transicao de status invalida';
      end if;
    end if;
  end if;
  return new;
end;
$$;
create trigger anuncios_protege_status
before insert or update of status on public.anuncios
for each row execute function public.retech_protege_status_anuncio();

-- Anuncios: visitantes veem apenas ativos; proprietario pode gerenciar os seus.
drop policy if exists "anuncios ativos sao publicos" on public.anuncios;
drop policy if exists "anuncios ativos publicos" on public.anuncios;
drop policy if exists "usuarios podem criar anuncios" on public.anuncios;
drop policy if exists "usuarios criam seus anuncios" on public.anuncios;
drop policy if exists "usuarios podem editar seus anuncios" on public.anuncios;
drop policy if exists "usuarios atualizam seus anuncios" on public.anuncios;
drop policy if exists "usuarios podem excluir seus anuncios" on public.anuncios;
drop policy if exists "usuarios excluem seus anuncios" on public.anuncios;
create policy "anuncios ativos publicos"
on public.anuncios for select
using (status = 'ativo' or auth.uid() = usuario_id);
create policy "usuarios criam seus anuncios"
on public.anuncios for insert
with check (auth.uid() = usuario_id);
create policy "usuarios atualizam seus anuncios"
on public.anuncios for update
using (auth.uid() = usuario_id)
with check (
  auth.uid() = usuario_id
  and status in ('ativo', 'vendido', 'pausado')
);
create policy "usuarios excluem seus anuncios"
on public.anuncios for delete
using (auth.uid() = usuario_id);

-- Carrinho.
drop policy if exists "usuarios gerenciam seu carrinho" on public.carrinho;
drop policy if exists "usuarios adicionam ao seu carrinho" on public.carrinho;
drop policy if exists "usuarios atualizam seu carrinho" on public.carrinho;
drop policy if exists "usuarios removem seu carrinho" on public.carrinho;
drop policy if exists "usuarios leem seu carrinho" on public.carrinho;
create policy "usuarios leem seu carrinho"
on public.carrinho for select
using (auth.uid() = usuario_id);
create policy "usuarios adicionam ao seu carrinho"
on public.carrinho for insert
with check (
  auth.uid() = usuario_id
  and exists (
    select 1
    from public.anuncios a
    where a.id = anuncio_id
      and a.status = 'ativo'
      and a.tipo_anuncio = 'venda'
      and a.usuario_id <> auth.uid()
  )
);
create policy "usuarios removem seu carrinho"
on public.carrinho for delete
using (auth.uid() = usuario_id);

-- Pedidos e itens nunca podem ser criados pelo navegador.
drop policy if exists "participantes veem pedidos" on public.pedidos;
drop policy if exists "participantes leem seus pedidos" on public.pedidos;
drop policy if exists "comprador cria pedido pendente" on public.pedidos;
create policy "participantes leem seus pedidos"
on public.pedidos for select
using (auth.uid() = comprador_id or auth.uid() = vendedor_id);

drop policy if exists "participantes veem itens" on public.itens_pedido;
drop policy if exists "participantes leem itens dos pedidos" on public.itens_pedido;
drop policy if exists "comprador cria itens do pedido" on public.itens_pedido;
create policy "participantes leem itens dos pedidos"
on public.itens_pedido for select
using (
  exists (
    select 1 from public.pedidos p
    where p.id = pedido_id
      and (p.comprador_id = auth.uid() or p.vendedor_id = auth.uid())
  )
);

-- Solicitacoes: solicitante cancela; dono aceita ou recusa.
drop policy if exists "participantes veem solicitacoes" on public.solicitacoes;
drop policy if exists "participantes leem solicitacoes" on public.solicitacoes;
drop policy if exists "usuarios criam solicitacoes" on public.solicitacoes;
drop policy if exists "solicitantes criam solicitacoes" on public.solicitacoes;
drop policy if exists "solicitantes excluem suas solicitacoes pendentes" on public.solicitacoes;
drop policy if exists "solicitante cancela solicitacao pendente" on public.solicitacoes;
drop policy if exists "proprietario aceita ou recusa solicitacao" on public.solicitacoes;
create policy "participantes leem solicitacoes"
on public.solicitacoes for select
using (
  auth.uid() = solicitante_id
  or exists (
    select 1 from public.anuncios a
    where a.id = anuncio_id and a.usuario_id = auth.uid()
  )
);
create policy "solicitantes criam solicitacoes"
on public.solicitacoes for insert
with check (
  auth.uid() = solicitante_id
  and status = 'pendente'
  and tipo in ('doacao', 'troca')
  and exists (
    select 1 from public.anuncios a
    where a.id = anuncio_id
      and a.status = 'ativo'
      and a.usuario_id <> auth.uid()
      and (
        (tipo = 'doacao' and a.tipo_anuncio = 'doacao')
        or (tipo = 'troca' and a.tipo_anuncio = 'troca')
      )
  )
);
create policy "solicitante cancela solicitacao pendente"
on public.solicitacoes for update
using (auth.uid() = solicitante_id and status = 'pendente')
with check (auth.uid() = solicitante_id and status = 'cancelada');
create policy "proprietario aceita ou recusa solicitacao"
on public.solicitacoes for update
using (
  status = 'pendente'
  and exists (
    select 1 from public.anuncios a
    where a.id = anuncio_id and a.usuario_id = auth.uid()
  )
)
with check (
  status in ('aceita', 'recusada')
  and exists (
    select 1 from public.anuncios a
    where a.id = anuncio_id and a.usuario_id = auth.uid()
  )
);
create policy "solicitantes excluem suas solicitacoes pendentes"
on public.solicitacoes for delete
using (auth.uid() = solicitante_id and status = 'pendente');

-- Mensagens: o remetente nao escolhe lida; somente o destinatario pode alterar.
drop trigger if exists mensagens_protege_lida on public.mensagens;
create or replace function public.retech_protege_lida_mensagem()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    new.lida := false;
  elsif tg_op = 'UPDATE' and new.lida is distinct from old.lida then
    if auth.uid() <> new.destinatario_id then
      raise exception 'Somente o destinatario pode marcar a mensagem como lida';
    end if;
  end if;
  if tg_op = 'UPDATE' and (
    new.remetente_id is distinct from old.remetente_id
    or new.destinatario_id is distinct from old.destinatario_id
    or new.anuncio_id is distinct from old.anuncio_id
    or new.conteudo is distinct from old.conteudo
    or new.created_at is distinct from old.created_at
  ) then
    raise exception 'Campos da mensagem nao podem ser alterados';
  end if;
  return new;
end;
$$;
create trigger mensagens_protege_lida
before insert or update on public.mensagens
for each row execute function public.retech_protege_lida_mensagem();

drop policy if exists "participantes leem mensagens" on public.mensagens;
drop policy if exists "usuarios enviam mensagens" on public.mensagens;
drop policy if exists "usuarios enviam mensagens em seu nome" on public.mensagens;
drop policy if exists "destinatario marca mensagem como lida" on public.mensagens;
drop policy if exists "destinatario atualiza lida" on public.mensagens;
create policy "participantes leem mensagens"
on public.mensagens for select
using (auth.uid() = remetente_id or auth.uid() = destinatario_id);
create policy "usuarios enviam mensagens em seu nome"
on public.mensagens for insert
with check (
  auth.uid() = remetente_id
  and destinatario_id <> remetente_id
);
create policy "destinatario atualiza lida"
on public.mensagens for update
using (auth.uid() = destinatario_id)
with check (auth.uid() = destinatario_id and lida in (true, false));

-- Artigos publicados.
drop policy if exists "artigos sao publicos" on public.artigos;
drop policy if exists "artigos publicados sao publicos" on public.artigos;
create policy "artigos publicados sao publicos"
on public.artigos for select
using (publicado = true);

-- Newsletter: campos publicos limitados e consentimento confirmado no momento do envio.
-- A protecao contra abuso automatizado nao pode depender apenas dessas policies.
-- Configure CAPTCHA/rate limiting em Edge Function antes de liberar em grande escala.
drop policy if exists "newsletter publica pode inserir e-mail" on public.newsletter;
drop policy if exists "newsletter aceita inscricoes publicas" on public.newsletter;
create policy "newsletter aceita inscricoes publicas"
on public.newsletter for insert
with check (
  char_length(email) between 3 and 254
  and email ~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
  and ativo = true
  and consentimento_em is not null
  and consentimento_em <= now()
);

-- Contato: dados podem ser enviados, mas nunca consultados publicamente.
drop policy if exists "contatos publicos podem ser enviados" on public.contatos;
create policy "contatos publicos podem ser enviados"
on public.contatos for insert
with check (
  char_length(trim(nome)) between 2 and 120
  and char_length(email) between 3 and 254
  and email ~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
  and char_length(trim(mensagem)) between 20 and 1000
  and consentimento_em is not null
  and consentimento_em <= now()
  and (usuario_id is null or usuario_id = auth.uid())
);

-- Permissoes minimas da API.
revoke all on table public.usuarios from anon, authenticated;
revoke all on table public.categorias from anon, authenticated;
revoke all on table public.anuncios from anon, authenticated;
revoke all on table public.carrinho from anon, authenticated;
revoke all on table public.pedidos from anon, authenticated;
revoke all on table public.itens_pedido from anon, authenticated;
revoke all on table public.solicitacoes from anon, authenticated;
revoke all on table public.mensagens from anon, authenticated;
revoke all on table public.artigos from anon, authenticated;
revoke all on table public.newsletter from anon, authenticated;
revoke all on table public.contatos from anon, authenticated;
revoke all on table public.vendedores_publicos from anon, authenticated;

grant select (id, nome, local, telefone, sobre, foto_url, created_at)
on public.usuarios to authenticated;
grant insert (id, nome, local, telefone, sobre, foto_url) on public.usuarios to authenticated;
grant update (nome, local, telefone, sobre, foto_url) on public.usuarios to authenticated;
grant delete on public.usuarios to authenticated;
grant select (id, nome, foto_url, local) on public.vendedores_publicos to anon, authenticated;

grant select on public.categorias to anon, authenticated;

grant select on public.anuncios to anon, authenticated;
grant insert (usuario_id, categoria_id, nome_anuncio, descricao_anuncio, estado, tipo_anuncio, preco_anuncio, imagem_url)
on public.anuncios to authenticated;
grant update (categoria_id, nome_anuncio, descricao_anuncio, estado, tipo_anuncio, preco_anuncio, imagem_url, status)
on public.anuncios to authenticated;
grant delete on public.anuncios to authenticated;

grant select on public.carrinho to authenticated;
grant insert (usuario_id, anuncio_id) on public.carrinho to authenticated;
grant delete on public.carrinho to authenticated;

grant select on public.pedidos to authenticated;
grant select on public.itens_pedido to authenticated;

grant select on public.solicitacoes to authenticated;
grant insert (solicitante_id, anuncio_id, tipo, mensagem, status) on public.solicitacoes to authenticated;
grant update (status) on public.solicitacoes to authenticated;
grant delete on public.solicitacoes to authenticated;

grant select on public.mensagens to authenticated;
grant insert (remetente_id, destinatario_id, anuncio_id, conteudo)
on public.mensagens to authenticated;
grant update (lida) on public.mensagens to authenticated;

grant select on public.artigos to anon, authenticated;

grant insert (email, ativo, consentimento_em)
on public.newsletter to anon, authenticated;

grant insert (usuario_id, nome, email, assunto, mensagem, consentimento_em)
on public.contatos to anon, authenticated;

-- Storage: os buckets anuncios e avatares ja existem.
drop policy if exists "imagens dos anuncios publicas" on storage.objects;
drop policy if exists "imagens dos anuncios sao publicas" on storage.objects;
drop policy if exists "imagens anuncios publicas" on storage.objects;
drop policy if exists "usuarios enviam imagens de anuncios" on storage.objects;
drop policy if exists "usuarios atualizam imagens de anuncios" on storage.objects;
drop policy if exists "usuarios removem imagens de anuncios" on storage.objects;
create policy "imagens dos anuncios publicas"
on storage.objects for select
using (bucket_id = 'anuncios');
create policy "usuarios enviam imagens de anuncios"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'anuncios'
  and auth.uid()::text = (storage.foldername(name))[1]
);
create policy "usuarios atualizam imagens de anuncios"
on storage.objects for update to authenticated
using (
  bucket_id = 'anuncios'
  and auth.uid()::text = (storage.foldername(name))[1]
)
with check (
  bucket_id = 'anuncios'
  and auth.uid()::text = (storage.foldername(name))[1]
);
create policy "usuarios removem imagens de anuncios"
on storage.objects for delete to authenticated
using (
  bucket_id = 'anuncios'
  and auth.uid()::text = (storage.foldername(name))[1]
);

drop policy if exists "avatares publicos" on storage.objects;
drop policy if exists "usuarios enviam avatares" on storage.objects;
drop policy if exists "usuarios atualizam avatares" on storage.objects;
drop policy if exists "usuarios removem avatares" on storage.objects;
create policy "avatares publicos"
on storage.objects for select
using (bucket_id = 'avatares');
create policy "usuarios enviam avatares"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'avatares'
  and auth.uid()::text = (storage.foldername(name))[1]
);
create policy "usuarios atualizam avatares"
on storage.objects for update to authenticated
using (
  bucket_id = 'avatares'
  and auth.uid()::text = (storage.foldername(name))[1]
)
with check (
  bucket_id = 'avatares'
  and auth.uid()::text = (storage.foldername(name))[1]
);
create policy "usuarios removem avatares"
on storage.objects for delete to authenticated
using (
  bucket_id = 'avatares'
  and auth.uid()::text = (storage.foldername(name))[1]
);
