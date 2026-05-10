import { create } from 'zustand'
import type { UserDTO } from '@ubes/types'
import { Role } from '@ubes/types'
import { AuthService } from '@/services/auth.service'
import { isAxiosError } from 'axios'
import { getErrorMessage } from '@/lib/errorDictionary'

function resolveLoginError(err: unknown): string {
  if (err instanceof Error && !isAxiosError(err)) return err.message
  if (isAxiosError(err)) return getErrorMessage(err.response?.data?.errorCode)
  return getErrorMessage()
}

const STORAGE_KEY = 'ubes_user'
const REJECTED_ROLES: Role[] = [Role.USER, Role.DELEGATE]

function saveUser(user: UserDTO) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
}

function loadUser(): UserDTO | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as UserDTO) : null
  } catch {
    return null
  }
}

function clearUser() {
  localStorage.removeItem(STORAGE_KEY)
}

interface AuthState {
  user: UserDTO | null
  isAuthenticated: boolean
  isLoading: boolean
  setUser: (user: UserDTO | null) => void
  login: (googleIdToken: string) => Promise<void>
  logout: () => Promise<void>
  initialize: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  setUser: (user) => set({ user, isAuthenticated: !!user }),

  initialize: () => {
    const user = loadUser()
    set({ user, isAuthenticated: !!user, isLoading: false })
  },

  login: async (googleIdToken: string) => {
    set({ isLoading: true })
    try {
      const data = await AuthService.login(googleIdToken)

      if (!data.user) {
        throw new Error('Tu cuenta no está registrada en el sistema UBES.')
      }

      if (REJECTED_ROLES.includes(data.user.role)) {
        await AuthService.logout().catch(() => {})
        throw new Error('Tu cuenta no tiene permiso para acceder al panel.')
      }

      saveUser(data.user)
      set({ user: data.user, isAuthenticated: true })
    } catch (err) {
      set({ isLoading: false })
      throw new Error(resolveLoginError(err))
    }
    set({ isLoading: false })
  },

  logout: async () => {
    set({ isLoading: true })
    try {
      await AuthService.logout()
    } finally {
      clearUser()
      set({ user: null, isAuthenticated: false, isLoading: false })
      window.location.href = '/login'
    }
  },
}))
