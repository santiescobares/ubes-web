import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { Search, Users } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { hasExecutiveAccess } from '@/lib/roleUtils'
import { useDebounce } from '@/hooks/useDebounce'
import { UserService, type UserListParams } from '@/services/userService'
import FilterDropdown, { type SortDirection } from '@/components/ui/FilterDropdown'
import Pagination from '@/components/ui/Pagination'
import { formatDateTime } from '@/lib/dateUtils'
import { SCHOOL_LABELS, ROLE_LABELS } from '@/lib/userLabels'
import UserModal from '@/components/users/UserModal'
import type { UserDTO } from '@ubes/types'

type UserSortField = 'id' | 'lastName' | 'firstName' | 'createdAt'

const USER_SORT_OPTIONS: { value: UserSortField; label: string }[] = [
  { value: 'createdAt', label: 'Fecha de Alta' },
  { value: 'lastName',  label: 'Apellido' },
  { value: 'firstName', label: 'Nombre' },
  { value: 'id',        label: 'ID' },
]

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function computePageSize(): number {
  const rowH = 38
  const reserved = 320
  const rows = Math.floor((window.innerHeight - reserved) / rowH)
  return Math.max(5, Math.min(20, rows))
}

export default function UsuariosPage() {
  const user = useAuthStore((s) => s.user)

  if (!user || !hasExecutiveAccess(user.role)) {
    return <Navigate to="/" replace />
  }

  return <UsuariosContent />
}

function UsuariosContent() {
  const [users, setUsers] = useState<UserDTO[]>([])
  const [totalPages, setTotalPages] = useState(1)
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(computePageSize)
  const [sort, setSort] = useState<UserSortField>('id')
  const [direction, setDirection] = useState<SortDirection>('asc')
  const [searchInput, setSearchInput] = useState('')
  const [fetchKey, setFetchKey] = useState(0)
  const [initialLoad, setInitialLoad] = useState(true)
  const [fetching, setFetching] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selected, setSelected] = useState<UserDTO | null>(null)

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

    const trimmed = debouncedSearch.trim().toLowerCase()
    const params: UserListParams = { page, size: pageSize, sort: `${sort},${direction}` }

    if (trimmed) {
      if (UUID_REGEX.test(trimmed)) {
        params.id = trimmed
      } else {
        params.firstName = trimmed
        params.lastName = trimmed
        params.email = trimmed
        params.googleId = trimmed
      }
    }

    UserService.list(params)
      .then((data) => {
        if (!cancelled) {
          setUsers(data.content)
          setTotalPages(data.totalPages)
        }
      })
      .catch(() => {
        if (!cancelled) setError('No se pudieron cargar los usuarios. Intentá de nuevo.')
      })
      .finally(() => {
        if (!cancelled) {
          setFetching(false)
          setInitialLoad(false)
        }
      })

    return () => { cancelled = true }
  }, [debouncedSearch, sort, direction, page, pageSize, fetchKey])

  function handleSaved(updated: UserDTO) {
    setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)))
    setSelected(updated)
  }

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
            <h1 className="page-heading">Listado de Usuarios</h1>
            <p className="page-sub">Gestión de usuarios, roles y sanciones</p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <div className="search-bar">
              <Search size={13} className="search-bar-icon" />
              <input
                className="search-bar-input"
                type="text"
                placeholder="Buscar por nombre, email o UUID..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </div>

            <FilterDropdown<UserSortField>
              sort={sort}
              direction={direction}
              onSortChange={setSort}
              onDirectionChange={setDirection}
              sortOptions={USER_SORT_OPTIONS}
            />
          </div>
        </div>

        {/* Table */}
        <div style={{ marginTop: 24 }}>
          {initialLoad ? (
            <table className="data-table users-table">
              <thead>
                <tr>
                  <th style={{ width: '18%' }}>ID</th>
                  <th>Apellido</th>
                  <th>Nombre</th>
                  <th>Escuela</th>
                  <th>Rol</th>
                  <th>Fecha de Alta</th>
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
              <Users size={36} className="empty-state-icon" />
              <p className="empty-state-text">{error}</p>
              <button className="btn btn-secondary" onClick={() => setFetchKey((k) => k + 1)}>
                Reintentar
              </button>
            </div>
          ) : users.length === 0 ? (
            <div className="empty-state">
              <Users size={36} className="empty-state-icon" />
              <p className="empty-state-text">
                {searchInput ? 'Sin resultados para tu búsqueda.' : 'No hay usuarios registrados.'}
              </p>
            </div>
          ) : (
            <div className="users-table-wrapper">
            <table
              className="data-table users-table"
              style={{ opacity: fetching ? 0.5 : 1, transition: 'opacity 0.15s' }}
            >
              <thead>
                <tr>
                  <th style={{ width: '18%' }}>ID</th>
                  <th>Apellido</th>
                  <th>Nombre</th>
                  <th>Escuela</th>
                  <th>Rol</th>
                  <th>Fecha de Alta</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} onClick={() => setSelected(u)} style={{ cursor: 'pointer' }}>
                    <td
                      title={u.id}
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 11,
                        color: 'var(--muted-light)',
                        maxWidth: 110,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {u.id}
                    </td>
                    <td style={{ fontWeight: 600 }}>{u.lastName}</td>
                    <td>{u.firstName}</td>
                    <td>{SCHOOL_LABELS[u.school] ?? u.school}</td>
                    <td style={{ fontSize: 12 }}>{ROLE_LABELS[u.role] ?? u.role}</td>
                    <td style={{ color: 'var(--muted-light)', fontSize: 12 }}>
                      {formatDateTime(u.createdAt)}
                    </td>
                  </tr>
                ))}
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

      {selected && (
        <UserModal
          user={selected}
          onClose={() => setSelected(null)}
          onSaved={handleSaved}
        />
      )}
    </div>
  )
}
