import api from '@/lib/axios'
import type { LoginResponseDTO } from '@ubes/types'

export class AuthService {
  static async login(googleIdToken: string): Promise<LoginResponseDTO> {
    const { data } = await api.post<LoginResponseDTO>('/auth/login', { googleIdToken })
    return data
  }

  static async logout(): Promise<void> {
    await api.post('/auth/logout')
  }

}
