"use client";

import Image from "next/image";
import { useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";

import forgotPassPt1 from "@/assets/forgotPassPt1.jpg";
import { Button, FormAlert, FormField, TextInput } from "@/components/ui";
import { apiJson, getApiFormError, type ApiFieldErrors } from "@/lib/api";

type ResetPasswordField = "password" | "confirm";

export function ResetPasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<ApiFieldErrors<ResetPasswordField>>({});
  const [loading, setLoading] = useState(false);
  const search = useSyncExternalStore(subscribeToLocation, getClientSearch, () => "");
  const token = new URLSearchParams(search).get("token") ?? "";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setFieldErrors({});

    if (password !== confirm) {
      setFieldErrors({ confirm: "As senhas não coincidem." });
      return;
    }
    if (!token.trim()) {
      setError("Link inválido ou expirado. Solicite um novo e-mail de recuperação.");
      return;
    }

    setLoading(true);
    try {
      await apiJson("/auth/reset-password", {
        method: "POST",
        json: { token: token.trim(), newPassword: password },
        auth: false,
      });
      router.push("/login");
    } catch (err) {
      const { fieldErrors: nextFieldErrors, formError } = getApiFormError<ResetPasswordField>(
        err,
        "Não foi possível atualizar. Verifique se a API está rodando.",
        {
          fieldMap: {
            "body.newPassword": "password",
            "body.token": null,
            newPassword: "password",
            token: null,
          },
        },
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

        <div className="text-center text-sm font-medium text-brand-teal">
          <p>Criar nova senha.</p>
          <p>Escolha uma senha forte que você não tenha usado antes.</p>
        </div>

        <form onSubmit={handleSubmit} className="flex w-full flex-col gap-4">
          <FormField error={fieldErrors.password}>
            <TextInput
              type="password"
              placeholder="Digite nova senha"
              autoComplete="new-password"
              required
              minLength={6}
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
          <FormField error={fieldErrors.confirm}>
            <TextInput
              type="password"
              placeholder="Digite senha novamente"
              autoComplete="new-password"
              required
              minLength={6}
              value={confirm}
              onChange={(e) => {
                setConfirm(e.target.value);
                setFieldErrors((current) => ({ ...current, confirm: undefined }));
              }}
              error={fieldErrors.confirm}
              variant="translucent"
              className="px-4 py-3 text-sm"
            />
          </FormField>

          <FormAlert align="center" className="text-xs" variant="error">
            {error}
          </FormAlert>

          <Button
            type="submit"
            disabled={loading}
            loading={loading}
            loadingLabel="Atualizando..."
            fullWidth
            className="mt-1 py-3"
          >
            Atualizar senha
          </Button>
        </form>
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
