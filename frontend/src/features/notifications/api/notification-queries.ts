import { queryOptions } from '@tanstack/react-query'
import {
  getAppointmentNotifications,
  getNotificationsForRole,
} from '@/features/notifications/api/notifications-api'
import type { UserRole } from '@/types/auth'

export const notificationKeys = {
  all: ['notifications'] as const,
  lists: () => [...notificationKeys.all, 'list'] as const,
  list: (role: UserRole, page: number, size: number) =>
    [...notificationKeys.lists(), role, { page, size }] as const,
  appointmentLists: () =>
    [...notificationKeys.all, 'appointment-list'] as const,
  appointment: (appointmentId: number) =>
    [...notificationKeys.appointmentLists(), appointmentId] as const,
}

export function roleNotificationsQuery(
  role: UserRole,
  page: number,
  size = 20,
) {
  return queryOptions({
    queryKey: notificationKeys.list(role, page, size),
    queryFn: () => getNotificationsForRole(role, { page, size }),
    retry: 1,
  })
}

export function appointmentNotificationsQuery(appointmentId: number | null) {
  return queryOptions({
    queryKey: notificationKeys.appointment(appointmentId ?? 0),
    queryFn: () => getAppointmentNotifications(appointmentId ?? 0),
    enabled: Boolean(appointmentId && appointmentId > 0),
  })
}
