import { useEffect, useRef, useState } from 'react'

interface CarouselItem {
  x: number
  y: number
}

export function useCarousel(itemCount: number, radius: number, autoRotateMs = 90000) {
  const [rotation, setRotation] = useState(0)
  const animationRef = useRef<number | null>(null)
  const lastTimeRef = useRef<number | null>(null)

  useEffect(() => {
    const fullCircleMs = autoRotateMs

    const step = (timestamp: number) => {
      if (lastTimeRef.current === null) lastTimeRef.current = timestamp
      const elapsed = timestamp - lastTimeRef.current
      lastTimeRef.current = timestamp

      setRotation((prev) => (prev + (elapsed / fullCircleMs) * 2 * Math.PI) % (2 * Math.PI))
      animationRef.current = requestAnimationFrame(step)
    }

    animationRef.current = requestAnimationFrame(step)
    return () => {
      if (animationRef.current !== null) cancelAnimationFrame(animationRef.current)
    }
  }, [autoRotateMs])

  const getItemPosition = (index: number): CarouselItem => {
    const baseAngle = (index / itemCount) * 2 * Math.PI
    const angle = baseAngle + rotation
    return {
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius,
    }
  }

  return { getItemPosition }
}
