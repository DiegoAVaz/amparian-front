"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

import forgotPassPt1 from "@/assets/forgotPassPt1.jpg";
import { ApiError, apiJson } from "@/lib/api";

export function ForgotPasswordForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await apiJson("/auth/forgot-password", {
        method: "POST",
        json: { email },
        auth: false,
      });
      router.push("/esqueci-minha-senha/redefinir");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Não foi possível enviar. Verifique se a API está rodando.");
      }
      setLoading(false);
    }
  }

  return (
    <section className="relative flex min-h-[100dvh] items-center justify-center px-4 py-8 sm:px-6 sm:py-10">
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

      <div className="relative flex w-full max-w-lg flex-col items-center gap-6 rounded-2xl bg-white/30 px-5 py-8 backdrop-blur-sm sm:px-10 sm:py-10">
        <div className="flex items-center gap-3">
          <ShieldIcon />
          <span className="text-2xl font-bold text-brand-teal">Amparian</span>
        </div>

        <p className="text-center text-sm font-medium text-brand-teal">
          Não se preocupe! Insira o e-mail associado à sua conta e enviaremos um link para você
          criar uma nova senha.
        </p>

        <form onSubmit={handleSubmit} className="flex w-full flex-col gap-4">
          <input
            type="email"
            placeholder="Email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-transparent bg-white/80 px-4 py-3 text-sm text-gray-700 placeholder-gray-500 outline-none focus:border-brand-teal focus:bg-white focus:ring-1 focus:ring-brand-teal"
          />

          {error && (
            <p className="rounded-lg bg-red-50/80 px-3 py-2 text-center text-xs font-medium text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-brand-teal py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-teal-hover disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-teal"
          >
            {loading ? "Enviando..." : "Enviar link de recuperação"}
          </button>
        </form>

        <p className="text-sm text-white">
          Não recebeu email?{" "}
          <Link
            href="#"
            className="font-medium text-brand-teal underline hover:text-brand-teal-hover"
          >
            Reenviar
          </Link>
        </p>
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
