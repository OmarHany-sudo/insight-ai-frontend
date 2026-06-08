import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  platformRole?: 'USER' | 'SUPER_ADMIN';
}

interface Organization {
  id: string;
  name: string;
  slug: string;
  role: 'OWNER' | 'ADMIN' | 'MANAGER' | 'ANALYST' | 'VIEWER';
  billingPlan?: 'FREE' | 'PRO' | 'PREMIUM' | 'AGENCY' | 'ENTERPRISE';
  logoUrl?: string;
  brandingColor?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  currentOrg: Organization | null;
  isAuthenticated: boolean;
  hasHydrated: boolean;
  
  setAuth: (user: User, token: string, organizations?: Organization[], currentOrg?: Organization | null) => void;
  setOrg: (org: Organization) => void;
  logout: () => void;
  setHasHydrated: (value: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      currentOrg: null,
      isAuthenticated: false,
      hasHydrated: false,

      setAuth: (user, token, organizations = [], currentOrg = null) => set({
        user,
        token,
        currentOrg: currentOrg || organizations[0] || null,
        isAuthenticated: true,
      }),
      setOrg: (currentOrg) => set({ currentOrg }),
      logout: () => set({ user: null, token: null, currentOrg: null, isAuthenticated: false }),
      setHasHydrated: (value) => set({ hasHydrated: value }),
    }),
    {
      name: 'insight-ai-auth',
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
