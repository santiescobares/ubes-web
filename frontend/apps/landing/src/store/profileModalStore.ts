import { create } from 'zustand'

interface ProfileModalState {
  activeModal: 'profile' | 'delete' | null
  openProfile: () => void
  openDelete: () => void
  close: () => void
}

const useProfileModalStore = create<ProfileModalState>((set) => ({
  activeModal: null,
  openProfile: () => set({ activeModal: 'profile' }),
  openDelete: () => set({ activeModal: 'delete' }),
  close: () => set({ activeModal: null }),
}))

export default useProfileModalStore
