import type { UserDTO } from './user.types'
import type { School } from './enums'

export interface LoginRequestDTO {
  googleIdToken: string
}

export interface LoginResponseDTO {
  registrationToken: string | null
  user: UserDTO | null
}

export interface RegisterRequestDTO {
  firstName: string
  lastName: string
  school: School
  registrationToken: string
}

export interface RegistrationTokenPayload {
  firstName: string
  lastName: string
  email: string
  exp: number
}
