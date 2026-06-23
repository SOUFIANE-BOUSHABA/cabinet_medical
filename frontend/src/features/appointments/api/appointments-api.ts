import { apiClient } from '@/lib/api/client'
import type { components } from '@/types/api'

export type Appointment = components['schemas']['AppointmentResponse']
export type AppointmentPage = components['schemas']['PageResponseAppointmentResponse']
export type AvailableSlot = components['schemas']['AvailableSlotResponse']
export type PatientAppointmentPayload = components['schemas']['PatientAppointmentRequest']

export interface AppointmentListParams {
  page: number
  size?: number
  sort?: string
  status?: string
  date?: string
}

export async function getMyAppointments({ page, size = 20, sort = 'date,desc' }: AppointmentListParams) {
  const { data } = await apiClient.get<AppointmentPage>('/appointments/my', {
    params: { page, size, sort },
  })
  return data
}

export async function getAvailableSlots(doctorId: number, date: string) {
  const { data } = await apiClient.get<AvailableSlot[]>('/appointments/available-slots', {
    params: { doctorId, date },
  })
  return data
}

export async function requestAppointment(payload: PatientAppointmentPayload) {
  const { data } = await apiClient.post<Appointment>('/appointments/request', payload)
  return data
}

export async function cancelAppointment(id: number) {
  const { data } = await apiClient.patch<Appointment>(`/appointments/${id}/cancel`)
  return data
}

export async function getAppointment(id: number) {
  const { data } = await apiClient.get<Appointment>(`/appointments/${id}`)
  return data
}
