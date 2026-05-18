import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  ariaLabel: string
  children: React.ReactNode
  size?: 'md' | 'md-lg' | 'lg'
}

const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])'

export default function AuthModal({ isOpen, onClose, ariaLabel, children, size = 'md' }: AuthModalProps) {
  const boxRef = useRef<HTMLDivElement>(null)
  const previousFocus = useRef<Element | null>(null)

  useEffect(() => {
    if (!isOpen) return

    previousFocus.current = document.activeElement
    document.body.style.overflow = 'hidden'

    const frame = requestAnimationFrame(() => {
      const first = boxRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE)[0]
      first?.focus()
    })

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
        return
      }
      if (e.key !== 'Tab') return
      const focusable = Array.from(boxRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? [])
      if (focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus() }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus() }
      }
    }

    document.addEventListener('keydown', onKey)
    return () => {
      cancelAnimationFrame(frame)
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
      ;(previousFocus.current as HTMLElement | null)?.focus()
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return createPortal(
    <div
      className="auth-modal-backdrop"
      onClick={onClose}
    >
      <div
        ref={boxRef}
        className={`auth-modal-box${size === 'lg' ? ' auth-modal-box--lg' : size === 'md-lg' ? ' auth-modal-box--md-lg' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        onClick={e => e.stopPropagation()}
      >
        <button
          className="auth-modal-close-btn"
          onClick={onClose}
          aria-label="Cerrar"
          type="button"
        >
          <X size={16} />
        </button>
        {children}
      </div>
    </div>,
    document.body
  )
}
