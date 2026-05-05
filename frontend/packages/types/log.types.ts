import type { Action, ResourceType } from './enums'

export interface LogDTO {
  id: string
  createdAt: string
  resourceType: ResourceType
  resourceId: string
  action: Action
  details: string | null
}
