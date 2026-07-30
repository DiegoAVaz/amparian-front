import {
  Bell,
  Calendar,
  CircleHelp,
  Clock,
  House,
  LogOut,
  Menu,
  Settings,
  User,
  X,
} from "lucide-react";

const HEADER_ICON_SIZE = 20;
const NAV_ICON_SIZE = 16;

export function UserIcon() {
  return <User size={HEADER_ICON_SIZE} strokeWidth={2} aria-hidden="true" />;
}

export function BellIcon() {
  return <Bell size={HEADER_ICON_SIZE} strokeWidth={2} aria-hidden="true" />;
}

export function MenuIcon() {
  return <Menu size={HEADER_ICON_SIZE} strokeWidth={2} aria-hidden="true" />;
}

export function CloseIcon() {
  return <X size={HEADER_ICON_SIZE} strokeWidth={2} aria-hidden="true" />;
}

export function HomeNavIcon() {
  return <House size={NAV_ICON_SIZE} strokeWidth={2} aria-hidden="true" />;
}

export function EventsNavIcon() {
  return <Calendar size={NAV_ICON_SIZE} strokeWidth={2} aria-hidden="true" />;
}

export function AgendaNavIcon() {
  return <Clock size={NAV_ICON_SIZE} strokeWidth={2} aria-hidden="true" />;
}

export function PerfisNavIcon() {
  return <User size={NAV_ICON_SIZE} strokeWidth={2} aria-hidden="true" />;
}

export function SettingsNavIcon() {
  return <Settings size={NAV_ICON_SIZE} strokeWidth={2} aria-hidden="true" />;
}

export function HelpNavIcon() {
  return <CircleHelp size={NAV_ICON_SIZE} strokeWidth={2} aria-hidden="true" />;
}

export function LogoutNavIcon() {
  return <LogOut size={NAV_ICON_SIZE} strokeWidth={2} aria-hidden="true" />;
}
