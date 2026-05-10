import type { EventType } from './enums'

export interface LocationDTO {
  name: string
  latitude: number | null
  longitude: number | null
}

export interface EventDTO {
  id: string
  createdAt: string
  updatedAt: string
  type: EventType
  name: string
  description: string
  startingDate: string
  endingDate: string | null
  location: LocationDTO
  bannerURL: string | null
}

export interface EventCreateDTO {
  type: EventType
  name: string
  description: string
  startingDate: string
  endingDate?: string
  location: LocationDTO
}

export interface EventUpdateDTO {
  type?: EventType
  name?: string
  description?: string
  startingDate?: string
  endingDate?: string
  location?: LocationDTO
}
