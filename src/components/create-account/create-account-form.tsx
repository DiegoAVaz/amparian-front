"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

import fundoCreateAccount from "@/assets/fundoCreateAccount.jpg";
import {
  Button,
  Checkbox,
  FormAlert,
  FormField,
  TextInput,
} from "@/components/ui";
import { apiJson, getApiFormError, type ApiFieldErrors } from "@/lib/api";
import { persistSession, setAuthCookie } from "@/lib/auth";

type RegisterField =
  | "name"
  | "email"
  | "phone"
  | "password"
  | "confirm"
  | "terms";

type RegisterResponse = {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
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
  const [fieldErrors, setFieldErrors] = useState<ApiFieldErrors<RegisterField>>(
    {},
  );
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setFieldErrors({});

    if (password !== confirm) {
      setFieldErrors({ confirm: "As senhas não coincidem." });
      return;
    }
    if (!terms) {
      setFieldErrors({ terms: "Você precisa aceitar os termos de uso." });
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

      persistSession(
        { accessToken: data.accessToken, refreshToken: data.refreshToken },
        { name: data.user.name, email: data.user.email },
      );
      setAuthCookie(data.user.name);
      router.push("/home");
    } catch (err) {
      const { fieldErrors: nextFieldErrors, formError } =
        getApiFormError<RegisterField>(
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
          Ficamos muito felizes em ter você com a gente! Vamos transformar
          realidades juntos?
        </p>

        <form
          onSubmit={handleSubmit}
          className="flex w-full flex-col gap-3 [&_[role=alert]]:font-bold [&_[role=alert]]:text-red-600"
        >
          <FormField error={fieldErrors.name}>
            <TextInput
              type="text"
              placeholder="Nome completo"
              autoComplete="name"
              required
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setFieldErrors((current) => ({ ...current, name: undefined }));
              }}
              error={fieldErrors.name}
              variant="translucent"
              className="px-4 py-3 text-sm"
            />
          </FormField>
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
          <FormField error={fieldErrors.phone}>
            <TextInput
              type="tel"
              placeholder="Número de celular"
              autoComplete="tel"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                setFieldErrors((current) => ({ ...current, phone: undefined }));
              }}
              error={fieldErrors.phone}
              variant="translucent"
              className="px-4 py-3 text-sm"
            />
          </FormField>
          <FormField error={fieldErrors.password}>
            <TextInput
              type="password"
              placeholder="Senha"
              autoComplete="new-password"
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
          <FormField error={fieldErrors.confirm}>
            <TextInput
              type="password"
              placeholder="Confirmar senha"
              autoComplete="new-password"
              required
              value={confirm}
              onChange={(e) => {
                setConfirm(e.target.value);
                setFieldErrors((current) => ({
                  ...current,
                  confirm: undefined,
                }));
              }}
              error={fieldErrors.confirm}
              variant="translucent"
              className="px-4 py-3 text-sm"
            />
          </FormField>

          <Checkbox
            checked={terms}
            onChange={(e) => {
              setTerms(e.target.checked);
              setFieldErrors((current) => ({ ...current, terms: undefined }));
            }}
            error={fieldErrors.terms}
            label={
              <span className="text-brand-teal">
                Li e aceito os{" "}
                <Link
                  href="#"
                  className="underline hover:text-brand-teal-hover"
                >
                  termos de uso da plataforma
                </Link>
              </span>
            }
          />

          <FormAlert
            align="center"
            className="text-xs font-semibold"
            variant="error"
          >
            {error}
          </FormAlert>

          <Button
            type="submit"
            disabled={loading}
            loading={loading}
            loadingLabel="Criando conta..."
            fullWidth
            className="mt-1 py-3"
          >
            Começar a ajudar
          </Button>
        </form>

        <p className="text-sm text-white">
          Já tem uma conta?{" "}
          <Link
            href="/login"
            className="font-medium text-brand-teal hover:underline"
          >
            Faça login.
          </Link>
        </p>
      </div>
    </section>
  );
}

function ShieldIcon() {
  return (
    <svg
      width="36"
      height="36"
      viewBox="0 0 36 36"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M18 3L5 8.5V17C5 24.18 10.64 30.9 18 33C25.36 30.9 31 24.18 31 17V8.5L18 3Z"
        fill="#064e3b"
      />
      <path
        d="M18 6L8 10.8V17C8 23.12 12.56 28.78 18 30.6C23.44 28.78 28 23.12 28 17V10.8L18 6Z"
        fill="#0d9488"
      />
    </svg>
  );
}

