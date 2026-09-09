// SHELL ATIVIDADENGX - Orquestradora de Micro Frontends via Web Components
// Este arquivo é o cérebro da casca: autentica no Keycloak, carrega o registro
// de micro frontends e injeta cada um como Custom Element isolado.

import Keycloak from 'keycloak-js';

// Contrato que o outro projeto precisa respeitar (ver CONEXAO-MICROFRONTEND.md)
// tag = nome do Web Component com hífen, url = main.js com CORS, title = rótulo da sidebar
type Microfrontend = {
  tag: string;
  url: string;
  title: string;
};

// Loader animado de 3 caixas usado no loading global e local
import { mountBoxLoader, type BoxLoaderHandle } from './components/loader/box-loader';

// Cache de elementos do DOM da shell (index.html)
const statusEl = document.getElementById('status') as HTMLDivElement; // "X micro frontends disponíveis"
const container = document.getElementById('microfrontends') as HTMLDivElement; // onde os Wrappers são inseridos
const sidebarNav = document.getElementById('sidebarNav') as HTMLElement; // nav lateral com botões
const logoutBtn = document.getElementById('logoutBtn') as HTMLButtonElement; // botão Sair
const userInfo = document.getElementById('userInfo') as HTMLSpanElement; // nome do usuário logado
const appLayout = document.getElementById('appLayout') as HTMLDivElement; // grid sidebar + main (escondido até auth)
const loadingEl = document.getElementById('loading') as HTMLDivElement; // tela de loading
const errorBox = document.getElementById('errorBox') as HTMLDivElement; // caixa vermelha de erro Keycloak
const errorMsg = document.getElementById('errorMsg') as HTMLParagraphElement;
const retryBtn = document.getElementById('retryBtn') as HTMLButtonElement; // botão Tentar novamente

let globalLoader: BoxLoaderHandle | null = null;

// Mostra loader global só se ainda não estiver tudo carregado
function startGlobalLoader(): void {
  // Evita piscar loader se já buscou antes e todos customElements já existem
  if (container.children.length > 0 && microfrontends.length > 0 && microfrontends.every((entry) => customElements.get(entry.tag))) {
    return;
  }
  loadingEl.innerHTML = '';
  loadingEl.style.display = 'grid';
  errorBox.style.display = 'none';
  globalLoader = mountBoxLoader(loadingEl);
}

function stopGlobalLoader(): void {
  if (globalLoader) {
    globalLoader.destroy();
    globalLoader = null;
  }
}

async function finishGlobalLoader(): Promise<void> {
  if (globalLoader) {
    await globalLoader.showFinal(); // animação final antes de sumir
    globalLoader.destroy();
    globalLoader = null;
  }
}

let microfrontends: Microfrontend[] = []; // lista vinda de /microfrontends.json
let activeTag: string | null = null; // qual micro frontend está visível

// Config do Keycloak - lê do .env (VITE_KEYCLOAK_*) com fallback localhost para dev
const keycloak = new Keycloak({
  url: import.meta.env.VITE_KEYCLOAK_URL ?? 'http://localhost:8080',
  realm: import.meta.env.VITE_KEYCLOAK_REALM ?? 'atividadengx',
  clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID ?? 'frontend',
});

// Fluxo principal: autentica -> carrega micro frontends -> mostra app
async function initAuth(): Promise<void> {
  const shouldShowLoader = !isAlreadyLoaded();
  if (shouldShowLoader) startGlobalLoader();
  try {
    await keycloak.init({
      onLoad: 'login-required', // obriga login, redireciona para Keycloak se não logado
      pkceMethod: 'S256', // PKCE para publicClient (sem secret), precisa estar em realm.json
      checkLoginIframe: false, // desativa iframe de checagem (usa silent-check-sso.html se precisar)
    });
    updateAuthUi(true); // mostra Sair + username
    scheduleRefresh(); // agenda renovação de token a cada 20s
    await loadMicrofrontends(); // busca JSON e monta DOM
    if (shouldShowLoader) await finishGlobalLoader();
    showApp(); // esconde loading/error, mostra grid sidebar+main
  } catch (error) {
    updateAuthUi(false);
    showError(error); // mostra caixa vermelha com mensagem
  } finally {
    stopGlobalLoader();
  }
}

// Verifica se já carregou antes (evita refazer fetch e piscar loader)
function isAlreadyLoaded(): boolean {
  return microfrontends.length > 0 && microfrontends.every((entry) => customElements.get(entry.tag) !== undefined);
}

// Atualiza header: botão Sair e nome do usuário
function updateAuthUi(authenticated: boolean): void {
  logoutBtn.style.display = authenticated ? 'inline-block' : 'none';
  userInfo.textContent = authenticated
    ? (keycloak.tokenParsed as { preferred_username?: string })?.preferred_username ?? 'autenticado'
    : '';
}

function showApp(): void {
  loadingEl.style.display = 'none';
  errorBox.style.display = 'none';
  appLayout.style.display = 'grid';
}

function showError(error: unknown): void {
  stopGlobalLoader();
  loadingEl.style.display = 'none';
  errorBox.style.display = 'block';
  const message = error instanceof Error ? error.message : String(error);
  errorMsg.textContent = `Falha ao conectar no Keycloak: ${message}. Verifique se o container keycloak esta em http://localhost:8080 e se o realm atividadengx foi importado.`;
}

// Renova token a cada 20s; se falhar, força login de novo
function scheduleRefresh(): void {
  setInterval(async () => {
    try {
      await keycloak.updateToken(30); // renova se expira em <30s
    } catch {
      await keycloak.login();
    }
  }, 20000);
}

logoutBtn.addEventListener('click', () => void keycloak.logout({ redirectUri: window.location.origin }));
retryBtn.addEventListener('click', () => {
  errorBox.style.display = 'none';
  loadingEl.style.display = 'grid';
  void initAuth();
});

// Busca /microfrontends.json, cria botão na sidebar e wrapper <tag></tag> para cada entrada
async function loadMicrofrontends(): Promise<void> {
  const response = await fetch('/microfrontends.json');
  microfrontends = await response.json();

  statusEl.textContent = `${microfrontends.length} micro frontends disponiveis`;

  sidebarNav.innerHTML = '';

  for (const entry of microfrontends) {
    // Botão na sidebar
    const button = document.createElement('button');
    button.className = 'sidebar-btn';
    button.textContent = entry.title;
    button.title = entry.tag;
    button.addEventListener('click', () => void selectMicrofrontend(entry.tag));
    sidebarNav.appendChild(button);

    // Wrapper que contém header + mount do Web Component
    const wrapper = document.createElement('div');
    wrapper.className = 'microfrontend-wrapper hidden';
    wrapper.id = `wrapper-${entry.tag}`;

    const header = document.createElement('div');
    header.className = 'microfrontend-header';
    header.innerHTML = `<span>${entry.title} <span class="muted">&lt;${entry.tag}&gt;</span></span><span class="muted">${entry.url}</span>`;
    wrapper.appendChild(header);

    // Mount onde o Custom Element vive: <posts-crud></posts-crud>
    const mount = document.createElement('div');
    mount.innerHTML = `<${entry.tag}></${entry.tag}>`;
    wrapper.appendChild(mount);
    container.appendChild(wrapper);
  }

  // Auto-seleciona o primeiro micro frontend
  if (microfrontends.length > 0) {
    await selectMicrofrontend(microfrontends[0].tag);
  }
}

// Troca visibilidade entre wrappers e carrega script se ainda não registrado
async function selectMicrofrontend(tag: string): Promise<void> {
  activeTag = tag;

  // Marca botão ativo na sidebar
  document.querySelectorAll<HTMLButtonElement>('.sidebar-btn').forEach((button) => {
    const isActive = button.textContent === microfrontends.find((entry) => entry.tag === tag)?.title;
    button.classList.toggle('active', isActive);
  });

  // Mostra só o wrapper da tag selecionada
  document.querySelectorAll<HTMLDivElement>('.microfrontend-wrapper').forEach((wrapper) => {
    const shouldShow = wrapper.id === `wrapper-${tag}`;
    wrapper.classList.toggle('hidden', !shouldShow);
  });

  const entry = microfrontends.find((item) => item.tag === tag);
  if (!entry) return;

  const wrapper = document.getElementById(`wrapper-${tag}`) as HTMLDivElement | null;
  const mount = wrapper?.lastElementChild as HTMLDivElement | null;
  let loaderHost: HTMLDivElement | null = null;
  let localLoader: BoxLoaderHandle | null = null;

  // Loader local só se ainda não carregou o script (customElements.get == undefined)
  if (wrapper && mount && !customElements.get(tag)) {
    loaderHost = document.createElement('div');
    mount.appendChild(loaderHost);
    localLoader = mountBoxLoader(loaderHost);
  }

  try {
    await loadScript(entry.url, entry.tag);
  } finally {
    if (localLoader) localLoader.destroy();
    if (loaderHost) loaderHost.remove();
  }
}

// Injeta <script type="module" src=url> se ainda não existe customElements.get(tag)
// O outro projeto precisa servir url com CORS * e registrar customElements.define(tag)
function loadScript(url: string, tag: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (customElements.get(tag)) {
      resolve(); // já carregado, evita redefinir
      return;
    }
    const script = document.createElement('script');
    script.type = 'module';
    script.src = url;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`falha ao carregar ${url}`));
    document.head.appendChild(script);
  });
}

void initAuth();
