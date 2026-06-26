import { queryOptions } from '@tanstack/react-query'
import {
  getDocument,
  getDocumentsByRecord,
} from '@/features/documents/api/documents-api'

export const documentKeys = {
  all: ['documents'] as const,
  byRecords: () => [...documentKeys.all, 'by-record'] as const,
  byRecord: (recordId: number) =>
    [...documentKeys.byRecords(), recordId] as const,
  details: () => [...documentKeys.all, 'detail'] as const,
  detail: (id: number) => [...documentKeys.details(), id] as const,
}

export function documentsByRecordQuery(recordId: number) {
  return queryOptions({
    queryKey: documentKeys.byRecord(recordId),
    queryFn: () => getDocumentsByRecord(recordId),
    enabled: recordId > 0,
  })
}

export function documentDetailQuery(id: number) {
  return queryOptions({
    queryKey: documentKeys.detail(id),
    queryFn: () => getDocument(id),
    enabled: id > 0,
  })
}
