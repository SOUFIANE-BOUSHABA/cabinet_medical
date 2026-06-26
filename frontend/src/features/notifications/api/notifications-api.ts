import { apiClient } from '@/lib/api/client'
import type { components } from '@/types/api'
import type { UserRole } from '@/types/auth'

export type Notification = components['schemas']['NotificationResponse']
export type NotificationPage =
  components['schemas']['PageResponseNotificationResponse']
export type SimulateNotificationPayload =
  components['schemas']['SimulateNotificationRequest']

export interface NotificationListParams {
  page: number
  size?: number
  sort?: string
}

function emptyNotificationPage({
  page,
  size = 20,
}: NotificationListParams): NotificationPage {
  return {
    content: [],
    page,
    size,
    totalElements: 0,
    totalPages: 0,
    last: true,
  }
}

export async function getNotifications({
  page,
  size = 20,
  sort = 'sentAt,desc',
}: NotificationListParams) {
  const { data } = await apiClient.get<NotificationPage>('/notifications', {
    params: { page, size, sort },
  })
  return data
}

export async function getMyNotifications({
  page,
  size = 20,
  sort = 'sentAt,desc',
}: NotificationListParams) {
  const { data } = await apiClient.get<NotificationPage>('/notifications/my', {
    params: { page, size, sort },
  })
  return data
}

export async function getNotificationsForRole(
  role: UserRole,
  params: NotificationListParams,
) {
  if (role === 'PATIENT' || role === 'DOCTOR') return getMyNotifications(params)
  if (role === 'ADMIN' || role === 'SECRETARY') return getNotifications(params)
  return emptyNotificationPage(params)
}

export async function getAppointmentNotifications(appointmentId: number) {
  const { data } = await apiClient.get<Notification[]>(
    `/notifications/appointment/${appointmentId}`,
  )
  return data
}

export async function simulateNotification(
  payload: SimulateNotificationPayload,
) {
  const { data } = await apiClient.post<Notification>(
    '/notifications/simulate',
    payload,
  )
  return data
}
