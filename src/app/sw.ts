/// <reference lib="webworker" />
import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig, SerwistPlugin } from "serwist";
import { ExpirationPlugin, NetworkFirst, NetworkOnly, Serwist } from "serwist";

import {
  API_OFFLINE_CACHE,
  NETWORK_OK_MESSAGE,
  SERVED_FROM_CACHE_MESSAGE,
} from "../lib/offline/api-cache";

declare global {
  interface ServiceWorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

// Sete dias: o mesmo prazo do cookie de sessão (`setAuthCookie`). Enquanto a pessoa está logada no
// aparelho, as telas que ela já abriu continuam abrindo sem conexão.
const OFFLINE_MAX_AGE_SECONDS = 7 * 24 * 60 * 60;

const PAGES_CACHE = "amparian-pages";

// O caminho da rota na API, sem o prefixo, quando a requisição é para a API; senão `null`. O teste é
// pelo prefixo `/api/v1/` em outra origem, e não pela URL da API: o endereço muda entre local,
// Preview e produção, e todas as rotas da API vivem sob esse prefixo.
function apiRoute(url: URL, sameOrigin: boolean): string | null {
  if (sameOrigin || !url.pathname.startsWith("/api/v1/")) return null;
  return url.pathname.slice("/api/v1".length);
}

// Leituras que valem offline (decisão de 21/11/2026): o que a pessoa lê sobre si mesma — perfil,
// impacto, agenda, inscrições, os eventos que organiza com inscritos e presença, a lista de
// certificados — mais os eventos abertos e as listas de opções. Só GET: salvar, inscrever-se e
// emitir continuam exigindo conexão.
//
// Ficam de fora, sempre pela rede: login e sessão (`/auth/*`), a verificação pública de
// certificado (mostra o nome completo de outra pessoa, num aparelho que pode nem ser dela) e o PDF
// do certificado (documento pessoal, que a pessoa já salva ao baixar).
// As leituras ligadas à sessão (`/me*`) e as públicas ficam em regras separadas porque só as
// primeiras exigem o token para usar a cópia guardada (`sessionBoundRead`, abaixo).
const SESSION_READS: RegExp[] = [
  /^\/me$/,
  /^\/me\/stats$/,
  /^\/me\/agenda$/,
  /^\/me\/registrations$/,
  /^\/me\/events$/,
  /^\/me\/events\/\d+$/,
  /^\/me\/events\/\d+\/registrations$/,
  /^\/me\/certificates$/,
];

const PUBLIC_READS: RegExp[] = [/^\/events$/, /^\/events\/\d+$/, /^\/lookups$/];

function matchesRoute(url: URL, sameOrigin: boolean, patterns: RegExp[]): boolean {
  const route = apiRoute(url, sameOrigin);
  return route !== null && patterns.some((pattern) => pattern.test(route));
}

// Só guarda resposta 200 que não veio de redirecionamento. Um erro (401 de sessão vencida, 404) não
// pode virar "o último dado visto"; e um redirecionamento guardado sob a URL original faria o
// navegador recusar a página (`/home` sem sessão redireciona para `/login`).
const okResponsesOnly: SerwistPlugin = {
  cacheWillUpdate: async ({ response }) =>
    response.status === 200 && !response.redirected ? response : null,
};

// A cópia de uma leitura `/me*` só é usada quando o pedido leva o token. O logout apaga o cache
// (`clearOfflineApiCache`), mas uma leitura que ainda estava a caminho pode terminar depois e gravá-lo
// de novo; sem esta guarda, quem abrisse o app offline no mesmo aparelho, sem sessão, veria os dados
// de quem saiu — inclusive os contatos dos inscritos. Sem token, a cópia nunca é entregue, e o
// próximo login apaga o que tiver sobrado.
const sessionBoundRead: SerwistPlugin = {
  cachedResponseWillBeUsed: async ({ request, cachedResponse }) =>
    request.headers.has("Authorization") ? (cachedResponse ?? null) : null,
};

// Conta à página que fez a leitura de onde veio a resposta. `navigator.onLine` só sabe se o aparelho
// tem rede, não se a API responde; com este aviso, a tela também sabe quando está mostrando uma cópia
// guardada com o navegador "online". Fica por último na lista de plugins: assim só é contada a cópia
// que de fato chega à página (a guarda de sessão pode tê-la descartado antes).
//
// O aviso é "melhor esforço": não é esperado e nunca lança. `fetchDidSucceed` roda dentro do trecho
// que o Serwist trata como "a rede falhou"; se o aviso lançasse ali, uma leitura bem-sucedida cairia
// na cópia guardada. Uma mensagem perdida só atrasa o aviso da tela, nunca muda a resposta.
// O envio fica preso ao evento por `waitUntil`, para o navegador não encerrar o service worker antes
// de a mensagem sair; a resposta da leitura não espera por ele.
function notifyClient(event: ExtendableEvent, type: string): void {
  const clientId = (event as FetchEvent).clientId;
  if (!clientId) return;
  const sending = self.clients
    .get(clientId)
    .then((client) => client?.postMessage({ type }))
    .catch(() => undefined);
  try {
    event.waitUntil(sending);
  } catch {
    // O evento já terminou: a mensagem segue sem a garantia, o que basta para um aviso.
  }
}

const reportResponseSource: SerwistPlugin = {
  cachedResponseWillBeUsed: async ({ event, cachedResponse }) => {
    if (cachedResponse) notifyClient(event, SERVED_FROM_CACHE_MESSAGE);
    return cachedResponse ?? null;
  },
  fetchDidSucceed: async ({ event, response }) => {
    notifyClient(event, NETWORK_OK_MESSAGE);
    return response;
  },
};

// Validade das cópias: o ExpirationPlugin descarta pela data em que a cópia foi gravada (guardada por
// ele mesmo), mas essa limpeza roda depois de cada uso. O cabeçalho `Date`, que permitiria recusar
// antes, não chega ao service worker: a API, em outra origem, só expõe `Content-Disposition` no CORS.
// Na prática, uma cópia com mais de 7 dias ainda pode aparecer UMA vez offline antes de sumir.
const apiExpiration = () =>
  new ExpirationPlugin({ maxEntries: 100, maxAgeSeconds: OFFLINE_MAX_AGE_SECONDS });

// Páginas que não fazem sentido offline e cuja URL pode carregar segredo: a redefinição de senha
// leva o token na query, e guardá-la deixaria o token no aparelho.
const NEVER_CACHED_PAGES = ["/esqueci-minha-senha"];

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    // Rede primeiro, sem prazo de espera: a cópia guardada só aparece quando a rede FALHA, nunca
    // porque a resposta demorou — assim um dado antigo nunca se passa por atual numa conexão lenta.
    // Sem rede, a tela mostra a última resposta e o painel avisa que está sem conexão.
    {
      matcher: ({ url, sameOrigin }) => matchesRoute(url, sameOrigin, SESSION_READS),
      handler: new NetworkFirst({
        cacheName: API_OFFLINE_CACHE,
        plugins: [okResponsesOnly, sessionBoundRead, apiExpiration(), reportResponseSource],
      }),
    },
    {
      matcher: ({ url, sameOrigin }) => matchesRoute(url, sameOrigin, PUBLIC_READS),
      handler: new NetworkFirst({
        cacheName: API_OFFLINE_CACHE,
        plugins: [okResponsesOnly, apiExpiration(), reportResponseSource],
      }),
    },
    // O resto da API vai sempre pela rede. Esta regra vem antes das padrão porque a última delas
    // guarda por 1 hora tudo o que vem de outra origem — e a API é outra origem.
    {
      matcher: ({ url, sameOrigin }) => apiRoute(url, sameOrigin) !== null,
      handler: new NetworkOnly(),
    },
    // Tudo o que é dessas páginas vai sempre pela rede. A regra precisa existir, e vir antes das
    // padrão: sem ela, a página cairia na regra padrão das páginas da própria origem, que guarda por
    // 24 horas com a URL inteira — token incluído — como chave.
    {
      matcher: ({ url, sameOrigin }) =>
        sameOrigin && NEVER_CACHED_PAGES.some((path) => url.pathname.startsWith(path)),
      handler: new NetworkOnly(),
    },
    // As páginas do app (abertas pela barra de endereço ou recarregadas). As regras padrão guardam
    // por 24 horas; aqui o prazo acompanha o das leituras da API, senão a tela deixaria de abrir
    // offline antes dos dados que ela mostra. O HTML não tem dado de ninguém: o conteúdo vem da API.
    {
      matcher: ({ request, sameOrigin }) => sameOrigin && request.mode === "navigate",
      handler: new NetworkFirst({
        cacheName: PAGES_CACHE,
        plugins: [
          okResponsesOnly,
          new ExpirationPlugin({
            maxEntries: 32,
            maxAgeSeconds: OFFLINE_MAX_AGE_SECONDS,
          }),
        ],
      }),
    },
    ...defaultCache,
  ],
  fallbacks: {
    entries: [
      {
        url: "/offline",
        matcher({ request }) {
          return request.destination === "document";
        },
      },
    ],
  },
});

// Ao ativar uma versão nova (a cada deploy):
// - as páginas guardadas são descartadas. O HTML de um build aponta para os scripts daquele build, e
//   o pré-cache da versão nova apaga os antigos: servida offline, a página antiga abriria sem
//   funcionar. Ela volta a ser guardada na próxima visita com rede;
// - versões anteriores deste service worker deixaram respostas da API no cache "cross-origin" das
//   regras padrão. A expiração delas só roda quando esse cache volta a ser usado, então elas são
//   apagadas aqui. O resto desse cache (fontes, imagens de outra origem) fica.
const LEGACY_CROSS_ORIGIN_CACHE = "cross-origin";

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      await caches.delete(PAGES_CACHE);
      if (!(await caches.has(LEGACY_CROSS_ORIGIN_CACHE))) return;
      const cache = await caches.open(LEGACY_CROSS_ORIGIN_CACHE);
      for (const request of await cache.keys()) {
        const url = new URL(request.url);
        if (apiRoute(url, url.origin === self.location.origin) !== null) {
          await cache.delete(request);
        }
      }
    })(),
  );
});

serwist.addEventListeners();
