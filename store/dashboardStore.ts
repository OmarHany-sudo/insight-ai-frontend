import { create } from 'zustand';

interface DashboardState {
  sidebarOpen: boolean;
  activeBrandId: string | null;
  timeRange: '7d' | '30d' | '90d' | 'all';
  
  toggleSidebar: () => void;
  setSidebar: (open: boolean) => void;
  setActiveBrand: (id: string | null) => void;
  setTimeRange: (range: '7d' | '30d' | '90d' | 'all') => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  sidebarOpen: true,
  activeBrandId: null,
  timeRange: '30d',

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebar: (open) => set({ sidebarOpen: open }),
  setActiveBrand: (activeBrandId) => set({ activeBrandId }),
  setTimeRange: (timeRange) => set({ timeRange }),
}));
