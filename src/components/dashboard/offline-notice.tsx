"use client";

import { useSyncExternalStore } from "react";

import { NETWORK_OK_MESSAGE, SERVED_FROM_CACHE_MESSAGE } from "@/lib/offline/api-cache";

// Se a última leitura da API veio da cópia guardada (o service worker avisa: `src/app/sw.ts`). Fica
// no módulo, e não no componente, porque o aviso deve sobreviver à troca de tela: a próxima tela
// também abre com cópias até a rede voltar a responder.
let servingCachedCopies = false;
const listeners = new Set<() => void>();

function notify() {
  for (const listener of listeners) listener();
}

function onWorkerMessage(event: MessageEvent) {
  const type = (event.data as { type?: unknown } | null)?.type;
  const next =
    type === SERVED_FROM_CACHE_MESSAGE ? true : type === NETWORK_OK_MESSAGE ? false : servingCachedCopies;
  if (next === servingCachedCopies) return;
  servingCachedCopies = next;
  notify();
}

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  if (listeners.size === 1) navigator.serviceWorker?.addEventListener("message", onWorkerMessage);
  window.addEventListener("online", onChange);
  window.addEventListener("offline", onChange);
  return () => {
    listeners.delete(onChange);
    if (listeners.size === 0) navigator.serviceWorker?.removeEventListener("message", onWorkerMessage);
    window.removeEventListener("online", onChange);
    window.removeEventListener("offline", onChange);
  };
}

// Sem conexão com a API, o service worker entrega a última resposta guardada de cada leitura. Este
// aviso é o que impede esse dado antigo de parecer atual. Ele aparece em dois casos: o navegador diz
// que está sem rede (`navigator.onLine`), ou diz que está com rede mas a API não respondeu e a tela
// recebeu uma cópia — Wi-Fi sem internet, servidor fora do ar. Some quando uma leitura volta a vir da
// rede.
// No servidor, e na primeira pintura, o valor é "conectado": assim o HTML do servidor e o do navegador
// batem, e o aviso aparece logo em seguida, se for o caso.
export function OfflineNotice() {
  const offline = useSyncExternalStore(
    subscribe,
    () => !navigator.onLine || servingCachedCopies,
    () => false,
  );

  // A região `role="status"` fica sempre na página e só o texto muda: leitores de tela não anunciam
  // o texto que chega junto com uma região recém-inserida.
  return (
    <p
      role="status"
      className={
        offline
          ? "border-b border-gray-100 bg-white px-4 py-2 text-sm font-medium text-amber-800 sm:px-6"
          : "sr-only"
      }
    >
      {offline
        ? "Sem conexão com o Amparian. As telas mostram os últimos dados recebidos, e salvar, se inscrever ou emitir certificados só funciona quando a conexão voltar."
        : ""}
    </p>
  );
}
