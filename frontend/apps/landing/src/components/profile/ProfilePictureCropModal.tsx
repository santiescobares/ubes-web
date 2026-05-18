import { useRef, useEffect, useCallback, useState } from 'react'
import { createPortal } from 'react-dom'
import { Check } from 'lucide-react'

const CANVAS_SIZE = 320
const OUTPUT_SIZE = 512

interface Props {
  file: File
  onConfirm: (blob: Blob) => void
  onCancel: () => void
}

export default function ProfilePictureCropModal({ file, onConfirm, onCancel }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imgRef = useRef<HTMLImageElement | null>(null)
  const baseFitRef = useRef(1)
  const zoomRef = useRef(1)
  const offsetRef = useRef({ x: 0, y: 0 })
  const dragRef = useRef<{ startX: number; startY: number; ox: number; oy: number } | null>(null)
  const [zoom, setZoom] = useState(1)

  const clampOffset = useCallback((ox: number, oy: number, z: number) => {
    const img = imgRef.current
    if (!img) return { x: ox, y: oy }
    const scale = baseFitRef.current * z
    const scaledW = img.naturalWidth * scale
    const scaledH = img.naturalHeight * scale
    return {
      x: Math.min(0, Math.max(CANVAS_SIZE - scaledW, ox)),
      y: Math.min(0, Math.max(CANVAS_SIZE - scaledH, oy)),
    }
  }, [])

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    const img = imgRef.current
    if (!canvas || !img) return
    const ctx = canvas.getContext('2d')!
    const scale = baseFitRef.current * zoomRef.current
    const { x, y } = offsetRef.current

    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE)
    ctx.drawImage(img, x, y, img.naturalWidth * scale, img.naturalHeight * scale)

    ctx.save()
    ctx.beginPath()
    ctx.rect(0, 0, CANVAS_SIZE, CANVAS_SIZE)
    ctx.arc(CANVAS_SIZE / 2, CANVAS_SIZE / 2, CANVAS_SIZE / 2 - 1, 0, Math.PI * 2, true)
    ctx.fillStyle = 'rgba(0,0,0,0.52)'
    ctx.fill('evenodd')
    ctx.restore()

    ctx.beginPath()
    ctx.arc(CANVAS_SIZE / 2, CANVAS_SIZE / 2, CANVAS_SIZE / 2 - 1, 0, Math.PI * 2)
    ctx.strokeStyle = 'rgba(255,255,255,0.75)'
    ctx.lineWidth = 2
    ctx.stroke()
  }, [])

  useEffect(() => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      imgRef.current = img
      const fit = Math.max(CANVAS_SIZE / img.naturalWidth, CANVAS_SIZE / img.naturalHeight)
      baseFitRef.current = fit
      zoomRef.current = 1
      setZoom(1)
      const scaledW = img.naturalWidth * fit
      const scaledH = img.naturalHeight * fit
      offsetRef.current = { x: (CANVAS_SIZE - scaledW) / 2, y: (CANVAS_SIZE - scaledH) / 2 }
      draw()
    }
    img.src = url
    return () => URL.revokeObjectURL(url)
  }, [file, draw])

  useEffect(() => { draw() }, [zoom, draw])

  function handleZoom(e: React.ChangeEvent<HTMLInputElement>) {
    const z = parseFloat(e.target.value)
    zoomRef.current = z
    setZoom(z)
    offsetRef.current = clampOffset(offsetRef.current.x, offsetRef.current.y, z)
    draw()
  }

  function startDrag(clientX: number, clientY: number) {
    dragRef.current = { startX: clientX, startY: clientY, ox: offsetRef.current.x, oy: offsetRef.current.y }
  }

  function moveDrag(clientX: number, clientY: number) {
    if (!dragRef.current) return
    const dx = clientX - dragRef.current.startX
    const dy = clientY - dragRef.current.startY
    offsetRef.current = clampOffset(dragRef.current.ox + dx, dragRef.current.oy + dy, zoomRef.current)
    draw()
  }

  function endDrag() { dragRef.current = null }

  function handleConfirm() {
    const img = imgRef.current
    if (!img) return
    const out = document.createElement('canvas')
    out.width = OUTPUT_SIZE
    out.height = OUTPUT_SIZE
    const ctx = out.getContext('2d')!
    ctx.beginPath()
    ctx.arc(OUTPUT_SIZE / 2, OUTPUT_SIZE / 2, OUTPUT_SIZE / 2, 0, Math.PI * 2)
    ctx.clip()
    const ratio = OUTPUT_SIZE / CANVAS_SIZE
    const scale = baseFitRef.current * zoomRef.current * ratio
    const { x, y } = offsetRef.current
    ctx.drawImage(img, x * ratio, y * ratio, img.naturalWidth * scale, img.naturalHeight * scale)
    out.toBlob(blob => { if (blob) onConfirm(blob) }, 'image/jpeg', 0.92)
  }

  return createPortal(
    <div className="crop-backdrop" onClick={onCancel}>
      <div className="crop-content" onClick={e => e.stopPropagation()}>
        <canvas
          ref={canvasRef}
          width={CANVAS_SIZE}
          height={CANVAS_SIZE}
          className="crop-canvas"
          onMouseDown={e => startDrag(e.clientX, e.clientY)}
          onMouseMove={e => moveDrag(e.clientX, e.clientY)}
          onMouseUp={endDrag}
          onMouseLeave={endDrag}
          onTouchStart={e => startDrag(e.touches[0].clientX, e.touches[0].clientY)}
          onTouchMove={e => { e.preventDefault(); moveDrag(e.touches[0].clientX, e.touches[0].clientY) }}
          onTouchEnd={endDrag}
        />
        <div className="crop-controls">
          <input
            type="range"
            min="1"
            max="3"
            step="0.01"
            value={zoom}
            onChange={handleZoom}
            className="crop-slider"
          />
          <button type="button" className="crop-confirm-btn" onClick={handleConfirm}>
            <Check size={20} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
