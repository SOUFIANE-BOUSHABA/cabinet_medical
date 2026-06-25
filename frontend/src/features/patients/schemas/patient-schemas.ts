import { z } from 'zod'

// We define the rules for creating a new patient
export const createPatientSchema = z.object({
  name: z.string().min(2, 'Le nom complet est obligatoire'),
  email: z.string().email('Adresse email invalide'),
  cin: z.string().min(4, 'Le numéro de CIN est obligatoire'),
  phone: z
    .string()
    .min(8, 'Numéro de téléphone invalide')
    .optional()
    .or(z.literal('')),
  dateOfBirth: z.string().min(1, 'La date de naissance est obligatoire'),
  address: z.string().optional(),
  bloodType: z.string().optional(),
})

// For updates, all fields become optional (they can update just the phone number if they want)
export const updatePatientSchema = createPatientSchema.partial()

// These types tell React exactly what the forms will output
export type CreatePatientFormValues = z.infer<typeof createPatientSchema>
export type UpdatePatientFormValues = z.infer<typeof updatePatientSchema>
