import type { TextareaHTMLAttributes } from "react";

import { cn, tv, type VariantProps } from "./variants";

const textareaStyles = tv({
  base: [
    "w-full rounded-lg border bg-white text-gray-700 outline-none transition-colors",
    "placeholder:text-gray-400",
    "focus:border-brand-teal focus:ring-1 focus:ring-brand-teal",
    "disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500 disabled:opacity-80",
  ],
  variants: {
    size: {
      sm: "px-3 py-2 text-xs",
      md: "px-3 py-2.5 text-sm",
      lg: "px-4 py-3 text-base",
    },
    variant: {
      default: "border-gray-200",
      translucent: "border-transparent bg-white/80 focus:bg-white",
    },
    invalid: {
      true: "border-red-300 focus:border-red-500 focus:ring-red-500",
    },
    resize: {
      none: "resize-none",
      vertical: "resize-y",
      both: "resize",
    },
  },
  defaultVariants: {
    size: "md",
    variant: "default",
    invalid: false,
    resize: "vertical",
  },
});

type TextareaVariants = VariantProps<typeof textareaStyles>;

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> &
  TextareaVariants & {
    error?: boolean | string;
  };

export function Textarea({
  className,
  error,
  resize,
  size,
  variant,
  ...props
}: TextareaProps) {
  const invalid = Boolean(error);

  return (
    <textarea
      className={cn(textareaStyles({ invalid, resize, size, variant }), className)}
      aria-invalid={invalid || undefined}
      {...props}
    />
  );
}
