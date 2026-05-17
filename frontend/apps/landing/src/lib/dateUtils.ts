// TIMEZONE NOTE: parseISO interprets strings without UTC offset (LocalDateTime from backend)
// as local browser time. This is correct for Argentina (UTC-3) as long as the backend
// stores and returns times in local time. If the backend ever switches to OffsetDateTime
// (UTC), dates will drift 3 hours — revisit with zonedTimeToUtc from date-fns-tz.
import { format, isSameDay, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'

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

export function formatDayMonth(iso: string): string {
  try {
    return format(parseISO(iso), 'dd-MM')
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

function formatDateTimeShort(iso: string): string {
  try {
    const dt = format(parseISO(iso), 'h:mm aa', { locale: es }).toUpperCase().replace(/\./g, '')
    return `${format(parseISO(iso), 'dd-MM')} ${dt}`
  } catch {
    return '—'
  }
}

export function formatEventTimeRangeMultiDay(start: string, end: string): string {
  try {
    const s = parseISO(start)
    const e = parseISO(end)
    if (isSameDay(s, e)) return formatEventHourRange(start, end)
    return `${formatDateTimeShort(start)} – ${formatDateTimeShort(end)}`
  } catch {
    return '—'
  }
}
