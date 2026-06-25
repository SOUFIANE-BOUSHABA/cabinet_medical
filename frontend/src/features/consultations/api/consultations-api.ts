import { apiClient } from '@/lib/api/client'
import type { components } from '@/types/api'

export type Consultation = components['schemas']['ConsultationResponse']
export type CreateConsultationPayload =
  components['schemas']['CreateConsultationRequest']
export type UpdateConsultationPayload =
  components['schemas']['UpdateConsultationRequest']
export type MedicalRecord = components['schemas']['MedicalRecordResponse']
export type MedicalRecordPage =
  components['schemas']['PageResponseMedicalRecordResponse']

export interface MedicalRecordListParams {
  page: number
  size?: number
  sort?: string
}

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

export async function getConsultation(id: number) {
  const { data } = await apiClient.get<Consultation>(`/consultations/${id}`)
  return data
}

export async function getConsultationsByRecord(recordId: number) {
  const { data } = await apiClient.get<Consultation[]>(
    `/consultations/record/${recordId}`,
  )
  return data
}

export async function createConsultation(payload: CreateConsultationPayload) {
  const { data } = await apiClient.post<Consultation>('/consultations', payload)
  return data
}

export async function updateConsultation(
  id: number,
  payload: UpdateConsultationPayload,
) {
  const { data } = await apiClient.put<Consultation>(
    `/consultations/${id}`,
    payload,
  )
  return data
}

export async function deleteConsultation(id: number) {
  await apiClient.delete(`/consultations/${id}`)
}
