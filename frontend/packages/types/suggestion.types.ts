import type { UserSnapshotDTO } from './user.types'

export interface SuggestionDTO {
  id: string
  createdAt: string
  updatedAt: string
  createdBy: UserSnapshotDTO
  content: string
  totalVotes: number
  votesInFavor: number
}

export interface SuggestionCreateDTO {
  content: string
}
