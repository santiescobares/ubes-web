import api from '@/lib/axios'
import type { CompetitionCreateDTO, CompetitionDTO, CompetitionUpdateDTO } from '@ubes/types'
import type { Page } from '@/lib/types'

export interface CompetitionListParams {
  id?: number
  name?: string
  page?: number
  size?: number
  sort?: string
  direction?: 'asc' | 'desc'
}

function buildCompetitionFormData(
  dto: CompetitionCreateDTO | CompetitionUpdateDTO,
  bannerFile?: File | null,
  regulationFile?: File | null,
): FormData {
  const form = new FormData()
  form.append('body', new Blob([JSON.stringify(dto)], { type: 'application/json' }))
  if (bannerFile) form.append('bannerFile', bannerFile)
  if (regulationFile) form.append('regulationDocumentFile', regulationFile)
  return form
}

export class CompetitionService {
  static async list(params: CompetitionListParams = {}): Promise<Page<CompetitionDTO>> {
    const { sort, direction, ...rest } = params
    const queryParams: Record<string, unknown> = { ...rest }
    if (sort) queryParams.sort = direction ? `${sort},${direction.toUpperCase()}` : sort
    const { data } = await api.get<Page<CompetitionDTO>>('/competitions', { params: queryParams })
    return data
  }

  static async get(id: string | number): Promise<CompetitionDTO> {
    const { data } = await api.get<CompetitionDTO>(`/competitions/${id}`)
    return data
  }

  static async create(
    dto: CompetitionCreateDTO,
    bannerFile?: File | null,
    regulationFile?: File | null,
  ): Promise<CompetitionDTO> {
    const formData = buildCompetitionFormData(dto, bannerFile, regulationFile)
    const { data } = await api.post<CompetitionDTO>('/competitions', formData)
    return data
  }

  static async update(
    id: string | number,
    dto: CompetitionUpdateDTO,
    bannerFile?: File | null,
    removeBanner?: boolean,
    regulationFile?: File | null,
    removeRegulationDocument?: boolean,
  ): Promise<CompetitionDTO> {
    const body: CompetitionUpdateDTO & { removeBanner?: boolean; removeRegulationDocument?: boolean } = { ...dto }
    if (removeBanner) body.removeBanner = true
    if (removeRegulationDocument) body.removeRegulationDocument = true
    const formData = buildCompetitionFormData(body, bannerFile, regulationFile)
    const { data } = await api.put<CompetitionDTO>(`/competitions/${id}`, formData)
    return data
  }

  static async openRegistration(id: string | number): Promise<CompetitionDTO> {
    const { data } = await api.patch<CompetitionDTO>(`/competitions/${id}/open-registration`)
    return data
  }

  static async closeRegistration(id: string | number, cancel: boolean): Promise<CompetitionDTO> {
    const { data } = await api.patch<CompetitionDTO>(`/competitions/${id}/close-registration`, null, {
      params: { cancel },
    })
    return data
  }

  static async start(id: string | number): Promise<CompetitionDTO> {
    const { data } = await api.patch<CompetitionDTO>(`/competitions/${id}/start`)
    return data
  }

  static async end(id: string | number): Promise<CompetitionDTO> {
    const { data } = await api.patch<CompetitionDTO>(`/competitions/${id}/end`)
    return data
  }

  static async cancel(id: string | number): Promise<CompetitionDTO> {
    const { data } = await api.patch<CompetitionDTO>(`/competitions/${id}/cancel`)
    return data
  }
}

export default CompetitionService
