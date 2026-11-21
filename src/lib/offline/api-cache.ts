// Cache das leituras da API que valem offline. O nome é compartilhado entre o service worker
// (`src/app/sw.ts`), que grava nele, e a sessão (`src/lib/auth/session.ts`), que o apaga.
export const API_OFFLINE_CACHE = "amparian-api";

// Mensagens que o service worker manda à página sobre de onde veio a última leitura da API: da cópia
// guardada (a rede falhou) ou da rede. É o que o aviso de "sem conexão" usa quando o navegador se
// diz online mas a rede não responde — Wi-Fi sem internet, servidor fora do ar.
export const SERVED_FROM_CACHE_MESSAGE = "amparian:served-from-cache";
export const NETWORK_OK_MESSAGE = "amparian:network-ok";

// O cache não separa usuários: a chave é só a URL, e o token vai num cabeçalho que ela ignora.
// Por isso ele é apagado a cada login e a cada saída — quem entra depois no mesmo aparelho nunca vê
// os dados de quem saiu, nem online nem offline.
export function clearOfflineApiCache(): void {
  if (typeof caches === "undefined") return;
  void caches.delete(API_OFFLINE_CACHE).catch(() => undefined);
}
