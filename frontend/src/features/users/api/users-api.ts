import { apiClient } from '@/lib/api/client'
import type { components } from '@/types/api'

export type User = components['schemas']['UserResponse']
export type UserPage = components['schemas']['PageResponseUserResponse']
export type CreateUserPayload = components['schemas']['CreateUserRequest']
export type UpdateUserPayload = components['schemas']['UpdateUserRequest']
export type UserRole = NonNullable<User['role']>

export interface UserListParams {
  page: number
  size?: number
  sort?: string
  role?: UserRole | ''
}

export async function getUsers({
  page,
  size = 20,
  sort = 'createdAt,desc',
  role,
}: UserListParams) {
  const { data } = await apiClient.get<UserPage>('/users', {
    params: { page, size, sort, role: role || undefined },
  })
  return data
}

export async function getUser(id: number) {
  const { data } = await apiClient.get<User>(`/users/${id}`)
  return data
}

export async function createUser(payload: CreateUserPayload) {
  const { data } = await apiClient.post<User>('/users', payload)
  return data
}

export async function updateUser(id: number, payload: UpdateUserPayload) {
  const { data } = await apiClient.put<User>(`/users/${id}`, payload)
  return data
}

export async function deleteUser(id: number) {
  await apiClient.delete(`/users/${id}`)
}

export async function updateUserStatus(id: number, enabled: boolean) {
  const { data } = await apiClient.patch<User>(`/users/${id}/status`, {
    enabled,
  })
  return data
}
