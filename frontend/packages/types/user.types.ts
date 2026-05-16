import type { Role, School } from './enums'

export interface UserDTO {
  id: string
  createdAt: string
  updatedAt: string
  firstName: string
  lastName: string
  email: string
  role: Role
  school: School
  pictureURL: string | null
}

export interface UserSnapshotDTO {
  id: string
  firstName: string
  lastName: string
  email: string
  role: Role
  school: School
  pictureURL: string | null
}

export interface UserCreateDTO {
  firstName: string
  lastName: string
  email: string
  role: Role
  school: School
}

export interface UserUpdateDTO {
  firstName?: string
  lastName?: string
  school?: School
  role?: Role
}
