import { useRef, useEffect, useState } from 'react'
import { MoreVertical, Pencil, Trash2 } from 'lucide-react'

interface Props {
  state: 'pristine' | 'dirty' | 'new'
  onEdit: () => void
  onDelete: () => void
  disabled?: boolean
}

export default function RowActionMenu({ state, onEdit, onDelete, disabled }: Props) {
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

  if (state === 'new') {
    return (
      <button
        className="row-action-btn danger"
        onClick={onDelete}
        disabled={disabled}
        aria-label="Eliminar"
        type="button"
      >
        <Trash2 size={14} />
      </button>
    )
  }

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        className="row-action-btn"
        onClick={() => setOpen(o => !o)}
        disabled={disabled}
        aria-label="Acciones"
        type="button"
      >
        <MoreVertical size={14} />
      </button>
      {open && (
        <div className="row-action-menu">
          <button
            className="row-action-menu-item"
            onClick={() => { setOpen(false); onEdit() }}
            type="button"
          >
            <Pencil size={12} /> Editar
          </button>
          <button
            className="row-action-menu-item danger"
            onClick={() => { setOpen(false); onDelete() }}
            type="button"
          >
            <Trash2 size={12} /> Eliminar
          </button>
        </div>
      )}
    </div>
  )
}
