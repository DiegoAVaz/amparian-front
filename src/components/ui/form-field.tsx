import type { HTMLAttributes, ReactNode } from "react";

import { FieldError } from "./field-error";
import { cn } from "./variants";

export type FormFieldProps = HTMLAttributes<HTMLDivElement> & {
  error?: ReactNode;
  helperText?: ReactNode;
  htmlFor?: string;
  label?: ReactNode;
  required?: boolean;
};

export function FormField({
  children,
  className,
  error,
  helperText,
  htmlFor,
  label,
  required,
  ...props
}: FormFieldProps) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)} {...props}>
      {label ? (
        <label className="text-xs font-medium text-gray-600" htmlFor={htmlFor}>
          {label}
          {required ? <span className="text-red-600"> *</span> : null}
        </label>
      ) : null}
      {children}
      {helperText && !error ? (
        <p className="text-xs text-gray-500">{helperText}</p>
      ) : null}
      <FieldError>{error}</FieldError>
    </div>
  );
}
