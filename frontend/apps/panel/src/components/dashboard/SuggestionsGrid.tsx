import type { SuggestionDTO } from '@ubes/types'
import SuggestionCard from './SuggestionCard'

interface Props {
  suggestions: SuggestionDTO[]
}

export default function SuggestionsGrid({ suggestions }: Props) {
  if (suggestions.length === 0) {
    return (
      <div className="last-post-placeholder">
        Sin sugerencias publicadas todavía.
      </div>
    )
  }

  return (
    <div className="suggestions-grid">
      {suggestions.slice(0, 8).map(s => (
        <SuggestionCard key={s.id} suggestion={s} />
      ))}
    </div>
  )
}
