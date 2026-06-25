import { queryOptions } from '@tanstack/react-query'
import {
  getUser,
  getUsers,
  type UserListParams,
} from '@/features/users/api/users-api'

export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (params: UserListParams) => [...userKeys.lists(), params] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: number) => [...userKeys.details(), id] as const,
}

export function usersQuery(params: UserListParams) {
  return queryOptions({
    queryKey: userKeys.list(params),
    queryFn: () => getUsers(params),
  })
}

export function userQuery(id: number) {
  return queryOptions({
    queryKey: userKeys.detail(id),
    queryFn: () => getUser(id),
    enabled: id > 0,
  })
}
