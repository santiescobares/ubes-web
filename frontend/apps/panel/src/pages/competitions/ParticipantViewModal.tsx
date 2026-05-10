import { Pencil, X, ExternalLink } from 'lucide-react'
import { SCHOOL_LABEL, PARTICIPANT_ROLE_LABEL, ID_TYPE_LABEL } from '@/lib/labels'
import type { ParticipantDTO } from '@ubes/types'

interface Props {
  participant: ParticipantDTO
  requiresShirtNumbers: boolean
  onEdit: () => void
  onClose: () => void
}

interface FieldProps {
  label: string
  value: React.ReactNode
}

function Field({ label, value }: FieldProps) {
  return (
    <div>
      <dt className="text-xs text-gray-400 mb-0.5">{label}</dt>
      <dd className="text-sm text-gray-900">{value}</dd>
    </div>
  )
}

export default function ParticipantViewModal({ participant, requiresShirtNumbers, onEdit, onClose }: Props) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-900">Información de Participante</h2>
          <div className="flex items-center gap-1">
            <button
              onClick={onEdit}
              title="Editar"
              className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
            >
              <Pencil size={15} />
            </button>
            <button
              onClick={onClose}
              title="Cerrar"
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Body */}
        <dl className="px-6 py-5 grid grid-cols-2 gap-x-6 gap-y-4">
          <Field label="Nombre" value={participant.firstName} />
          <Field label="Apellido" value={participant.lastName} />
          <Field label="Tipo de documento" value={ID_TYPE_LABEL[participant.idType]} />
          <Field label="Nº Documento" value={participant.idNumber} />
          <Field label="Escuela" value={SCHOOL_LABEL[participant.school]} />
          <Field label="Rol" value={PARTICIPANT_ROLE_LABEL[participant.role]} />
          {requiresShirtNumbers && (
            <Field label="Nº Camiseta" value={participant.shirtNumber || '—'} />
          )}
        </dl>

        {/* Certificates */}
        <div className="px-6 pb-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">Cert. Alumno Reg.</span>
            {participant.studentCertificateURL ? (
              <a
                href={participant.studentCertificateURL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-blue-600 hover:underline"
              >
                Ver <ExternalLink size={11} />
              </a>
            ) : (
              <span className="text-xs text-gray-300">Vacío</span>
            )}
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">Ficha Médica</span>
            {participant.medicalCertificateURL ? (
              <a
                href={participant.medicalCertificateURL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-blue-600 hover:underline"
              >
                Ver <ExternalLink size={11} />
              </a>
            ) : (
              <span className="text-xs text-gray-300">Vacío</span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
