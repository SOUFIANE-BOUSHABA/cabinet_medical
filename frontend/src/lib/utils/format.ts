import type { components } from '@/types/api'

type LocalTime = components['schemas']['LocalTime']
export type LocalTimeValue = LocalTime | string

export function formatTime(time?: LocalTimeValue) {
  if (!time) return '—'
  if (typeof time === 'string') return time.slice(0, 5)
  return `${String(time.hour ?? 0).padStart(2, '0')}:${String(
    time.minute ?? 0,
  ).padStart(2, '0')}`
}

export function parseTime(value: string): LocalTime {
  const [hour = 0, minute = 0] = value.split(':').map(Number)
  return { hour, minute, second: 0, nano: 0 }
}

export function serializeTime(value: string) {
  const [hour = 0, minute = 0, second = 0] = value.split(':').map(Number)
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(
    2,
    '0',
  )}:${String(second).padStart(2, '0')}`
}

export function formatDate(value?: string) {
  if (!value) return '—'
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(`${value}T00:00:00`))
}

export function formatDateTime(value?: string) {
  if (!value) return '—'
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

export function valueOrDash(value?: string | number | null) {
  if (typeof value === 'number') return String(value)
  return value?.trim() || '—'
}
