import Link from "next/link";
import type { ComponentProps } from "react";

type PrimaryLinkProps = ComponentProps<typeof Link>;

export function PrimaryLink({ className, ...props }: PrimaryLinkProps) {
  return (
    <Link
      className={[
        "inline-flex min-w-[200px] items-center justify-center rounded-md bg-brand-teal px-8 py-3 text-base font-medium text-white transition-colors",
        "hover:bg-brand-teal-hover",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-teal",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    />
  );
}
