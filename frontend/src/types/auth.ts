export type UserRole = 'ADMIN' | 'DOCTOR' | 'SECRETARY' | 'PATIENT'
export type PrincipalType = 'STAFF' | 'PATIENT'

export interface AuthSession {
  tokenType: string
  accessToken: string
  refreshToken: string
  expiresInSeconds: number
  id: number
  username: string
  displayName: string
  role: UserRole
  principalType: PrincipalType
}

export interface CurrentUser {
  id: number
  username: string
  displayName: string
  email?: string
  role: UserRole
  principalType: PrincipalType
}

export interface ApiError {
  timestamp: string
  status: number
  error: string
  message: string
  path: string
  errors?: Array<{
    field: string
    message: string
  }>
}
