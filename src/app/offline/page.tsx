"use client";

export default function OfflinePage() {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <div className="text-6xl">📡</div>
      <h1 className="text-2xl font-bold">Você está offline</h1>
      <p className="max-w-sm text-gray-500">
        Não conseguimos carregar esta página. Verifique sua conexão com a
        internet e tente novamente.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="mt-2 rounded-lg bg-black px-4 py-2 text-white hover:bg-gray-800"
      >
        Tentar novamente
      </button>
    </div>
  );
}