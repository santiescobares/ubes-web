import api from '@/lib/axios'
import type { EventCreateDTO, EventDTO, EventUpdateDTO } from '@ubes/types'

export interface EventListParams {
  id?: number
  name?: string
  from?: string
  to?: string
}

function buildEventFormData(
  dto: EventCreateDTO | EventUpdateDTO,
  bannerFile?: File | null,
): FormData {
  const form = new FormData()
  form.append('body', new Blob([JSON.stringify(dto)], { type: 'application/json' }))
  if (bannerFile) form.append('bannerFile', bannerFile)
  return form
}

export class EventService {
  static async list(params: EventListParams = {}): Promise<EventDTO[]> {
    const { data } = await api.get<EventDTO[]>('/events', { params })
    return data
  }

  static async create(dto: EventCreateDTO, bannerFile?: File | null): Promise<EventDTO> {
    const formData = buildEventFormData(dto, bannerFile)
    const { data } = await api.post<EventDTO>('/events', formData)
    return data
  }

  static async update(
    id: string | number,
    dto: EventUpdateDTO,
    bannerFile?: File | null,
    removeBanner?: boolean,
  ): Promise<EventDTO> {
    const formData = buildEventFormData(dto, bannerFile)
    const params = removeBanner ? { removeBanner: true } : {}
    const { data } = await api.put<EventDTO>(`/events/${id}`, formData, { params })
    return data
  }

  static async remove(id: string | number): Promise<void> {
    await api.delete(`/events/${id}`)
  }
}

export default EventService
