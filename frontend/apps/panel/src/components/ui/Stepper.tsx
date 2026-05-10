interface StepperProps {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  disabled?: boolean
}

export default function Stepper({ value, onChange, min = 0, max = 999, disabled }: StepperProps) {
  return (
    <div className="number-stepper">
      <button
        type="button"
        className="number-stepper-btn"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={disabled || value <= min}
      >
        −
      </button>
      <span className="number-stepper-value">{value}</span>
      <button
        type="button"
        className="number-stepper-btn"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={disabled || value >= max}
      >
        +
      </button>
    </div>
  )
}
