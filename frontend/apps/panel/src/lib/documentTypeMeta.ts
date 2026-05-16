import { DocumentType } from '@ubes/types'

export const DOCUMENT_TYPE_META: Record<DocumentType, { label: string; badgeClass: string; fallbackBg: string }> = {
  STATUTE:     { label: 'Estatuto',    badgeClass: 'document-badge-statute',     fallbackBg: '#CA8A04' },
  REGULATION:  { label: 'Reglamento',  badgeClass: 'document-badge-regulation',  fallbackBg: '#60A5FA' },
  STATEMENT:   { label: 'Comunicado',  badgeClass: 'document-badge-statement',   fallbackBg: '#9333EA' },
  INFORMATIVE: { label: 'Informativo', badgeClass: 'document-badge-informative', fallbackBg: '#0891B2' },
  OTHER:       { label: 'Otro',        badgeClass: 'document-badge-other',       fallbackBg: '#374151' },
}
