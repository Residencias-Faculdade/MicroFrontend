# atividadengx — Biblioteca Shell para Micro Frontends via Web Components

> **Use como biblioteca:** importe a casca como orquestradora e plugue qualquer frontend que exponha um `Custom Element`. Sem rebuild da casca, sem acoplamento entre times.

```bash
npm install
cp .env.example .env
docker compose up --build -d   # shell :3000 + keycloak :8080 (+ posts-crud :4200 se existir)
# ou dev:
npm run dev
```

**Stack:** Vite 6 + TypeScript + `keycloak-js` 26.2 (PKCE S256) + Nginx + Docker Compose.

---

## Sumário

- [A. Configuração da Casca / Shell](#a-configuracao-da-casca--shell) — só quem mantém `atividadengx`
- [B. Configuração Global dos Frontends](#b-configuracao-global-dos-frontends) — todo time que vai plugar um CRUD
- [C. Como plugar (registro)](#c-como-plugar-registro)
- [Apêndice](#apendice)

---

## A. Configuração da Casca / Shell

### A.1. O que a casca faz

`src/main.ts:52-78` inicializa `Keycloak` (`login-required`, `pkceMethod:'S256'`, `checkLoginIframe:false`), agenda `updateToken(30)` a cada 20s e carrega `public/microfrontends.json:1` para injetar `<script type="module" src="url">` e montar `<tag></tag>` dentro de `#microfrontends`. `src/style.css:52` + `src/tokens.css:1` desenham o grid `240px + 1fr` com sidebar.

### A.2. Env da casca

`.env.example` é template commitado. `.env` é cópia local **não commitada** (bakeado no build via `import.meta.env` em `src/main.ts:53`).

```ini
# portas host (docker-compose.yml:7,24,43)
SHELL_PORT=3000
POSTS_CRUD_PORT=4200
KEYCLOAK_PORT=8080

# Keycloak runtime (compose) e build-time (Vite precisa VITE_*)
KEYCLOAK_URL=http://localhost:8080
KEYCLOAK_REALM=atividadengx
KEYCLOAK_CLIENT_ID=frontend
KEYCLOAK_ADMIN=admin
KEYCLOAK_ADMIN_PASSWORD=admin          # DEV: pode ser admin; PROD: senha forte, não commitar
VITE_KEYCLOAK_URL=http://localhost:8080  # usado em src/main.ts:53
VITE_KEYCLOAK_REALM=atividadengx
VITE_KEYCLOAK_CLIENT_ID=frontend
```

| Cenário | O que mudar no `.env` |
|---|---|
| Dev local | nada — `cp .env.example .env` já funciona (`localhost` casa com `keycloak/realm.json:30` `redirectUris`) |
| Prod (Vercel/Railway) | `VITE_KEYCLOAK_URL=https://keycloak.seudominio.com` + senha forte + adicionar `https://sua-shell.vercel.app/*` em `realm.json:30` e refazer `npm run build` |

### A.3. Registro declarativo

`public/microfrontends.json` é o **único ponto de configuração da casca**:

```json
[
  { "tag": "posts-crud", "title": "Posts CRUD (primeiro-projeto)", "url": "http://localhost:4200/main.js" }
]
```

`src/main.ts:122` faz `fetch` e para cada entrada cria `button.sidebar-btn` + `div#wrapper-tag` com `header` e mount `<tag></tag>`. Array vazio `[]` mostra `0 micro frontends disponíveis` sem erro.

### A.4. Docker da casca

`Dockerfile:1` multi-stage: `node:22-alpine` (`COPY package*.json ./` + `npm ci` + `npm run build` -> `dist/`) → `nginx:alpine` (`COPY nginx.conf` + `dist/`). `nginx.conf:7` faz SPA `try_files` e `11,18` cache `1y immutable` vs `no-cache` para `index.html`. `docker-compose.yml:1` sobe `shell:3000` + `keycloak:8080` (`app-network`), `posts-crud` é opcional (se path `../Caio/...` não existir, sobe só casca+keycloak).

```bash
docker compose up --build -d
docker compose logs -f
docker compose down        # mantém volume keycloak-data
docker compose down -v     # apaga volume (reseta realm)
```

### A.5. Keycloak da casca

`keycloak/realm.json:2` realm `atividadengx`, client `frontend` `publicClient:true` + `pkce.code.challenge.method:S256` (casa com `src/main.ts:64`), `redirectUris: 3000/4200/4201/4202`, `webOrigins:*`. Usuário demo `Alec / Lost seas1` com `admin,user`. `public/silent-check-sso.html:1` `parent.postMessage` para silent SSO.

---

## B. Configuração Global dos Frontends

> **Todo frontend externo** (Angular 21, React, Vue, Vanilla) que quiser ser jogado na casca precisa cumprir este contrato. A casca não importa código dele.

### B.1. Contrato Web Component (obrigatório)

No bundle final `main.js` do frontend:

```js
// 1 tag por main.js, tag com hífen, guard para não redefinir
if (!customElements.get('orders-crud')) {
  customElements.define('orders-crud', OrdersCrud);
}
```

- `src/main.ts:193` verifica `customElements.get(tag)` antes de injetar `<script type="module" src="url">` — sem hífen o browser lança `SyntaxError`, sem guard dá `Already defined`.
- `main.js` estável sem hash (`main.js` com `no-cache`, chunks `main-*.js` com `immutable`) — não aponte para `main.ABC123.js`.
- `main.js` deve responder `200` + `Content-Type: application/javascript` + `Access-Control-Allow-Origin: *` — shell é ` :3000` buscando ` :4202` cross-origin (`src/main.ts:199`). Sem CORS falha.
- Isolamento: `ViewEncapsulation.ShadowDom` (Angular) ou `this.attachShadow({mode:'open'})` (React/Vanilla). Tokens via `src/tokens.css:1` `--color-primary` em vez de hardcode.

### B.2. Servidor do frontend

Nginx do frontend (copie de `nginx.conf:11`):

```nginx
server {
  listen 80;
  location / { try_files $uri $uri/ /index.html; add_header Access-Control-Allow-Origin "*"; }
  location ~* \.js$ { add_header Access-Control-Allow-Origin "*"; }
  location = /main.js { add_header Cache-Control "no-cache, no-store, must-revalidate"; }
  location ~* \.js$ { expires 1y; add_header Cache-Control "public, immutable"; }
}
```

Vite dev: `vite.config.ts:7` `server.port` deve ser a mesma porta da `url`.

### B.3. Build / Dockerfile do frontend

Multi-stage igual a `Dockerfile:1` da casca (`node:22-alpine` -> `nginx:alpine`, copia `dist/.../browser`). Se Angular com `outputHashing: all`, script pós-build copia `main-*.js` -> `main.js` estável (ver `Requisitos-Microfrontend.md:72`).

### B.4. Auth do frontend (se usar API protegida)

Copie de `src/main.ts:52` e `public/silent-check-sso.html:1`:

```ts
// src/environments/environment.ts
export const environment = {
  keycloak: {
    url: import.meta.env.VITE_KEYCLOAK_URL ?? 'http://localhost:8080',
    realm: import.meta.env.VITE_KEYCLOAK_REALM ?? 'atividadengx',
    clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID ?? 'frontend',
  }
};
import Keycloak from 'keycloak-js';
const keycloak = new Keycloak(environment.keycloak);
await keycloak.init({ onLoad:'check-sso', silentCheckSsoRedirectUri:`${location.origin}/silent-check-sso.html`, pkceMethod:'S256', checkLoginIframe:false });
setInterval(()=>keycloak.updateToken(30), 20000);
```

Arquivo obrigatório `public/silent-check-sso.html`:
```html
<html><body><script>parent.postMessage(location.href, location.origin)</script></body></html>
```

Se usar porta fora de `3000/4200/4201/4202`, peça para adicionar em `keycloak/realm.json:30` `redirectUris`. Interceptor deve injetar `Authorization: Bearer` e enfileirar `401` durante `updateToken`.

### B.5. Exemplos por stack

**Angular 21:**
```ts
import { createApplication } from '@angular/platform-browser';
import { createCustomElement } from '@angular/elements';
import { appConfig } from './app/app.config';
import { OrdersComponent } from './app/features/orders/presentation/orders.component';
const tag='orders-crud';
async function defineElement(){ if(customElements.get(tag)) return; const app=await createApplication(appConfig); const el=createCustomElement(OrdersComponent,{injector:app.injector}); customElements.define(tag,el); }
void defineElement();
```

**React:**
```tsx
class OrdersCrud extends HTMLElement { connectedCallback(){ const r=this.attachShadow({mode:'open'}); createRoot(r).render(<App />); } }
if(!customElements.get('orders-crud')) customElements.define('orders-crud', OrdersCrud);
```

**Vanilla:** `class UsersCrud extends HTMLElement { ... }` com `attachShadow` (ver `CONEXAO-MICROFRONTEND.md`).

**Regra de ouro:** frontend nunca `import` da casca — autocontido, próprio `environment.ts` e `Dockerfile`, comunica só via `CustomEvent`/`postMessage`.

---

## C. Como plugar (registro)

> **Única edição na casca** para plugar um frontend novo.

1. Deploye o frontend e anote `https://seu-front.vercel.app/main.js` (200 + CORS *).
2. Adicione em `public/microfrontends.json`:
```json
[
  { "tag": "posts-crud", "title": "Posts CRUD (primeiro-projeto)", "url": "http://localhost:4200/main.js" },
  { "tag": "orders-crud", "title": "Orders CRUD", "url": "http://localhost:4202/main.js" }
]
```
3. Se orquestra local, adicione em `docker-compose.yml:15`:
```yaml
orders-crud:
  build: { context: ../orders-crud, dockerfile: Dockerfile }
  ports: ["4202:80"]
  networks: [app-network]
  depends_on: [keycloak]
```
4. `F5` em `http://localhost:3000` — aparece botão `Orders CRUD` na sidebar, sem rebuild da casca.

**Checklist do frontend antes de pedir plug:**
- [ ] `http://localhost:PORTA/main.js` 200 + CORS *
- [ ] `customElements.get('sua-tag')` undefined antes, classe depois
- [ ] Tag com hífen, única
- [ ] Shadow DOM isolado
- [ ] `main.js` no-cache, chunks immutable
- [ ] Se auth: `silent-check-sso.html` + `S256` + `updateToken(30)`

---

## Apêndice

- Contrato detalhado: `CONEXAO-MICROFRONTEND.md`
- Tutorial Angular 21 passo a passo: `Requisitos-Microfrontend.md`
- Diagramas C4/ER/sequência: `Arquitetura-Visual.md`
- `npm run dev` precisa dos frontends rodando nas URLs do `microfrontends.json`; `npm run build` bakeia `VITE_*` do `.env`.
