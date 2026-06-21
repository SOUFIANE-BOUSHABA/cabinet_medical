import { z } from 'zod'
import { apiClient } from '@/lib/api/client'
import type { components } from '@/types/api'
import type { AuthSession, CurrentUser } from '@/types/auth'

export type StaffLoginPayload = components['schemas']['StaffLoginRequest']
export type PatientLoginPayload = components['schemas']['PatientLoginRequest']
export type PatientRegisterPayload =
  components['schemas']['RegisterPatientRequest']
export type PatientResponse = components['schemas']['PatientResponse']

const authSessionSchema = z.object({
  tokenType: z.string().min(1),
  accessToken: z.string().min(1),
  refreshToken: z.string().min(1),
  expiresInSeconds: z.number(),
  id: z.number(),
  username: z.string(),
  displayName: z.string(),
  role: z.enum(['ADMIN', 'DOCTOR', 'SECRETARY', 'PATIENT']),
  principalType: z.enum(['STAFF', 'PATIENT']),
})

const currentUserSchema = z.object({
  id: z.number(),
  username: z.string(),
  displayName: z.string(),
  email: z.string().nullish(),
  role: z.enum(['ADMIN', 'DOCTOR', 'SECRETARY', 'PATIENT']),
  principalType: z.enum(['STAFF', 'PATIENT']),
})

export async function staffLogin(payload: StaffLoginPayload) {
  const { data } = await apiClient.post('/auth/staff/login', payload)
  return authSessionSchema.parse(data) satisfies AuthSession
}

export async function patientLogin(payload: PatientLoginPayload) {
  const { data } = await apiClient.post('/auth/patient/login', payload)
  return authSessionSchema.parse(data) satisfies AuthSession
}

export async function patientRegister(payload: PatientRegisterPayload) {
  const { data } = await apiClient.post<PatientResponse>(
    '/auth/patient/register',
    payload,
  )
  return data
}

export async function getCurrentUser() {
  const { data } = await apiClient.get('/auth/me')
  const parsed = currentUserSchema.parse(data)
  return {
    ...parsed,
    email: parsed.email ?? undefined,
  } satisfies CurrentUser
}

export async function logout() {
  await apiClient.post('/auth/logout')
}
