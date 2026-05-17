import api from '@/lib/axios'
import type { EventDTO } from '@ubes/types'

export async function listEvents(params: { from?: string; to?: string } = {}): Promise<EventDTO[]> {
  const { data } = await api.get<EventDTO[]>('/events', { params })
  return data
}
