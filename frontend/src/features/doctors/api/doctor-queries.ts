import { queryOptions } from '@tanstack/react-query'
import { getDoctor, getDoctors } from '@/features/doctors/api/doctors-api'

export const doctorKeys = {
  all: ['doctors'] as const,
  lists: () => [...doctorKeys.all, 'list'] as const,
  list: (page: number, size: number) =>
    [...doctorKeys.lists(), { page, size }] as const,
  details: () => [...doctorKeys.all, 'detail'] as const,
  detail: (id: number) => [...doctorKeys.details(), id] as const,
}

export function doctorsQuery(page: number, size = 20) {
  return queryOptions({
    queryKey: doctorKeys.list(page, size),
    queryFn: () => getDoctors({ page, size }),
  })
}

export function doctorQuery(id: number) {
  return queryOptions({
    queryKey: doctorKeys.detail(id),
    queryFn: () => getDoctor(id),
    enabled: id > 0,
  })
}
