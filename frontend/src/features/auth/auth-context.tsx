import {
  type PropsWithChildren,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { useNavigate } from 'react-router-dom'
import {
  getCurrentUser,
  logout as logoutRequest,
  patientLogin,
  staffLogin,
  type PatientLoginPayload,
  type StaffLoginPayload,
} from '@/features/auth/api/auth-api'
import {
  AuthContext,
  type AuthContextValue,
  type AuthStatus,
} from '@/features/auth/auth-context-value'
import { getLoginPath } from '@/features/auth/auth-routing'
import { setAuthFailureHandler } from '@/lib/api/client'
import { tokenStorage } from '@/lib/auth/token-storage'
import { queryClient } from '@/lib/query/query-client'
import type { AuthSession, CurrentUser, UserRole } from '@/types/auth'

export function AuthProvider({ children }: PropsWithChildren) {
  const navigate = useNavigate()
  const [user, setUser] = useState<CurrentUser | null>(null)
  const [status, setStatus] = useState<AuthStatus>(() =>
    tokenStorage.get() ? 'loading' : 'anonymous',
  )

  const clearSession = useCallback(() => {
    tokenStorage.clear()
    queryClient.clear()
    setUser(null)
    setStatus('anonymous')
  }, [])

  const restoreUser = useCallback(async () => {
    if (!tokenStorage.get()) {
      setStatus('anonymous')
      return null
    }

    try {
      const currentUser = await getCurrentUser()
      setUser(currentUser)
      setStatus('authenticated')
      return currentUser
    } catch {
      clearSession()
      return null
    }
  }, [clearSession])

  useEffect(() => {
    if (!tokenStorage.get()) return
    let active = true

    void getCurrentUser()
      .then((currentUser) => {
        if (!active) return
        setUser(currentUser)
        setStatus('authenticated')
      })
      .catch(() => {
        if (!active) return
        clearSession()
      })

    return () => {
      active = false
    }
  }, [clearSession])

  useEffect(() => {
    setAuthFailureHandler((principalType) => {
      clearSession()
      navigate(getLoginPath(principalType), { replace: true })
    })
    return () => setAuthFailureHandler(null)
  }, [clearSession, navigate])

  const completeLogin = useCallback(
    async (session: AuthSession, persistent: boolean) => {
      tokenStorage.set(session, persistent)
      try {
        const currentUser = await getCurrentUser()
        setUser(currentUser)
        setStatus('authenticated')
        return currentUser
      } catch (error) {
        clearSession()
        throw error
      }
    },
    [clearSession],
  )

  const loginStaff = useCallback(
    async (
      payload: StaffLoginPayload,
      expectedRole: Exclude<UserRole, 'PATIENT'>,
      remember: boolean,
    ) => {
      const session = await staffLogin(payload)
      if (session.role !== expectedRole) {
        throw new Error(
          `Ce compte appartient au rôle ${session.role.toLowerCase()}, pas au rôle sélectionné.`,
        )
      }
      return completeLogin(session, remember)
    },
    [completeLogin],
  )

  const loginPatient = useCallback(
    async (payload: PatientLoginPayload) => {
      const session = await patientLogin(payload)
      if (session.role !== 'PATIENT') {
        throw new Error("Ce compte n'est pas un compte patient.")
      }
      return completeLogin(session, true)
    },
    [completeLogin],
  )

  const logout = useCallback(async () => {
    const principalType =
      user?.principalType ?? tokenStorage.get()?.principalType
    try {
      if (tokenStorage.get()) await logoutRequest()
    } finally {
      clearSession()
      navigate(getLoginPath(principalType), { replace: true })
    }
  }, [clearSession, navigate, user?.principalType])

  const value = useMemo<AuthContextValue>(
    () => ({ user, status, loginStaff, loginPatient, logout, restoreUser }),
    [loginPatient, loginStaff, logout, restoreUser, status, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
