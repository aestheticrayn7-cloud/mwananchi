import { create } from 'zustand'
import { User, Shop, SyncStatus } from './types'

interface AuthStore {
  user: User | null
  shop: Shop | null
  token: string | null
  setUser: (user: User | null) => void
  setShop: (shop: Shop | null) => void
  setToken: (token: string | null) => void
  logout: () => void
}

interface SyncStore {
  status: SyncStatus
  setSyncing: (isSyncing: boolean) => void
  setLastSyncTime: (time: number) => void
  setPendingItems: (count: number) => void
  setError: (error: string | undefined) => void
}

interface UIStore {
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  toggleSidebar: () => void
  currentPage: string
  setCurrentPage: (page: string) => void
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  shop: null,
  token: null,
  setUser: (user) => set({ user }),
  setShop: (shop) => set({ shop }),
  setToken: (token) => set({ token }),
  logout: () => set({ user: null, shop: null, token: null }),
}))

export const useSyncStore = create<SyncStore>((set) => ({
  status: {
    isSyncing: false,
    pendingItems: 0,
  },
  setSyncing: (isSyncing) => set((state) => ({
    status: { ...state.status, isSyncing },
  })),
  setLastSyncTime: (time) => set((state) => ({
    status: { ...state.status, lastSyncTime: time },
  })),
  setPendingItems: (count) => set((state) => ({
    status: { ...state.status, pendingItems: count },
  })),
  setError: (error) => set((state) => ({
    status: { ...state.status, error },
  })),
}))

export const useUIStore = create<UIStore>((set) => ({
  sidebarOpen: true,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  currentPage: 'dashboard',
  setCurrentPage: (page) => set({ currentPage: page }),
}))
