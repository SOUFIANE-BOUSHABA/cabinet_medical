import type { AuthSession } from '@/types/auth'

const STORAGE_KEY = 'cabinet-medical.auth-session'

function read(storage: Storage): AuthSession | null {
  const value = storage.getItem(STORAGE_KEY)
  if (!value) return null

  try {
    return JSON.parse(value) as AuthSession
  } catch {
    storage.removeItem(STORAGE_KEY)
    return null
  }
}

export const tokenStorage = {
  get(): AuthSession | null {
    return read(window.sessionStorage) ?? read(window.localStorage)
  },

  set(session: AuthSession, persistent = true) {
    this.clear()
    const storage = persistent ? window.localStorage : window.sessionStorage
    storage.setItem(STORAGE_KEY, JSON.stringify(session))
  },

  clear() {
    window.localStorage.removeItem(STORAGE_KEY)
    window.sessionStorage.removeItem(STORAGE_KEY)
  },

  isPersistent() {
    return window.localStorage.getItem(STORAGE_KEY) !== null
  },

  getAccessToken() {
    return this.get()?.accessToken ?? null
  },

  getRefreshToken() {
    return this.get()?.refreshToken ?? null
  },
}
