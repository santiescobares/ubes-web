import { EventType } from '@ubes/types'

export const EVENT_TYPE_META: Record<EventType, { label: string; badgeClass: string; fallbackBg: string }> = {
  COMPETITION:    { label: 'Competencia', badgeClass: 'event-badge-competition', fallbackBg: '#60A5FA' },
  SPECIAL:        { label: 'Especial',    badgeClass: 'event-badge-special',     fallbackBg: '#CA8A04' },
  PARTY:          { label: 'Fiesta',      badgeClass: 'event-badge-party',       fallbackBg: '#9333EA' },
  NATIONAL_EVENT: { label: 'Efeméride',   badgeClass: 'event-badge-national',    fallbackBg: '#0891B2' },
  OTHER:          { label: 'Otro',        badgeClass: 'event-badge-other',       fallbackBg: '#374151' },
}
