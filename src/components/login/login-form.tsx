"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";

import fundoLogin from "@/assets/fundoLogin.png";
import {
  BrandShield,
  Button,
  FormAlert,
  FormField,
  TextInput,
} from "@/components/ui";
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
  const [fieldErrors, setFieldErrors] = useState<ApiFieldErrors<LoginField>>(
    {},
  );
  const [loading, setLoading] = useState(false);
  const search = useSyncExternalStore(
    subscribeToLocation,
    getClientSearch,
    () => "",
  );
  const reason = new URLSearchParams(search).get("reason");
  const reasonMessage =
    reason === "session-expired"
      ? "Sua sessão expirou. Faça login novamente."
      : reason === "session-required"
        ? "Faça login para continuar."
        : reason === "password-reset"
          ? "Senha alterada com sucesso. Faça login com a nova senha."
          : "";
  const message = error || reasonMessage;
  const messageVariant =
    !error && reason === "password-reset" ? "success" : "error";

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
      const { fieldErrors: nextFieldErrors, formError } =
        getApiFormError<LoginField>(
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
          <BrandShield />
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
                setFieldErrors((current) => ({
                  ...current,
                  password: undefined,
                }));
              }}
              error={fieldErrors.password}
              variant="translucent"
              className="px-4 py-3 text-sm"
            />
          </FormField>

          <FormAlert
            align="center"
            className="text-xs"
            variant={messageVariant}
          >
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
