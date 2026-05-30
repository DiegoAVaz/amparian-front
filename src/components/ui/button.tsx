import type { ButtonHTMLAttributes, ReactNode } from "react";

import { cn, tv, type VariantProps } from "./variants";

export const buttonStyles = tv({
  slots: {
    base: [
      "inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors cursor-pointer",
      "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
      "disabled:pointer-events-none disabled:opacity-60",
    ],
    icon: "shrink-0",
    spinner:
      "shrink-0 animate-spin rounded-full border-2 border-current border-r-transparent",
  },
  variants: {
    variant: {
      primary: {
        base: "bg-brand-teal text-white hover:bg-brand-teal-hover focus-visible:outline-brand-teal",
      },
      secondary: {
        base: "border border-brand-teal/20 bg-white text-brand-teal hover:bg-brand-teal/10 focus-visible:outline-brand-teal",
      },
      success: {
        base: "bg-green-500 text-white hover:bg-green-600 focus-visible:outline-green-600",
      },
      danger: {
        base: "bg-red-600 text-white hover:bg-red-700 focus-visible:outline-red-600",
      },
      ghost: {
        base: "bg-transparent text-gray-600 hover:bg-gray-100 focus-visible:outline-gray-400",
      },
      outline: {
        base: "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 focus-visible:outline-brand-teal",
      },
      link: {
        base: "rounded-none bg-transparent p-0 text-brand-teal underline-offset-4 hover:underline focus-visible:outline-brand-teal disabled:opacity-60",
      },
    },
    size: {
      sm: {
        base: "min-h-9 px-3 py-2 text-xs",
        icon: "h-4 w-4",
        spinner: "h-4 w-4",
      },
      md: {
        base: "min-h-10 px-4 py-2.5 text-sm",
        icon: "h-5 w-5",
        spinner: "h-5 w-5",
      },
      lg: {
        base: "min-h-12 px-5 py-3 text-base",
        icon: "h-5 w-5",
        spinner: "h-5 w-5",
      },
    },
    fullWidth: {
      true: {
        base: "w-full",
      },
      false: {
        base: "w-auto",
      },
    },
    loading: {
      true: {
        base: "cursor-wait",
      },
    },
    iconOnly: {
      true: {
        base: "gap-0 p-0",
      },
    },
  },
  compoundVariants: [
    {
      variant: "link",
      class: "min-h-0 px-0 py-0",
    },
    {
      iconOnly: true,
      size: "sm",
      class: "h-9 w-9",
    },
    {
      iconOnly: true,
      size: "md",
      class: "h-10 w-10",
    },
    {
      iconOnly: true,
      size: "lg",
      class: "h-12 w-12",
    },
  ],
  defaultVariants: {
    variant: "primary",
    size: "md",
    fullWidth: false,
    loading: false,
    iconOnly: false,
  },
});

type ButtonVariants = Omit<VariantProps<typeof buttonStyles>, "iconOnly">;

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  ButtonVariants & {
    leftIcon?: ReactNode;
    rightIcon?: ReactNode;
    loading?: boolean;
    loadingLabel?: string;
  };

export function Button({
  children,
  className,
  disabled,
  leftIcon,
  loading = false,
  loadingLabel = "Carregando",
  rightIcon,
  size,
  fullWidth,
  type = "button",
  variant,
  ...props
}: ButtonProps) {
  const styles = buttonStyles({ fullWidth, loading, size, variant });
  const isDisabled = disabled || loading;

  return (
    <button
      className={cn(styles.base(), className)}
      disabled={isDisabled}
      type={type}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? (
        <span className={styles.spinner()} aria-hidden />
      ) : leftIcon ? (
        <span className={styles.icon()} aria-hidden>
          {leftIcon}
        </span>
      ) : null}
      <span>{loading ? loadingLabel : children}</span>
      {!loading && rightIcon ? (
        <span className={styles.icon()} aria-hidden>
          {rightIcon}
        </span>
      ) : null}
    </button>
  );
}

