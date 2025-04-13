-- Criar tabela de comentários
create table comments (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  comment text not null,
  profile_icon text not null -- Armazenará o nome do ícone escolhido
);

-- Políticas de segurança RLS (Row Level Security)
alter table comments enable row level security;

-- Política para permitir SELECT para todos (leitura pública)
create policy "Permitir leitura pública de comentários" on comments
  for select
  using (true);

-- Política para permitir INSERT para todos (inserção pública)
create policy "Permitir inserção pública de comentários" on comments
  for insert
  with check (true); 