import Link from "next/link";
import type { ComponentProps } from "react";

type MutedUnderlineLinkProps = ComponentProps<typeof Link>;

export function MutedUnderlineLink({ className, ...props }: MutedUnderlineLinkProps) {
  return (
    <Link
      className={[
        "text-sm text-brand-teal underline underline-offset-4 transition-opacity hover:opacity-80",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    />
  );
}
