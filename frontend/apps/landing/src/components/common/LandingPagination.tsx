import { ChevronLeft, ChevronRight } from 'lucide-react'

interface LandingPaginationProps {
  current: number
  total: number
  onChange: (page: number) => void
}

export default function LandingPagination({ current, total, onChange }: LandingPaginationProps) {
  if (total <= 1) return null
  return (
    <div className="landing-pagination-bar">
      <button
        className="landing-pagination-btn"
        onClick={() => onChange(current - 1)}
        disabled={current <= 1}
        aria-label="Página anterior"
      >
        <ChevronLeft size={14} strokeWidth={2.5} />
      </button>
      <span className="landing-pagination-label">
        {current} <span className="landing-pagination-sep">/</span> {total}
      </span>
      <button
        className="landing-pagination-btn"
        onClick={() => onChange(current + 1)}
        disabled={current >= total}
        aria-label="Página siguiente"
      >
        <ChevronRight size={14} strokeWidth={2.5} />
      </button>
    </div>
  )
}
