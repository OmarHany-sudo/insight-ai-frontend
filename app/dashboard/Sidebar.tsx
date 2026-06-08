"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, 
  BarChart3, 
  Target, 
  Zap, 
  Settings, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  FileText,
  FileSearch,
  CreditCard,
  SearchCheck,
  BadgeAlert
} from "lucide-react";
import { useDashboardStore } from "@/store/dashboardStore";
import { useAuthStore } from "@/store/authStore";
import { useTranslation } from "@/hooks/useTranslation";
import clsx from "clsx";

function cn(...classes: any[]) {
  return clsx(classes);
}

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { sidebarOpen, toggleSidebar } = useDashboardStore();
  const { logout } = useAuthStore();
  const { t, isRTL } = useTranslation();

  const NAV_ITEMS = [
    { label: t.nav.overview, icon: LayoutDashboard, href: "/dashboard" },
    { label: t.nav.analytics, icon: BarChart3, href: "/dashboard/analytics" },
    { label: t.nav.geoAudit, icon: SearchCheck, href: "/dashboard/geo-audit" },
    { label: t.nav.sro, icon: FileSearch, href: "/dashboard/sro" },
    { label: t.nav.whyNotRecommended, icon: BadgeAlert, href: "/dashboard/why-not-recommended" },
    { label: t.nav.prompts, icon: Target, href: "/dashboard/prompts" },
    { label: t.nav.competitors, icon: ShieldCheck, href: "/dashboard/competitors" },
    { label: t.nav.recommendations, icon: Zap, href: "/dashboard/recommendations" },
    { label: t.nav.reports, icon: FileText, href: "/dashboard/reports" },
    { label: t.billing.title, icon: CreditCard, href: "/dashboard/billing" },
  ];

  return (
    <aside 
      className={cn(
        "hidden md:flex h-screen bg-brand-surface border-r border-brand-border flex-col transition-all duration-300",
        sidebarOpen ? "w-64" : "w-20",
        isRTL ? "border-l border-r-0" : "border-r"
      )}
    >
      <div className="p-6 flex items-center justify-between">
        <Link href="/" className={cn("font-bold tracking-tighter flex items-center gap-2", !sidebarOpen && "justify-center w-full")}>
          <div className="w-8 h-8 bg-brand-accent rounded-lg flex items-center justify-center shrink-0">
            <div className="w-4 h-4 bg-brand-primary rounded-sm" />
          </div>
          {sidebarOpen && <span className="text-xl">Insight AI</span>}
        </Link>
      </div>

      <nav className="flex-1 px-4 space-y-1 mt-4">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive 
                  ? "bg-brand-accent/10 text-brand-accent" 
                  : "text-foreground/60 hover:text-foreground hover:bg-brand-border/30",
                !sidebarOpen && "justify-center"
              )}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              {sidebarOpen && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 space-y-1">
        <Link
          href="/dashboard/settings"
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-foreground/60 hover:text-foreground hover:bg-brand-border/30 transition-colors",
            !sidebarOpen && "justify-center"
          )}
        >
          <Settings className="w-5 h-5 shrink-0" />
          {sidebarOpen && <span>{t.nav.settings}</span>}
        </Link>
        
        <button
          onClick={() => {
            logout();
            router.push("/login");
          }}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-red-500/70 hover:text-red-500 hover:bg-red-500/10 transition-colors",
            !sidebarOpen && "justify-center"
          )}
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {sidebarOpen && <span>{t.common.logout}</span>}
        </button>

        <button 
          onClick={toggleSidebar}
          className="mt-4 w-full flex items-center justify-center p-2 rounded-lg bg-brand-border/20 hover:bg-brand-border/40 transition-colors"
        >
          {sidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>
      </div>
    </aside>
  );
}
