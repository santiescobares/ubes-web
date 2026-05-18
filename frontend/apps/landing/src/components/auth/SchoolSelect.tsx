import { useState, useRef, useEffect, useId } from 'react'
import { ChevronDown } from 'lucide-react'
import { SCHOOL_OPTIONS } from '@/constants/schools'
import type { School } from '@ubes/types'

interface SchoolSelectProps {
  label: string
  value: School | null
  onChange: (value: School) => void
  error?: string
  required?: boolean
}

export default function SchoolSelect({ label, value, onChange, error, required }: SchoolSelectProps) {
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState<number>(-1)
  const containerRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const triggerId = useId()
  const listId = useId()

  const selectedLabel = value ? SCHOOL_OPTIONS.find(o => o.value === value)?.label : null

  useEffect(() => {
    if (!open) return
    const idx = value ? SCHOOL_OPTIONS.findIndex(o => o.value === value) : 0
    setActiveIndex(idx >= 0 ? idx : 0)
  }, [open, value])

  useEffect(() => {
    if (!open || activeIndex < 0) return
    const item = listRef.current?.children[activeIndex] as HTMLElement | undefined
    item?.scrollIntoView({ block: 'nearest' })
  }, [activeIndex, open])

  useEffect(() => {
    if (!open) return
    const onClickOutside = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [open])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') { e.preventDefault(); setOpen(true) }
      return
    }
    if (e.key === 'Escape') { e.preventDefault(); setOpen(false) }
    else if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIndex(i => Math.min(i + 1, SCHOOL_OPTIONS.length - 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIndex(i => Math.max(i - 1, 0)) }
    else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      if (activeIndex >= 0) { onChange(SCHOOL_OPTIONS[activeIndex].value); setOpen(false) }
    }
  }

  return (
    <div className="auth-field" ref={containerRef}>
      <label className="auth-field-label" htmlFor={triggerId}>
        {label}
        {required && <span className="auth-field-required" aria-hidden="true"> *</span>}
      </label>

      <button
        id={triggerId}
        type="button"
        className={`auth-select-trigger${error ? ' auth-field-input--error' : ''}${open ? ' auth-select-trigger--open' : ''}`}
        onClick={() => setOpen(o => !o)}
        onKeyDown={handleKeyDown}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-invalid={!!error}
        aria-describedby={error ? `${triggerId}-error` : undefined}
      >
        <span className={selectedLabel ? '' : 'auth-select-placeholder'}>
          {selectedLabel ?? 'Seleccioná tu escuela'}
        </span>
        <ChevronDown size={16} className="auth-select-chevron" />
      </button>

      {open && (
        <ul
          id={listId}
          ref={listRef}
          className="auth-select-list auth-select-list--open"
          role="listbox"
          aria-label={label}
        >
          {SCHOOL_OPTIONS.map((opt, i) => (
            <li
              key={opt.value}
              role="option"
              aria-selected={opt.value === value}
              className={`auth-select-option${opt.value === value ? ' auth-select-option--selected' : ''}${i === activeIndex ? ' auth-select-option--active' : ''}`}
              onMouseEnter={() => setActiveIndex(i)}
              onMouseDown={e => { e.preventDefault(); onChange(opt.value); setOpen(false) }}
            >
              {opt.label}
            </li>
          ))}
        </ul>
      )}

      {error && (
        <span id={`${triggerId}-error`} className="auth-field-error" role="alert">
          {error}
        </span>
      )}
    </div>
  )
}
