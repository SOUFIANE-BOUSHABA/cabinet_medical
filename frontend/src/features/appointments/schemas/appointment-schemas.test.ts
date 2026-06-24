import { describe, expect, it } from 'vitest'
import { requestAppointmentSchema } from '@/features/appointments/schemas/appointment-schemas'

describe('appointment schemas', () => {
  it('accepts a valid appointment request', () => {
    const result = requestAppointmentSchema.safeParse({
      doctorId: 1,
      date: '2026-07-15',
      startTime: '09:00',
      reason: 'Douleur au genou',
    })

    expect(result.success).toBe(true)
  })

  it('accepts a request without a reason', () => {
    const result = requestAppointmentSchema.safeParse({
      doctorId: 1,
      date: '2026-07-15',
      startTime: '10:30',
    })

    expect(result.success).toBe(true)
  })

  it('rejects missing doctorId', () => {
    const result = requestAppointmentSchema.safeParse({
      date: '2026-07-15',
      startTime: '09:00',
    })

    expect(result.success).toBe(false)
  })

  it('rejects empty date', () => {
    const result = requestAppointmentSchema.safeParse({
      doctorId: 1,
      date: '',
      startTime: '09:00',
    })

    expect(result.success).toBe(false)
  })

  it('rejects empty startTime', () => {
    const result = requestAppointmentSchema.safeParse({
      doctorId: 1,
      date: '2026-07-15',
      startTime: '',
    })

    expect(result.success).toBe(false)
  })

  it('rejects reason exceeding 500 characters', () => {
    const result = requestAppointmentSchema.safeParse({
      doctorId: 1,
      date: '2026-07-15',
      startTime: '09:00',
      reason: 'x'.repeat(501),
    })

    expect(result.success).toBe(false)
  })

  it('strips whitespace from reason', () => {
    const result = requestAppointmentSchema.safeParse({
      doctorId: 1,
      date: '2026-07-15',
      startTime: '09:00',
      reason: '  douleur  ',
    })

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.reason).toBe('douleur')
    }
  })
})
