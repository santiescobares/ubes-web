import type { UserDTO } from './user.types'

export interface LoginRequestDTO {
  googleIdToken: string
}

export interface LoginResponseDTO {
  registrationToken: string | null
  user: UserDTO | null
}
