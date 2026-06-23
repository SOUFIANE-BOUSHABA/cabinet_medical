import { z } from 'zod'

export const requestAppointmentSchema = z.object({
  doctorId: z.number({ message: 'Veuillez sélectionner un médecin' }),
  date: z.string().min(1, 'Veuillez choisir une date'),
  startTime: z.string().min(1, 'Veuillez choisir un créneau'),
  reason: z.string().trim().max(500, 'Maximum 500 caractères').optional(),
})

export type RequestAppointmentFormValues = z.infer<typeof requestAppointmentSchema>
