"use client";

import { Bell, UserCircle } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";
import { apiFetch } from "@/lib/api";
import { useTranslation } from "@/hooks/useTranslation";
import { useEffect, useState } from "react";

export function TopBar() {
  const { currentOrg, user, token } = useAuthStore();
  const { t, isRTL } = useTranslation();
  const [notice, setNotice] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [open, setOpen] = useState(false);

  const unreadCount = notifications.filter((item) => !item.isRead).length;

  const loadNotifications = async () => {
    if (!token || !currentOrg) return;
    try {
      const data = await apiFetch<any[]>(`/notifications?organizationId=${currentOrg.id}`, {}, token);
      setNotifications(data);
      setNotice(null);
    } catch {
      setNotice(t.notifications.loadError);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, [token, currentOrg?.id]);

  const markRead = async (id: string) => {
    if (!token) return;
    await apiFetch(`/notifications/${id}/read`, { method: "PATCH" }, token);
    await loadNotifications();
  };

  return (
    <header className="h-16 border-b border-brand-border bg-brand-primary/80 backdrop-blur-md flex items-center justify-between px-4 md:px-8 shrink-0 relative z-20 gap-3">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-brand-border bg-brand-surface/50 min-w-0 max-w-[180px] md:max-w-none">
          <div className="w-5 h-5 bg-brand-accent rounded flex items-center justify-center text-[10px] text-brand-primary font-bold">
            {currentOrg?.name?.charAt(0) || "I"}
          </div>
          <span className="text-sm font-medium truncate">{currentOrg?.name || t.common.defaultOrganization}</span>
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-4 shrink-0">
        <LanguageSwitcher />
        <button
          onClick={() => setOpen((value) => !value)}
          className="block p-2 text-foreground/60 hover:text-foreground transition-colors relative"
          aria-label={t.nav.notifications}
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-5 h-5 px-1 rounded-full bg-brand-accent text-brand-primary text-[10px] font-bold flex items-center justify-center border-2 border-brand-primary">
              {unreadCount}
            </span>
          )}
        </button>

        <div className="hidden sm:block h-8 w-[1px] bg-brand-border mx-2" />

        <div className="flex items-center gap-3 cursor-pointer group">
          <div className={`hidden sm:block ${isRTL ? "text-left" : "text-right"}`}>
            <p className="text-sm font-medium group-hover:text-brand-accent transition-colors">
              {user?.fullName || user?.email}
            </p>
            <p className="text-[10px] text-foreground/40 uppercase tracking-widest font-bold">
              {currentOrg?.role || "OWNER"}
            </p>
          </div>
          <div className="w-9 h-9 rounded-full bg-brand-border/50 flex items-center justify-center overflow-hidden border border-brand-border group-hover:border-brand-accent transition-colors">
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt={t.common.avatar} className="w-full h-full object-cover" />
            ) : (
              <UserCircle className="w-6 h-6 text-foreground/40" />
            )}
          </div>
        </div>
      </div>
      {(open || notice) && (
        <div className={`absolute ${isRTL ? "left-8" : "right-8"} top-14 w-[min(360px,calc(100vw-2rem))] rounded-xl border border-brand-border bg-brand-surface p-3 text-xs text-foreground/70 shadow-2xl`}>
          {notice && (
            <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-red-300">
              {notice}
            </div>
          )}
          {!notice && notifications.length === 0 && (
            <div className="px-3 py-6 text-center text-foreground/40">{t.notifications.empty}</div>
          )}
          {!notice && notifications.slice(0, 8).map((item) => (
            <div key={item.id} className="rounded-lg border border-brand-border bg-brand-primary/40 p-3 mb-2 last:mb-0">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-bold text-foreground">{item.title}</p>
                  <p className="mt-1 text-foreground/50">{item.message}</p>
                  <p className="mt-2 text-[10px] text-foreground/30">{new Date(item.createdAt).toLocaleString()}</p>
                </div>
                {!item.isRead && <span className="rounded-full bg-brand-accent/10 px-2 py-0.5 text-[10px] text-brand-accent">{t.notifications.unread}</span>}
              </div>
              {!item.isRead && (
                <button onClick={() => markRead(item.id)} className="mt-3 text-[11px] font-bold text-brand-accent hover:underline">
                  {t.notifications.markRead}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </header>
  );
}
