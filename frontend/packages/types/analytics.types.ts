import type { EventType } from './enums'
import type { LocationDTO } from './event.types'
import type { PostDTO } from './post.types'
import type { SuggestionDTO } from './suggestion.types'

export interface CountDeltaDTO {
  current: number
  delta: number
}

export interface DashboardCountsDTO {
  users: CountDeltaDTO
  activePunishments: CountDeltaDTO
  suggestions: CountDeltaDTO
}

export interface UpcomingItemDTO {
  kind: 'EVENT' | 'COMPETITION'
  id: string
  type: EventType
  name: string
  location: LocationDTO | null
  startingDate: string
  endingDate: string
  active: boolean
}

export interface DashboardDataDTO {
  counts: DashboardCountsDTO
  lastPost: PostDTO | null
  upcomingItems: UpcomingItemDTO[]
  latestSuggestions: SuggestionDTO[]
}
