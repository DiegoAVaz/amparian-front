import type { InputHTMLAttributes, ReactNode } from "react";

import { FieldError } from "./field-error";
import { cn } from "./variants";

export type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  error?: ReactNode;
  helperText?: ReactNode;
  label?: ReactNode;
};

export function Checkbox({
  className,
  error,
  helperText,
  label,
  ...props
}: CheckboxProps) {
  const invalid = Boolean(error);

  return (
    <label className="flex items-start gap-2 text-sm leading-snug text-gray-600">
      <input
        className={cn(
          "mt-0.5 h-4 w-4 shrink-0 accent-brand-teal",
          "disabled:cursor-not-allowed disabled:opacity-60",
          className,
        )}
        type="checkbox"
        aria-invalid={invalid || undefined}
        {...props}
      />
      <span className="min-w-0">
        {label}
        {helperText && !error ? (
          <span className="mt-1 block text-xs text-gray-500">{helperText}</span>
        ) : null}
        <FieldError className="mt-1">{error}</FieldError>
      </span>
    </label>
  );
}
