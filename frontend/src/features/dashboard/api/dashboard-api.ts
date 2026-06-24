import { apiClient } from '@/lib/api/client'
import type { components } from '@/types/api'
import type { UserRole } from '@/types/auth'

export type AdminDashboardResponse =
  components['schemas']['AdminDashboardResponse']
export type DoctorDashboardResponse =
  components['schemas']['DoctorDashboardResponse']
export type SecretaryDashboardResponse =
  components['schemas']['SecretaryDashboardResponse']
export type PatientDashboardResponse =
  components['schemas']['PatientDashboardResponse']

export type DashboardResponseByRole = {
  ADMIN: AdminDashboardResponse
  DOCTOR: DoctorDashboardResponse
  SECRETARY: SecretaryDashboardResponse
  PATIENT: PatientDashboardResponse
}

const dashboardPaths: Record<UserRole, string> = {
  ADMIN: '/dashboard/admin',
  DOCTOR: '/dashboard/doctor',
  SECRETARY: '/dashboard/secretary',
  PATIENT: '/dashboard/patient',
}

export async function getDashboard<Role extends UserRole>(role: Role) {
  const { data } = await apiClient.get<DashboardResponseByRole[Role]>(
    dashboardPaths[role],
  )
  return data
}
