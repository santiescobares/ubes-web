import api from '@/lib/axios'
import type { LogDTO } from '@ubes/types'
import type { Page } from '@/lib/types'

export interface LogListParams {
  id?: number
  userId?: string
  resourceType?: string
  resourceId?: string
  action?: string
  from?: string
  to?: string
  page?: number
  size?: number
  sort?: string
}

export class LogService {
  static async list(params: LogListParams = {}): Promise<Page<LogDTO>> {
    const { data } = await api.get<Page<LogDTO>>('/logs', { params })
    return data
  }

  static async getById(id: number): Promise<LogDTO> {
    const { data } = await api.get<LogDTO>(`/logs/${id}`)
    return data
  }
}

export default LogService
