"use client";

import { Mail } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import {
  Button,
  FormAlert,
  FormField,
  PanelBadge,
  TextInput,
} from "@/components/ui";
import {
  ApiError,
  apiJson,
  getApiFormError,
  type ApiFieldErrors,
} from "@/lib/api";
import { AuthCard, FocusPanel } from "./auth-card";

type ForgotPasswordField = "email";

const RESEND_COOLDOWN_SECONDS = 60;

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [sentTo, setSentTo] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<
    ApiFieldErrors<ForgotPasswordField>
  >({});
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = window.setTimeout(() => setCooldown(cooldown - 1), 1000);
    return () => window.clearTimeout(id);
  }, [cooldown]);

  async function requestLink(target: string) {
    setError("");
    setFieldErrors({});
    setLoading(true);
    try {
      await apiJson("/auth/forgot-password", {
        method: "POST",
        json: { email: target },
        auth: false,
      });
      setSentTo(target);
      setCooldown(RESEND_COOLDOWN_SECONDS);
    } catch (err) {
      if (err instanceof ApiError && err.status === 429) {
        setError(
          "Muitas tentativas. Aguarde alguns minutos e tente novamente.",
        );
        setCooldown(RESEND_COOLDOWN_SECONDS);
      } else {
        const { fieldErrors: nextFieldErrors, formError } =
          getApiFormError<ForgotPasswordField>(
            err,
            "Não foi possível enviar. Verifique se a API está rodando.",
          );
        setFieldErrors(nextFieldErrors);
        setError(formError || (sentTo ? (nextFieldErrors.email ?? "") : ""));
      }
    } finally {
      setLoading(false);
    }
  }

  const blocked = loading || cooldown > 0;

  if (sentTo) {
    return (
      <AuthCard>
        <FocusPanel>
          <div className="flex flex-col items-center gap-2 text-center">
            <PanelBadge tone="teal">
              <Mail size={20} strokeWidth={2} aria-hidden="true" />
            </PanelBadge>
            <h1 className="text-base font-semibold text-brand-teal">
              Verifique seu e-mail
            </h1>
          </div>

          <p className="text-center text-sm font-medium text-brand-teal">
            Enviamos um link de recuperação para{" "}
            <strong className="break-all">{sentTo}</strong>. Se não encontrar,
            confira também a pasta de spam.
          </p>

          <p className="text-center text-xs text-brand-teal/80">
            O link tem validade limitada e só pode ser usado uma vez. Pedir um
            novo invalida o anterior.
          </p>

          <FormAlert align="center" className="w-full text-xs" variant="error">
            {error}
          </FormAlert>

          <Button
            type="button"
            onClick={() => requestLink(sentTo)}
            disabled={blocked}
            loading={loading}
            loadingLabel="Reenviando..."
            fullWidth
            className="py-3"
          >
            {cooldown > 0 ? `Reenviar em ${cooldown}s` : "Reenviar e-mail"}
          </Button>

          <div className="flex flex-col items-center gap-2 text-sm sm:flex-row sm:gap-3">
            <button
              type="button"
              onClick={() => {
                setSentTo("");
                setError("");
                setCooldown(0);
              }}
              className="font-medium text-brand-teal underline hover:text-brand-teal-hover cursor-pointer"
            >
              Usar outro e-mail
            </button>
            <span className="hidden text-brand-teal/50 sm:inline">|</span>
            <Link
              href="/login"
              className="font-medium text-brand-teal hover:underline"
            >
              Voltar para o login
            </Link>
          </div>
        </FocusPanel>
      </AuthCard>
    );
  }

  return (
    <AuthCard>
      <div className="text-center text-sm font-medium text-brand-teal">
        <h1 className="text-base font-semibold">Esqueci minha senha</h1>
        <p>
          Não se preocupe! Insira o e-mail associado à sua conta e enviaremos um
          link para você criar uma nova senha.
        </p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          void requestLink(email);
        }}
        className="flex w-full flex-col gap-4"
      >
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

        <FormAlert align="center" className="text-xs" variant="error">
          {error}
        </FormAlert>

        <Button
          type="submit"
          disabled={blocked}
          loading={loading}
          loadingLabel="Enviando..."
          fullWidth
          className="py-3"
        >
          {cooldown > 0
            ? `Tentar em ${cooldown}s`
            : "Enviar link de recuperação"}
        </Button>
      </form>

      <Link
        href="/login"
        className="text-sm font-medium text-brand-teal hover:underline"
      >
        Voltar para o login
      </Link>
    </AuthCard>
  );
}


