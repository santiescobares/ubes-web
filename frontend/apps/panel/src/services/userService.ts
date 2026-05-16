import api from '@/lib/axios'
import type { UserDTO, UserUpdateDTO } from '@ubes/types'
import type { Page } from '@/lib/types'

export interface UserListParams {
  id?: string
  firstName?: string
  lastName?: string
  email?: string
  googleId?: string
  page?: number
  size?: number
  sort?: string
}

export class UserService {
  static async list(params: UserListParams = {}): Promise<Page<UserDTO>> {
    const { data } = await api.get<Page<UserDTO>>('/users/all', { params })
    return data
  }

  static async update(id: string, dto: UserUpdateDTO): Promise<UserDTO> {
    const { data } = await api.put<UserDTO>(`/users/${id}`, dto)
    return data
  }

  static async deletePicture(id: string): Promise<{ pictureURL: string | null }> {
    const form = new FormData()
    const { data } = await api.patch<{ pictureURL: string | null }>(`/users/${id}/picture`, form)
    return data
  }
}

export default UserService
