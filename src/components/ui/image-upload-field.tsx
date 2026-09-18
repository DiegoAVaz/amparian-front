"use client";

import { useEffect, useId, useRef, useState } from "react";

import { Button } from "./button";
import { FormField } from "./form-field";
import { cn } from "./variants";

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
const ACCEPT_ATTRIBUTE = ACCEPTED_TYPES.join(",");

export const DEFAULT_MAX_BYTES = 4_000_000;

export function formatSizeLimit(maxBytes: number): string {
  if (maxBytes < 1_000) return `${maxBytes} bytes`;
  if (maxBytes < 1_000_000) return `${Math.floor(maxBytes / 1_000)} KB`;
  return `${(maxBytes / 1_000_000).toFixed(1).replace(".", ",")} MB`;
}

export type ImageUploadFieldProps = {
  label: string;
  currentUrl?: string | null;
  onSelect: (file: File | null) => void;
  onRemove?: () => void;
  maxBytes?: number;

  error?: string;
  helperText?: string;
  disabled?: boolean;
  required?: boolean;
  /**
   * `inline` — miniatura quadrada à esquerda, controles ao lado. Serve para
   * foto de perfil, que é redonda e pequena na tela.
   *
   * `stacked` — prévia larga em cima, controles embaixo. Serve para capa de
   * evento, que é exibida deitada: a prévia com a mesma proporção do resultado
   * evita a surpresa de escolher uma imagem que fica cortada no card.
   */
  layout?: "inline" | "stacked";
  className?: string;
};

export function ImageUploadField({
  label,
  currentUrl,
  onSelect,
  onRemove,
  maxBytes = DEFAULT_MAX_BYTES,
  error,
  helperText,
  disabled,
  required,
  layout = "inline",
  className,
}: ImageUploadFieldProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [localError, setLocalError] = useState("");

  useEffect(() => {
    if (!previewUrl) return;
    return () => URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  const normalizedUrl = currentUrl ?? null;
  const [syncedUrl, setSyncedUrl] = useState(normalizedUrl);

  const echoOfOwnSelection = previewUrl !== null && syncedUrl === null;

  if (normalizedUrl !== syncedUrl) {
    setSyncedUrl(normalizedUrl);
    if (!echoOfOwnSelection) {
      setPreviewUrl(null);
      setLocalError("");
    }
  }

  useEffect(() => {
    if (previewUrl) return;
    if (inputRef.current) inputRef.current.value = "";
  }, [syncedUrl, previewUrl]);

  useEffect(() => {
    if (error && inputRef.current) inputRef.current.value = "";
  }, [error]);

  function clearInput() {
    if (inputRef.current) inputRef.current.value = "";
  }

  function handleChange(file: File | null) {
    setLocalError("");
    setPreviewUrl(null);

    if (!file) {
      onSelect(null);
      return;
    }

    if (
      !ACCEPTED_TYPES.includes(file.type as (typeof ACCEPTED_TYPES)[number])
    ) {
      setLocalError("Formato não aceito. Envie uma imagem JPEG, PNG ou WebP");
      clearInput();
      onSelect(null);
      return;
    }

    if (file.size > maxBytes) {
      setLocalError(`A imagem deve ter no máximo ${formatSizeLimit(maxBytes)}`);
      clearInput();
      onSelect(null);
      return;
    }

    setPreviewUrl(URL.createObjectURL(file));
    onSelect(file);
  }

  const shownUrl = previewUrl ?? normalizedUrl;
  const shownError = localError || error || "";
  const canRemove = Boolean(onRemove) && Boolean(normalizedUrl) && !previewUrl;

  return (
    <FormField
      className={className}
      label={label}
      htmlFor={inputId}
      helperText={helperText}
      error={shownError}
      required={required}
    >
      <div
        className={cn(
          "flex gap-4",
          layout === "stacked" ? "flex-col items-stretch" : "items-center",
        )}
      >
        <div
          className={cn(
            "flex shrink-0 items-center justify-center overflow-hidden border border-dashed border-gray-300 bg-gray-50",
            layout === "stacked"
              ? "aspect-[16/9] w-full rounded-lg"
              : "h-20 w-20 rounded-lg",
            shownError && "border-red-400",
          )}
          aria-hidden
        >
          {shownUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={shownUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="px-1 text-center text-[10px] text-gray-400">
              Sem imagem
            </span>
          )}
        </div>

        <div
          className={cn(
            "flex min-w-0 gap-2",
            layout === "stacked"
              ? "flex-col items-stretch sm:flex-row sm:items-center"
              : "flex-col items-start",
          )}
        >
          <input
            ref={inputRef}
            id={inputId}
            type="file"
            accept={ACCEPT_ATTRIBUTE}
            disabled={disabled}
            aria-invalid={Boolean(shownError) || undefined}
            onChange={(event) => handleChange(event.target.files?.[0] ?? null)}
            className="block w-full text-sm text-gray-600 file:mr-3 file:cursor-pointer file:rounded-md file:border-0 file:bg-brand-teal file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-white hover:file:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          />

          {previewUrl ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={disabled}
              onClick={() => {
                clearInput();
                handleChange(null);
              }}
            >
              Desfazer escolha
            </Button>
          ) : null}

          {canRemove ? (
            <Button
              type="button"
              variant="danger"
              size="sm"
              disabled={disabled}
              onClick={() => {
                clearInput();
                onRemove?.();
              }}
            >
              Remover imagem
            </Button>
          ) : null}
        </div>
      </div>
    </FormField>
  );
}
