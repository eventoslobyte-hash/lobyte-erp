import {
  LayoutDashboard,
  Users,
  MonitorSmartphone,
  CalendarRange,
  ClipboardList,
  MessageSquareHeart,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Se muestra en la barra inferior de mobile (máximo 4-5 ítems recomendado). */
  mobilePrimary?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard, mobilePrimary: true },
  { href: "/alquileres", label: "Alquileres", icon: ClipboardList, mobilePrimary: true },
  { href: "/disponibilidad", label: "Disponibilidad", icon: CalendarRange, mobilePrimary: true },
  { href: "/clientes", label: "Clientes", icon: Users, mobilePrimary: true },
  { href: "/equipos", label: "Equipos", icon: MonitorSmartphone },
  { href: "/post-evento", label: "Post-Evento", icon: MessageSquareHeart },
];
