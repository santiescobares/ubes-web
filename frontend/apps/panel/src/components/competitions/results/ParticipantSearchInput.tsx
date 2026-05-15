import { useState, useRef, useEffect } from 'react'
import { useDebounce } from '@/hooks/useDebounce'
import ParticipantService from '@/services/participantService'
import { SCHOOL_LABELS } from '@/lib/schoolLabels'
import type { ParticipantDTO } from '@ubes/types'

interface ParticipantValue {
  participantId: string | null
  label: string
  schoolLabel?: string
}

interface Props {
  competitionId: string | number
  value: ParticipantValue
  onChange: (v: ParticipantValue) => void
  disabled?: boolean
}

export default function ParticipantSearchInput({ competitionId, value, onChange, disabled }: Props) {
  const [query, setQuery] = useState(value.label)
  const [results, setResults] = useState<ParticipantDTO[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const debouncedQuery = useDebounce(query, 300)

  useEffect(() => {
    setQuery(value.label)
  }, [value.label])

  useEffect(() => {
    if (debouncedQuery.length < 3) {
      setResults([])
      setOpen(false)
      return
    }
    let cancelled = false
    setLoading(true)
    ParticipantService.list(competitionId, { search: debouncedQuery, size: 10, role: 'PARTICIPANT' })
      .then(page => {
        if (!cancelled) {
          setResults(page.content)
          setOpen(true)
        }
      })
      .catch(() => {
        if (!cancelled) setResults([])
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [debouncedQuery, competitionId])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function selectParticipant(p: ParticipantDTO) {
    const label = `${p.firstName} ${p.lastName}`
    setQuery(label)
    setOpen(false)
    onChange({ participantId: p.id, label, schoolLabel: p.school })
  }

  function selectFreeText() {
    setOpen(false)
    onChange({ participantId: null, label: query, schoolLabel: undefined })
  }

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      <input
        className="inline-input"
        value={query}
        onChange={e => {
          setQuery(e.target.value)
          if (e.target.value !== value.label) {
            onChange({ participantId: null, label: e.target.value, schoolLabel: undefined })
          }
        }}
        onFocus={() => { if (results.length > 0) setOpen(true) }}
        placeholder="Buscar participante…"
        disabled={disabled}
        autoFocus
      />
      {open && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          zIndex: 100,
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 6,
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          maxHeight: 200,
          overflowY: 'auto',
          marginTop: 2,
        }}>
          {loading && (
            <div style={{ padding: '8px 12px', fontSize: 12, color: 'var(--muted)' }}>Buscando…</div>
          )}
          {!loading && results.map(p => (
            <button
              key={p.id}
              type="button"
              onMouseDown={() => selectParticipant(p)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                width: '100%',
                padding: '7px 12px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
                gap: 1,
              }}
              className="participant-search-option"
            >
              <span style={{ fontSize: 13, fontWeight: 500 }}>{p.firstName} {p.lastName}</span>
              <span style={{ fontSize: 11, color: 'var(--muted)' }}>{SCHOOL_LABELS[p.school] ?? p.school}</span>
            </button>
          ))}
          {!loading && query.trim() && (
            <button
              type="button"
              onMouseDown={selectFreeText}
              style={{
                display: 'block',
                width: '100%',
                padding: '7px 12px',
                background: 'none',
                border: 'none',
                borderTop: results.length > 0 ? '1px solid var(--border)' : 'none',
                cursor: 'pointer',
                textAlign: 'left',
                fontSize: 12,
                color: 'var(--muted)',
                fontStyle: 'italic',
              }}
            >
              Usar texto libre: "{query}"
            </button>
          )}
        </div>
      )}
    </div>
  )
}
