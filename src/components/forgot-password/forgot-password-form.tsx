"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

import forgotPassPt1 from "@/assets/forgotPassPt1.jpg";
import { Button, FormAlert, FormField, TextInput } from "@/components/ui";
import { apiJson, getApiFormError, type ApiFieldErrors } from "@/lib/api";

type ForgotPasswordField = "email";

export function ForgotPasswordForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<ApiFieldErrors<ForgotPasswordField>>({});
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setFieldErrors({});
    setLoading(true);
    try {
      await apiJson("/auth/forgot-password", {
        method: "POST",
        json: { email },
        auth: false,
      });
      router.push("/esqueci-minha-senha/redefinir");
    } catch (err) {
      const { fieldErrors: nextFieldErrors, formError } = getApiFormError<ForgotPasswordField>(
        err,
        "Não foi possível enviar. Verifique se a API está rodando.",
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

        <p className="text-center text-sm font-medium text-brand-teal">
          Não se preocupe! Insira o e-mail associado à sua conta e enviaremos um link para você
          criar uma nova senha.
        </p>

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

          <FormAlert align="center" className="text-xs" variant="error">
            {error}
          </FormAlert>

          <Button
            type="submit"
            disabled={loading}
            loading={loading}
            loadingLabel="Enviando..."
            fullWidth
            className="py-3"
          >
            Enviar link de recuperação
          </Button>
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
