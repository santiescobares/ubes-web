import type { UserSnapshotDTO } from './user.types'

export interface SuggestionDTO {
  id: number
  createdAt: string
  updatedAt: string
  createdBy: UserSnapshotDTO | null
  content: string
  anonymized: boolean
  totalVotes: number
  votesInFavor: number
  userVote: boolean | null
  hidden: boolean
}

export interface SuggestionCreateDTO {
  content: string
  anonymized: boolean
}

export interface SuggestionsByDateDTO {
  date: string
  suggestions: SuggestionDTO[]
}
