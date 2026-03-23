import Link from "next/link";
import type { ComponentProps } from "react";

type PrimaryLinkProps = ComponentProps<typeof Link>;

export function PrimaryLink({ className, ...props }: PrimaryLinkProps) {
  return (
    <Link
      className={[
        "inline-flex w-full max-w-xs items-center justify-center rounded-md bg-brand-teal px-6 py-3 text-base font-medium text-white transition-colors sm:w-auto sm:min-w-[200px] sm:max-w-none sm:px-8",
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
