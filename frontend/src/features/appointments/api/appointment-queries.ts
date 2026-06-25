import { queryOptions } from '@tanstack/react-query'
import {
  getMyAppointments,
  getAvailableSlots,
  getAppointment,
  getAppointments,
} from '@/features/appointments/api/appointments-api'
import type { AppointmentListParams } from '@/features/appointments/api/appointments-api'

export const appointmentKeys = {
  all: ['appointments'] as const,
  lists: () => [...appointmentKeys.all, 'list'] as const,
  list: (params: AppointmentListParams) =>
    [...appointmentKeys.lists(), params] as const,
  myLists: () => [...appointmentKeys.all, 'my-list'] as const,
  myList: (page: number, size: number) =>
    [...appointmentKeys.myLists(), { page, size }] as const,
  slots: (doctorId: number, date: string) =>
    [...appointmentKeys.all, 'slots', doctorId, date] as const,
  details: () => [...appointmentKeys.all, 'detail'] as const,
  detail: (id: number) => [...appointmentKeys.details(), id] as const,
}

export function appointmentsQuery(params: AppointmentListParams) {
  return queryOptions({
    queryKey: appointmentKeys.list(params),
    queryFn: () => getAppointments(params),
  })
}

export function myAppointmentsQuery(page: number, size = 20) {
  return queryOptions({
    queryKey: appointmentKeys.myList(page, size),
    queryFn: () => getMyAppointments({ page, size }),
  })
}

export function availableSlotsQuery(doctorId: number, date: string) {
  return queryOptions({
    queryKey: appointmentKeys.slots(doctorId, date),
    queryFn: () => getAvailableSlots(doctorId, date),
    enabled: doctorId > 0 && date.length > 0,
  })
}

export function appointmentDetailQuery(id: number) {
  return queryOptions({
    queryKey: appointmentKeys.detail(id),
    queryFn: () => getAppointment(id),
    enabled: id > 0,
  })
}
