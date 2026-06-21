import { z } from 'zod'

const optionalText = (max: number) =>
  z.string().trim().max(max, `Maximum ${max} caractères`).optional()

export const createDoctorSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Le nom est obligatoire')
    .max(150, 'Maximum 150 caractères'),
  email: z
    .string()
    .trim()
    .min(1, "L'adresse email est obligatoire")
    .email('Adresse email invalide')
    .max(180, 'Maximum 180 caractères'),
  password: z
    .string()
    .min(6, 'Le mot de passe doit contenir au moins 6 caractères')
    .max(100, 'Maximum 100 caractères'),
  specialty: optionalText(150),
  availability: optionalText(255),
})

export const updateDoctorSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Le nom est obligatoire')
    .max(150, 'Maximum 150 caractères'),
  specialty: optionalText(150),
  availability: optionalText(255),
})

export type CreateDoctorFormValues = z.infer<typeof createDoctorSchema>
export type UpdateDoctorFormValues = z.infer<typeof updateDoctorSchema>
