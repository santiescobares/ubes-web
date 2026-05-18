import { create } from 'zustand'
import type { RegistrationTokenPayload } from '@ubes/types'

interface AuthModalState {
  activeModal: 'login' | 'register' | null
  registrationToken: string | null
  registrationPayload: RegistrationTokenPayload | null
  openLogin: () => void
  openRegister: (token: string, payload: RegistrationTokenPayload) => void
  close: () => void
}

const useAuthModalStore = create<AuthModalState>((set) => ({
  activeModal: null,
  registrationToken: null,
  registrationPayload: null,

  openLogin: () => set({
    activeModal: 'login',
    registrationToken: null,
    registrationPayload: null,
  }),

  openRegister: (token, payload) => set({
    activeModal: 'register',
    registrationToken: token,
    registrationPayload: payload,
  }),

  close: () => set({
    activeModal: null,
    registrationToken: null,
    registrationPayload: null,
  }),
}))

export default useAuthModalStore
