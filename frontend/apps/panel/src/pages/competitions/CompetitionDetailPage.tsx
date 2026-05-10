import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Trash2, Upload } from 'lucide-react'
import ParticipantsTab from './ParticipantsTab'
import ResultsTab from './ResultsTab'
import competitionService from '@/services/competitionService'
import Stepper from '@/components/ui/Stepper'
import {
  COMPETITION_STATUS_LABEL,
  COMPETITION_STATUS_COLOR,
  REGISTRATION_STATUS_LABEL,
} from '@/lib/labels'
import type { CompetitionDTO, CompetitionUpdateDTO } from '@ubes/types'

// Converts LocalDateTime string "2025-01-01T10:00:00" to datetime-local value "2025-01-01T10:00"
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

export default function CompetitionDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [competition, setCompetition] = useState<CompetitionDTO | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [form, setForm] = useState<FormState | null>(null)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState(false)

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
        setBannerPreview(c.bannerURL)
      })
      .catch(() => setLoadError('No se pudo cargar la competencia.'))
      .finally(() => setLoading(false))
  }, [id])

  const isEditable =
    competition?.status === 'SCHEDULED' && competition?.registrationStatus !== 'AVAILABLE'

  function handleBannerChange(file: File) {
    setBannerFile(file)
    setRemoveBanner(false)
    const url = URL.createObjectURL(file)
    setBannerPreview(url)
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
    setSaveError(null)
    setSaveSuccess(false)
    try {
      const dto: CompetitionUpdateDTO = {
        name: form.name,
        description: form.description,
        startingDate: form.startingDate || undefined,
        endingDate: form.endingDate || undefined,
        location: {
          name: form.locationName,
          address: form.locationAddress || null,
        },
        minParticipants: form.minParticipants,
        maxParticipants: form.maxParticipants,
        maxCoaches: form.maxCoaches,
        requiresShirtNumbers: form.requiresShirtNumbers,
        requiresMedicalCertificates: form.requiresMedicalCertificates,
      }
      const updated = await competitionService.update(
        id,
        dto,
        bannerFile,
        regulationFile,
        removeBanner,
        removeRegulation,
      )
      setCompetition(updated)
      setForm(competitionToForm(updated))
      setBannerFile(null)
      setRegulationFile(null)
      setRemoveBanner(false)
      setRemoveRegulation(false)
      setBannerPreview(updated.bannerURL)
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      setSaveError(msg ?? 'Error al guardar los cambios.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full py-32 text-gray-400 text-sm">
        Cargando...
      </div>
    )
  }

  if (loadError || !competition || !form) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-32 gap-3">
        <p className="text-gray-500 text-sm">{loadError ?? 'Competencia no encontrada.'}</p>
        <button
          onClick={() => navigate('/competitions')}
          className="text-blue-600 text-sm hover:underline"
        >
          Volver al listado
        </button>
      </div>
    )
  }

  const showResults = competition.status === 'FINISHED'
  const visibleTabs: Tab[] = showResults ? [...TABS] : ['Información', 'Participantes']

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Left column — info */}
      <div className="w-[420px] shrink-0 border-r border-gray-200 bg-white flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between shrink-0">
          <div>
            <button
              onClick={() => navigate('/competitions')}
              className="text-xs text-gray-400 hover:text-gray-600 mb-1 block"
            >
              ← Competencias
            </button>
            <h1 className="text-base font-semibold text-gray-900 leading-tight line-clamp-1">
              {competition.name}
            </h1>
          </div>
          <span
            className={`shrink-0 ml-3 inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${COMPETITION_STATUS_COLOR[competition.status]}`}
          >
            {COMPETITION_STATUS_LABEL[competition.status]}
          </span>
        </div>

        {/* Scrollable form body */}
        <div className="flex-1 overflow-y-auto">
          <form id="info-form" onSubmit={handleSave} className="p-6 space-y-5">
            {/* Nombre */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Nombre</label>
              <input
                type="text"
                required
                disabled={!isEditable}
                value={form.name}
                onChange={(e) => setForm((f) => f && { ...f, name: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-400"
              />
            </div>

            {/* Descripción */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Descripción</label>
              <textarea
                required
                rows={3}
                disabled={!isEditable}
                value={form.description}
                onChange={(e) => setForm((f) => f && { ...f, description: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-400 resize-none"
              />
            </div>

            {/* Fechas competencia */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Inicio</label>
                <input
                  type="datetime-local"
                  disabled={!isEditable}
                  value={form.startingDate}
                  onChange={(e) => setForm((f) => f && { ...f, startingDate: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-400"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Fin</label>
                <input
                  type="datetime-local"
                  disabled={!isEditable}
                  value={form.endingDate}
                  onChange={(e) => setForm((f) => f && { ...f, endingDate: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-400"
                />
              </div>
            </div>

            {/* Participantes */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Mín. part.</label>
                <Stepper
                  value={form.minParticipants}
                  onChange={(v) =>
                    setForm((f) =>
                      f
                        ? {
                            ...f,
                            minParticipants: v,
                            maxParticipants: Math.max(f.maxParticipants, v),
                          }
                        : f,
                    )
                  }
                  min={1}
                  max={form.maxParticipants}
                  disabled={!isEditable}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Máx. part.</label>
                <Stepper
                  value={form.maxParticipants}
                  onChange={(v) =>
                    setForm((f) =>
                      f
                        ? {
                            ...f,
                            maxParticipants: v,
                            minParticipants: Math.min(f.minParticipants, v),
                          }
                        : f,
                    )
                  }
                  min={form.minParticipants}
                  disabled={!isEditable}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Máx. entren.</label>
                <Stepper
                  value={form.maxCoaches}
                  onChange={(v) => setForm((f) => f && { ...f, maxCoaches: v })}
                  min={0}
                  max={99}
                  disabled={!isEditable}
                />
              </div>
            </div>

            {/* Checkboxes */}
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  disabled={!isEditable}
                  checked={form.requiresShirtNumbers}
                  onChange={(e) =>
                    setForm((f) => f && { ...f, requiresShirtNumbers: e.target.checked })
                  }
                  className="rounded"
                />
                Requiere número de camiseta
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  disabled={!isEditable}
                  checked={form.requiresMedicalCertificates}
                  onChange={(e) =>
                    setForm((f) => f && { ...f, requiresMedicalCertificates: e.target.checked })
                  }
                  className="rounded"
                />
                Requiere certificados médicos
              </label>
            </div>

            {/* Inscripción */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-gray-600">Inscripción</label>
                <span className="text-xs text-gray-400">
                  {REGISTRATION_STATUS_LABEL[competition.registrationStatus]}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Apertura</label>
                  <input
                    type="datetime-local"
                    disabled={!isEditable}
                    value={form.registrationStartingDate}
                    onChange={(e) =>
                      setForm((f) => f && { ...f, registrationStartingDate: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Cierre</label>
                  <input
                    type="datetime-local"
                    disabled={!isEditable}
                    value={form.registrationEndingDate}
                    onChange={(e) =>
                      setForm((f) => f && { ...f, registrationEndingDate: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-400"
                  />
                </div>
              </div>
            </div>

            {/* Ubicación */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Ubicación</label>
              <input
                type="text"
                placeholder="Nombre del lugar"
                disabled={!isEditable}
                value={form.locationName}
                onChange={(e) => setForm((f) => f && { ...f, locationName: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-400"
              />
              <input
                type="text"
                placeholder="Dirección (opcional)"
                disabled={!isEditable}
                value={form.locationAddress}
                onChange={(e) => setForm((f) => f && { ...f, locationAddress: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-400"
              />
            </div>

            {/* Banner */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">Banner</label>
              {bannerPreview ? (
                <div className="relative rounded-xl overflow-hidden border border-gray-200">
                  <img
                    src={bannerPreview}
                    alt="Banner"
                    className="w-full h-32 object-cover"
                  />
                  {isEditable && (
                    <div className="absolute top-2 right-2 flex gap-1">
                      <button
                        type="button"
                        onClick={() => bannerInputRef.current?.click()}
                        title="Cambiar banner"
                        className="p-1.5 bg-white/90 rounded-lg shadow hover:bg-white transition-colors"
                      >
                        <Upload size={14} className="text-gray-600" />
                      </button>
                      <button
                        type="button"
                        onClick={handleRemoveBanner}
                        title="Eliminar banner"
                        className="p-1.5 bg-white/90 rounded-lg shadow hover:bg-white transition-colors"
                      >
                        <Trash2 size={14} className="text-red-500" />
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                isEditable && (
                  <button
                    type="button"
                    onClick={() => bannerInputRef.current?.click()}
                    className="w-full h-24 border-2 border-dashed border-gray-300 rounded-xl text-xs text-gray-400 hover:bg-gray-50 hover:border-gray-400 transition-colors flex items-center justify-center gap-2"
                  >
                    <Upload size={16} />
                    Subir banner
                  </button>
                )
              )}
              <input
                ref={bannerInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleBannerChange(file)
                }}
              />
            </div>

            {/* Reglamento */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">Reglamento</label>
              {competition.regulationDocument ? (
                <div className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg">
                  <span className="text-xs text-gray-700 truncate mr-2">
                    {competition.regulationDocument.name}
                  </span>
                  {isEditable && (
                    <div className="flex gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => regulationInputRef.current?.click()}
                        title="Reemplazar"
                        className="p-1 hover:text-blue-600 text-gray-400"
                      >
                        <Upload size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setRemoveRegulation(true)
                          setRegulationFile(null)
                        }}
                        title="Eliminar"
                        className="p-1 hover:text-red-500 text-gray-400"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  )}
                </div>
              ) : regulationFile ? (
                <div className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg">
                  <span className="text-xs text-gray-700 truncate">{regulationFile.name}</span>
                  {isEditable && (
                    <button
                      type="button"
                      onClick={() => setRegulationFile(null)}
                      className="p-1 hover:text-red-500 text-gray-400 shrink-0"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              ) : (
                isEditable && (
                  <button
                    type="button"
                    onClick={() => regulationInputRef.current?.click()}
                    className="w-full border border-dashed border-gray-300 rounded-lg px-3 py-2 text-xs text-gray-400 hover:bg-gray-50 text-left"
                  >
                    Seleccionar PDF/DOC...
                  </button>
                )
              )}
              <input
                ref={regulationInputRef}
                type="file"
                accept=".pdf,.doc,.docx"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    setRegulationFile(file)
                    setRemoveRegulation(false)
                  }
                }}
              />
            </div>
          </form>
        </div>

        {/* Save footer */}
        <div className="shrink-0 px-6 py-4 border-t border-gray-100 bg-white">
          {saveError && (
            <p className="text-xs text-red-600 mb-2">{saveError}</p>
          )}
          {saveSuccess && (
            <p className="text-xs text-green-600 mb-2">Cambios guardados correctamente.</p>
          )}
          {!isEditable && (
            <p className="text-xs text-gray-400 mb-2">
              La competencia no se puede editar en el estado actual.
            </p>
          )}
          <button
            type="submit"
            form="info-form"
            disabled={!isEditable || saving}
            className="w-full py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>

      {/* Right column — tabs */}
      <div className="flex-1 min-w-0 flex flex-col overflow-hidden bg-gray-50">
        {/* Tab bar */}
        <div className="bg-white border-b border-gray-200 px-6 flex gap-0 shrink-0">
          {visibleTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab
                  ? 'border-blue-600 text-blue-700'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-auto p-6">
          {activeTab === 'Información' && (
            <div className="text-sm text-gray-500">
              Selecciona un campo en el panel izquierdo para editar la información de la competencia.
            </div>
          )}
          {activeTab === 'Participantes' && (
            <ParticipantsTab
              competitionId={id!}
              requiresShirtNumbers={competition.requiresShirtNumbers}
              requiresMedicalCertificates={competition.requiresMedicalCertificates}
            />
          )}
          {activeTab === 'Resultados' && (
            <ResultsTab competitionId={id!} />
          )}
        </div>
      </div>
    </div>
  )
}
