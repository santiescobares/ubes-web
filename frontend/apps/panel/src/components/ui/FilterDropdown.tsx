import { useRef, useEffect, useState } from 'react'
import { SlidersHorizontal, Check } from 'lucide-react'

export type SortField = 'id' | 'name' | 'startingDate'
export type SortDirection = 'asc' | 'desc'

interface FilterDropdownProps<T extends string = SortField> {
  sort: T
  direction: SortDirection
  onSortChange: (sort: T) => void
  onDirectionChange: (direction: SortDirection) => void
  sortOptions?: { value: T; label: string }[]
}

const DEFAULT_SORT_OPTIONS: { value: SortField; label: string }[] = [
  { value: 'id', label: 'ID' },
  { value: 'name', label: 'Nombre' },
  { value: 'startingDate', label: 'Fecha de Inicio' },
]

const DIRECTION_OPTIONS: { value: SortDirection; label: string }[] = [
  { value: 'asc', label: 'Ascendente' },
  { value: 'desc', label: 'Descendente' },
]

export default function FilterDropdown<T extends string = SortField>({ sort, direction, onSortChange, onDirectionChange, sortOptions }: FilterDropdownProps<T>) {
  const options = sortOptions ?? (DEFAULT_SORT_OPTIONS as { value: T; label: string }[])
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button className="filter-dropdown-btn" onClick={() => setOpen(o => !o)}>
        <SlidersHorizontal size={13} strokeWidth={2} />
        Filtros
      </button>

      {open && (
        <div className="filter-dropdown-menu">
          <div className="filter-dropdown-group-label">Ordenar por</div>
          {options.map(opt => (
            <button
              key={opt.value}
              className={`filter-dropdown-option${sort === opt.value ? ' active' : ''}`}
              onClick={() => { onSortChange(opt.value); setOpen(false) }}
            >
              {opt.label}
              {sort === opt.value && <Check size={11} strokeWidth={2.5} />}
            </button>
          ))}

          <div className="filter-dropdown-divider" />
          <div className="filter-dropdown-group-label">Orden</div>
          {DIRECTION_OPTIONS.map(opt => (
            <button
              key={opt.value}
              className={`filter-dropdown-option${direction === opt.value ? ' active' : ''}`}
              onClick={() => { onDirectionChange(opt.value); setOpen(false) }}
            >
              {opt.label}
              {direction === opt.value && <Check size={11} strokeWidth={2.5} />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
