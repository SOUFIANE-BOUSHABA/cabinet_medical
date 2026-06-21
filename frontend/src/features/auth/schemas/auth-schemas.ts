import { z } from 'zod'

export const staffLoginSchema = z.object({
  email: z
    .string()
    .min(1, "L'adresse email est obligatoire.")
    .email("L'adresse email n'est pas valide."),
  password: z.string().min(1, 'Le mot de passe est obligatoire.'),
  remember: z.boolean(),
})

export type StaffLoginValues = z.infer<typeof staffLoginSchema>

export const patientLoginSchema = z.object({
  cin: z
    .string()
    .trim()
    .min(1, 'Le numéro de CIN est obligatoire.')
    .max(30, 'Le CIN ne peut pas dépasser 30 caractères.'),
  password: z.string().min(1, 'Le mot de passe est obligatoire.'),
})

export type PatientLoginValues = z.infer<typeof patientLoginSchema>

export const patientRegisterSchema = z
  .object({
    firstName: z
      .string()
      .trim()
      .min(1, 'Le prénom est obligatoire.')
      .max(100, 'Maximum 100 caractères.'),
    lastName: z
      .string()
      .trim()
      .min(1, 'Le nom est obligatoire.')
      .max(100, 'Maximum 100 caractères.'),
    cin: z
      .string()
      .trim()
      .min(1, 'Le CIN est obligatoire.')
      .max(30, 'Maximum 30 caractères.'),
    phone: z
      .string()
      .trim()
      .max(30, 'Maximum 30 caractères.')
      .refine(
        (value) => !value || /^[+\d][\d\s-]{7,29}$/.test(value),
        'Le numéro de téléphone est invalide.',
      ),
    email: z
      .string()
      .trim()
      .max(180, 'Maximum 180 caractères.')
      .refine(
        (value) => !value || z.string().email().safeParse(value).success,
        "L'adresse email n'est pas valide.",
      ),
    birthDate: z.string().refine((value) => {
      if (!value) return true
      return new Date(value) < new Date()
    }, 'La date de naissance doit être dans le passé.'),
    address: z.string().trim().max(255, 'Maximum 255 caractères.'),
    gender: z.string().max(20, 'Maximum 20 caractères.'),
    password: z
      .string()
      .min(6, 'Le mot de passe doit contenir au moins 6 caractères.')
      .max(100, 'Maximum 100 caractères.'),
    confirmPassword: z.string().min(1, 'Confirmez votre mot de passe.'),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Les mots de passe ne correspondent pas.',
  })

export type PatientRegisterValues = z.infer<typeof patientRegisterSchema>
