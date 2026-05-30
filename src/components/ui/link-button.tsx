import Link from "next/link";
import type { ComponentProps, MouseEvent, ReactNode } from "react";

import { cn, type VariantProps } from "./variants";
import { buttonStyles } from "./button";

type LinkButtonVariants = Omit<VariantProps<typeof buttonStyles>, "iconOnly">;
type NextLinkProps = ComponentProps<typeof Link>;

export type LinkButtonProps = NextLinkProps &
  LinkButtonVariants & {
    disabled?: boolean;
    leftIcon?: ReactNode;
    loading?: boolean;
    loadingLabel?: string;
    rightIcon?: ReactNode;
  };

export function LinkButton({
  children,
  className,
  disabled = false,
  fullWidth,
  leftIcon,
  loading = false,
  loadingLabel = "Carregando",
  onClick,
  rightIcon,
  size,
  variant,
  ...props
}: LinkButtonProps) {
  const styles = buttonStyles({ fullWidth, loading, size, variant });
  const isDisabled = disabled || loading;

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    if (isDisabled) {
      event.preventDefault();
      return;
    }

    onClick?.(event);
  }

  return (
    <Link
      className={cn(styles.base(), isDisabled && "pointer-events-none opacity-60", className)}
      aria-busy={loading || undefined}
      aria-disabled={isDisabled || undefined}
      tabIndex={isDisabled ? -1 : props.tabIndex}
      onClick={handleClick}
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
    </Link>
  );
}
