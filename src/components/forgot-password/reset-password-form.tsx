"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";

import forgotPassPt1 from "@/assets/forgotPassPt1.jpg";

export function ResetPasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      setError("As senhas não coincidem.");
      return;
    }
    router.push("/login");
  }

  const inputCls =
    "w-full rounded-lg border border-transparent bg-white/80 px-4 py-3 text-sm text-gray-700 placeholder-gray-500 outline-none focus:border-brand-teal focus:bg-white focus:ring-1 focus:ring-brand-teal";

  return (
    <section className="relative flex min-h-screen items-center justify-center">
      <div className="absolute inset-0">
        <Image
          src={forgotPassPt1}
          alt=""
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-black/40" />
      </div>

      <div className="relative flex w-full max-w-lg flex-col items-center gap-6 rounded-2xl bg-white/30 px-10 py-10 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <ShieldIcon />
          <span className="text-2xl font-bold text-brand-teal">Amparian</span>
        </div>

        <div className="text-center text-sm font-medium text-brand-teal">
          <p>Criar nova senha.</p>
          <p>Escolha uma senha forte que você não tenha usado antes.</p>
        </div>

        <form onSubmit={handleSubmit} className="flex w-full flex-col gap-4">
          <input
            type="password"
            placeholder="Digite nova senha"
            autoComplete="new-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputCls}
          />
          <input
            type="password"
            placeholder="Digite senha novamente"
            autoComplete="new-password"
            required
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className={inputCls}
          />

          {error && (
            <p className="rounded-lg bg-red-50/80 px-3 py-2 text-center text-xs font-medium text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="mt-1 w-full rounded-lg bg-brand-teal py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-teal-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-teal"
          >
            Atualizar senha
          </button>
        </form>
      </div>
    </section>
  );
}

function ShieldIcon() {
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none" aria-hidden="true">
      <path d="M18 3L5 8.5V17C5 24.18 10.64 30.9 18 33C25.36 30.9 31 24.18 31 17V8.5L18 3Z" fill="#064e3b" />
      <path d="M18 6L8 10.8V17C8 23.12 12.56 28.78 18 30.6C23.44 28.78 28 23.12 28 17V10.8L18 6Z" fill="#0d9488" />
    </svg>
  );
}
