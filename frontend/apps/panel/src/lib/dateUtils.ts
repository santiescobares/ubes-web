import { format, formatDistanceStrict, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import type { CompetitionDTO } from '@ubes/types'

export function formatDateTime(value: string | null | undefined): string {
  if (!value) return '—'
  try {
    return format(parseISO(value), 'dd-MM-yyyy hh:mm a', { locale: es })
  } catch {
    return '—'
  }
}

export function formatTimeRemaining(competition: CompetitionDTO): string {
  if (competition.status === 'FINISHED') {
    return `Finalizó el ${formatDateTime(competition.endingDate ?? competition.startingDate)}`
  }
  const now = new Date()
  const start = parseISO(competition.startingDate)
  if (now < start) {
    return `Comienza en ${formatDistanceStrict(now, start, { locale: es })}`
  }
  if (competition.endingDate) {
    const end = parseISO(competition.endingDate)
    if (now < end) {
      return `Finaliza en ${formatDistanceStrict(now, end, { locale: es })}`
    }
  }
  return '—'
}

export function toLocalDateTimeString(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}

export function formatEventHourRange(start: string, end: string): string {
  try {
    const fmt = (iso: string) =>
      format(parseISO(iso), 'h:mm a', { locale: es }).toUpperCase().replace(/\./g, '')
    const s = fmt(start)
    const e = fmt(end)
    return s === e ? s : `${s} – ${e}`
  } catch {
    return '—'
  }
}

export function formatSelectedDayHeader(date: Date): string {
  try {
    return format(date, "EEEE, d 'de' MMMM yyyy", { locale: es })
  } catch {
    return '—'
  }
}
