import { create } from 'zustand'
import api from '@/lib/axios'
import type { UserDTO, LoginResponseDTO } from '@ubes/types'

interface AuthState {
  user: UserDTO | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (googleIdToken: string) => Promise<LoginResponseDTO>
  logout: () => Promise<void>
  setUser: (user: UserDTO | null) => void
}

const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,

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
}))

export default useAuthStore
