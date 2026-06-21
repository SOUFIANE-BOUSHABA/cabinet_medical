import { describe, expect, it } from 'vitest'
import {
  createDoctorSchema,
  updateDoctorSchema,
} from '@/features/doctors/schemas/doctor-schemas'

describe('doctor schemas', () => {
  it('accepts a valid doctor creation payload', () => {
    const result = createDoctorSchema.safeParse({
      name: 'Dr. Lina Mansouri',
      email: 'lina@cabinet.ma',
      password: 'Doctor123!',
      specialty: 'Cardiologie',
      availability: 'Lundi - Vendredi, 09:00 - 17:00',
    })

    expect(result.success).toBe(true)
  })

  it('rejects an invalid email and short password', () => {
    const result = createDoctorSchema.safeParse({
      name: 'Dr. Lina Mansouri',
      email: 'not-an-email',
      password: '123',
    })

    expect(result.success).toBe(false)
  })

  it('accepts only the editable doctor fields on update', () => {
    const result = updateDoctorSchema.safeParse({
      name: 'Dr. Lina Updated',
      specialty: 'Médecine générale',
      availability: 'Lundi - Jeudi',
    })

    expect(result.success).toBe(true)
  })
})
