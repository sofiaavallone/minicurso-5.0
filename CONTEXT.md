# 🤖 CONTEXT: cartinha-do-futuro

> **Para IAs:** Leia este arquivo inteiro antes de sugerir qualquer código. Ele descreve toda a arquitetura, convenções e decisões técnicas do projeto. Com este contexto, você consegue sugerir código preciso e consistente sem explorar cada arquivo individualmente.

---

## O Projeto

**cartinha-do-futuro** é um monorepo TypeScript com um site para escrever e guardar cartas para o seu "eu do futuro", gerenciado com pnpm workspaces e Turborepo.

### Apps

| App            | Pasta         | Tecnologia                             | Onde roda | Porta  |
| -------------- | ------------- | --------------------------------------- | --------- | ------ |
| Front-end web  | `apps/web`    | Next.js 15 + React 19 + Tailwind CSS 3 | Local     | `3000` |
| API / Back-end | `apps/server` | Node.js 22 + Express 4 + Prisma 7      | Docker    | `3001` |

### Infraestrutura

| Serviço             | Onde roda | Porta  |
| ------------------- | --------- | ------ |
| PostgreSQL 16       | Docker    | `5432` |
| Adminer (GUI banco) | Docker    | `8080` |

### Packages internos (nunca publicados no npm)

| Package        | Pasta                         | O que contém                                 |
| -------------- | ------------------------------ | --------------------------------------------- |
| `@repo/types`  | `packages/types/src/index.ts` | Interfaces e tipos TypeScript compartilhados |
| `@repo/utils`  | `packages/utils/src/index.ts` | Funções utilitárias reutilizáveis            |
| `@repo/config` | `packages/config/`            | TSConfig base e ESLint base                  |

---

## Fluxo de Dados

```
apps/web (Next.js) ── HTTP → apps/server (Express :3001) → Prisma → PostgreSQL (:5432)
```

- O web se comunica com o server via HTTP em `http://localhost:3001`
- O server está no Docker; o web está na máquina local
- O Prisma 7 lê a URL do banco do `prisma.config.ts` (que aponta para `process.env.DATABASE_URL`)
- Em runtime, o server instancia `PrismaClient` com o adapter `@prisma/adapter-pg`

### Mensagens ao subir o Docker

Após `docker compose up` (ou `pnpm docker:up`), o server imprime no log:

```
🚀 Server ready at http://localhost:3001
📦 Successfully connected with database
```

A primeira linha confirma que o Express está escutando na porta 3001. A segunda confirma que o `PrismaClient.$connect()` validou a conexão com o PostgreSQL antes de aceitar requisições. Use `pnpm docker:logs` para acompanhar.

---

## Convenções de Código

### TypeScript

- Sem `any`: use `unknown` + type narrowing ou generics
- Sem `!` (non-null assertion): trate o null explicitamente
- Tipos sempre em `@repo/types` quando compartilhados entre apps
- Tipos locais de um só app ficam no próprio app

### Imports

```typescript
// Arquivos locais do app, alias @/
import { Button } from "@/components/Button";
import { useAuth } from "@/hooks/useAuth";

// Packages internos
import type { Letter, ApiResponse } from "@repo/types";
import { formatDate, sleep } from "@repo/utils";
```

### Nomenclatura

```
camelCase     → variáveis, funções, hooks          (getLetterById, useModal)
PascalCase    → tipos, interfaces, componentes     (LetterCard, LetterForm)
UPPER_SNAKE   → constantes                         (MAX_RETRIES, API_URL)
kebab-case    → pastas de rotas Next.js            (nova-carta/)
```

### Estrutura do server

```
src/routes/      → Declara as rotas Express (URLs + métodos HTTP)
src/controllers/ → Recebe request, chama service, retorna response
src/services/    → Lógica de negócio + acesso ao Prisma
src/middlewares/ → Autenticação, logging, validação global
```

---

## Tipos Compartilhados (`@repo/types`)

```typescript
// Resposta padrão da API. SEMPRE use este formato.
export interface ApiResponse<T> {
  data: T;
  message?: string;
  error?: string;
}

// Respostas paginadas
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

// Entidades do banco, espelham os models do Prisma
export interface Letter {
  id: string;
  authorName?: string | null;
  content: string;
  deliverAt: string; // ISO string, data em que a carta "deve ser lida"
  createdAt: string; // ISO string (não Date, pois JSON não suporta Date)
  updatedAt: string;
}
```

> **Regra:** Ao criar um novo model no Prisma, crie a interface correspondente em `@repo/types`. Datas do Prisma (`DateTime`) viram `string` no tipo compartilhado porque JSON serializa datas como string.

---

## Prisma

**Schema:** `apps/server/prisma/schema.prisma`
**Config:** `apps/server/prisma.config.ts`
**Migrations:** `apps/server/prisma/migrations/`

A partir do Prisma 7, a URL do banco **não fica mais no `schema.prisma`**: fica em `prisma.config.ts`, e em runtime o `PrismaClient` recebe um driver adapter (`@prisma/adapter-pg`).

```prisma
// schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
}
```

```typescript
// prisma.config.ts
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: { url: process.env.DATABASE_URL ?? "" },
  migrations: { path: "prisma/migrations" },
});
```

```typescript
// src/index.ts (runtime)
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });
```

### Comandos Prisma

```bash
pnpm db:push      # Sincroniza banco com schema (dev, sem histórico)
pnpm db:migrate   # Cria migration nomeada (produção, com histórico)
pnpm db:studio    # GUI do banco em localhost:5555
pnpm db:generate  # Regenera o Prisma Client após mudanças no schema
```

---

## Variáveis de Ambiente

### Por que o projeto roda sem `.env` em dev (e por que isso muda em produção)

Em desenvolvimento, dá pra subir front e banco sem criar nenhum `.env`. Isso acontece por **dois mecanismos distintos**:

1. **Server e PostgreSQL** rodam no Docker e recebem as variáveis pelo bloco `environment:` do `docker-compose.yml` (`DATABASE_URL`, `PORT`, `WEB_URL`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`). Os processos não leem nenhum `.env`; o Docker injeta tudo direto no container.
2. **Web** roda localmente e não depende do Docker. Funciona sem `.env` porque o código tem fallback hardcoded em `apps/web/src/lib/api.ts`: `process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001"`. O fallback bate com a porta que o Docker expõe, então o client acha o server sem configuração extra.

**Em produção isso muda:** as credenciais do banco no `docker-compose.yml` estão em texto puro, o que é aceitável só pra dev. No deploy, troca-se o bloco `environment:` do compose por `env_file:` apontando para um `.env` fora do Git, ou usa-se secrets manager (Vault, AWS Secrets, Doppler). O fallback `?? "http://localhost:3001"` no client também perde sentido: o build do Next precisa receber a URL real via variável de ambiente no momento do build.

### `apps/web/.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

> `NEXT_PUBLIC_` é obrigatório para variáveis acessadas no browser (client components).

### `apps/server/.env`

```env
DATABASE_URL="postgresql://postgres:postgres@postgres:5432/projectdb?schema=public"
PORT=3001
WEB_URL=http://localhost:3000
```

> Para rodar comandos do Prisma CLI fora do Docker (ex: `prisma db push` local), exporte `DATABASE_URL` apontando para `localhost:5432` no shell antes do comando.

---

## Comandos do Projeto

```bash
# Instalar tudo (raiz, instala todos os apps e packages)
pnpm install

# Docker
pnpm docker:up        # Sobe server + PostgreSQL
pnpm docker:down      # Para os containers
pnpm docker:logs      # Logs do server em tempo real
pnpm docker:rebuild   # Rebuilda imagem do server e reinicia

# Desenvolvimento local
pnpm dev              # Só Next.js (:3000)
pnpm dev:web          # idem, nome explícito

# Banco
pnpm db:push          # Sincroniza schema (dev)
pnpm db:migrate       # Gera migration (prod)
pnpm db:studio        # GUI do banco (:5555)

# Qualidade
pnpm build            # Compila todos os apps
pnpm lint             # ESLint em tudo
pnpm format           # Prettier em tudo
```

### Equivalentes "clássicos" (alternativos)

Os scripts acima são wrappers. Os comandos canônicos do Docker, Prisma e Next.js seguem funcionando. Use o que for mais natural ou se estiver depurando algo que precise do CLI direto.

```bash
# Docker (na raiz)
docker compose up -d                              # ≈ pnpm docker:up
docker compose up --build                         # ≈ pnpm docker:rebuild (foreground)
docker compose down                               # ≈ pnpm docker:down
docker compose logs -f server                     # ≈ pnpm docker:logs

# Prisma (dentro de apps/server, ou com `pnpm --filter server exec` na raiz)
npx prisma migrate dev --name <nome_da_migration> # ≈ pnpm db:migrate
npx prisma db push                                # ≈ pnpm db:push
npx prisma generate                               # ≈ pnpm db:generate
npx prisma studio                                 # ≈ pnpm db:studio

# Dev local (dentro do app correspondente)
cd apps/web && pnpm dev                           # ≈ pnpm dev:web (next dev)
```

> Para rodar Prisma CLI fora do Docker, exporte `DATABASE_URL` apontando para `localhost:5432` antes (o host `postgres` só resolve dentro da rede do compose).

---

## Estrutura Completa de Arquivos

```
cartinha-do-futuro/
├── apps/
│   ├── web/
│   │   ├── src/
│   │   │   ├── app/            # App Router, page.tsx, layout.tsx
│   │   │   ├── components/     # Componentes React (.tsx)
│   │   │   ├── hooks/          # Custom hooks (use*.ts)
│   │   │   ├── lib/            # Helpers e config do cliente
│   │   │   └── styles/         # globals.css
│   │   ├── next.config.ts
│   │   ├── tailwind.config.ts
│   │   ├── tsconfig.json       # extends ../../packages/config/typescript/base.json
│   │   └── package.json        # name: "web"
│   │
│   └── server/
│       ├── src/
│       │   ├── routes/         # Registra rotas no Express
│       │   ├── controllers/    # Handlers HTTP
│       │   ├── services/       # Lógica de negócio + Prisma
│       │   ├── middlewares/    # Auth, logging
│       │   └── index.ts        # Entry point, cria app Express
│       ├── prisma/
│       │   ├── schema.prisma
│       │   └── migrations/
│       ├── prisma.config.ts    # Prisma 7 config (URL do banco fica aqui)
│       ├── Dockerfile
│       ├── .env
│       ├── tsconfig.json       # extends ../../packages/config/typescript/base.json
│       └── package.json        # name: "server"
│
├── packages/
│   ├── types/src/index.ts      # @repo/types
│   ├── utils/src/index.ts      # @repo/utils
│   └── config/
│       ├── typescript/base.json
│       └── eslint/index.js
│
├── docker-compose.yml
├── turbo.json
├── pnpm-workspace.yaml
├── package.json                # Scripts raiz, chama turbo
├── .env.example
├── CONTEXT.md                  # Este arquivo
└── README.md
```

---

## Decisões Técnicas

| Decisão                         | Motivo                                                                                      |
| -------------------------------- | -------------------------------------------------------------------------------------------- |
| pnpm em vez de npm/yarn         | Workspaces nativos, eficiente em disco, estrito com dependências                            |
| Turborepo                       | Paraleliza tasks, cache inteligente, garante ordem de build (packages antes dos apps)       |
| Express em vez de Fastify       | API minimalista e familiar para a maioria dos times, com ecossistema de middlewares maduro  |
| Prisma v7 com driver adapter    | URL fica no `prisma.config.ts`, runtime usa `@prisma/adapter-pg`, alinhado ao Prisma atual  |
| Docker só para server + banco   | Web precisa de hot-reload imediato; Docker adicionaria latência                             |
| `@postgres:5432` no Docker      | Containers se comunicam pelo nome do serviço, não por `localhost`                           |
| Tailwind CSS v3                 | Versão estável e madura, com PostCSS pipeline tradicional                                   |
| Axios 1.7.9                     | Tipagem genérica nas respostas, interceptors prontos para auth/refresh, transformação JSON automática |
| `NEXT_PUBLIC_`                  | Prefixo obrigatório para expor variáveis ao bundle do client (browser)                       |

---

## Template de Integração (já implementado)

O boilerplate inclui uma integração ponta-a-ponta de exemplo: `GET /users` no server, consumido pelo web. **Use como referência ao criar o recurso real de "cartas" (`Letter`).**

### Server

```
src/services/users.service.ts      → listUsers(): Promise<User[]> (mock; troque por prisma.user.findMany())
src/controllers/users.controller.ts → getUsers(req, res): retorna { data: users }
src/routes/users.route.ts           → usersRouter com GET "/"
src/index.ts                        → app.use("/users", usersRouter)
```

### Cliente HTTP compartilhado em forma

O web usa **Axios**. `apps/web/src/lib/api.ts` cria a instância via `axios.create({ baseURL })` e exporta tanto a instância `api` (para chamadas avançadas: `api.post`, `api.put`, interceptors, headers customizados) quanto o helper `apiGet<T>` para o caso comum.

```typescript
// apps/web/src/lib/api.ts
import axios from "axios";
import type { ApiResponse } from "@repo/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

export type ApiResult<T> = { data: T; isMocked: boolean };

export async function apiGet<T>(path: string, fallback: T): Promise<ApiResult<T>> {
  try {
    const { data } = await api.get<ApiResponse<T>>(path, {
      headers: { "Cache-Control": "no-store" },
    });
    return { data: data.data, isMocked: false };
  } catch {
    return { data: fallback, isMocked: true };
  }
}
```

**Quando usar `api` direto vs `apiGet`:**

- `apiGet<T>(path, fallback)` → GET simples com fallback offline. Use por padrão para listagens e leituras.
- `api.post`, `api.put`, `api.delete`, `api.get` direto → quando precisar de body, headers customizados, status code específico ou não quiser fallback automático. Trate o erro com `try/catch` no caller.

Para adicionar interceptors (ex: log centralizado), edite a instância `api` em `lib/api.ts` com `api.interceptors.request.use(...)` ou `api.interceptors.response.use(...)`. Esse é o ponto único de configuração — não importe `axios` direto em outros arquivos.

### Fallback offline

O `fallback` é **obrigatório** e é usado automaticamente quando a requisição falha (server fora do ar, sem rede, URL errada, status non-2xx). O web mantém seus mocks em `src/lib/mocks.ts`. Quando `isMocked === true`, a UI deve mostrar um aviso explícito de que está sem comunicação com o servidor (banner amarelo). Isso permite rodar `pnpm dev:web` sem precisar subir o Docker.

### Web

`apps/web/src/app/page.tsx` é um **Server Component** que faz `await apiGet<T>(...)` no render e renderiza o banner condicional quando `isMocked`. Use `cache: "no-store"` se precisar de dados sempre frescos (já está no helper).

### Para adicionar a entidade `Letter` (a cartinha)

1. **Tipo:** adicione a interface `Letter` em `packages/types/src/index.ts` (já esboçada acima)
2. **Prisma:** crie o model `Letter` em `apps/server/prisma/schema.prisma` e rode `pnpm db:push`
3. **Server:** crie `services/letters.service.ts`, `controllers/letters.controller.ts`, `routes/letters.route.ts`
4. **Mount:** em `apps/server/src/index.ts`, `app.use("/letters", lettersRouter)`
5. **Client:** adicione mocks em `lib/mocks.ts` e chame `apiGet<Letter[]>("/letters", mockLetters)`; trate `isMocked` na UI

Mantenha os nomes de arquivo no padrão `<nome>.<camada>.ts` para que IAs e humanos encontrem rápido.

---

## Padrões de Resposta da API

**Sempre use `ApiResponse<T>` de `@repo/types`:**

```typescript
// Resposta de sucesso
return { data: letter };

// Resposta com mensagem
return { data: letter, message: "Carta salva com sucesso" };

// Resposta de erro (use res.status())
return res.status(404).json({ error: "Carta não encontrada" });

// Resposta paginada
return {
  data: letters,
  total: 42,
  page: 1,
  pageSize: 10,
};
```

---

## O que NÃO fazer

```typescript
// Não use any
function process(data: any) { }

// Não defina tipos de entidades fora de @repo/types
// (a menos que seja estritamente local a um único arquivo)
interface Letter { ... }  // coloque em packages/types/

// Não acesse o Prisma diretamente nos controllers.
// Controllers chamam services; services usam Prisma.
app.get('/letters', async (_req, res) => {
  res.json(await prisma.letter.findMany())  // mova para um service
})

// Não commite arquivos .env
// .gitignore já os ignora, mas nunca force o add

// Não use localhost como host do banco dentro do Docker
DATABASE_URL="...@localhost:5432/..."  // use @postgres:5432
```

---

_Atualizado junto com o projeto. Sempre que adicionar um novo app, package, porta ou convenção importante, atualize este arquivo._
