import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { tokenStorage } from '@/lib/auth/token-storage'
import type { ApiError, AuthSession } from '@/types/auth'
import type { PrincipalType } from '@/types/auth'

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '/api/v1'

export const apiClient = axios.create({
  baseURL: apiBaseUrl,
  timeout: 15_000,
  headers: {
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const accessToken = tokenStorage.getAccessToken()
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }
  return config
})

let refreshRequest: Promise<string> | null = null
let authFailureHandler: ((principalType?: PrincipalType) => void) | null = null

export function setAuthFailureHandler(
  handler: ((principalType?: PrincipalType) => void) | null,
) {
  authFailureHandler = handler
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiError>) => {
    const originalRequest = error.config as
      | (InternalAxiosRequestConfig & {
          _retry?: boolean
        })
      | undefined

    const refreshToken = tokenStorage.getRefreshToken()
    const shouldRefresh =
      error.response?.status === 401 &&
      refreshToken &&
      originalRequest &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/refresh-token')

    if (!shouldRefresh) return Promise.reject(error)

    originalRequest._retry = true

    const failedSession = tokenStorage.get()
    const persistent = tokenStorage.isPersistent()

    refreshRequest ??= axios
      .post<AuthSession>(`${apiBaseUrl}/auth/refresh-token`, { refreshToken })
      .then(({ data }) => {
        tokenStorage.set(data, persistent)
        return data.accessToken
      })
      .catch((refreshError) => {
        tokenStorage.clear()
        authFailureHandler?.(failedSession?.principalType)
        throw refreshError
      })
      .finally(() => {
        refreshRequest = null
      })

    const accessToken = await refreshRequest
    originalRequest.headers.Authorization = `Bearer ${accessToken}`
    return apiClient(originalRequest)
  },
)

export function getApiErrorMessage(error: unknown) {
  if (axios.isAxiosError<ApiError>(error)) {
    return error.response?.data?.message || 'Unable to reach the server.'
  }
  return 'An unexpected error occurred.'
}
