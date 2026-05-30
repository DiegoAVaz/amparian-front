"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useSyncExternalStore } from "react";

import { Button, IconButton } from "@/components/ui";
import { getStoredUser, logoutAndClear } from "@/lib/auth";
import {
  AgendaNavIcon,
  BellIcon,
  CloseIcon,
  EventsNavIcon,
  HelpNavIcon,
  HomeNavIcon,
  LogoutNavIcon,
  MenuIcon,
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
  | "none";

type Props = {
  activeNav: DashboardNavId;
  children: React.ReactNode;
};

export function DashboardShell({ activeNav, children }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const userName = useSyncExternalStore(
    subscribeToSession,
    () => getStoredUser()?.name ?? null,
    () => null,
  );

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setMobileNavOpen(false);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [pathname]);

  useEffect(() => {
    if (!mobileNavOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileNavOpen]);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    function onChange() {
      if (mq.matches) setMobileNavOpen(false);
    }
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  function closeMobileNav() {
    setMobileNavOpen(false);
  }

  async function handleLogout() {
    closeMobileNav();
    await logoutAndClear();
    router.replace("/login");
  }

  return (
    <div className="flex min-h-[100dvh] flex-col bg-[#f0f8fa]">
      <header className="flex shrink-0 items-center justify-between gap-3 bg-brand-teal px-4 py-3 sm:px-6">
        <div className="flex min-w-0 items-center gap-2">
          <IconButton
            type="button"
            className="shrink-0 text-white hover:bg-white/10 hover:text-white lg:hidden"
            aria-expanded={mobileNavOpen}
            aria-controls="dashboard-sidebar"
            icon={mobileNavOpen ? <CloseIcon /> : <MenuIcon />}
            label={mobileNavOpen ? "Fechar menu" : "Abrir menu"}
            onClick={() => setMobileNavOpen((o) => !o)}
            size="sm"
            variant="ghost"
          />
          <div className="flex min-w-0 items-center gap-2">
            <ShieldIcon variant="white" size={28} />
            <span className="truncate text-base font-bold text-white sm:text-lg">Amparian</span>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <span className="hidden text-sm font-medium text-white sm:inline">
            {userName ? `Olá, ${userName.split(" ")[0]}!` : "Olá!"}
          </span>
          <Link
            href="/home/perfis"
            className="text-white/90 hover:text-white"
            aria-label="Meu perfil"
            onClick={closeMobileNav}
          >
            <UserIcon />
          </Link>
          <IconButton
            type="button"
            className="text-white/80 hover:bg-white/10 hover:text-white"
            icon={<BellIcon />}
            label="Notificações"
            size="sm"
            variant="ghost"
          />
        </div>
      </header>

      <div className="relative flex min-h-0 flex-1">
        {mobileNavOpen && (
          <button
            type="button"
            className="fixed inset-0 z-30 bg-black/40 lg:hidden"
            aria-label="Fechar menu"
            onClick={closeMobileNav}
          />
        )}

        <aside
          id="dashboard-sidebar"
          className={[
            "fixed inset-y-0 left-0 z-40 flex w-[min(18rem,88vw)] flex-col border-r border-gray-100 bg-white shadow-lg transition-transform duration-200 ease-out lg:static lg:z-auto lg:w-56 lg:translate-x-0 lg:shadow-sm",
            mobileNavOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          ].join(" ")}
        >
          <div className="flex items-center justify-between border-b border-gray-100 px-3 py-3 lg:hidden">
            <span className="text-sm font-semibold text-brand-teal">Menu</span>
            <IconButton
              type="button"
              icon={<CloseIcon />}
              label="Fechar menu"
              onClick={closeMobileNav}
              size="sm"
              variant="ghost"
            />
          </div>

          <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-3 pt-4 lg:pt-5">
            <SidebarLink
              href="/home"
              icon={<HomeNavIcon />}
              label="Home"
              active={activeNav === "home"}
              onNavigate={closeMobileNav}
            />
            <SidebarLink
              href="/home/meus-eventos"
              icon={<EventsNavIcon />}
              label="Meus eventos"
              active={activeNav === "events"}
              onNavigate={closeMobileNav}
            />
            <SidebarLink
              href="/home/agenda"
              icon={<AgendaNavIcon />}
              label="Agenda"
              active={activeNav === "agenda"}
              onNavigate={closeMobileNav}
            />
            <SidebarLink
              href="/home/configuracoes"
              icon={<SettingsNavIcon />}
              label="Configurações"
              active={activeNav === "settings"}
              onNavigate={closeMobileNav}
            />
            <SidebarLink
              href="/home/perfis"
              icon={<PerfisNavIcon />}
              label="Perfis"
              active={activeNav === "profiles"}
              onNavigate={closeMobileNav}
            />
          </nav>
          <div className="flex flex-col gap-0.5 border-t border-gray-100 p-3">
            <SidebarLink
              href="/home/ajuda"
              icon={<HelpNavIcon />}
              label="Ajuda"
              active={activeNav === "help"}
              onNavigate={closeMobileNav}
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

function subscribeToSession(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  return () => window.removeEventListener("storage", onStoreChange);
}

function SidebarLink({
  href,
  icon,
  label,
  active,
  onNavigate,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onNavigate?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={[
        "flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors active:bg-gray-50",
        active ? "bg-brand-teal text-white shadow-sm" : "text-gray-600 hover:bg-gray-100",
      ].join(" ")}
    >
      {icon}
      <span className="truncate">{label}</span>
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
    <Button
      type="button"
      onClick={onClick}
      className={[
        "w-full justify-start px-3 py-2.5 text-left",
        active
          ? "bg-brand-teal/10 text-brand-teal hover:bg-brand-teal/10"
          : danger
            ? "text-red-500 hover:bg-red-50"
            : "text-gray-600 hover:bg-gray-100",
      ].join(" ")}
      leftIcon={icon}
      variant="ghost"
    >
      <span className="truncate">{label}</span>
    </Button>
  );
}
