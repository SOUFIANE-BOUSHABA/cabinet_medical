import { apiClient } from '@/lib/api/client'
import type { components } from '@/types/api'

export type MedicalDocument = components['schemas']['DocumentResponse']

export const MAX_DOCUMENT_SIZE = 10 * 1024 * 1024 // 10 MB (backend multipart limit)

// GET /api/v1/documents/my
export async function getMyDocuments() {
  const { data } = await apiClient.get<MedicalDocument[]>('/documents/my')
  return data
}

// GET /api/v1/documents/record/{recordId}
export async function getDocumentsByRecord(recordId: number) {
  const { data } = await apiClient.get<MedicalDocument[]>(
    `/documents/record/${recordId}`,
  )
  return data
}

// GET /api/v1/documents/{id}
export async function getDocument(id: number) {
  const { data } = await apiClient.get<MedicalDocument>(`/documents/${id}`)
  return data
}

// POST /api/v1/documents/upload (multipart/form-data)
export async function uploadDocument(recordId: number, file: File) {
  const formData = new FormData()
  formData.append('recordId', String(recordId))
  formData.append('file', file)
  const { data } = await apiClient.post<MedicalDocument>(
    '/documents/upload',
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  )
  return data
}

// DELETE /api/v1/documents/{id}
export async function deleteDocument(id: number) {
  await apiClient.delete(`/documents/${id}`)
}

// GET /api/v1/documents/{id}/download
export async function downloadDocument(id: number, fileName: string) {
  const { data } = await apiClient.get<Blob>(`/documents/${id}/download`, {
    responseType: 'blob',
  })
  const url = window.URL.createObjectURL(data)
  const link = window.document.createElement('a')
  link.href = url
  link.setAttribute('download', fileName)
  window.document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(url)
}
