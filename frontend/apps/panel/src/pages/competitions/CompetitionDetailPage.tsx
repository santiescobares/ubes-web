import { useEffect, useRef, useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { ChevronRight, Upload, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import ParticipantsTab from './ParticipantsTab'
import ResultsTab from './ResultsTab'
import competitionService from '@/services/competitionService'
import Stepper from '@/components/ui/Stepper'
import { COMPETITION_STATUS_LABELS, REGISTRATION_STATUS_LABELS } from '@/lib/labels'
import type { CompetitionDTO, CompetitionUpdateDTO } from '@ubes/types'

function toInputDate(value: string | null | undefined): string {
  if (!value) return ''
  return value.slice(0, 16)
}

interface FormState {
  name: string
  description: string
  startingDate: string
  endingDate: string
  locationName: string
  locationAddress: string
  minParticipants: number
  maxParticipants: number
  maxCoaches: number
  requiresShirtNumbers: boolean
  requiresMedicalCertificates: boolean
  registrationStartingDate: string
  registrationEndingDate: string
}

function competitionToForm(c: CompetitionDTO): FormState {
  return {
    name: c.name,
    description: c.description,
    startingDate: toInputDate(c.startingDate),
    endingDate: toInputDate(c.endingDate),
    locationName: c.location?.name ?? '',
    locationAddress: c.location?.address ?? '',
    minParticipants: c.minParticipants,
    maxParticipants: c.maxParticipants,
    maxCoaches: c.maxCoaches,
    requiresShirtNumbers: c.requiresShirtNumbers,
    requiresMedicalCertificates: c.requiresMedicalCertificates,
    registrationStartingDate: toInputDate(c.registrationStartingDate),
    registrationEndingDate: toInputDate(c.registrationEndingDate),
  }
}

const TABS = ['Información', 'Participantes', 'Resultados'] as const
type Tab = (typeof TABS)[number]

const STATUS_COLORS: Record<string, string> = {
  SCHEDULED: 'bg-blue-100 text-blue-700',
  ON_GOING:  'bg-green-100 text-green-700',
  FINISHED:  'bg-violet-100 text-violet-700',
  CANCELED:  'bg-red-100 text-red-700',
}

export default function CompetitionDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [competition, setCompetition] = useState<CompetitionDTO | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [form, setForm] = useState<FormState | null>(null)
  const [saving, setSaving] = useState(false)

  const [bannerFile, setBannerFile] = useState<File | null>(null)
  const [bannerPreview, setBannerPreview] = useState<string | null>(null)
  const [removeBanner, setRemoveBanner] = useState(false)
  const [regulationFile, setRegulationFile] = useState<File | null>(null)
  const [removeRegulation, setRemoveRegulation] = useState(false)

  const [activeTab, setActiveTab] = useState<Tab>('Información')

  const bannerInputRef = useRef<HTMLInputElement>(null)
  const regulationInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    setLoadError(null)
    competitionService
      .get(id)
      .then((c) => {
        setCompetition(c)
        setForm(competitionToForm(c))
        setBannerPreview(c.bannerURL ?? null)
      })
      .catch(() => setLoadError('No se pudo cargar la competencia.'))
      .finally(() => setLoading(false))
  }, [id])

  const isEditable =
    competition?.status === 'SCHEDULED' && competition?.registrationStatus !== 'AVAILABLE'

  function handleBannerChange(file: File) {
    setBannerFile(file)
    setRemoveBanner(false)
    setBannerPreview(URL.createObjectURL(file))
  }

  function handleRemoveBanner() {
    setBannerFile(null)
    setBannerPreview(null)
    setRemoveBanner(true)
    if (bannerInputRef.current) bannerInputRef.current.value = ''
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!form || !id) return
    setSaving(true)
    try {
      const dto: CompetitionUpdateDTO = {
        name: form.name,
        description: form.description,
        startingDate: form.startingDate || undefined,
        endingDate: form.endingDate || undefined,
        location: { name: form.locationName, address: form.locationAddress || null },
        minParticipants: form.minParticipants,
        maxParticipants: form.maxParticipants,
        maxCoaches: form.maxCoaches,
        requiresShirtNumbers: form.requiresShirtNumbers,
        requiresMedicalCertificates: form.requiresMedicalCertificates,
      }
      const updated = await competitionService.update(
        id, dto, bannerFile, regulationFile, removeBanner, removeRegulation,
      )
      setCompetition(updated)
      setForm(competitionToForm(updated))
      setBannerFile(null)
      setRegulationFile(null)
      setRemoveBanner(false)
      setRemoveRegulation(false)
      setBannerPreview(updated.bannerURL ?? null)
      toast.success('Cambios guardados')
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(msg ?? 'Error al guardar los cambios.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="detail-loading">Cargando...</div>

  if (loadError || !competition || !form) {
    return (
      <div className="detail-loading" style={{ flexDirection: 'column', gap: 12 }}>
        <p>{loadError ?? 'Competencia no encontrada.'}</p>
        <button className="btn btn-secondary" onClick={() => navigate('/panel/competencias')}>
          Volver al listado
        </button>
      </div>
    )
  }

  const showResults = competition.status === 'FINISHED'
  const visibleTabs: Tab[] = showResults ? [...TABS] : ['Información', 'Participantes']

  return (
    <div className="detail-page">
      {/* ── Left column ── */}
      <div className="detail-left">
        {/* Header */}
        <div className="detail-left-header">
          <div style={{ minWidth: 0 }}>
            <div className="breadcrumb" style={{ padding: 0, border: 'none', background: 'none', marginBottom: 6 }}>
              <Link to="/panel/competencias" className="breadcrumb-link">Competencias</Link>
              <ChevronRight size={12} className="breadcrumb-sep" />
              <span className="breadcrumb-current" style={{ fontSize: 11 }}>Detalle</span>
            </div>
            <div className="detail-left-name">{competition.name}</div>
          </div>
          <span className={`status-pill ${STATUS_COLORS[competition.status]}`} style={{ flexShrink: 0 }}>
            {COMPETITION_STATUS_LABELS[competition.status]}
          </span>
        </div>

        {/* Form */}
        <form id="info-form" onSubmit={handleSave} className="form-grid" style={{ marginTop: 4 }}>
          <div className="form-field">
            <label className="form-label">Nombre</label>
            <input className="form-input" type="text" required disabled={!isEditable}
              value={form.name} onChange={(e) => setForm((f) => f && { ...f, name: e.target.value })} />
          </div>

          <div className="form-field">
            <label className="form-label">Descripción</label>
            <textarea className="form-textarea" rows={3} disabled={!isEditable}
              value={form.description} onChange={(e) => setForm((f) => f && { ...f, description: e.target.value })} />
          </div>

          <div className="form-row">
            <div className="form-field">
              <label className="form-label">Inicio</label>
              <input className="form-input" type="datetime-local" disabled={!isEditable}
                value={form.startingDate} onChange={(e) => setForm((f) => f && { ...f, startingDate: e.target.value })} />
            </div>
            <div className="form-field">
              <label className="form-label">Fin</label>
              <input className="form-input" type="datetime-local" disabled={!isEditable}
                value={form.endingDate} onChange={(e) => setForm((f) => f && { ...f, endingDate: e.target.value })} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            <div className="form-field">
              <label className="form-label">Mín. part.</label>
              <Stepper value={form.minParticipants} min={1} max={form.maxParticipants} disabled={!isEditable}
                onChange={(v) => setForm((f) => f ? { ...f, minParticipants: v, maxParticipants: Math.max(f.maxParticipants, v) } : f)} />
            </div>
            <div className="form-field">
              <label className="form-label">Máx. part.</label>
              <Stepper value={form.maxParticipants} min={form.minParticipants} disabled={!isEditable}
                onChange={(v) => setForm((f) => f ? { ...f, maxParticipants: v, minParticipants: Math.min(f.minParticipants, v) } : f)} />
            </div>
            <div className="form-field">
              <label className="form-label">Entren.</label>
              <Stepper value={form.maxCoaches} min={0} max={99} disabled={!isEditable}
                onChange={(v) => setForm((f) => f && { ...f, maxCoaches: v })} />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div className="toggle-row">
              <div>
                <div className="toggle-label-text">Nº camiseta</div>
              </div>
              <label className="toggle-switch">
                <input type="checkbox" disabled={!isEditable} checked={form.requiresShirtNumbers}
                  onChange={(e) => setForm((f) => f && { ...f, requiresShirtNumbers: e.target.checked })} />
                <span className="toggle-track" />
              </label>
            </div>
            <div className="toggle-row">
              <div>
                <div className="toggle-label-text">Certif. médicos</div>
              </div>
              <label className="toggle-switch">
                <input type="checkbox" disabled={!isEditable} checked={form.requiresMedicalCertificates}
                  onChange={(e) => setForm((f) => f && { ...f, requiresMedicalCertificates: e.target.checked })} />
                <span className="toggle-track" />
              </label>
            </div>
          </div>

          <div className="detail-divider" />

          <div className="form-field">
            <label className="form-label">
              Inscripción
              <span style={{ marginLeft: 8, fontWeight: 400, textTransform: 'none', letterSpacing: 0, color: 'var(--muted-light)' }}>
                — {REGISTRATION_STATUS_LABELS[competition.registrationStatus]}
              </span>
            </label>
            <div className="form-row">
              <div className="form-field">
                <label className="form-label">Apertura</label>
                <input className="form-input" type="datetime-local" disabled={!isEditable}
                  value={form.registrationStartingDate}
                  onChange={(e) => setForm((f) => f && { ...f, registrationStartingDate: e.target.value })} />
              </div>
              <div className="form-field">
                <label className="form-label">Cierre</label>
                <input className="form-input" type="datetime-local" disabled={!isEditable}
                  value={form.registrationEndingDate}
                  onChange={(e) => setForm((f) => f && { ...f, registrationEndingDate: e.target.value })} />
              </div>
            </div>
          </div>

          <div className="form-field">
            <label className="form-label">Ubicación</label>
            <input className="form-input" type="text" placeholder="Nombre del lugar" disabled={!isEditable}
              value={form.locationName} onChange={(e) => setForm((f) => f && { ...f, locationName: e.target.value })}
              style={{ marginBottom: 6 }} />
            <input className="form-input" type="text" placeholder="Dirección (opcional)" disabled={!isEditable}
              value={form.locationAddress} onChange={(e) => setForm((f) => f && { ...f, locationAddress: e.target.value })} />
          </div>

          {/* Banner */}
          <div className="form-field">
            <label className="form-label">Banner</label>
            {bannerPreview ? (
              <div style={{ position: 'relative', borderRadius: 8, overflow: 'hidden', border: '1px solid rgba(0,0,0,0.1)' }}>
                <img src={bannerPreview} alt="Banner" style={{ width: '100%', height: 100, objectFit: 'cover', display: 'block' }} />
                {isEditable && (
                  <div style={{ position: 'absolute', top: 6, right: 6, display: 'flex', gap: 4 }}>
                    <button type="button" className="action-btn" title="Cambiar" onClick={() => bannerInputRef.current?.click()}>
                      <Upload size={12} />
                    </button>
                    <button type="button" className="action-btn danger" title="Eliminar" onClick={handleRemoveBanner}>
                      <Trash2 size={12} />
                    </button>
                  </div>
                )}
              </div>
            ) : isEditable && (
              <label className="file-input-label" style={{ justifyContent: 'center', height: 64 }}>
                <input type="file" accept="image/*" ref={bannerInputRef}
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleBannerChange(f) }} />
                <Upload size={14} /> Subir banner
              </label>
            )}
          </div>

          {/* Reglamento */}
          <div className="form-field">
            <label className="form-label">Reglamento</label>
            {competition.regulationDocument && !removeRegulation ? (
              <div className="cert-row">
                <span className="cert-label">{competition.regulationDocument.name}</span>
                {isEditable && (
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button type="button" className="action-btn" title="Reemplazar" onClick={() => regulationInputRef.current?.click()}>
                      <Upload size={12} />
                    </button>
                    <button type="button" className="action-btn danger" title="Eliminar" onClick={() => setRemoveRegulation(true)}>
                      <Trash2 size={12} />
                    </button>
                  </div>
                )}
              </div>
            ) : regulationFile ? (
              <div className="cert-row">
                <span className="cert-label">{regulationFile.name}</span>
                {isEditable && (
                  <button type="button" className="action-btn danger" onClick={() => setRegulationFile(null)}>
                    <Trash2 size={12} />
                  </button>
                )}
              </div>
            ) : isEditable && (
              <label className="file-input-label">
                <input type="file" accept=".pdf,.doc,.docx" ref={regulationInputRef}
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) { setRegulationFile(f); setRemoveRegulation(false) } }} />
                Seleccionar PDF/DOC...
              </label>
            )}
          </div>
        </form>

        {/* Save footer */}
        {isEditable && (
          <div style={{ paddingTop: 12, borderTop: '1px solid rgba(0,0,0,0.07)', marginTop: 'auto' }}>
            <button type="submit" form="info-form" disabled={saving} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
              {saving ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        )}
      </div>

      {/* ── Right column ── */}
      <div className="detail-right">
        <div className="detail-tabs">
          {visibleTabs.map((tab) => (
            <button
              key={tab}
              className={`detail-tab-btn${activeTab === tab ? ' active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="detail-tab-content">
          {activeTab === 'Información' && (
            <p style={{ fontSize: 13, color: 'var(--muted)' }}>
              Editá los campos en el panel izquierdo y guardá los cambios.
            </p>
          )}
          {activeTab === 'Participantes' && (
            <ParticipantsTab
              competitionId={id!}
              requiresShirtNumbers={competition.requiresShirtNumbers}
              requiresMedicalCertificates={competition.requiresMedicalCertificates}
            />
          )}
          {activeTab === 'Resultados' && <ResultsTab competitionId={id!} />}
        </div>
      </div>
    </div>
  )
}
