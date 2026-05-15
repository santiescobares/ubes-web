import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PaginationProps {
  current: number
  total: number
  onChange: (page: number) => void
}

export default function Pagination({ current, total, onChange }: PaginationProps) {
  if (total <= 1) return null
  return (
    <div className="pagination-bar">
      <button
        className="pagination-btn"
        onClick={() => onChange(current - 1)}
        disabled={current <= 1}
        aria-label="Página anterior"
      >
        <ChevronLeft size={14} strokeWidth={2.5} />
      </button>
      <span className="pagination-label">
        {current} <span className="pagination-sep">/</span> {total}
      </span>
      <button
        className="pagination-btn"
        onClick={() => onChange(current + 1)}
        disabled={current >= total}
        aria-label="Página siguiente"
      >
        <ChevronRight size={14} strokeWidth={2.5} />
      </button>
    </div>
  )
}
