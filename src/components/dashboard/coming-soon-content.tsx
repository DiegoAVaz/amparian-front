"use client";

import { DashboardShell } from "./dashboard-shell";

export function ComingSoonContent() {
  return (
    <DashboardShell activeNav="none">
      <main className="flex min-h-[50vh] flex-1 flex-col items-center justify-center gap-3 px-4 py-12 text-center sm:p-10">
        <p className="text-base font-semibold text-brand-teal">Em breve</p>
        <p className="max-w-md text-sm leading-relaxed text-gray-600">
          Esta área ainda está em desenvolvimento. Volte em breve para novidades.
        </p>
      </main>
    </DashboardShell>
  );
}
