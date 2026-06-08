"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect } from "react";
import { BarChart3, Building2, CreditCard, FileClock, Flag, Headphones, LayoutDashboard, LogOut, Percent, Receipt, Settings, Shield, Sparkles, Users } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";
import { useTranslation } from "@/hooks/useTranslation";

const labels = {
  en: {
    title: "Super Admin",
    subtitle: "Platform control center",
    logout: "Logout",
    access: "Checking super admin access...",
    nav: [
      ["Overview", "/admin"],
      ["Organizations", "/admin/organizations"],
      ["Users", "/admin/users"],
      ["Subscriptions", "/admin/subscriptions"],
      ["Payments", "/admin/payments"],
      ["Plans", "/admin/plans"],
      ["Coupons", "/admin/coupons"],
      ["Revenue", "/admin/revenue"],
      ["AI Monitoring", "/admin/ai-monitoring"],
      ["Features", "/admin/features"],
      ["Support", "/admin/support"],
      ["White Label", "/admin/white-label"],
      ["Platform", "/admin/platform"],
      ["Audit Logs", "/admin/audit-logs"],
      ["Settings", "/admin/settings"],
    ],
  },
  ar: {
    title: "إدارة المنصة",
    subtitle: "مركز التحكم التشغيلي",
    logout: "تسجيل الخروج",
    access: "جار التحقق من صلاحية مدير المنصة...",
    nav: [
      ["نظرة عامة", "/admin"],
      ["المؤسسات", "/admin/organizations"],
      ["المستخدمون", "/admin/users"],
      ["الاشتراكات", "/admin/subscriptions"],
      ["المدفوعات", "/admin/payments"],
      ["الخطط", "/admin/plans"],
      ["الكوبونات", "/admin/coupons"],
      ["الإيرادات", "/admin/revenue"],
      ["مراقبة الذكاء الاصطناعي", "/admin/ai-monitoring"],
      ["المميزات", "/admin/features"],
      ["الدعم", "/admin/support"],
      ["العلامة البيضاء", "/admin/white-label"],
      ["المنصة", "/admin/platform"],
      ["سجل التدقيق", "/admin/audit-logs"],
      ["الإعدادات", "/admin/settings"],
    ],
  },
};

const icons = [LayoutDashboard, Building2, Users, CreditCard, Receipt, Shield, Percent, BarChart3, Sparkles, Flag, Headphones, Shield, BarChart3, FileClock, Settings];

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, token, isAuthenticated, hasHydrated, logout } = useAuthStore();
  const { locale, isRTL } = useTranslation();
  const copy = labels[locale];

  useEffect(() => {
    if (!hasHydrated) return;
    if (!isAuthenticated || !token) {
      router.replace("/login");
      return;
    }
    if (user?.platformRole !== "SUPER_ADMIN") {
      router.replace("/dashboard");
    }
  }, [hasHydrated, isAuthenticated, token, user?.platformRole, router]);

  if (!hasHydrated || !isAuthenticated || user?.platformRole !== "SUPER_ADMIN") {
    return (
      <div className="min-h-screen bg-brand-primary flex items-center justify-center text-sm text-foreground/50">
        {copy.access}
      </div>
    );
  }

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="min-h-screen bg-brand-primary text-foreground flex">
      <aside className={`hidden lg:flex w-72 shrink-0 flex-col border-brand-border bg-brand-surface ${isRTL ? "border-l" : "border-r"}`}>
        <div className="p-6 border-b border-brand-border">
          <Link href="/admin" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-brand-accent text-brand-primary flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold tracking-tight">{copy.title}</p>
              <p className="text-xs text-foreground/40">{copy.subtitle}</p>
            </div>
          </Link>
        </div>
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {copy.nav.map(([label, href], index) => {
            const Icon = icons[index];
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                  active ? "bg-brand-accent/10 text-brand-accent" : "text-foreground/60 hover:bg-brand-border/30 hover:text-foreground"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      <main className="flex-1 min-w-0">
        <header className="h-16 border-b border-brand-border bg-brand-primary/80 backdrop-blur flex items-center justify-between px-4 md:px-8 sticky top-0 z-20">
          <div>
            <p className="text-xs uppercase tracking-widest text-brand-accent font-bold">{copy.title}</p>
            <p className="text-sm text-foreground/50 truncate">{user?.email}</p>
          </div>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <button
              onClick={() => {
                logout();
                router.push("/login");
              }}
              className="p-2 rounded-lg border border-brand-border text-foreground/60 hover:text-red-400 hover:border-red-500/40 transition-colors"
              aria-label={copy.logout}
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>
        <div className="p-4 md:p-8 max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
