import { useRef, useEffect, useState, useCallback } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { SuggestionDTO } from '@ubes/types'
import SuggestionCard from './SuggestionCard'

interface SuggestionCarouselProps {
  suggestions: SuggestionDTO[]
  isAuthority: boolean
  onOpen: (s: SuggestionDTO) => void
}

export default function SuggestionCarousel({ suggestions, isAuthority, onOpen }: SuggestionCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [canLeft, setCanLeft] = useState(false)
  const [canRight, setCanRight] = useState(false)

  const updateArrows = useCallback(() => {
    const el = trackRef.current
    if (!el) return
    setCanLeft(el.scrollLeft > 4)
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4)
  }, [])

  useEffect(() => {
    const el = trackRef.current
    if (!el) return
    updateArrows()
    el.addEventListener('scroll', updateArrows, { passive: true })
    const ro = new ResizeObserver(updateArrows)
    ro.observe(el)
    return () => {
      el.removeEventListener('scroll', updateArrows)
      ro.disconnect()
    }
  }, [updateArrows, suggestions])

  function scrollBy(direction: 'left' | 'right') {
    const el = trackRef.current
    if (!el) return
    const card = el.querySelector('.suggestion-card') as HTMLElement | null
    if (!card) return
    const gap = 16
    const amount = card.offsetWidth + gap
    el.scrollBy({ left: direction === 'left' ? -amount : amount, behavior: 'smooth' })
  }

  return (
    <div className="suggestion-carousel">
      {canLeft && (
        <button
          className="suggestion-carousel-arrow suggestion-carousel-arrow--left"
          onClick={() => scrollBy('left')}
          aria-label="Anterior"
        >
          <ChevronLeft size={18} />
        </button>
      )}

      <div className="suggestion-carousel-track" ref={trackRef}>
        {suggestions.map(s => (
          <SuggestionCard key={s.id} suggestion={s} isAuthority={isAuthority} onOpen={onOpen} />
        ))}
      </div>

      {canRight && (
        <button
          className="suggestion-carousel-arrow suggestion-carousel-arrow--right"
          onClick={() => scrollBy('right')}
          aria-label="Siguiente"
        >
          <ChevronRight size={18} />
        </button>
      )}
    </div>
  )
}
