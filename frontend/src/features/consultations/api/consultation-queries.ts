import { queryOptions } from '@tanstack/react-query'
import {
  getConsultation,
  getConsultationsByRecord,
  getMedicalRecords,
} from '@/features/consultations/api/consultations-api'

export const consultationKeys = {
  all: ['consultations'] as const,
  records: () => [...consultationKeys.all, 'records'] as const,
  recordList: (page: number, size: number) =>
    [...consultationKeys.records(), { page, size }] as const,
  byRecords: () => [...consultationKeys.all, 'by-record'] as const,
  byRecord: (recordId: number) =>
    [...consultationKeys.byRecords(), recordId] as const,
  details: () => [...consultationKeys.all, 'detail'] as const,
  detail: (id: number) => [...consultationKeys.details(), id] as const,
}

export function medicalRecordsQuery(page = 0, size = 100) {
  return queryOptions({
    queryKey: consultationKeys.recordList(page, size),
    queryFn: () => getMedicalRecords({ page, size }),
  })
}

export function consultationsByRecordQuery(recordId: number) {
  return queryOptions({
    queryKey: consultationKeys.byRecord(recordId),
    queryFn: () => getConsultationsByRecord(recordId),
    enabled: recordId > 0,
  })
}

export function consultationDetailQuery(id: number) {
  return queryOptions({
    queryKey: consultationKeys.detail(id),
    queryFn: () => getConsultation(id),
    enabled: id > 0,
  })
}
