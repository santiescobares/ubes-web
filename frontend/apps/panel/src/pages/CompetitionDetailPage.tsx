import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import {
  ChevronRight, Users, Trophy,
  Plus, Loader2, AlertCircle, RefreshCw,
  Search, SlidersHorizontal, Download, Settings,
} from 'lucide-react'
import { CompetitionService, ParticipantService, ResultService } from '@/services/competition.service'
import { useAuthStore } from '@/store/authStore'
import { hasCompetitionAccess, hasExecutiveAccess } from '@/lib/roleUtils'
import {
  PARTICIPANT_ROLE_LABELS, SCHOOL_LABELS, POSITION_TYPE_LABELS_PLURAL,
} from '@/lib/labels'
import CompetitionForm, { type CompetitionFormState, COMPETITION_FORM_INITIAL } from '@/components/competitions/CompetitionForm'
import ParticipantPreviewModal from '@/components/competitions/participants/ParticipantPreviewModal'
import ParticipantFormModal from '@/components/competitions/participants/ParticipantFormModal'
import ResultPreviewModal from '@/components/competitions/results/ResultPreviewModal'
import ResultEditModal from '@/components/competitions/results/ResultEditModal'
import CalculateResultsModal from '@/components/competitions/results/CalculateResultsModal'
import ConfirmActionModal from '@/components/ConfirmActionModal'
import type { CompetitionDTO, CompetitionUpdateDTO, ParticipantDTO, ResultDTO } from '@ubes/types'
import { CompetitionStatus, RegistrationStatus } from '@ubes/types'

function minDateRangeError(start: string, end: string): string | undefined {
  if (!start || !end) return undefined
  if (new Date(end).getTime() - new Date(start).getTime() < 5 * 60 * 1000)
    return 'El rango mínimo entre fechas es de 5 minutos.'
  return undefined
}

function toDatetimeLocal(iso: string | null | undefined): string {
  if (!iso) return ''
  return iso.slice(0, 16)
}

function competitionToFormState(c: CompetitionDTO): CompetitionFormState {
  return {
    name: c.name,
    description: c.description,
    startingDate: toDatetimeLocal(c.startingDate),
    endingDate: toDatetimeLocal(c.endingDate),
    locationName: c.location?.name ?? '',
    minParticipants: c.minParticipants,
    maxParticipants: c.maxParticipants,
    maxCoaches: c.maxCoaches,
    requiresShirtNumbers: c.requiresShirtNumbers,
    requiresMedicalCertificates: c.requiresMedicalCertificates,
    registrationStartingDate: toDatetimeLocal(c.registrationStartingDate),
    registrationEndingDate: toDatetimeLocal(c.registrationEndingDate),
  }
}

type Tab = 'participants' | 'results'
type ParticipantModal =
  | { type: 'preview'; participant: ParticipantDTO }
  | { type: 'form'; participant?: ParticipantDTO }
  | null
type ResultModal =
  | { type: 'preview'; result: ResultDTO }
  | { type: 'edit'; result: ResultDTO }
  | { type: 'calculate' }
  | null

export default function CompetitionDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const user = useAuthStore(s => s.user)

  const canManage = user ? hasCompetitionAccess(user.role) : false
  const canExecutive = user ? hasExecutiveAccess(user.role) : false

  const [competition, setCompetition] = useState<CompetitionDTO | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [participants, setParticipants] = useState<ParticipantDTO[]>([])
  const [pPage, setPPage] = useState(0)
  const [pTotalPages, setPTotalPages] = useState(0)
  const [pLoading, setPLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const debouncedSearch = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [results, setResults] = useState<ResultDTO[]>([])
  const [rLoading, setRLoading] = useState(false)

  const [tab, setTab] = useState<Tab>('participants')
  const [resultSubTab, setResultSubTab] = useState<'INDIVIDUAL' | 'SCHOOL' | 'SUPPORTER'>('INDIVIDUAL')
  const [participantModal, setParticipantModal] = useState<ParticipantModal>(null)
  const [resultModal, setResultModal] = useState<ResultModal>(null)
  const [lifecycleLoading, setLifecycleLoading] = useState(false)

  const [formValue, setFormValue] = useState<CompetitionFormState>(COMPETITION_FORM_INITIAL)
  const [bannerFile, setBannerFile] = useState<File | null>(null)
  const [regulationFile, setRegulationFile] = useState<File | null>(null)
  const [removeBanner, setRemoveBanner] = useState(false)
  const [saveLoading, setSaveLoading] = useState(false)
  const formInitialized = useRef(false)
  const originalFormValue = useRef<CompetitionFormState | null>(null)

  const formErrors = useMemo(() => {
    const errs: Partial<Record<keyof CompetitionFormState, string>> = {}
    const endErr = minDateRangeError(formValue.startingDate, formValue.endingDate)
    if (endErr) errs.endingDate = endErr
    const regErr = minDateRangeError(formValue.registrationStartingDate ?? '', formValue.registrationEndingDate ?? '')
    if (regErr) errs.registrationEndingDate = regErr
    return errs
  }, [formValue])

  const hasChanges = useMemo(() => {
    if (!originalFormValue.current) return false
    return JSON.stringify(formValue) !== JSON.stringify(originalFormValue.current)
      || bannerFile !== null
      || removeBanner
  }, [formValue, bannerFile, removeBanner])

  async function loadCompetition() {
    if (!id) return
    setLoading(true)
    setError(null)
    try {
      const c = await CompetitionService.getCompetition(id)
      setCompetition(c)
    } catch {
      setError('No se pudo cargar la competencia.')
    } finally {
      setLoading(false)
    }
  }

  const loadParticipants = useCallback(async (page: number, search?: string) => {
    if (!id) return
    setPLoading(true)
    try {
      const result = await ParticipantService.getParticipants(id, page, 20, search)
      setParticipants(result.content)
      setPTotalPages(result.totalPages)
    } finally {
      setPLoading(false)
    }
  }, [id])

  async function loadResults() {
    if (!id) return
    setRLoading(true)
    try {
      const data = await ResultService.getResults(id)
      setResults(data)
    } finally {
      setRLoading(false)
    }
  }

  useEffect(() => { loadCompetition() }, [id])
  const searchQueryRef = useRef(searchQuery)
  useEffect(() => { searchQueryRef.current = searchQuery }, [searchQuery])

  useEffect(() => { if (id) loadParticipants(pPage, searchQueryRef.current || undefined) }, [id, pPage, loadParticipants])

  useEffect(() => {
    if (debouncedSearch.current) clearTimeout(debouncedSearch.current)
    debouncedSearch.current = setTimeout(() => {
      setPPage(0)
      loadParticipants(0, searchQuery || undefined)
    }, 300)
    return () => { if (debouncedSearch.current) clearTimeout(debouncedSearch.current) }
  }, [searchQuery])
  useEffect(() => { if (tab === 'results' && competition) loadResults() }, [tab, competition])
  useEffect(() => { if (searchOpen) searchInputRef.current?.focus() }, [searchOpen])

  useEffect(() => {
    if (competition && !formInitialized.current) {
      const state = competitionToFormState(competition)
      setFormValue(state)
      originalFormValue.current = state
      formInitialized.current = true
    }
  }, [competition])

async function handleSave() {
    if (!competition || !id) return

    const endErr = minDateRangeError(formValue.startingDate, formValue.endingDate)
    if (endErr) {
      toast.error(endErr)
      return
    }

    const regStart = formValue.registrationStartingDate
    const regEnd = formValue.registrationEndingDate
    
    if ((regStart && !regEnd) || (!regStart && regEnd)) {
      toast.error('Completá ambas fechas de inscripción para guardarlas, o dejalas vacías.')
      return
    }

    if (regStart && regEnd) {
      const regErr = minDateRangeError(regStart, regEnd)
      if (regErr) {
        toast.error(regErr)
        return
      }
    }

    setSaveLoading(true)
    try {
      const dto: CompetitionUpdateDTO = {
        name: formValue.name,
        description: formValue.description,
        startingDate: formValue.startingDate || undefined,
        endingDate: formValue.endingDate || undefined,
        location: formValue.locationName.trim()
          ? { name: formValue.locationName.trim(), latitude: null, longitude: null }
          : undefined,
        minParticipants: formValue.minParticipants,
        maxParticipants: formValue.maxParticipants,
        requiresShirtNumbers: formValue.requiresShirtNumbers,
        requiresMedicalCertificates: formValue.requiresMedicalCertificates,
      }
      
      let updated = await CompetitionService.updateCompetition(id, dto, bannerFile ?? undefined, removeBanner)

      const origRegStart = toDatetimeLocal(competition.registrationStartingDate)
      const origRegEnd = toDatetimeLocal(competition.registrationEndingDate)
      const regStartChanged = regStart !== origRegStart
      const regEndChanged = regEnd !== origRegEnd

      if ((regStartChanged || regEndChanged) && regStart && regEnd) {
        updated = await CompetitionService.scheduleRegistration(id, regStart, regEnd)
      }

      const newState = competitionToFormState(updated)
      setCompetition(updated)
      setFormValue(newState)
      originalFormValue.current = newState
      
      setBannerFile(null)
      setRemoveBanner(false)
      
      toast.success('Cambios guardados')
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? 'Error al guardar.')
    } finally {
      setSaveLoading(false)
    }
  }

  async function runLifecycle(action: () => Promise<void>, successMsg?: string) {
    setLifecycleLoading(true)
    try {
      await action()
      await loadCompetition()
      toast.success(successMsg ?? 'Acción ejecutada correctamente.')
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? 'Error al ejecutar la acción.')
    } finally {
      setLifecycleLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="detail-page">
        <div className="detail-loading">
          <Loader2 size={18} className="spin" />
          <span>Cargando competencia…</span>
        </div>
      </div>
    )
  }

  if (error || !competition) {
    return (
      <div className="detail-page">
        <div className="detail-loading" style={{ flexDirection: 'column', gap: 12 }}>
          <AlertCircle size={24} style={{ color: 'var(--red-strong)', opacity: 0.7 }} />
          <span>{error ?? 'Competencia no encontrada.'}</span>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-secondary" onClick={loadCompetition}>
              <RefreshCw size={13} /> Reintentar
            </button>
            <button className="btn btn-secondary" onClick={() => navigate('/panel/competencias')}>
              Volver
            </button>
          </div>
        </div>
      </div>
    )
  }

  const { status, registrationStatus } = competition

  const canAddParticipants = canManage && registrationStatus === RegistrationStatus.AVAILABLE
  const canCalculateResults = canManage && status === CompetitionStatus.FINISHED && results.length === 0
  const canEditResults = canManage && (status === CompetitionStatus.ON_GOING || status === CompetitionStatus.FINISHED)
  const formDisabled = !canManage || status === CompetitionStatus.CANCELED

  return (
    <div className="detail-page">
      {/* ── Left panel ── */}
      <div className="detail-left">
        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--muted)', marginBottom: 4 }}>
          <Link to="/panel/competencias" style={{ color: 'var(--muted)', textDecoration: 'none' }}>
            Competencias
          </Link>
          <ChevronRight size={11} style={{ opacity: 0.4 }} />
          <span style={{ color: 'var(--ink)', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {competition.name}
          </span>
        </div>

        <CompetitionForm
          value={formValue}
          onChange={setFormValue}
          errors={formErrors}
          bannerFile={bannerFile}
          setBannerFile={setBannerFile}
          regulationFile={regulationFile}
          setRegulationFile={setRegulationFile}
          disabled={formDisabled}
          showRegistrationDates
          existingBannerURL={competition.bannerURL ?? undefined}
          removeBanner={removeBanner}
          onRemoveBanner={() => setRemoveBanner(true)}
        />

        {canManage && status !== CompetitionStatus.CANCELED && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <button className="btn btn-primary" onClick={handleSave} disabled={saveLoading || !hasChanges} style={{ justifyContent: 'center' }}>
              {saveLoading ? <Loader2 size={13} className="spin" /> : 'Guardar cambios'}
            </button>
          </div>
        )}

        {canManage && (
          <>
            <div className="detail-divider" />
            <LifecycleActions
              competition={competition}
              canExecutive={canExecutive}
              loading={lifecycleLoading}
              onAction={(action, successMsg) => runLifecycle(action, successMsg)}
              competitionId={id!}
            />
          </>
        )}
      </div>

      {/* ── Right panel ── */}
      <div className="detail-right">
        {/* Tabs */}
        <div className="detail-tabs">
          <button
            className={`detail-tab-btn${tab === 'participants' ? ' active' : ''}`}
            onClick={() => setTab('participants')}
          >
            <Users size={13} />
            Participantes
            <span className="count-badge">{participants.length}</span>
          </button>
          <button
            className={`detail-tab-btn${tab === 'results' ? ' active' : ''}`}
            onClick={() => setTab('results')}
          >
            <Trophy size={13} />
            Resultados
            <span className="count-badge">{results.length}</span>
          </button>
        </div>

        {/* Tab content */}
        <div className="detail-tab-content">
          {tab === 'participants' && (
            <div className="fade-up">
              <div className="panel-toolbar">
                <span className="panel-toolbar-title">Participantes Registrados</span>
                <div className="panel-toolbar-right" style={{ gap: 6 }}>
                  <div style={{
                    overflow: 'hidden',
                    maxWidth: searchOpen ? 180 : 0,
                    opacity: searchOpen ? 1 : 0,
                    transition: 'max-width 250ms ease, opacity 200ms ease',
                  }}>
                    <input
                      ref={searchInputRef}
                      type="text"
                      className="input"
                      style={{ width: 180, fontSize: 12, padding: '4px 8px' }}
                      placeholder="Nombre o DNI…"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Escape') { setSearchOpen(false); setSearchQuery('') } }}
                    />
                  </div>
                  <button
                    className={`btn btn-ghost${searchOpen ? ' active' : ''}`}
                    title="Buscar"
                    onClick={() => { setSearchOpen(o => !o); if (searchOpen) setSearchQuery('') }}
                  >
                    <Search size={13} />
                  </button>
                  <button className="btn btn-ghost" title="Filtrar"><SlidersHorizontal size={13} /></button>
                  <button className="btn btn-ghost" title="Exportar"><Download size={13} /></button>
                  {canAddParticipants && (
                    <button className="btn btn-primary" onClick={() => setParticipantModal({ type: 'form' })}>
                      <Plus size={13} /> Agregar
                    </button>
                  )}
                </div>
              </div>

              {pLoading ? (
                <div className="detail-loading"><Loader2 size={16} className="spin" /></div>
              ) : participants.length === 0 ? (
                <div className="empty-state">
                  <Users size={32} className="empty-state-icon" />
                  <p className="empty-state-text">Sin participantes registrados.</p>
                  {canAddParticipants && (
                    <button className="btn btn-primary" onClick={() => setParticipantModal({ type: 'form' })}>
                      <Plus size={13} /> Agregar primero
                    </button>
                  )}
                </div>
              ) : (
                <>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Nombre completo</th>
                        <th>Rol</th>
                        <th>Escuela</th>
                        {competition.requiresShirtNumbers && <th>Nº</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {participants.map((p, index) => (
                        <tr key={p.id} onClick={() => setParticipantModal({ type: 'preview', participant: p })}>
                          <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--muted)', fontSize: 12 }}>{pPage * 20 + index + 1}</td>
                          <td style={{ fontWeight: 600 }}>{p.firstName} {p.lastName}</td>
                          <td>{PARTICIPANT_ROLE_LABELS[p.role]}</td>
                          <td>{SCHOOL_LABELS[p.school] ?? p.school}</td>
                          {competition.requiresShirtNumbers && <td style={{ fontFamily: 'var(--font-mono)' }}>{p.shirtNumber ?? '—'}</td>}
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {pTotalPages > 1 && (
                    <div className="pagination">
                      <button className="pagination-btn icon" disabled={pPage === 0} onClick={() => setPPage(p => p - 1)}>&lt;</button>
                      <span className="pagination-info">{pPage + 1}</span>
                      <button className="pagination-btn icon" disabled={pPage >= pTotalPages - 1} onClick={() => setPPage(p => p + 1)}>&gt;</button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {tab === 'results' && (
            <div className="fade-up">
              <div className="panel-toolbar">
                <span className="panel-toolbar-title">Resultados de Competencia</span>
                <div className="panel-toolbar-right">
                  {canCalculateResults && (
                    <button className="btn btn-ghost" title="Calcular resultados" onClick={() => setResultModal({ type: 'calculate' })}>
                      <Settings size={13} />
                    </button>
                  )}
                </div>
              </div>

              {rLoading ? (
                <div className="detail-loading"><Loader2 size={16} className="spin" /></div>
              ) : (
                <>
                  <div className="detail-tabs" style={{ marginTop: 8 }}>
                    {(['INDIVIDUAL', 'SCHOOL', 'SUPPORTER'] as const).map(type => (
                      <button
                        key={type}
                        className={`detail-tab-btn${resultSubTab === type ? ' active' : ''}`}
                        onClick={() => setResultSubTab(type)}
                      >
                        {POSITION_TYPE_LABELS_PLURAL[type]}
                      </button>
                    ))}
                  </div>

                  {(() => {
                    const subResults = results.filter(r => r.positionType === resultSubTab)
                    if (subResults.length === 0) {
                      return (
                        <div className="empty-state">
                          <Trophy size={32} className="empty-state-icon" />
                          <p className="empty-state-text">Sin resultados para {POSITION_TYPE_LABELS_PLURAL[resultSubTab].toLowerCase()}.</p>
                          {canCalculateResults && (
                            <button className="btn btn-primary" onClick={() => setResultModal({ type: 'calculate' })}>
                              <Settings size={13} /> Calcular
                            </button>
                          )}
                        </div>
                      )
                    }
                    return (
                      <>
                        <table className="data-table">
                          <thead>
                            <tr>
                              <th>#</th>
                              <th>Nombre</th>
                              <th>Escuela</th>
                            </tr>
                          </thead>
                          <tbody>
                            {subResults.map(r => (
                              <tr
                                key={`${r.positionType}-${r.positionNumber}`}
                                onClick={() => setResultModal(
                                  canEditResults
                                    ? { type: 'edit', result: r }
                                    : { type: 'preview', result: r }
                                )}
                              >
                                <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{r.positionNumber}</td>
                                <td style={{ fontWeight: 600 }}>
                                  {r.participant ? `${r.participant.firstName} ${r.participant.lastName}` : r.name || '—'}
                                </td>
                                <td>{r.participant ? (SCHOOL_LABELS[r.participant.school] ?? r.participant.school) : (r.name || '—')}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </>
                    )
                  })()}
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Modals ── */}
      {participantModal?.type === 'preview' && (
        <ParticipantPreviewModal
          participant={participantModal.participant}
          competition={competition}
          onClose={() => setParticipantModal(null)}
          onEdit={() => setParticipantModal({ type: 'form', participant: participantModal.participant })}
        />
      )}

      {participantModal?.type === 'form' && (
        <ParticipantFormModal
          competition={competition}
          participant={participantModal.participant}
          existingParticipants={!participantModal.participant ? participants : undefined}
          onClose={() => participantModal.participant
            ? setParticipantModal({ type: 'preview', participant: participantModal.participant })
            : setParticipantModal(null)
          }
          onSaved={() => {
            setParticipantModal(null)
            loadParticipants(pPage)
          }}
        />
      )}

      {resultModal?.type === 'preview' && (
        <ResultPreviewModal
          result={resultModal.result}
          onClose={() => setResultModal(null)}
          onEdit={() => setResultModal({ type: 'edit', result: resultModal.result })}
        />
      )}

      {resultModal?.type === 'edit' && (
        <ResultEditModal
          competitionId={id!}
          result={resultModal.result}
          participants={participants}
          onClose={() => setResultModal(null)}
          onSaved={() => {
            setResultModal(null)
            loadResults()
          }}
        />
      )}

      {resultModal?.type === 'calculate' && (
        <CalculateResultsModal
          competitionId={id!}
          participants={participants}
          onClose={() => setResultModal(null)}
          onSaved={() => {
            setResultModal(null)
            loadResults()
          }}
        />
      )}
    </div>
  )
}

interface LifecycleProps {
  competition: CompetitionDTO
  canExecutive: boolean
  loading: boolean
  onAction: (action: () => Promise<void>, successMsg: string) => void
  competitionId: string
}

type LifecycleButton = {
  label: string
  successMsg: string
  confirmMsg: string
  style?: 'danger'
  action: () => Promise<void>
}

function LifecycleActions({ competition, canExecutive, loading, onAction, competitionId }: LifecycleProps) {
  const { status, registrationStatus } = competition
  const [pending, setPending] = useState<LifecycleButton | null>(null)

  const buttons: LifecycleButton[] = []

  if (status === CompetitionStatus.SCHEDULED) {
    if (registrationStatus === RegistrationStatus.UNAVAILABLE) {
      buttons.push({
        label: 'Abrir inscripciones',
        successMsg: 'Inscripciones abiertas.',
        confirmMsg: '¿Deseas abrir las inscripciones de esta competencia?',
        action: () => CompetitionService.openRegistration(competitionId),
      })
    }
    if (registrationStatus === RegistrationStatus.AVAILABLE) {
      buttons.push({
        label: 'Cerrar inscripciones',
        successMsg: 'Inscripciones cerradas.',
        confirmMsg: '¿Deseas cerrar las inscripciones? Los participantes ya registrados serán conservados.',
        action: () => CompetitionService.closeRegistration(competitionId, false),
      })
    }
    if (registrationStatus === RegistrationStatus.EXPIRED) {
      buttons.push({
        label: 'Iniciar',
        successMsg: 'Competencia iniciada.',
        confirmMsg: '¿Deseas iniciar la competencia? Esta acción cambiará su estado a "En curso".',
        action: () => CompetitionService.startCompetition(competitionId),
      })
    }
    if (canExecutive) {
      buttons.push({
        label: 'Cancelar',
        style: 'danger',
        successMsg: 'Competencia cancelada.',
        confirmMsg: 'Esta acción es irreversible. ¿Deseas cancelar la competencia?',
        action: () => CompetitionService.cancelCompetition(competitionId).then(() => {}),
      })
    }
  }

  if (status === CompetitionStatus.ON_GOING) {
    buttons.push({
      label: 'Finalizar competencia',
      successMsg: 'Competencia finalizada.',
      confirmMsg: '¿Deseas finalizar la competencia? Esta acción cambiará su estado a "Finalizada".',
      action: () => CompetitionService.endCompetition(competitionId),
    })
    if (canExecutive) {
      buttons.push({
        label: 'Cancelar',
        style: 'danger',
        successMsg: 'Competencia cancelada.',
        confirmMsg: 'Esta acción es irreversible. ¿Deseas cancelar la competencia?',
        action: () => CompetitionService.cancelCompetition(competitionId).then(() => {}),
      })
    }
  }

  if (buttons.length === 0) return null

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <span className="detail-field-label">Acciones</span>
        {buttons.map(btn => (
          <button
            key={btn.label}
            className={`btn ${btn.style === 'danger' ? 'btn-danger' : 'btn-secondary'}`}
            style={{ justifyContent: 'center', fontSize: 12 }}
            disabled={loading}
            onClick={() => setPending(btn)}
          >
            {loading ? <Loader2 size={13} className="spin" /> : btn.label}
          </button>
        ))}
      </div>

      {pending && (
        <ConfirmActionModal
          title={pending.label}
          message={pending.confirmMsg}
          confirmLabel={pending.label}
          danger={pending.style === 'danger'}
          onConfirm={() => onAction(pending.action, pending.successMsg)}
          onClose={() => setPending(null)}
        />
      )}
    </>
  )
}
