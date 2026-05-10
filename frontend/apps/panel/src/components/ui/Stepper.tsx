interface StepperProps {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  disabled?: boolean
}

export default function Stepper({ value, onChange, min = 0, max = 999, disabled }: StepperProps) {
  return (
    <div className="flex items-center">
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={disabled || value <= min}
        className="w-8 h-9 flex items-center justify-center border border-gray-300 rounded-l-md bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed text-gray-600 text-lg leading-none"
      >
        −
      </button>
      <input
        type="number"
        value={value}
        onChange={(e) => {
          const v = parseInt(e.target.value, 10)
          if (!isNaN(v)) onChange(Math.min(max, Math.max(min, v)))
        }}
        disabled={disabled}
        className="w-16 h-9 text-center border-t border-b border-gray-300 text-sm disabled:bg-gray-50 disabled:text-gray-400 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none focus:outline-none focus:ring-1 focus:ring-blue-500 focus:z-10"
      />
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={disabled || value >= max}
        className="w-8 h-9 flex items-center justify-center border border-gray-300 rounded-r-md bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed text-gray-600 text-lg leading-none"
      >
        +
      </button>
    </div>
  )
}
