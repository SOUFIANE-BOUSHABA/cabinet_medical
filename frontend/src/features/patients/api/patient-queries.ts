import { keepPreviousData } from '@tanstack/react-query'
import {
  getPatient,
  getPatients,
  getPendingPatients,
  searchPatients,
} from './patients-api'

// 1. We create "Keys" so React Query knows exactly how to label the saved data in memory.
export const patientKeys = {
  all: ['patients'] as const,
  lists: () => [...patientKeys.all, 'list'] as const,
  list: (page: number, size: number) => [...patientKeys.lists(), { page, size }] as const,
  details: () => [...patientKeys.all, 'detail'] as const,
  detail: (id: number) => [...patientKeys.details(), id] as const,
  searches: () => [...patientKeys.all, 'search'] as const,
  search: (query: string) => [...patientKeys.searches(), query] as const,
  pending: () => [...patientKeys.all, 'pending'] as const,
  byCin: (cin: string) => [...patientKeys.all, 'cin', cin] as const,
}

// 2. These are the hooks your UI will actually call to get the data.

export function patientsQuery(page: number, size: number = 20) {
  return {
    queryKey: patientKeys.list(page, size),
    queryFn: () => getPatients({ page, size }),
    // keepPreviousData prevents the screen from flickering blank when clicking "Next Page"
    placeholderData: keepPreviousData, 
  }
}

export function patientQuery(id: number) {
  return {
    queryKey: patientKeys.detail(id),
    queryFn: () => getPatient(id),
    enabled: Boolean(id), // Don't try to fetch if we don't have an ID yet
  }
}

export function pendingPatientsQuery() {
  return {
    queryKey: patientKeys.pending(),
    queryFn: () => getPendingPatients(),
  }
}

export function searchPatientsQuery(query: string) {
  return {
    queryKey: patientKeys.search(query),
    queryFn: () => searchPatients(query),
    enabled: Boolean(query.trim()), // Only search if they typed something
  }
}
