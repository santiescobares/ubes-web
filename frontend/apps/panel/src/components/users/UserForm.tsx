import { Copy } from 'lucide-react'
import { toast } from 'sonner'
import { School, Role } from '@ubes/types'
import { SCHOOL_LABELS, ROLE_LABELS, ASSIGNABLE_ROLES } from '@/lib/userLabels'

export interface UserFormState {
  firstName: string
  lastName: string
  school: string
  role: string
}

export interface UserFormErrors {
  firstName?: string
  lastName?: string
  school?: string
  role?: string
}

export function validateUserForm(form: UserFormState): UserFormErrors {
  const errors: UserFormErrors = {}
  if (!form.firstName.trim()) errors.firstName = 'El nombre es requerido'
  else if (form.firstName.trim().length < 3 || form.firstName.trim().length > 30)
    errors.firstName = 'Entre 3 y 30 caracteres'
  if (!form.lastName.trim()) errors.lastName = 'El apellido es requerido'
  else if (form.lastName.trim().length < 3 || form.lastName.trim().length > 30)
    errors.lastName = 'Entre 3 y 30 caracteres'
  if (!form.school) errors.school = 'La escuela es requerida'
  if (!form.role || !ASSIGNABLE_ROLES.includes(form.role as Role))
    errors.role = 'El rol es requerido'
  return errors
}

interface Props {
  form: UserFormState
  errors: UserFormErrors
  email: string
  disabled?: boolean
  onChange: (patch: Partial<UserFormState>) => void
}

export default function UserForm({ form, errors, email, disabled, onChange }: Props) {
  function copyEmail() {
    navigator.clipboard.writeText(email)
    toast.success('Email copiado')
  }

  const isNonAssignableRole = !!form.role && !ASSIGNABLE_ROLES.includes(form.role as Role)

  return (
    <div className="form-grid">
      <div className="form-row">
        <div className="form-field">
          <label className="form-label">Nombre</label>
          <input
            className={`form-input${errors.firstName ? ' error' : ''}`}
            type="text"
            value={form.firstName}
            onChange={(e) => onChange({ firstName: e.target.value })}
            maxLength={30}
            disabled={disabled}
          />
          {errors.firstName && <span className="form-error">{errors.firstName}</span>}
        </div>

        <div className="form-field">
          <label className="form-label">Apellido</label>
          <input
            className={`form-input${errors.lastName ? ' error' : ''}`}
            type="text"
            value={form.lastName}
            onChange={(e) => onChange({ lastName: e.target.value })}
            maxLength={30}
            disabled={disabled}
          />
          {errors.lastName && <span className="form-error">{errors.lastName}</span>}
        </div>
      </div>

      <div className="form-field">
        <label className="form-label">Email</label>
        <div className="email-field-wrapper">
          <input
            className="form-input"
            type="text"
            value={email}
            disabled
            style={{ paddingRight: 36, color: 'var(--muted)', background: 'rgba(0,0,0,0.025)' }}
          />
          <button
            type="button"
            className="btn btn-ghost"
            style={{ position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)', padding: '2px 6px' }}
            onClick={copyEmail}
            title="Copiar email"
          >
            <Copy size={12} />
          </button>
        </div>
      </div>

      <div className="form-row">
        <div className="form-field">
          <label className="form-label">Escuela</label>
          <select
            className={`form-select${errors.school ? ' error' : ''}`}
            value={form.school}
            onChange={(e) => onChange({ school: e.target.value })}
            disabled={disabled}
          >
            {Object.entries(School).map(([key]) => (
              <option key={key} value={key}>
                {SCHOOL_LABELS[key as keyof typeof SCHOOL_LABELS] ?? key}
              </option>
            ))}
          </select>
          {errors.school && <span className="form-error">{errors.school}</span>}
        </div>

        <div className="form-field">
          <label className="form-label">Rol</label>
          <select
            className={`form-select${errors.role ? ' error' : ''}`}
            value={form.role}
            onChange={(e) => onChange({ role: e.target.value })}
            disabled={disabled}
          >
            {isNonAssignableRole && (
              <option value={form.role} disabled>
                {ROLE_LABELS[form.role as Role] ?? form.role}
              </option>
            )}
            {ASSIGNABLE_ROLES.map((r) => (
              <option key={r} value={r}>
                {ROLE_LABELS[r] ?? r}
              </option>
            ))}
          </select>
          {errors.role && <span className="form-error">{errors.role}</span>}
        </div>
      </div>
    </div>
  )
}
