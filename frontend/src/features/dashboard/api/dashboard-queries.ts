import { queryOptions } from '@tanstack/react-query'
import { getDashboard } from '@/features/dashboard/api/dashboard-api'
import type { UserRole } from '@/types/auth'

export const dashboardKeys = {
  all: ['dashboard'] as const,
  detail: (role: UserRole) => [...dashboardKeys.all, role] as const,
}

export function dashboardQuery(role: UserRole) {
  return queryOptions({
    queryKey: dashboardKeys.detail(role),
    queryFn: () => getDashboard(role),
    retry: 1,
  })
}
