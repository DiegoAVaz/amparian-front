"use client";

import { DashboardShell } from "./dashboard-shell";

export function ComingSoonContent() {
  return (
    <DashboardShell activeNav="none">
      <main className="flex flex-1 flex-col items-center justify-center gap-3 p-10 text-center">
        <p className="text-base font-semibold text-brand-teal">Em breve</p>
        <p className="max-w-md text-sm text-gray-600">
          Esta área ainda está em desenvolvimento. Volte em breve para novidades.
        </p>
      </main>
    </DashboardShell>
  );
}
