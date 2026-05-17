import { Trophy, Star, PartyPopper, Flag, Info, type LucideIcon } from 'lucide-react'
import { EventType } from '@ubes/types'

export const EVENT_TYPE_META: Record<EventType, { label: string; color: string; textColor: string; dotColor: string; icon: LucideIcon }> = {
  [EventType.COMPETITION]:    { label: 'Competencia', color: '#BFDBFE', textColor: '#1D4ED8', dotColor: '#3B82F6', icon: Trophy },
  [EventType.SPECIAL]:        { label: 'Especial',    color: '#FEF9C3', textColor: '#92400E', dotColor: '#F59E0B', icon: Star },
  [EventType.PARTY]:          { label: 'Fiesta',      color: '#E9D5FF', textColor: '#7E22CE', dotColor: '#A855F7', icon: PartyPopper },
  [EventType.NATIONAL_EVENT]: { label: 'Efeméride',    color: '#CFFAFE', textColor: '#0E7490', dotColor: '#06B6D4', icon: Flag },
  [EventType.OTHER]:          { label: 'Otro',        color: '#F3F4F6', textColor: '#374151', dotColor: '#6B7280', icon: Info },
}
