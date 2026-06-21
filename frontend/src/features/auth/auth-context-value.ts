import { createContext } from 'react'
import type {
  PatientLoginPayload,
  StaffLoginPayload,
} from '@/features/auth/api/auth-api'
import type { CurrentUser, UserRole } from '@/types/auth'

export type AuthStatus = 'loading' | 'authenticated' | 'anonymous'

export interface AuthContextValue {
  user: CurrentUser | null
  status: AuthStatus
  loginStaff: (
    payload: StaffLoginPayload,
    expectedRole: Exclude<UserRole, 'PATIENT'>,
    remember: boolean,
  ) => Promise<CurrentUser>
  loginPatient: (payload: PatientLoginPayload) => Promise<CurrentUser>
  logout: () => Promise<void>
  restoreUser: () => Promise<CurrentUser | null>
}

export const AuthContext = createContext<AuthContextValue | null>(null)
