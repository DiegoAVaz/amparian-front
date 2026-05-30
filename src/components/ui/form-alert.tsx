import type { HTMLAttributes, ReactNode } from "react";

import { cn, tv, type VariantProps } from "./variants";

const formAlertStyles = tv({
  base: "rounded-lg px-3 py-2 text-sm font-medium",
  variants: {
    variant: {
      error: "bg-red-50 text-red-600",
      success: "bg-green-50 text-green-700",
      warning: "bg-amber-50 text-amber-800",
      info: "bg-sky-50 text-sky-800",
    },
    align: {
      left: "text-left",
      center: "text-center",
    },
  },
  defaultVariants: {
    variant: "error",
    align: "left",
  },
});

export type FormAlertProps = HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof formAlertStyles> & {
    children?: ReactNode;
  };

export function FormAlert({
  align,
  children,
  className,
  variant,
  ...props
}: FormAlertProps) {
  if (!children) return null;

  return (
    <div
      className={cn(formAlertStyles({ align, variant }), className)}
      role={variant === "error" ? "alert" : "status"}
      {...props}
    >
      {children}
    </div>
  );
}
