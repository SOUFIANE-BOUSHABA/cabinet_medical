import { apiClient } from '@/lib/api/client'
import type { components } from '@/types/api'

// We infer these type names based on standard OpenAPI generation 
// (just like the Doctors module)
export type Patient = components['schemas']['PatientResponse']
export type PatientPage = components['schemas']['PageResponsePatientResponse']
export type CreatePatientPayload = components['schemas']['CreatePatientRequest']
export type UpdatePatientPayload = components['schemas']['UpdatePatientRequest']

export interface PatientListParams {
  page: number
  size?: number
  sort?: string
}

// 1. GET /api/v1/patients
export async function getPatients({ page, size = 20, sort = 'id,desc' }: PatientListParams) {
  const { data } = await apiClient.get<PatientPage>('/patients', {
    params: { page, size, sort },
  })
  return data
}

// 2. GET /api/v1/patients/{id}
export async function getPatient(id: number) {
  const { data } = await apiClient.get<Patient>(`/patients/${id}`)
  return data
}

// 3. POST /api/v1/patients
export async function createPatient(payload: CreatePatientPayload) {
  const { data } = await apiClient.post<Patient>('/patients', payload)
  return data
}

// 4. PUT /api/v1/patients/{id}
export async function updatePatient(id: number, payload: UpdatePatientPayload) {
  const { data } = await apiClient.put<Patient>(`/patients/${id}`, payload)
  return data
}

// 5. DELETE /api/v1/patients/{id}
export async function deletePatient(id: number) {
  await apiClient.delete(`/patients/${id}`)
}

// 6. GET /api/v1/patients/search
export async function searchPatients(query: string) {
  const { data } = await apiClient.get<PatientPage>('/patients/search', {
    params: { keyword: query } // Assuming 'q' or similar is the search param
  })
  return data
}

// 7. GET /api/v1/patients/pending
export async function getPendingPatients() {
  const { data } = await apiClient.get<PatientPage>('/patients/pending')
  return data
}

// 8. GET /api/v1/patients/by-cin/{cin}
export async function getPatientByCin(cin: string) {
  const { data } = await apiClient.get<Patient>(`/patients/by-cin/${cin}`)
  return data
}

// 9. PATCH /api/v1/patients/{id}/approve
export async function approvePatient(id: number) {
  const { data } = await apiClient.patch<Patient>(`/patients/${id}/approve`)
  return data
}

// 10. PATCH /api/v1/patients/{id}/reject
export async function rejectPatient(id: number) {
  await apiClient.patch(`/patients/${id}/reject`)
}
