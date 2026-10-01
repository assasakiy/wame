import {
  Activity, BarChart3, Bot, Code2, CreditCard, KeyRound, LayoutDashboard, Megaphone, MessageSquare, Receipt, ScrollText,
  Settings, ShieldCheck, Smartphone, Users, Wallet, Webhook, Zap, type LucideIcon,
} from "lucide-react";
import type { IconName } from "@/shared/config/navigation";

export const NAV_ICONS: Record<IconName, LucideIcon> = {
  dashboard: LayoutDashboard,
  devices: Smartphone,
  messages: MessageSquare,
  contacts: Users,
  broadcast: Megaphone,
  automation: Zap,
  api: Code2,
  webhook: Webhook,
  ai: Bot,
  analytics: BarChart3,
  subscription: CreditCard,
  billing: Receipt,
  settings: Settings,
  users: Users,
  roles: KeyRound,
  revenue: Wallet,
  system: Activity,
  logs: ScrollText,
};

export const AdminIcon = ShieldCheck;
