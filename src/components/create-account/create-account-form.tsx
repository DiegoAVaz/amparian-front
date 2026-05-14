"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

import fundoCreateAccount from "@/assets/fundoCreateAccount.jpg";
import { ApiError, apiJson } from "@/lib/api";
import { persistUser } from "@/lib/auth";

type RegisterResponse = {
  user: {
    name: string;
    email: string;
  };
};

export function CreateAccountForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [terms, setTerms] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirm) {
      setError("As senhas não coincidem.");
      return;
    }
    if (!terms) {
      setError("Você precisa aceitar os termos de uso.");
      return;
    }

    setLoading(true);
    try {
      const data = await apiJson<RegisterResponse>("/auth/register", {
        method: "POST",
        json: {
          email,
          password,
          name,
          ...(phone.trim() ? { phone: phone.trim() } : {}),
        },
        auth: false,
      });

      persistUser({ name: data.user.name, email: data.user.email });
      router.replace("/home");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Não foi possível conectar. Verifique se a API está rodando.");
      }
      setLoading(false);
    }
  }

  const inputCls =
    "w-full rounded-lg border border-transparent bg-white/80 px-4 py-3 text-sm text-gray-700 placeholder-gray-500 outline-none focus:border-brand-teal focus:bg-white focus:ring-1 focus:ring-brand-teal";

  return (
    <section className="relative flex min-h-[100dvh] items-center justify-center px-4 py-8 sm:px-6 sm:py-10">
      <div className="absolute inset-0">
        <Image
          src={fundoCreateAccount}
          alt=""
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-black/40" />
      </div>

      <div className="relative flex w-full max-w-lg flex-col items-center gap-5 rounded-2xl bg-white/30 px-5 py-8 backdrop-blur-sm sm:px-10 sm:py-10">
        <div className="flex items-center gap-3">
          <ShieldIcon />
          <span className="text-2xl font-bold text-brand-teal">Amparian</span>
        </div>

        <p className="text-center text-sm font-medium text-brand-teal">
          Ficamos muito felizes em ter você com a gente! Vamos transformar realidades juntos?
        </p>

        <form onSubmit={handleSubmit} className="flex w-full flex-col gap-3">
          <input
            type="text"
            placeholder="Nome completo"
            autoComplete="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputCls}
          />
          <input
            type="email"
            placeholder="Email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputCls}
          />
          <input
            type="tel"
            placeholder="Número de celular"
            autoComplete="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className={inputCls}
          />
          <input
            type="password"
            placeholder="Senha"
            autoComplete="new-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputCls}
          />
          <input
            type="password"
            placeholder="Confirmar senha"
            autoComplete="new-password"
            required
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className={inputCls}
          />

          <label className="flex items-start gap-2 text-sm leading-snug text-brand-teal">
            <input
              type="checkbox"
              className="mt-0.5 h-4 w-4 shrink-0 accent-brand-teal"
              checked={terms}
              onChange={(e) => setTerms(e.target.checked)}
            />
            <span className="min-w-0">
              Li e aceito os{" "}
              <Link href="#" className="underline hover:text-brand-teal-hover">
                termos de uso da plataforma
              </Link>
            </span>
          </label>

          {error && (
            <p className="rounded-lg bg-red-50/80 px-3 py-2 text-center text-xs font-medium text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-1 w-full rounded-lg bg-brand-teal py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-teal-hover disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-teal"
          >
            {loading ? "Criando conta..." : "Começar a ajudar"}
          </button>
        </form>

        <p className="text-sm text-white">
          Já tem uma conta?{" "}
          <Link href="/login" className="font-medium text-brand-teal hover:underline">
            Faça login.
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
