import api from '@/lib/axios'
import type { SuggestionDTO, SuggestionCreateDTO, SuggestionsByDateDTO, PageResponse } from '@ubes/types'

export async function listSuggestionsByDate(
  params: { page?: number; size?: number } = {},
): Promise<PageResponse<SuggestionsByDateDTO>> {
  const { data } = await api.get<PageResponse<SuggestionsByDateDTO>>('/suggestions/by-date', {
    params: { page: params.page ?? 0, size: params.size ?? 4 },
  })
  return data
}

export async function createSuggestion(dto: SuggestionCreateDTO): Promise<SuggestionDTO> {
  const { data } = await api.post<SuggestionDTO>('/suggestions', dto)
  return data
}

export async function voteSuggestion(id: number, inFavor: boolean): Promise<void> {
  await api.post(`/suggestions/${id}/vote`, null, { params: { inFavor } })
}

export async function hideSuggestion(id: number): Promise<void> {
  await api.patch(`/suggestions/${id}/hide`)
}

export async function unhideSuggestion(id: number): Promise<void> {
  await api.patch(`/suggestions/${id}/unhide`)
}
