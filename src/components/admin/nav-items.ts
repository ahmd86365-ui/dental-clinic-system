import {
  Activity,
  BarChart3,
  Bell,
  CalendarClock,
  LayoutDashboard,
  Receipt,
  Settings,
  Stethoscope,
  Users,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import type { Permission } from "@/lib/auth/permissions";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  permission?: Permission;
};

export const NAV_ITEMS: NavItem[] = [
  { label: "لوحة التحكم", href: "/admin", icon: LayoutDashboard },
  {
    label: "المواعيد",
    href: "/admin/appointments",
    icon: CalendarClock,
    permission: "viewAppointments",
  },
  {
    label: "المرضى",
    href: "/admin/patients",
    icon: Users,
    permission: "viewPatients",
  },
  {
    label: "الفواتير",
    href: "/admin/billing",
    icon: Receipt,
    permission: "viewBilling",
  },
  {
    label: "التقارير",
    href: "/admin/reports",
    icon: BarChart3,
    permission: "viewReports",
  },
  {
    label: "الموظفون",
    href: "/admin/staff",
    icon: UsersRound,
    permission: "manageStaff",
  },
  {
    label: "الأطباء",
    href: "/admin/doctors",
    icon: Stethoscope,
    permission: "manageStaff",
  },
  {
    label: "الإشعارات",
    href: "/admin/notifications",
    icon: Bell,
  },
  {
    label: "سجل النشاط",
    href: "/admin/activity",
    icon: Activity,
    permission: "viewActivityLog",
  },
  {
    label: "إعدادات العيادة",
    href: "/admin/settings/clinic",
    icon: Settings,
    permission: "viewClinicSettings",
  },
];
