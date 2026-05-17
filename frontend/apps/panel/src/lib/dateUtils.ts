import { format, formatDistanceStrict, parse, parseISO, startOfDay, endOfDay, startOfMonth } from 'date-fns'
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

export function formatDocumentDateTime(value: string | null | undefined): string {
  if (!value) return '—'
  try {
    return format(parseISO(value), 'dd-MM-yyyy hh:mm a', { locale: es })
      .toUpperCase()
      .replace(/\./g, '')
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

export function formatLogDateTime(value: string | null | undefined): string {
  if (!value) return '—'
  try {
    return format(parseISO(value), 'dd-MM-yyyy hh:mm:ss a', { locale: es })
      .toUpperCase()
      .replace(/\./g, '')
  } catch {
    return '—'
  }
}

export function formatDashboardDayHeader(date: Date): string {
  try {
    const str = format(date, "EEEE, d 'de' MMMM", { locale: es })
    return str.charAt(0).toUpperCase() + str.slice(1)
  } catch {
    return '—'
  }
}

export function formatYear(date: Date): string {
  return format(date, 'yyyy')
}

export function formatCountdown(startingDate: string, endingDate: string, isActive: boolean): string {
  try {
    const now = new Date()
    if (isActive) {
      const end = parseISO(endingDate)
      return `Termina en ${formatDistanceStrict(now, end, { locale: es })}`
    }
    const start = parseISO(startingDate)
    return `Comienza en ${formatDistanceStrict(now, start, { locale: es })}`
  } catch {
    return '—'
  }
}

export function formatDayMonth(iso: string): string {
  try {
    return format(parseISO(iso), 'dd-MM')
  } catch {
    return '—'
  }
}

export { startOfMonth }

export function parseDdMmYyyyToInstantRange(input: string): { from: string; to: string } | null {
  if (!/^\d{2}-\d{2}-\d{4}$/.test(input)) return null
  try {
    const date = parse(input, 'dd-MM-yyyy', new Date())
    if (isNaN(date.getTime())) return null
    return {
      from: startOfDay(date).toISOString(),
      to: endOfDay(date).toISOString(),
    }
  } catch {
    return null
  }
}
