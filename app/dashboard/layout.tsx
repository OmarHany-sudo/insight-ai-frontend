"use client";

import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { useAuthStore } from "@/store/authStore";
import { useTranslation } from "@/hooks/useTranslation";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, hasHydrated } = useAuthStore();
  const { isRTL } = useTranslation();
  const router = useRouter();

  useEffect(() => {
    if (hasHydrated && !isAuthenticated) router.push("/login");
  }, [hasHydrated, isAuthenticated, router]);

  if (!hasHydrated) {
    return (
      <div className="min-h-screen bg-brand-primary flex items-center justify-center text-foreground/50">
        <div className="h-8 w-8 rounded-full border-2 border-brand-accent/20 border-t-brand-accent animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className={`flex h-screen bg-brand-primary overflow-hidden selection:bg-brand-accent/30 ${isRTL ? "font-cairo" : ""}`}>
      <Sidebar />
      
      <div className="flex-1 flex flex-col relative overflow-hidden">
        {/* Background Ambient Glow */}
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-brand-accent/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[30%] h-[30%] bg-brand-accent/3 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-brand-accent/20 to-transparent animate-scan pointer-events-none" />
        
        <TopBar />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-8 relative scroll-smooth focus:outline-none">
          <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
