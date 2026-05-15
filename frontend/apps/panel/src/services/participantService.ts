import api from '@/lib/axios'
import type { ParticipantCreateDTO, ParticipantDTO, ParticipantUpdateDTO } from '@ubes/types'
import type { Page } from '@/lib/types'

export interface ParticipantListParams {
  page?: number
  size?: number
  sort?: string
  direction?: 'asc' | 'desc'
  search?: string
  id?: number
  role?: string
}

function buildParticipantFormData(
  dto: ParticipantCreateDTO | ParticipantUpdateDTO,
  studentFile?: File | null,
  medicalFile?: File | null,
): FormData {
  const form = new FormData()
  form.append('body', new Blob([JSON.stringify(dto)], { type: 'application/json' }))
  if (studentFile) form.append('studentCertificateFile', studentFile)
  if (medicalFile) form.append('medicalCertificateFile', medicalFile)
  return form
}

export class ParticipantService {
  static async list(
    competitionId: string | number,
    params: ParticipantListParams = {},
  ): Promise<Page<ParticipantDTO>> {
    const { sort, direction, ...rest } = params
    const queryParams: Record<string, unknown> = { ...rest }
    if (sort) queryParams.sort = direction ? `${sort},${direction.toUpperCase()}` : sort
    const { data } = await api.get<Page<ParticipantDTO>>(
      `/competitions/${competitionId}/participants`,
      { params: queryParams },
    )
    return data
  }

  static async create(
    competitionId: string | number,
    dto: ParticipantCreateDTO,
    studentFile?: File | null,
    medicalFile?: File | null,
  ): Promise<ParticipantDTO> {
    const formData = buildParticipantFormData(dto, studentFile, medicalFile)
    const { data } = await api.post<ParticipantDTO>(
      `/competitions/${competitionId}/participants`,
      formData,
    )
    return data
  }

  static async update(
    competitionId: string | number,
    participantId: string | number,
    dto: ParticipantUpdateDTO,
    studentFile?: File | null,
    medicalFile?: File | null,
  ): Promise<ParticipantDTO> {
    const formData = buildParticipantFormData(dto, studentFile, medicalFile)
    const { data } = await api.put<ParticipantDTO>(
      `/competitions/${competitionId}/participants/${participantId}`,
      formData,
    )
    return data
  }

  static async remove(
    competitionId: string | number,
    participantId: string | number,
  ): Promise<void> {
    await api.delete(`/competitions/${competitionId}/participants/${participantId}`)
  }
}

export default ParticipantService
