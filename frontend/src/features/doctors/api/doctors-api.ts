import { apiClient } from '@/lib/api/client'
import type { components } from '@/types/api'

export type Doctor = components['schemas']['DoctorResponse']
export type DoctorPage = components['schemas']['PageResponseDoctorResponse']
export type CreateDoctorPayload = components['schemas']['CreateDoctorRequest']
export type UpdateDoctorPayload = components['schemas']['UpdateDoctorRequest']

export interface DoctorListParams {
  page: number
  size?: number
  sort?: string
}

export async function getDoctors({
  page,
  size = 20,
  sort = 'id,desc',
}: DoctorListParams) {
  const { data } = await apiClient.get<DoctorPage>('/doctors', {
    params: { page, size, sort },
  })
  return data
}

export async function getDoctor(id: number) {
  const { data } = await apiClient.get<Doctor>(`/doctors/${id}`)
  return data
}

export async function createDoctor(payload: CreateDoctorPayload) {
  const { data } = await apiClient.post<Doctor>('/doctors', payload)
  return data
}

export async function updateDoctor(id: number, payload: UpdateDoctorPayload) {
  const { data } = await apiClient.put<Doctor>(`/doctors/${id}`, payload)
  return data
}

export async function deleteDoctor(id: number) {
  await apiClient.delete(`/doctors/${id}`)
}
