import api from '@/lib/axios'
import type { RegisterRequestDTO, UserDTO, UserUpdateDTO } from '@ubes/types'

export async function registerUser(dto: RegisterRequestDTO): Promise<UserDTO> {
  const { data } = await api.post<UserDTO>('/users', dto)
  return data
}

export async function getCurrentUser(): Promise<UserDTO> {
  const { data } = await api.get<UserDTO>('/users')
  return data
}

export async function updateCurrentUser(dto: UserUpdateDTO): Promise<UserDTO> {
  const { data } = await api.put<UserDTO>('/users', dto)
  return data
}

export async function updateProfilePicture(file: File): Promise<{ pictureURL: string | null }> {
  const form = new FormData()
  form.append('pictureFile', file)
  const { data } = await api.patch<{ pictureURL: string | null }>('/users/picture', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}

export async function deleteProfilePicture(): Promise<{ pictureURL: string | null }> {
  const { data } = await api.patch<{ pictureURL: string | null }>('/users/picture', new FormData(), {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}

export async function deleteCurrentUser(): Promise<void> {
  await api.delete('/users')
}
