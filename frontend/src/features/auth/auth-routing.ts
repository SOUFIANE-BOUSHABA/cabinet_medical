import type { PrincipalType, UserRole } from '@/types/auth'

export function getDashboardPath(role: UserRole) {
  const paths: Record<UserRole, string> = {
    ADMIN: '/admin/dashboard',
    DOCTOR: '/doctor/dashboard',
    SECRETARY: '/secretary/dashboard',
    PATIENT: '/patient/dashboard',
  }
  return paths[role]
}

export function getLoginPath(principalType?: PrincipalType) {
  return principalType === 'PATIENT' ? '/patient/login' : '/staff/login'
}
