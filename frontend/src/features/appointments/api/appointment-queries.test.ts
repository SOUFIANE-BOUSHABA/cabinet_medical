import { describe, expect, it } from 'vitest'
import {
  appointmentKeys,
  myAppointmentsQuery,
  availableSlotsQuery,
  appointmentDetailQuery,
} from '@/features/appointments/api/appointment-queries'

describe('appointmentKeys', () => {
  it('all est la racine', () => {
    expect(appointmentKeys.all).toEqual(['appointments'])
  })

  it('myLists contient my-list', () => {
    expect(appointmentKeys.myLists()).toEqual(['appointments', 'my-list'])
  })

  it('myList inclut la pagination', () => {
    expect(appointmentKeys.myList(0, 20)).toEqual([
      'appointments',
      'my-list',
      { page: 0, size: 20 },
    ])
  })

  it('slots inclut doctorId et date', () => {
    expect(appointmentKeys.slots(1, '2026-07-15')).toEqual([
      'appointments',
      'slots',
      1,
      '2026-07-15',
    ])
  })

  it('detail est un sous-ensemble de details', () => {
    expect(appointmentKeys.detail(5)).toEqual(['appointments', 'detail', 5])
  })
})

describe('myAppointmentsQuery', () => {
  it('retourne les bons queryKey et queryFn', () => {
    const query = myAppointmentsQuery(0, 20)
    expect(query.queryKey).toEqual(appointmentKeys.myList(0, 20))
    expect(typeof query.queryFn).toBe('function')
  })
})

describe('availableSlotsQuery', () => {
  it('est désactivé quand doctorId est 0', () => {
    const query = availableSlotsQuery(0, '')
    expect(query.enabled).toBe(false)
  })

  it('est activé avec doctorId > 0 et une date', () => {
    const query = availableSlotsQuery(1, '2026-07-15')
    expect(query.enabled).toBe(true)
  })

  it('a les bonnes clés', () => {
    const query = availableSlotsQuery(1, '2026-07-15')
    expect(query.queryKey).toEqual(appointmentKeys.slots(1, '2026-07-15'))
  })
})

describe('appointmentDetailQuery', () => {
  it('est désactivé quand id est 0', () => {
    const query = appointmentDetailQuery(0)
    expect(query.enabled).toBe(false)
  })

  it('est activé avec un id valide', () => {
    const query = appointmentDetailQuery(1)
    expect(query.enabled).toBe(true)
  })
})
