"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { useState } from "react";
import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

export default function LoginPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data: any = await apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      setAuth(data.user, data.accessToken, data.organizations, data.currentOrg);
      router.push(data.user?.platformRole === "SUPER_ADMIN" ? "/admin" : "/dashboard");
    } catch (err: any) {
      setError(err.message || t.auth.signInError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-primary flex flex-col items-center justify-center px-6 relative overflow-hidden">
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-brand-accent/5 blur-[120px] rounded-full pointer-events-none" />
      
      <Link href="/" className="absolute top-8 left-8 flex items-center gap-2 text-foreground/40 hover:text-brand-accent transition-colors">
        <ArrowLeft className="w-4 h-4" /> {t.common.backToHome}
      </Link>

      <div className="w-full max-w-md p-8 rounded-3xl border border-brand-border bg-brand-surface/30 glass animate-in fade-in zoom-in duration-500">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold tracking-tight">{t.auth.loginTitle}</h1>
          <p className="text-foreground/40 text-sm mt-2">{t.auth.loginSubtitle}</p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-foreground/40">{t.auth.email}</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t.auth.emailPlaceholder}
              className="w-full bg-brand-surface border border-brand-border rounded-xl py-3 px-4 focus:outline-none focus:ring-1 focus:ring-brand-accent transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-foreground/40">{t.auth.password}</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-brand-surface border border-brand-border rounded-xl py-3 px-4 focus:outline-none focus:ring-1 focus:ring-brand-accent transition-all"
            />
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button disabled={loading} className="w-full btn-premium py-4 flex items-center justify-center disabled:opacity-50">
            {loading ? t.auth.signingIn : t.auth.signIn}
          </button>
        </form>

        <p className="text-center mt-8 text-sm text-foreground/40">
          {t.auth.noAccount} <Link href="/register" className="text-brand-accent hover:underline">{t.auth.signUp}</Link>
        </p>
      </div>
    </div>
  );
}
