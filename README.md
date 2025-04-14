# Site de Confirmação - Aniversário de Kart 🏎️

Site para confirmação de presença no aniversário de kart do Diego no Kart Atrium.

## Detalhes do Evento

**Status**: 
- **Data**: 10 de maio de 2024 (sábado)
- **Horário**: ⚠️ Pendente (será definido em breve)

**Local**: Kart Atrium
- Localizado em: Century Plaza Business (Prédio Comercial)
- Endereço: Av. Alexandre de Gusmão, 291 - Vila Homero Thon, Santo André - SP, 09111-310
- [Link para Google Maps](https://www.google.com/maps/place/kart+atrium/data=!4m2!3m1!1s0x94ce69ae2faa9883:0xa3e25c78f3655e52?sa=X&ved=1t:242&ictx=111)

## Como Personalizar o Site

### Substituindo o Banner
Para substituir o banner:

1. Adicione sua imagem na pasta `public/`
2. Abra o arquivo `src/app/page.tsx`
3. Localize a seção do banner (por volta da linha 40)
4. Comente ou remova o placeholder atual
5. Descomente as linhas da tag `<img>` 
6. Atualize o caminho da imagem em `src="/caminho/para/seu/banner.jpg"`

```tsx
{/* Remova este bloco
<div className="flex items-center justify-center h-48 sm:h-64 md:h-80">
  <div className="text-center">
    <ImageIcon className="h-12 w-12 text-green-400 mx-auto mb-4 opacity-50" />
    <p className="text-gray-400 max-w-md mx-auto">Banner do evento - Substitua esta área por sua imagem</p>
  </div>
</div>
*/}

{/* E descomente este bloco */}
<img 
  src="/seu-banner.jpg"  {/* Atualize para o nome do seu arquivo */}
  alt="Banner do Aniversário de Kart do Diego" 
  className="w-full h-auto object-cover"
/>
```

## Configuração do Supabase

1. Crie uma conta no [Supabase](https://supabase.com)
2. Crie um novo projeto
3. No SQL Editor, crie a tabela de confirmações:

```sql
create table confirmations (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  vai_andar boolean not null,
  nivel_interesse text not null,
  status text default 'pending'::text
);
```

Se você já criou a tabela anteriormente e precisa adicionar os novos campos, execute:

```sql
alter table confirmations 
add column vai_andar boolean,
add column nivel_interesse text;

-- Atualizar registros existentes 
update confirmations
set 
  vai_andar = true,
  nivel_interesse = 'alto'
where vai_andar is null;

-- Adicionar as constraints de not null
alter table confirmations
alter column vai_andar set not null,
alter column nivel_interesse set not null;
```

4. Copie as credenciais do projeto (URL e Anon Key) e cole no arquivo `.env.local`

## Instalação

```bash
npm install
npm run dev
```

O site estará disponível em [http://localhost:3000](http://localhost:3000)

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
