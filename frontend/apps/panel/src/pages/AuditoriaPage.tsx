import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { Search, ScrollText } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { hasExecutiveAccess } from '@/lib/roleUtils'
import { useDebounce } from '@/hooks/useDebounce'
import { LogService, type LogListParams } from '@/services/logService'
import FilterDropdown, { type SortDirection } from '@/components/ui/FilterDropdown'
import Pagination from '@/components/ui/Pagination'
import { formatLogDateTime, parseDdMmYyyyToInstantRange } from '@/lib/dateUtils'
import { RESOURCE_TYPE_LABELS, ACTION_LABELS, SYSTEM_UUID } from '@/lib/logLabels'
import LogModal from '@/components/logs/LogModal'
import type { LogDTO } from '@ubes/types'

type LogSortField = 'id' | 'createdAt'

const LOG_SORT_OPTIONS: { value: LogSortField; label: string }[] = [
  { value: 'createdAt', label: 'Fecha' },
  { value: 'id',        label: 'ID' },
]

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function computePageSize(): number {
  const rowH = 38
  const reserved = 120
  const rows = Math.floor((window.innerHeight - reserved) / rowH)
  return Math.max(5, Math.min(20, rows))
}

export default function AuditoriaPage() {
  const user = useAuthStore((s) => s.user)

  if (!user || !hasExecutiveAccess(user.role)) {
    return <Navigate to="/" replace />
  }

  return <AuditoriaContent />
}

function AuditoriaContent() {
  const [logs, setLogs] = useState<LogDTO[]>([])
  const [totalPages, setTotalPages] = useState(1)
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(computePageSize)
  const [sort, setSort] = useState<LogSortField>('createdAt')
  const [direction, setDirection] = useState<SortDirection>('desc')
  const [searchInput, setSearchInput] = useState('')
  const [fetchKey, setFetchKey] = useState(0)
  const [initialLoad, setInitialLoad] = useState(true)
  const [fetching, setFetching] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selected, setSelected] = useState<LogDTO | null>(null)

  const debouncedSearch = useDebounce(searchInput, 300)

  useEffect(() => {
    const handler = () => setPageSize(computePageSize())
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  useEffect(() => {
    setPage(0)
  }, [debouncedSearch, sort, direction])

  useEffect(() => {
    let cancelled = false
    setFetching(true)
    setError(null)

    const trimmed = debouncedSearch.trim()
    const params: LogListParams = { page, size: pageSize, sort: `${sort},${direction}` }

    if (trimmed) {
      if (/^\d+$/.test(trimmed)) {
        params.id = Number(trimmed)
      } else if (UUID_REGEX.test(trimmed)) {
        params.userId = trimmed
      } else {
        const range = parseDdMmYyyyToInstantRange(trimmed)
        if (range) {
          params.from = range.from
          params.to = range.to
        }
      }
    }

    LogService.list(params)
      .then((data) => {
        if (!cancelled) {
          setLogs(data.content)
          setTotalPages(data.totalPages)
        }
      })
      .catch(() => {
        if (!cancelled) setError('No se pudo cargar el historial. Intentá de nuevo.')
      })
      .finally(() => {
        if (!cancelled) {
          setFetching(false)
          setInitialLoad(false)
        }
      })

    return () => { cancelled = true }
  }, [debouncedSearch, sort, direction, page, pageSize, fetchKey])

  return (
    <div className="panel-content">
      <div className="fade-up">
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <div>
            <h1 className="page-heading">Historial de Actividad</h1>
            <p className="page-sub">Registros de auditoría del sistema</p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <div className="search-bar">
              <Search size={13} className="search-bar-icon" />
              <input
                className="search-bar-input"
                type="text"
                placeholder="Buscar por ID, UUID de usuario o fecha (dd-MM-yyyy)..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </div>

            <FilterDropdown<LogSortField>
              sort={sort}
              direction={direction}
              onSortChange={setSort}
              onDirectionChange={setDirection}
              sortOptions={LOG_SORT_OPTIONS}
            />
          </div>
        </div>

        {/* Table */}
        <div style={{ marginTop: 24 }}>
          {initialLoad ? (
            <table className="data-table users-table" style={{ tableLayout: 'fixed', width: '100%' }}>
              <colgroup>
                <col style={{ width: '5%' }} />
                <col style={{ width: '15%' }} />
                <col style={{ width: '30%' }} />
                <col style={{ width: '10%' }} />
                <col style={{ width: '10%' }} />
                <col style={{ width: '30%' }} />
              </colgroup>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Fecha</th>
                  <th>Usuario</th>
                  <th>Acción</th>
                  <th>Tipo Recurso</th>
                  <th>ID Recurso</th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: pageSize }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={6}>
                      <div style={{ height: 18, background: 'var(--surface-muted, #f5f5f5)', borderRadius: 4 }} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : error ? (
            <div className="empty-state">
              <ScrollText size={36} className="empty-state-icon" />
              <p className="empty-state-text">{error}</p>
              <button className="btn btn-secondary" onClick={() => setFetchKey((k) => k + 1)}>
                Reintentar
              </button>
            </div>
          ) : logs.length === 0 ? (
            <div className="empty-state">
              <ScrollText size={36} className="empty-state-icon" />
              <p className="empty-state-text">
                {searchInput ? 'Sin resultados para tu búsqueda.' : 'No hay registros disponibles.'}
              </p>
            </div>
          ) : (
            <div className="users-table-wrapper">
              <table
                className="data-table users-table"
                style={{ opacity: fetching ? 0.5 : 1, transition: 'opacity 0.15s', tableLayout: 'fixed', width: '100%' }}
              >
                <colgroup>
                  <col style={{ width: '5%' }} />
                  <col style={{ width: '15%' }} />
                  <col style={{ width: '30%' }} />
                  <col style={{ width: '10%' }} />
                  <col style={{ width: '10%' }} />
                  <col style={{ width: '30%' }} />
                </colgroup>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Fecha</th>
                    <th>Usuario</th>
                    <th>Acción</th>
                    <th>Tipo Recurso</th>
                    <th>ID Recurso</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((l) => {
                    const isSystem = !l.user || l.user.id === SYSTEM_UUID
                    const userName = isSystem ? 'Sistema' : `${l.user.lastName}, ${l.user.firstName}`
                    return (
                      <tr key={l.id} onClick={() => setSelected(l)} style={{ cursor: 'pointer' }}>
                        <td style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--muted-light)' }}>
                          {l.id}
                        </td>
                        <td style={{ color: 'var(--muted-light)', fontSize: 12 }}>
                          {formatLogDateTime(l.createdAt)}
                        </td>
                        <td style={{ fontWeight: 600 }}>{userName}</td>
                        <td style={{ fontSize: 12 }}>{ACTION_LABELS[l.action] ?? l.action}</td>
                        <td style={{ fontSize: 12 }}>{RESOURCE_TYPE_LABELS[l.resourceType] ?? l.resourceType}</td>
                        <td
                          title={l.resourceId}
                          style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: 11,
                            color: 'var(--muted-light)',
                            maxWidth: 140,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {l.resourceId}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {!initialLoad && !error && (
          <div style={{ marginTop: 24, display: 'flex', justifyContent: 'center' }}>
            <Pagination current={page + 1} total={totalPages} onChange={(p) => setPage(p - 1)} />
          </div>
        )}
      </div>

      {selected && <LogModal log={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}
