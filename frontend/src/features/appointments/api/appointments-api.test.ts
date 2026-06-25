import { describe, expect, it, vi, beforeEach } from 'vitest'
import { apiClient } from '@/lib/api/client'

vi.mock('@/lib/api/client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
  },
  getApiErrorMessage: vi.fn(
    (error) => error?.response?.data?.message ?? 'Erreur inconnue',
  ),
}))

const {
  getMyAppointments,
  getAvailableSlots,
  requestAppointment,
  cancelAppointment,
  getAppointment,
} = await import('@/features/appointments/api/appointments-api')

describe('appointments API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getMyAppointments', () => {
    it('appelle GET /appointments/my avec les bons paramètres', async () => {
      const mockData = {
        content: [],
        page: 0,
        size: 20,
        totalElements: 0,
        totalPages: 0,
      }
      vi.mocked(apiClient.get).mockResolvedValue({ data: mockData })

      const result = await getMyAppointments({ page: 0, size: 20 })

      expect(apiClient.get).toHaveBeenCalledWith('/appointments/my', {
        params: { page: 0, size: 20, sort: 'date,desc' },
      })
      expect(result).toEqual(mockData)
    })

    it('utilise les valeurs par défaut pour size et sort', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({ data: { content: [] } })

      await getMyAppointments({ page: 1 })

      expect(apiClient.get).toHaveBeenCalledWith('/appointments/my', {
        params: { page: 1, size: 20, sort: 'date,desc' },
      })
    })
  })

  describe('getAvailableSlots', () => {
    it('appelle GET /appointments/available-slots avec doctorId et date', async () => {
      const mockSlots = [
        { startTime: { hour: 9, minute: 0 }, endTime: { hour: 9, minute: 30 } },
        {
          startTime: { hour: 10, minute: 0 },
          endTime: { hour: 10, minute: 30 },
        },
      ]
      vi.mocked(apiClient.get).mockResolvedValue({ data: mockSlots })

      const result = await getAvailableSlots(1, '2026-07-15')

      expect(apiClient.get).toHaveBeenCalledWith(
        '/appointments/available-slots',
        {
          params: { doctorId: 1, date: '2026-07-15' },
        },
      )
      expect(result).toEqual(mockSlots)
    })
  })

  describe('requestAppointment', () => {
    it('appelle POST /appointments/request avec le payload patient', async () => {
      const payload = {
        doctorId: 1,
        date: '2026-07-15',
        startTime: { hour: 9, minute: 0 },
        reason: 'Douleur',
      }
      const mockResponse = { id: 1, status: 'PENDING', ...payload }
      vi.mocked(apiClient.post).mockResolvedValue({ data: mockResponse })

      const result = await requestAppointment(payload)

      expect(apiClient.post).toHaveBeenCalledWith(
        '/appointments/request',
        payload,
      )
      expect(result).toEqual(mockResponse)
    })

    it('envoie la requête sans reason optionnelle', async () => {
      const payload = {
        doctorId: 1,
        date: '2026-07-15',
        startTime: { hour: 10, minute: 30 },
      }
      vi.mocked(apiClient.post).mockResolvedValue({ data: { id: 2 } })

      await requestAppointment(payload)

      expect(apiClient.post).toHaveBeenCalledWith('/appointments/request', {
        doctorId: 1,
        date: '2026-07-15',
        startTime: { hour: 10, minute: 30 },
      })
    })
  })

  describe('cancelAppointment', () => {
    it('appelle PATCH /appointments/{id}/cancel', async () => {
      vi.mocked(apiClient.patch).mockResolvedValue({
        data: { id: 1, status: 'CANCELLED' },
      })

      const result = await cancelAppointment(1)

      expect(apiClient.patch).toHaveBeenCalledWith('/appointments/1/cancel')
      expect(result.status).toBe('CANCELLED')
    })
  })

  describe('getAppointment', () => {
    it('appelle GET /appointments/{id}', async () => {
      const mockAppt = { id: 1, doctorName: 'Dr. Test', date: '2026-07-15' }
      vi.mocked(apiClient.get).mockResolvedValue({ data: mockAppt })

      const result = await getAppointment(1)

      expect(apiClient.get).toHaveBeenCalledWith('/appointments/1')
      expect(result).toEqual(mockAppt)
    })
  })
})
