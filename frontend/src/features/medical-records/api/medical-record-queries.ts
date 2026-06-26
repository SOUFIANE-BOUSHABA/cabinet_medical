import { keepPreviousData, queryOptions } from '@tanstack/react-query'
import {
  getMedicalRecord,
  getMedicalRecordByPatient,
  getMedicalRecords,
  getMyMedicalRecord,
} from '@/features/medical-records/api/medical-records-api'

export const medicalRecordKeys = {
  all: ['medical-records'] as const,
  lists: () => [...medicalRecordKeys.all, 'list'] as const,
  list: (page: number, size: number) =>
    [...medicalRecordKeys.lists(), { page, size }] as const,
  details: () => [...medicalRecordKeys.all, 'detail'] as const,
  detail: (id: number) => [...medicalRecordKeys.details(), id] as const,
  byPatients: () => [...medicalRecordKeys.all, 'by-patient'] as const,
  byPatient: (patientId: number) =>
    [...medicalRecordKeys.byPatients(), patientId] as const,
  mine: () => [...medicalRecordKeys.all, 'mine'] as const,
}

export function medicalRecordsQuery(page = 0, size = 100) {
  return queryOptions({
    queryKey: medicalRecordKeys.list(page, size),
    queryFn: () => getMedicalRecords({ page, size }),
    placeholderData: keepPreviousData,
  })
}

export function medicalRecordQuery(id: number) {
  return queryOptions({
    queryKey: medicalRecordKeys.detail(id),
    queryFn: () => getMedicalRecord(id),
    enabled: id > 0,
  })
}

export function medicalRecordByPatientQuery(patientId: number) {
  return queryOptions({
    queryKey: medicalRecordKeys.byPatient(patientId),
    queryFn: () => getMedicalRecordByPatient(patientId),
    enabled: patientId > 0,
  })
}

export function myMedicalRecordQuery() {
  return queryOptions({
    queryKey: medicalRecordKeys.mine(),
    queryFn: () => getMyMedicalRecord(),
  })
}
