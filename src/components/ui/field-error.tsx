import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "./variants";

export type FieldErrorProps = HTMLAttributes<HTMLParagraphElement> & {
  children?: ReactNode;
};

export function FieldError({ children, className, ...props }: FieldErrorProps) {
  if (!children) return null;

  return (
    <p
      className={cn("text-xs font-medium text-red-600", className)}
      role="alert"
      {...props}
    >
      {children}
    </p>
  );
}
