import type { DayKey } from './types'
import { DAY_ORDER } from './data/workouts'

export function todayISO(): string {
  return new Date().toISOString().split('T')[0]
}

export function dayKeyFromDate(date: Date): DayKey {
  const days: DayKey[] = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']
  return days[date.getDay()]
}

export function isoToDate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function formatDate(iso: string): string {
  const d = isoToDate(iso)
  return d.toLocaleDateString('en-GB', { weekday: 'short', month: 'short', day: 'numeric' })
}

export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) return `${h}h ${m}m`
  if (m > 0) return `${m}m ${s}s`
  return `${s}s`
}

export function getWeekDates(referenceDate: Date = new Date()): Array<{ iso: string; day: DayKey }> {
  const dayOfWeek = referenceDate.getDay()
  const monday = new Date(referenceDate)
  monday.setDate(referenceDate.getDate() - ((dayOfWeek + 6) % 7))
  return DAY_ORDER.map((day, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return { iso: d.toISOString().split('T')[0], day }
  })
}

export function getMondayOfWeek(date: Date): string {
  const d = new Date(date)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  return d.toISOString().split('T')[0]
}

export function progressPercent(startDate: string, targetDate: string): number {
  const start = isoToDate(startDate).getTime()
  const end = isoToDate(targetDate).getTime()
  const now = Date.now()
  return Math.min(100, Math.max(0, Math.round(((now - start) / (end - start)) * 100)))
}

export function weeksElapsed(startDate: string): number {
  const start = isoToDate(startDate).getTime()
  return Math.floor((Date.now() - start) / (7 * 24 * 3600 * 1000))
}

export function totalWeeks(startDate: string, targetDate: string): number {
  const start = isoToDate(startDate).getTime()
  const end = isoToDate(targetDate).getTime()
  return Math.ceil((end - start) / (7 * 24 * 3600 * 1000))
}

export function vibrate(pattern: number | number[]) {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    navigator.vibrate(pattern)
  }
}
