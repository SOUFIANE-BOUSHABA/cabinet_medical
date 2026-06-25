import { apiClient } from '@/lib/api/client'
import type { LocalTimeValue } from '@/lib/utils/format'
import type { components } from '@/types/api'

export type Appointment = components['schemas']['AppointmentResponse']
export type AppointmentPage =
  components['schemas']['PageResponseAppointmentResponse']
export type AvailableSlot = components['schemas']['AvailableSlotResponse']
export type PatientAppointmentPayload = Omit<
  components['schemas']['PatientAppointmentRequest'],
  'startTime'
> & { startTime: LocalTimeValue }
export type CreateAppointmentPayload = Omit<
  components['schemas']['CreateAppointmentRequest'],
  'startTime'
> & { startTime: LocalTimeValue }
export type UpdateAppointmentPayload = Omit<
  components['schemas']['UpdateAppointmentRequest'],
  'startTime'
> & { startTime: LocalTimeValue }
export type UrgentAppointmentPayload = Omit<
  components['schemas']['UrgentAppointmentRequest'],
  'startTime'
> & { startTime: LocalTimeValue }
export type AppointmentStatus = NonNullable<Appointment['status']>

export interface AppointmentListParams {
  page: number
  size?: number
  sort?: string
  status?: string
  date?: string
}

export async function getMyAppointments({
  page,
  size = 20,
  sort = 'date,desc',
}: AppointmentListParams) {
  const { data } = await apiClient.get<AppointmentPage>('/appointments/my', {
    params: { page, size, sort },
  })
  return data
}

export async function getAppointments({
  page,
  size = 20,
  sort = 'date,desc',
  status,
  date,
}: AppointmentListParams) {
  const { data } = await apiClient.get<AppointmentPage>('/appointments', {
    params: { page, size, sort, status, date },
  })
  return data
}

export async function getAvailableSlots(doctorId: number, date: string) {
  const { data } = await apiClient.get<AvailableSlot[]>(
    '/appointments/available-slots',
    {
      params: { doctorId, date },
    },
  )
  return data
}

export async function requestAppointment(payload: PatientAppointmentPayload) {
  const { data } = await apiClient.post<Appointment>(
    '/appointments/request',
    payload,
  )
  return data
}

export async function createAppointment(payload: CreateAppointmentPayload) {
  const { data } = await apiClient.post<Appointment>('/appointments', payload)
  return data
}

export async function createUrgentAppointment(
  payload: UrgentAppointmentPayload,
) {
  const { data } = await apiClient.post<Appointment>(
    '/appointments/urgent',
    payload,
  )
  return data
}

export async function cancelAppointment(id: number) {
  const { data } = await apiClient.patch<Appointment>(
    `/appointments/${id}/cancel`,
  )
  return data
}

export async function confirmAppointment(id: number) {
  const { data } = await apiClient.patch<Appointment>(
    `/appointments/${id}/confirm`,
  )
  return data
}

export async function completeAppointment(id: number) {
  const { data } = await apiClient.patch<Appointment>(
    `/appointments/${id}/complete`,
  )
  return data
}

export async function updateAppointment(
  id: number,
  payload: UpdateAppointmentPayload,
) {
  const { data } = await apiClient.put<Appointment>(
    `/appointments/${id}`,
    payload,
  )
  return data
}

export async function getAppointment(id: number) {
  const { data } = await apiClient.get<Appointment>(`/appointments/${id}`)
  return data
}
