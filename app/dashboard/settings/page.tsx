"use client";

import { Building2, Trash2, UserPlus } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { useAuthStore } from "@/store/authStore";
import { apiFetch } from "@/lib/api";
import { useEffect, useState } from "react";
import { BillingSettings } from "@/components/dashboard/BillingSettings";

export default function SettingsPage() {
  const { t } = useTranslation();
  const { token, currentOrg, setOrg } = useAuthStore();
  const [orgForm, setOrgForm] = useState({ name: "", logoUrl: "", brandingColor: "" });
  const [members, setMembers] = useState<any[]>([]);
  const [memberForm, setMemberForm] = useState({ email: "", fullName: "", role: "VIEWER" });
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");

  const canManage = currentOrg?.role === "OWNER" || currentOrg?.role === "ADMIN";

  const loadMembers = async () => {
    if (!token || !currentOrg) return;
    const data = await apiFetch<any[]>(`/organizations/${currentOrg.id}/members`, {}, token);
    setMembers(data);
  };

  useEffect(() => {
    setOrgForm({
      name: currentOrg?.name || "",
      logoUrl: currentOrg?.logoUrl || "",
      brandingColor: currentOrg?.brandingColor || "",
    });
    loadMembers().catch((err) => setError(err.message || t.dashboard.settings.loadError));
  }, [token, currentOrg?.id]);

  const updateOrg = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!token || !currentOrg) return;
    setError("");
    setStatus("");
    try {
      const updated = await apiFetch<any>(`/organizations/${currentOrg.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          name: orgForm.name,
          logoUrl: orgForm.logoUrl || undefined,
          brandingColor: orgForm.brandingColor || undefined,
        }),
      }, token);
      setOrg({ ...currentOrg, ...updated });
      setStatus(t.dashboard.settings.agencySaved);
    } catch (err: any) {
      setError(err.message || t.dashboard.settings.saveError);
    }
  };

  const addMember = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!token || !currentOrg) return;
    setError("");
    setStatus("");
    try {
      await apiFetch(`/organizations/${currentOrg.id}/members`, {
        method: "POST",
        body: JSON.stringify(memberForm),
      }, token);
      setStatus(`${memberForm.email} ${t.dashboard.settings.memberAdded}`);
      setMemberForm({ email: "", fullName: "", role: "VIEWER" });
      await loadMembers();
    } catch (err: any) {
      setError(err.message || t.dashboard.settings.addMemberError);
    }
  };

  const updateMemberRole = async (memberId: string, role: string) => {
    if (!token || !currentOrg) return;
    setError("");
    setStatus("");
    try {
      await apiFetch(`/organizations/${currentOrg.id}/members/${memberId}`, {
        method: "PATCH",
        body: JSON.stringify({ role }),
      }, token);
      setStatus(t.dashboard.settings.roleUpdated);
      await loadMembers();
    } catch (err: any) {
      setError(err.message || t.dashboard.settings.updateRoleError);
    }
  };

  const removeMember = async (memberId: string) => {
    if (!token || !currentOrg) return;
    setError("");
    setStatus("");
    try {
      await apiFetch(`/organizations/${currentOrg.id}/members/${memberId}`, { method: "DELETE" }, token);
      setStatus(t.dashboard.settings.memberRemoved);
      await loadMembers();
    } catch (err: any) {
      setError(err.message || t.dashboard.settings.removeMemberError);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t.nav.settings}</h1>
        <p className="text-foreground/40 text-sm mt-1">{t.dashboard.settings.subtitle}</p>
      </div>

      {error && <div className="p-3 rounded-lg border border-red-500/30 bg-red-500/10 text-sm text-red-300">{error}</div>}
      {status && <div className="p-3 rounded-lg border border-brand-border bg-brand-surface/40 text-sm text-foreground/60">{status}</div>}

      <form onSubmit={updateOrg} className="p-6 rounded-2xl border border-brand-border bg-brand-surface/30 glass space-y-4">
        <div className="flex items-center gap-3">
          <Building2 className="w-5 h-5 text-brand-accent" />
          <h2 className="font-bold">{t.dashboard.settings.agencyProfile}</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input disabled={!canManage} value={orgForm.name} onChange={(e) => setOrgForm({ ...orgForm, name: e.target.value })} placeholder={t.dashboard.settings.agencyName} className="bg-brand-primary border border-brand-border rounded-lg p-3 text-sm disabled:opacity-50" />
          <input type="url" disabled={!canManage} value={orgForm.logoUrl} onChange={(e) => setOrgForm({ ...orgForm, logoUrl: e.target.value })} placeholder={t.dashboard.settings.logoUrl} className="bg-brand-primary border border-brand-border rounded-lg p-3 text-sm disabled:opacity-50" />
          <input disabled={!canManage} value={orgForm.brandingColor} onChange={(e) => setOrgForm({ ...orgForm, brandingColor: e.target.value })} placeholder={t.dashboard.settings.brandingColor} className="bg-brand-primary border border-brand-border rounded-lg p-3 text-sm disabled:opacity-50" />
        </div>
        {canManage && <button className="btn-premium px-4 py-2 text-sm">{t.dashboard.settings.saveAgency}</button>}
      </form>

      <div className="p-6 rounded-2xl border border-brand-border bg-brand-surface/30 glass space-y-4">
        <div className="flex items-center gap-3">
          <UserPlus className="w-5 h-5 text-brand-accent" />
          <h2 className="font-bold">{t.dashboard.settings.teamMembers}</h2>
        </div>

        {canManage && (
          <form onSubmit={addMember} className="grid grid-cols-1 md:grid-cols-[1fr_1fr_160px_auto] gap-3">
            <input type="email" value={memberForm.email} onChange={(e) => setMemberForm({ ...memberForm, email: e.target.value })} placeholder={t.dashboard.settings.teammateEmail} className="bg-brand-primary border border-brand-border rounded-lg p-3 text-sm" />
            <input required value={memberForm.fullName} onChange={(e) => setMemberForm({ ...memberForm, fullName: e.target.value })} placeholder={t.dashboard.settings.fullName} className="bg-brand-primary border border-brand-border rounded-lg p-3 text-sm" />
            <select value={memberForm.role} onChange={(e) => setMemberForm({ ...memberForm, role: e.target.value })} className="bg-brand-primary border border-brand-border rounded-lg p-3 text-sm">
              {["ADMIN", "MANAGER", "ANALYST", "VIEWER"].map((role) => <option key={role} value={role}>{role}</option>)}
            </select>
            <button disabled={!memberForm.email} className="px-4 py-2 rounded-lg bg-brand-border/40 font-bold text-sm disabled:opacity-50">{t.common.add}</button>
          </form>
        )}

        <div className="space-y-3">
          {members.map((member) => (
            <div key={member.id} className="flex items-center justify-between p-4 rounded-lg border border-brand-border bg-brand-primary/40">
              <div>
                <p className="text-sm font-bold">{member.user.fullName || member.user.email}</p>
                <p className="text-xs text-foreground/40">{member.user.email}</p>
              </div>
              <div className="flex items-center gap-2">
                <select
                  disabled={!canManage || member.role === "OWNER"}
                  value={member.role}
                  onChange={(e) => updateMemberRole(member.id, e.target.value)}
                  className="bg-brand-surface border border-brand-border rounded-lg p-2 text-xs disabled:opacity-50"
                >
                  {["OWNER", "ADMIN", "MANAGER", "ANALYST", "VIEWER"].map((role) => <option key={role} value={role}>{role}</option>)}
                </select>
                {canManage && member.role !== "OWNER" && (
                  <button onClick={() => removeMember(member.id)} className="p-2 text-foreground/30 hover:text-red-400">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <BillingSettings />
    </div>
  );
}
