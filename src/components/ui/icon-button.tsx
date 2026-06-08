import type { ButtonHTMLAttributes, ReactNode } from "react";

import { cn, type VariantProps } from "./variants";
import { buttonStyles } from "./button";

type IconButtonVariants = Omit<VariantProps<typeof buttonStyles>, "fullWidth" | "iconOnly">;

export type IconButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> &
  IconButtonVariants & {
    icon: ReactNode;
    loading?: boolean;
    label: string;
  };

export function IconButton({
  className,
  disabled,
  icon,
  label,
  loading = false,
  size,
  type = "button",
  variant = "ghost",
  ...props
}: IconButtonProps) {
  const styles = buttonStyles({
    fullWidth: false,
    iconOnly: true,
    loading,
    size,
    variant,
  });
  const isDisabled = disabled || loading;

  return (
    <button
      className={cn(styles.base(), className)}
      disabled={isDisabled}
      type={type}
      aria-busy={loading || undefined}
      aria-label={label}
      title={label}
      {...props}
    >
      {loading ? (
        <span className={styles.spinner()} aria-hidden />
      ) : (
        <span className={styles.icon()} aria-hidden>
          {icon}
        </span>
      )}
    </button>
  );
}
