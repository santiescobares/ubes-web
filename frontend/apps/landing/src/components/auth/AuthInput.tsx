interface AuthInputProps {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  error?: string
  required?: boolean
  maxLength?: number
  autoComplete?: string
  disabled?: boolean
  onBlur?: () => void
}

export default function AuthInput({ id, label, value, onChange, error, required, maxLength, autoComplete, disabled, onBlur }: AuthInputProps) {
  return (
    <div className="auth-field">
      <label className="auth-field-label" htmlFor={id}>
        {label}
        {required && <span className="auth-field-required" aria-hidden="true"> *</span>}
      </label>
      <input
        id={id}
        className={`auth-field-input${error ? ' auth-field-input--error' : ''}${disabled ? ' auth-field-input--disabled' : ''}`}
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        maxLength={maxLength}
        autoComplete={autoComplete}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        disabled={disabled}
        readOnly={disabled}
        onBlur={onBlur}
      />
      {error && (
        <span id={`${id}-error`} className="auth-field-error" role="alert">
          {error}
        </span>
      )}
    </div>
  )
}
