import { apiClient } from '@/lib/api/client'
import type { LocalTimeValue } from '@/lib/utils/format'
import type { components } from '@/types/api'

export type CabinetSettings = components['schemas']['SettingsResponse']
export type UpdateCabinetSettingsPayload = Omit<
  components['schemas']['UpdateSettingsRequest'],
  'openingTime' | 'closingTime'
> & {
  openingTime: LocalTimeValue
  closingTime: LocalTimeValue
}

export async function getCabinetSettings() {
  const { data } = await apiClient.get<CabinetSettings>('/settings')
  return data
}

export async function updateCabinetSettings(
  payload: UpdateCabinetSettingsPayload,
) {
  const { data } = await apiClient.put<CabinetSettings>('/settings', payload)
  return data
}
