import { useState, useRef, useCallback, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { SuggestionDTO } from '@ubes/types'
import SuggestionCard from './SuggestionCard'

const GAP = 12

interface Props {
  suggestions: SuggestionDTO[]
}

export default function SuggestionsCarousel({ suggestions }: Props) {
  const [index, setIndex] = useState(0)
  const firstCardRef = useRef<HTMLDivElement>(null)

  const visibleCount = useVisibleCount()
  const maxIndex = Math.max(0, suggestions.length - visibleCount)

  // Reset index when viewport shrinks and current index is out of bounds
  useEffect(() => {
    setIndex(i => Math.min(i, Math.max(0, suggestions.length - visibleCount)))
  }, [visibleCount, suggestions.length])

  function getStep(): number {
    return firstCardRef.current ? firstCardRef.current.offsetWidth + GAP : 0
  }

  const offset = index * getStep()

  if (suggestions.length === 0) {
    return (
      <div className="last-post-placeholder">
        Sin sugerencias publicadas todavía.
      </div>
    )
  }

  return (
    <div className="suggestions-carousel">
      {index > 0 && (
        <button
          className="carousel-arrow carousel-arrow-left"
          onClick={() => setIndex(i => Math.max(0, i - 1))}
          aria-label="Anterior"
        >
          <ChevronLeft size={16} />
        </button>
      )}

      <div
        className="suggestions-track"
        style={{ transform: `translateX(-${offset}px)` }}
      >
        {suggestions.map((s, i) => (
          <div key={s.id} ref={i === 0 ? firstCardRef : undefined}>
            <SuggestionCard suggestion={s} />
          </div>
        ))}
      </div>

      {index < maxIndex && (
        <button
          className="carousel-arrow carousel-arrow-right"
          onClick={() => setIndex(i => Math.min(maxIndex, i + 1))}
          aria-label="Siguiente"
        >
          <ChevronRight size={16} />
        </button>
      )}
    </div>
  )
}

function useVisibleCount(): number {
  const getCount = useCallback(() => {
    if (window.innerWidth <= 600) return 1
    if (window.innerWidth <= 1024) return 2
    return 4
  }, [])

  const [count, setCount] = useState(getCount)

  useEffect(() => {
    function onResize() { setCount(getCount()) }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [getCount])

  return count
}
