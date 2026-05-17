import type { UserSnapshotDTO } from './user.types'
import type { Action, ResourceType } from './enums'

export interface LogDTO {
  id: number
  createdAt: string
  user: UserSnapshotDTO
  resourceType: ResourceType
  resourceId: string
  action: Action
  details: string | null
}
