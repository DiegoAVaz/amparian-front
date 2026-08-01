"use client";

import { CircleAlert } from "lucide-react";
import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";

import {
  Button,
  FormAlert,
  FormField,
  LinkButton,
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

type ResetPasswordField = "password" | "confirm";

const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_MAX_LENGTH = 72;
const PASSWORD_RULE =
  "Mínimo de 8 caracteres, com letra maiúscula, minúscula, número e caractere especial.";

function violatesPasswordRule(value: string): boolean {
  return (
    value.length < PASSWORD_MIN_LENGTH ||
    value.length > PASSWORD_MAX_LENGTH ||
    !/[A-Z]/.test(value) ||
    !/[a-z]/.test(value) ||
    !/\d/.test(value) ||
    !/[^\w\s]/.test(value)
  );
}

function subscribeToLocation(onStoreChange: () => void) {
  window.addEventListener("popstate", onStoreChange);
  return () => window.removeEventListener("popstate", onStoreChange);
}

function getClientSearch() {
  return window.location.search;
}

export function ResetPasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<
    ApiFieldErrors<ResetPasswordField>
  >({});
  const [loading, setLoading] = useState(false);
  const [tokenRejected, setTokenRejected] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);

  const ruleError =
    passwordTouched && password.length > 0 && violatesPasswordRule(password)
      ? PASSWORD_RULE
      : undefined;

  const search = useSyncExternalStore(
    subscribeToLocation,
    getClientSearch,
    () => null,
  );
  const token =
    search === null
      ? null
      : (new URLSearchParams(search).get("token") ?? "").trim();

  const linkIsDead = token === "" || tokenRejected;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setFieldErrors({});

    if (violatesPasswordRule(password)) {
      setPasswordTouched(true);
      return;
    }
    if (password !== confirm) {
      setFieldErrors({ confirm: "As senhas não coincidem." });
      return;
    }
    if (!token) {
      setError(
        "Link inválido ou expirado. Solicite um novo e-mail de recuperação.",
      );
      return;
    }

    setLoading(true);
    try {
      await apiJson("/auth/reset-password", {
        method: "POST",
        json: { token, newPassword: password },
        auth: false,
      });
      router.push("/login?reason=password-reset");
    } catch (err) {
      if (err instanceof ApiError && err.hasCode("INVALID_RESET_TOKEN")) {
        setTokenRejected(true);
        setLoading(false);
        return;
      }

      const { fieldErrors: nextFieldErrors, formError } =
        getApiFormError<ResetPasswordField>(
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

  if (linkIsDead) {
    return (
      <AuthCard>
        <FocusPanel>
          <div className="flex flex-col items-center gap-2 text-center">
            <PanelBadge tone="danger">
              <CircleAlert size={20} strokeWidth={2} aria-hidden="true" />
            </PanelBadge>
            <h1 className="text-base font-semibold text-brand-teal">
              {tokenRejected ? "Link expirado" : "Link inválido"}
            </h1>
          </div>

          <p className="text-center text-sm font-medium text-brand-teal">
            {tokenRejected
              ? "Este link já foi usado ou passou da validade. Peça um novo e use-o em seguida."
              : "Este endereço não traz um token de redefinição. O link pode ter sido copiado pela metade, ou já foi substituído por um mais recente."}
          </p>

          <LinkButton href="/esqueci-minha-senha" fullWidth className="py-3">
            Pedir um novo link
          </LinkButton>

          <Link
            href="/login"
            className="text-sm font-medium text-brand-teal hover:underline"
          >
            Voltar para o login
          </Link>
        </FocusPanel>
      </AuthCard>
    );
  }

  return (
    <AuthCard>
      <div className="text-center text-sm font-medium text-brand-teal">
        <h1 className="text-base font-semibold">Criar nova senha</h1>
        <p>Escolha uma senha forte que você não tenha usado antes.</p>
      </div>

      <form onSubmit={handleSubmit} className="flex w-full flex-col gap-4">
        <FormField error={fieldErrors.password ?? ruleError}>
          <TextInput
            type="password"
            placeholder="Digite nova senha"
            autoComplete="new-password"
            required
            minLength={PASSWORD_MIN_LENGTH}
            maxLength={PASSWORD_MAX_LENGTH}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setFieldErrors((current) => ({
                ...current,
                password: undefined,
              }));
            }}
            onBlur={() => setPasswordTouched(true)}
            error={fieldErrors.password ?? ruleError}
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
            minLength={PASSWORD_MIN_LENGTH}
            maxLength={PASSWORD_MAX_LENGTH}
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

      <Link
        href="/login"
        className="text-sm font-medium text-brand-teal hover:underline"
      >
        Voltar para o login
      </Link>
    </AuthCard>
  );
}
