"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";

import fundoLogin from "@/assets/fundoLogin.png";
import { Button, FormAlert, FormField, TextInput } from "@/components/ui";
import { apiJson, getApiFormError, type ApiFieldErrors } from "@/lib/api";
import { persistSession, setAuthCookie } from "@/lib/auth";

type LoginField = "email" | "password";

type LoginResponse = {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: {
    name: string;
    email: string;
  };
};

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<ApiFieldErrors<LoginField>>({});
  const [loading, setLoading] = useState(false);
  const search = useSyncExternalStore(subscribeToLocation, getClientSearch, () => "");
  const reason = new URLSearchParams(search).get("reason");
  const reasonMessage = reason === "session-expired"
    ? "Sua sessão expirou. Faça login novamente."
    : reason === "session-required"
      ? "Faça login para continuar."
      : "";
  const message = error || reasonMessage;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setFieldErrors({});
    setLoading(true);

    try {
      const data = await apiJson<LoginResponse>("/auth/login", {
        method: "POST",
        json: { email, password },
        auth: false,
      });

      persistSession(
        { accessToken: data.accessToken, refreshToken: data.refreshToken },
        { name: data.user.name, email: data.user.email },
      );
      setAuthCookie(data.user.name);
      router.push("/home");
    } catch (err) {
      const { fieldErrors: nextFieldErrors, formError } = getApiFormError<LoginField>(
        err,
        "Não foi possível conectar. Verifique se a API está rodando.",
      );
      setFieldErrors(nextFieldErrors);
      setError(formError);
      setLoading(false);
    }
  }

  return (
    <section className="relative flex min-h-[100dvh] items-center justify-center px-4 py-8 sm:px-6 sm:py-10">
      <div className="absolute inset-0">
        <Image
          src={fundoLogin}
          alt=""
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-black/40" />
      </div>

      <div className="relative flex w-full max-w-md flex-col items-center gap-5 rounded-2xl bg-white/30 px-5 py-8 backdrop-blur-sm sm:gap-6 sm:px-10 sm:py-10">
        <div className="flex items-center gap-3">
          <ShieldIcon />
          <span className="text-2xl font-bold text-brand-teal">Amparian</span>
        </div>

        <form onSubmit={handleSubmit} className="flex w-full flex-col gap-4">
          <FormField error={fieldErrors.email}>
            <TextInput
              type="email"
              placeholder="Email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setFieldErrors((current) => ({ ...current, email: undefined }));
              }}
              error={fieldErrors.email}
              variant="translucent"
              className="px-4 py-3 text-sm"
            />
          </FormField>
          <FormField error={fieldErrors.password}>
            <TextInput
              type="password"
              placeholder="Senha"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setFieldErrors((current) => ({ ...current, password: undefined }));
              }}
              error={fieldErrors.password}
              variant="translucent"
              className="px-4 py-3 text-sm"
            />
          </FormField>

          <FormAlert align="center" className="text-xs" variant="error">
            {message}
          </FormAlert>

          <Button
            type="submit"
            disabled={loading}
            loading={loading}
            loadingLabel="Entrando..."
            fullWidth
            className="mt-2 py-3"
          >
            Login
          </Button>
        </form>

        <div className="flex flex-col items-center gap-2 text-center text-sm text-brand-teal sm:flex-row sm:flex-wrap sm:justify-center sm:gap-3">
          <Link href="/esqueci-minha-senha" className="hover:underline">
            Esqueci minha senha
          </Link>
          <span className="hidden text-brand-teal/50 sm:inline">|</span>
          <Link href="/criar-conta" className="hover:underline">
            Criar minha conta
          </Link>
        </div>
      </div>
    </section>
  );
}

function subscribeToLocation(onStoreChange: () => void) {
  window.addEventListener("popstate", onStoreChange);
  return () => window.removeEventListener("popstate", onStoreChange);
}

function getClientSearch() {
  return window.location.search;
}

function ShieldIcon() {
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none" aria-hidden="true">
      <path d="M18 3L5 8.5V17C5 24.18 10.64 30.9 18 33C25.36 30.9 31 24.18 31 17V8.5L18 3Z" fill="#064e3b" />
      <path d="M18 6L8 10.8V17C8 23.12 12.56 28.78 18 30.6C23.44 28.78 28 23.12 28 17V10.8L18 6Z" fill="#0d9488" />
    </svg>
  );
}
