import { ArrowUp, ArrowDown } from 'lucide-react'

interface Props {
  label: string
  value: number
  delta: number
}

export default function StatCard({ label, value, delta }: Props) {
  const isUp = delta >= 0
  const DeltaIcon = isUp ? ArrowUp : ArrowDown
  const deltaClass = isUp ? 'stat-delta-up' : 'stat-delta-down'
  const sign = isUp ? '+' : ''

  return (
    <div className="stat-card">
      <span className="stat-card-label">{label}</span>
      <div className="stat-card-value-row">
        <span className="stat-card-value">{value.toLocaleString('es-AR')}</span>
        <span className={`stat-delta ${deltaClass}`}>
          <DeltaIcon size={12} />
          {sign}{delta.toLocaleString('es-AR')}
        </span>
      </div>
    </div>
  )
}
