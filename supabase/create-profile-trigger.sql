-- Execute manualmente no SQL Editor do Supabase somente se precisar garantir
-- o perfil quando a confirmação de e-mail estiver habilitada.

drop trigger if exists on_auth_user_created on auth.users;

create or replace function public.retech_cria_perfil_usuario()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.usuarios (id, nome)
  values (
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'nome'), ''), split_part(new.email, '@', 1))
  )
  on conflict (id) do update set
    nome = coalesce(public.usuarios.nome, excluded.nome);
  return new;
end;
$$;

revoke all on function public.retech_cria_perfil_usuario() from public;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.retech_cria_perfil_usuario();
