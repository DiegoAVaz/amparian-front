"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { clearAuthCookie } from "@/lib/auth";
import {
  AgendaNavIcon,
  BellIcon,
  EventsNavIcon,
  HelpNavIcon,
  HomeNavIcon,
  LogoutNavIcon,
  PerfisNavIcon,
  SettingsNavIcon,
  ShieldIcon,
  UserIcon,
} from "./dashboard-shell-icons";

export type DashboardNavId =
  | "home"
  | "events"
  | "agenda"
  | "settings"
  | "help"
  | "profiles"
  /** Nenhum item ativo (ex.: página genérica) */
  | "none";

type Props = {
  activeNav: DashboardNavId;
  children: React.ReactNode;
};

export function DashboardShell({ activeNav, children }: Props) {
  const router = useRouter();

  function handleLogout() {
    clearAuthCookie();
    router.push("/login");
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#f0f8fa]">
      <header className="flex items-center justify-between bg-brand-teal px-6 py-3">
        <div className="flex items-center gap-2">
          <ShieldIcon variant="white" size={28} />
          <span className="text-lg font-bold text-white">Amparian</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-white">Olá, Bianca!</span>
          <Link
            href="/home/perfis"
            className="text-white/90 hover:text-white"
            aria-label="Meu perfil"
          >
            <UserIcon />
          </Link>
          <button type="button" className="text-white/80 hover:text-white" aria-label="Notificações">
            <BellIcon />
          </button>
        </div>
      </header>

      <div className="flex flex-1">
        <aside className="flex w-56 flex-shrink-0 flex-col border-r border-gray-100 bg-white shadow-sm">
          <nav className="flex flex-1 flex-col gap-0.5 p-3 pt-5">
            <SidebarLink
              href="/home"
              icon={<HomeNavIcon />}
              label="Home"
              active={activeNav === "home"}
            />
            <SidebarLink
              href="/home/meus-eventos"
              icon={<EventsNavIcon />}
              label="Meus eventos"
              active={activeNav === "events"}
            />
            <SidebarLink
              href="/home/agenda"
              icon={<AgendaNavIcon />}
              label="Agenda"
              active={activeNav === "agenda"}
            />
            <SidebarLink
              href="/home/configuracoes"
              icon={<SettingsNavIcon />}
              label="Configurações"
              active={activeNav === "settings"}
            />
            <SidebarLink
              href="/home/perfis"
              icon={<PerfisNavIcon />}
              label="Perfis"
              active={activeNav === "profiles"}
            />
          </nav>
          <div className="flex flex-col gap-0.5 border-t border-gray-100 p-3">
            <SidebarLink
              href="/home/ajuda"
              icon={<HelpNavIcon />}
              label="Ajuda"
              active={activeNav === "help"}
            />
            <SidebarItem
              icon={<LogoutNavIcon />}
              label="Sair da conta"
              danger
              onClick={handleLogout}
            />
          </div>
        </aside>

        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-auto">{children}</div>
      </div>
    </div>
  );
}

function SidebarLink({
  href,
  icon,
  label,
  active,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={[
        "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors",
        active ? "bg-brand-teal text-white shadow-sm" : "text-gray-600 hover:bg-gray-100",
      ].join(" ")}
    >
      {icon}
      {label}
    </Link>
  );
}

function SidebarItem({
  icon,
  label,
  active,
  danger,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  danger?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors",
        active
          ? "bg-brand-teal/10 text-brand-teal"
          : danger
            ? "text-red-500 hover:bg-red-50"
            : "text-gray-600 hover:bg-gray-100",
      ].join(" ")}
    >
      {icon}
      {label}
    </button>
  );
}
