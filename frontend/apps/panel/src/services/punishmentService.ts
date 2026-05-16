import api from '@/lib/axios'
import type { PunishmentCreateDTO, PunishmentDTO, PunishmentRemoveDTO } from '@ubes/types'
import type { Page } from '@/lib/types'

export class PunishmentService {
  static async listByTarget(targetId: string, page = 0, size = 3): Promise<Page<PunishmentDTO>> {
    const { data } = await api.get<Page<PunishmentDTO>>(`/punishments/by-target/${targetId}`, {
      params: { page, size },
    })
    return data
  }

  static async create(dto: PunishmentCreateDTO): Promise<PunishmentDTO> {
    const { data } = await api.post<PunishmentDTO>('/punishments', dto)
    return data
  }

  static async remove(id: number, dto: PunishmentRemoveDTO): Promise<PunishmentDTO> {
    const { data } = await api.delete<PunishmentDTO>(`/punishments/${id}`, { data: dto })
    return data
  }
}

export default PunishmentService
