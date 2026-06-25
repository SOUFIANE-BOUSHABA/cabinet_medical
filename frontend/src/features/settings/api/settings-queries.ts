import { queryOptions } from '@tanstack/react-query'
import { getCabinetSettings } from '@/features/settings/api/settings-api'

export const settingsKeys = {
  all: ['settings'] as const,
  detail: () => [...settingsKeys.all, 'detail'] as const,
}

export function cabinetSettingsQuery() {
  return queryOptions({
    queryKey: settingsKeys.detail(),
    queryFn: getCabinetSettings,
  })
}
