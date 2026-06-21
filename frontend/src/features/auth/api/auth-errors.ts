import axios from 'axios'
import type { ApiError } from '@/types/auth'

export function getAuthErrorMessage(error: unknown) {
  if (error instanceof Error && !axios.isAxiosError(error)) return error.message

  if (axios.isAxiosError<ApiError>(error)) {
    const status = error.response?.status
    const message = error.response?.data?.message

    if (status === 401) return 'Identifiants incorrects. Veuillez réessayer.'
    if (status === 403 && message?.includes('PENDING')) {
      return 'Votre compte est en attente de validation par le cabinet.'
    }
    if (status === 403 && message?.includes('REJECTED')) {
      return 'Votre compte a été refusé. Contactez le cabinet.'
    }
    if (status === 409)
      return message || 'Ces informations sont déjà utilisées.'
    if (!error.response) {
      return 'Le serveur est injoignable. Vérifiez que le backend est démarré.'
    }
    return message || 'Une erreur est survenue. Veuillez réessayer.'
  }

  return 'Une erreur inattendue est survenue.'
}
