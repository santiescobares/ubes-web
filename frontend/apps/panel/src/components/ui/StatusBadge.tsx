import type { CompetitionDTO } from '@ubes/types'
import { getDisplayStatus } from '@/lib/competitionStatus'

interface StatusBadgeProps {
  competition: CompetitionDTO
}

export default function StatusBadge({ competition }: StatusBadgeProps) {
  const { label, colorClass } = getDisplayStatus(competition)
  return (
    <span className={`competition-status-badge ${colorClass}`}>{label}</span>
  )
}
