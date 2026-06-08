import type { InputHTMLAttributes, ReactNode } from "react";

import { cn, tv, type VariantProps } from "./variants";

const textInputStyles = tv({
  base: [
    "rounded-lg border bg-white text-gray-700 outline-none transition-colors",
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
    fullWidth: {
      true: "w-full",
      false: "w-auto",
    },
    hasLeftIcon: {
      true: "pl-10",
    },
    hasRightIcon: {
      true: "pr-10",
    },
  },
  defaultVariants: {
    size: "md",
    variant: "default",
    invalid: false,
    fullWidth: true,
    hasLeftIcon: false,
    hasRightIcon: false,
  },
});

type TextInputVariants = VariantProps<typeof textInputStyles>;

export type TextInputProps = InputHTMLAttributes<HTMLInputElement> &
  TextInputVariants & {
    error?: boolean | string;
    leftIcon?: ReactNode;
    rightIcon?: ReactNode;
    wrapperClassName?: string;
  };

export function TextInput({
  className,
  error,
  fullWidth,
  leftIcon,
  rightIcon,
  size,
  variant,
  wrapperClassName,
  ...props
}: TextInputProps) {
  const invalid = Boolean(error);
  const hasLeftIcon = Boolean(leftIcon);
  const hasRightIcon = Boolean(rightIcon);

  if (!hasLeftIcon && !hasRightIcon) {
    return (
      <input
        className={cn(
          textInputStyles({ fullWidth, invalid, size, variant }),
          className,
        )}
        aria-invalid={invalid || undefined}
        {...props}
      />
    );
  }

  return (
    <span className={cn("relative block", fullWidth !== false && "w-full", wrapperClassName)}>
      {leftIcon ? (
        <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-gray-400">
          {leftIcon}
        </span>
      ) : null}
      <input
        className={cn(
          textInputStyles({
            fullWidth,
            hasLeftIcon,
            hasRightIcon,
            invalid,
            size,
            variant,
          }),
          className,
        )}
        aria-invalid={invalid || undefined}
        {...props}
      />
      {rightIcon ? (
        <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-400">
          {rightIcon}
        </span>
      ) : null}
    </span>
  );
}
