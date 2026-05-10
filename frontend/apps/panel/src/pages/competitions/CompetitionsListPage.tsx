import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react'
import competitionService from '@/services/competitionService'
import Stepper from '@/components/ui/Stepper'
import { COMPETITION_STATUS_LABEL, COMPETITION_STATUS_COLOR } from '@/lib/labels'
import type { CompetitionDTO, CompetitionCreateDTO } from '@ubes/types'
import type { Page } from '@/lib/types'

const EMPTY_FORM: CompetitionCreateDTO & { bannerFile?: File; regulationDocumentFile?: File } = {
  name: '',
  description: '',
  startingDate: '',
  endingDate: undefined,
  location: { name: '', address: null },
  minParticipants: 1,
  maxParticipants: 10,
  maxCoaches: 0,
  requiresShirtNumbers: false,
  requiresMedicalCertificates: false,
}

function formatDate(value: string | null | undefined): string {
  if (!value) return '—'
  return new Date(value).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export default function CompetitionsListPage() {
  const navigate = useNavigate()
  const [page, setPage] = useState<Page<CompetitionDTO> | null>(null)
  const [currentPage, setCurrentPage] = useState(0)
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ ...EMPTY_FORM })
  const [bannerFile, setBannerFile] = useState<File | null>(null)
  const [regulationFile, setRegulationFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const bannerInputRef = useRef<HTMLInputElement>(null)
  const regulationInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setLoading(true)
    competitionService
      .getAll(currentPage, 10)
      .then(setPage)
      .finally(() => setLoading(false))
  }, [currentPage])

  function openModal() {
    setForm({ ...EMPTY_FORM })
    setBannerFile(null)
    setRegulationFile(null)
    setSaveError(null)
    setShowModal(true)
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setSaveError(null)
    try {
      const dto: CompetitionCreateDTO = {
        name: form.name,
        description: form.description,
        startingDate: form.startingDate,
        endingDate: form.endingDate || undefined,
        location: form.location,
        minParticipants: form.minParticipants,
        maxParticipants: form.maxParticipants,
        maxCoaches: form.maxCoaches,
        requiresShirtNumbers: form.requiresShirtNumbers,
        requiresMedicalCertificates: form.requiresMedicalCertificates,
      }
      const created = await competitionService.create(dto, bannerFile ?? undefined, regulationFile ?? undefined)
      setShowModal(false)
      navigate(`/competitions/${created.id}`)
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      setSaveError(msg ?? 'Error al crear la competencia')
    } finally {
      setSaving(false)
    }
  }

  const competitions = page?.content ?? []

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Competencias</h1>
        <button
          onClick={openModal}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={16} />
          Nueva competencia
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400 text-sm">Cargando...</div>
      ) : competitions.length === 0 ? (
        <div className="text-center py-20 text-gray-400 text-sm">
          No hay competencias registradas.
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 font-medium text-gray-500">Nombre</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Estado</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Inicio</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Inscripción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {competitions.map((c) => (
                <tr
                  key={c.id}
                  onClick={() => navigate(`/competitions/${c.id}`)}
                  className="hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3 font-medium text-gray-900">{c.name}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${COMPETITION_STATUS_COLOR[c.status]}`}
                    >
                      {COMPETITION_STATUS_LABEL[c.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{formatDate(c.startingDate)}</td>
                  <td className="px-4 py-3 text-gray-600">{formatDate(c.registrationStartingDate)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {page && page.totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50">
              <span className="text-xs text-gray-500">
                {page.totalElements} competencias · página {page.number + 1} de {page.totalPages}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                  disabled={page.first}
                  className="p-1.5 rounded hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={() => setCurrentPage((p) => p + 1)}
                  disabled={page.last}
                  className="p-1.5 rounded hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Create modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={(e) => e.target === e.currentTarget && setShowModal(false)}
        >
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-base font-semibold text-gray-900">Nueva competencia</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 text-xl leading-none"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-6 space-y-5">
              {/* Name */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Nombre *</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Descripción *</label>
                <textarea
                  required
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Fecha de inicio *</label>
                  <input
                    type="datetime-local"
                    required
                    value={form.startingDate}
                    onChange={(e) => setForm((f) => ({ ...f, startingDate: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Fecha de fin</label>
                  <input
                    type="datetime-local"
                    value={form.endingDate ?? ''}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, endingDate: e.target.value || undefined }))
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Ubicación *</label>
                <input
                  type="text"
                  required
                  placeholder="Nombre del lugar"
                  value={form.location.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, location: { ...f.location, name: e.target.value } }))
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Participants / coaches */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Mín. participantes</label>
                  <Stepper
                    value={form.minParticipants}
                    onChange={(v) =>
                      setForm((f) => ({
                        ...f,
                        minParticipants: v,
                        maxParticipants: Math.max(f.maxParticipants, v),
                      }))
                    }
                    min={1}
                    max={form.maxParticipants}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Máx. participantes</label>
                  <Stepper
                    value={form.maxParticipants}
                    onChange={(v) =>
                      setForm((f) => ({
                        ...f,
                        maxParticipants: v,
                        minParticipants: Math.min(f.minParticipants, v),
                      }))
                    }
                    min={form.minParticipants}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Máx. entrenadores</label>
                  <Stepper
                    value={form.maxCoaches}
                    onChange={(v) => setForm((f) => ({ ...f, maxCoaches: v }))}
                    min={0}
                    max={99}
                  />
                </div>
              </div>

              {/* Checkboxes */}
              <div className="flex flex-col gap-2">
                <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={form.requiresShirtNumbers}
                    onChange={(e) => setForm((f) => ({ ...f, requiresShirtNumbers: e.target.checked }))}
                    className="rounded"
                  />
                  Requiere número de camiseta
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={form.requiresMedicalCertificates}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, requiresMedicalCertificates: e.target.checked }))
                    }
                    className="rounded"
                  />
                  Requiere certificados médicos
                </label>
              </div>

              {/* Files */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Banner (opcional)</label>
                  <input
                    ref={bannerInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => setBannerFile(e.target.files?.[0] ?? null)}
                  />
                  <button
                    type="button"
                    onClick={() => bannerInputRef.current?.click()}
                    className="w-full border border-dashed border-gray-300 rounded-lg px-3 py-2 text-xs text-gray-500 hover:bg-gray-50 text-left"
                  >
                    {bannerFile ? bannerFile.name : 'Seleccionar imagen...'}
                  </button>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Reglamento (opcional)</label>
                  <input
                    ref={regulationInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx"
                    className="hidden"
                    onChange={(e) => setRegulationFile(e.target.files?.[0] ?? null)}
                  />
                  <button
                    type="button"
                    onClick={() => regulationInputRef.current?.click()}
                    className="w-full border border-dashed border-gray-300 rounded-lg px-3 py-2 text-xs text-gray-500 hover:bg-gray-50 text-left"
                  >
                    {regulationFile ? regulationFile.name : 'Seleccionar PDF/DOC...'}
                  </button>
                </div>
              </div>

              {saveError && (
                <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  {saveError}
                </p>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {saving ? 'Creando...' : 'Crear competencia'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

