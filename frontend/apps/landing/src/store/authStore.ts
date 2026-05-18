import { create } from 'zustand'
import api from '@/lib/axios'
import type { UserDTO } from '@ubes/types'
import type { LoginResponseDTO } from '@ubes/types'
import { getCurrentUser } from '@/services/userService'

interface AuthState {
  user: UserDTO | null
  isAuthenticated: boolean
  isLoading: boolean
  isInitialized: boolean
  login: (googleIdToken: string) => Promise<LoginResponseDTO>
  logout: () => Promise<void>
  setUser: (user: UserDTO | null) => void
  updateUser: (partial: Partial<UserDTO>) => void
  initialize: () => Promise<void>
}

const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false,

  login: async (googleIdToken: string) => {
    set({ isLoading: true })
    try {
      const { data } = await api.post<LoginResponseDTO>('/auth/login', { googleIdToken })
      if (data.user) {
        set({ user: data.user, isAuthenticated: true })
      }
      return data
    } finally {
      set({ isLoading: false })
    }
  },

  logout: async () => {
    set({ isLoading: true })
    try {
      await api.post('/auth/logout')
      set({ user: null, isAuthenticated: false })
    } finally {
      set({ isLoading: false })
    }
  },

  setUser: (user) => set({ user, isAuthenticated: !!user }),

  updateUser: (partial) =>
    set((state) => state.user ? { user: { ...state.user, ...partial } } : state),

  initialize: async () => {
    try {
      const user = await getCurrentUser()
      set({ user, isAuthenticated: true })
    } catch {
      set({ user: null, isAuthenticated: false })
    } finally {
      set({ isInitialized: true })
    }
  },
}))

export default useAuthStore
