import { apiClient } from '@/lib/api/client'
import type { components } from '@/types/api'

export type MedicalRecord = components['schemas']['MedicalRecordResponse']
export type MedicalRecordPage =
  components['schemas']['PageResponseMedicalRecordResponse']
export type CreateMedicalRecordPayload =
  components['schemas']['CreateMedicalRecordRequest']

export interface MedicalRecordListParams {
  page: number
  size?: number
  sort?: string
}

// GET /api/v1/medical-records (staff)
export async function getMedicalRecords({
  page,
  size = 100,
  sort = 'updatedAt,desc',
}: MedicalRecordListParams) {
  const { data } = await apiClient.get<MedicalRecordPage>('/medical-records', {
    params: { page, size, sort },
  })
  return data
}

// GET /api/v1/medical-records/{id}
export async function getMedicalRecord(id: number) {
  const { data } = await apiClient.get<MedicalRecord>(`/medical-records/${id}`)
  return data
}

// GET /api/v1/medical-records/patient/{patientId}
export async function getMedicalRecordByPatient(patientId: number) {
  const { data } = await apiClient.get<MedicalRecord>(
    `/medical-records/patient/${patientId}`,
  )
  return data
}

// GET /api/v1/medical-records/my (patient)
export async function getMyMedicalRecord() {
  const { data } = await apiClient.get<MedicalRecord>('/medical-records/my')
  return data
}

// POST /api/v1/medical-records (staff)
export async function createMedicalRecord(payload: CreateMedicalRecordPayload) {
  const { data } = await apiClient.post<MedicalRecord>(
    '/medical-records',
    payload,
  )
  return data
}
