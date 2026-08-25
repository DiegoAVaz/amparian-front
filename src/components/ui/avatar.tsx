"use client";

import { useState } from "react";

import { cn, tv } from "./variants";

const avatarStyles = tv({
  slots: {
    base: "flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-teal-600 to-cyan-500 font-bold text-white",
    image: "h-full w-full object-cover",
  },
  variants: {
    size: {
      sm: { base: "h-20 w-20 text-2xl" },
      md: { base: "h-36 w-36 text-3xl" },
      lg: { base: "h-40 w-40 text-4xl" },
    },
  },
  defaultVariants: { size: "md" },
});

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "AM";
  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export type AvatarProps = {
  name: string;
  src?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
};

export function Avatar({ name, src, size, className }: AvatarProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const { base, image } = avatarStyles({ size });

  const shownSrc = src && failedSrc !== src ? src : null;

  return (
    <div className={cn(base(), className)} aria-hidden>
      {shownSrc === null ? (
        getInitials(name)
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={shownSrc}
          alt=""
          className={image()}
          onError={() => setFailedSrc(shownSrc)}
        />
      )}
    </div>
  );
}

