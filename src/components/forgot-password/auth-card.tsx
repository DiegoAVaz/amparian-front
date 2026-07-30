"use client";

import Image from "next/image";
import { useEffect, useRef, type ReactNode } from "react";

import forgotPassPt1 from "@/assets/forgotPassPt1.jpg";
import { BrandShield } from "@/components/ui";

/** Shared frame for the recovery screens: photo, dark scrim and glass card. */
export function AuthCard({ children }: { children: ReactNode }) {
  return (
    <section className="relative flex min-h-[100dvh] items-center justify-center px-4 py-8 sm:px-6 sm:py-10">
      <div className="absolute inset-0">
        <Image
          src={forgotPassPt1}
          alt=""
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-black/40" />
      </div>

      <div className="relative flex w-full max-w-lg flex-col items-center gap-6 rounded-2xl bg-white/30 px-5 py-8 backdrop-blur-sm sm:px-10 sm:py-10">
        <div className="flex items-center gap-3">
          <BrandShield />
          <span className="text-2xl font-bold text-brand-teal">Amparian</span>
        </div>

        {children}
      </div>
    </section>
  );
}

export function FocusPanel({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ref.current?.focus();
  }, []);

  return (
    <div
      ref={ref}
      tabIndex={-1}
      className="flex w-full flex-col items-center gap-6 outline-none"
    >
      {children}
    </div>
  );
}
