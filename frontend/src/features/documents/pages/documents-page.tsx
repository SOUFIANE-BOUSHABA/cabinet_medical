import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  AlertCircle,
  FileText,
  FolderOpen,
  Paperclip,
  RefreshCw,
  Search,
  Trash2,
  Upload,
} from 'lucide-react'
import { useMemo, useRef, useState, type ChangeEvent } from 'react'
import { toast } from 'sonner'
import { PortalShell } from '@/components/layout/portal-shell'
import { medicalRecordsQuery } from '@/features/consultations/api/consultation-queries'
import { DoctorDialog } from '@/features/doctors/ui/doctor-dialog'
import { documentsByRecordQuery } from '@/features/documents/api/document-queries'
import {
  deleteDocument,
  MAX_DOCUMENT_SIZE,
  uploadDocument,
  type MedicalDocument,
} from '@/features/documents/api/documents-api'
import { getApiErrorMessage } from '@/lib/api/client'

function textOrDash(value?: string | null) {
  return value?.trim() || 'Non renseigne'
}

function formatDateTime(value?: string) {
  if (!value) return 'Non renseigne'
  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

export function DocumentsPage() {
  const queryClient = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedRecordId, setSelectedRecordId] = useState(0)
  const [recordSearch, setRecordSearch] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<MedicalDocument | null>(null)

  const recordsQuery = useQuery(medicalRecordsQuery())
  const records = useMemo(
    () => recordsQuery.data?.content ?? [],
    [recordsQuery.data?.content],
  )
  const effectiveRecordId = selectedRecordId || records[0]?.id || 0
  const selectedRecord = records.find(
    (record) => record.id === effectiveRecordId,
  )
  const documentsQuery = useQuery(documentsByRecordQuery(effectiveRecordId))
  const documents = documentsQuery.data ?? []

  const filteredRecords = useMemo(() => {
    const search = recordSearch.trim().toLowerCase()
    if (!search) return records
    return records.filter((record) =>
      [record.patientName, record.patientCin, String(record.id ?? '')]
        .join(' ')
        .toLowerCase()
        .includes(search),
    )
  }, [recordSearch, records])

  const uploadMutation = useMutation({
    mutationFn: (file: File) => uploadDocument(effectiveRecordId, file),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: documentsByRecordQuery(effectiveRecordId).queryKey,
      })
      toast.success('Document televerse avec succes')
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  })

  const deleteMutation = useMutation({
    mutationFn: deleteDocument,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: documentsByRecordQuery(effectiveRecordId).queryKey,
      })
      toast.success('Document supprime')
      setDeleteTarget(null)
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  })

  const onPickFile = () => {
    if (!effectiveRecordId) {
      toast.error('Selectionnez un dossier medical')
      return
    }
    fileInputRef.current?.click()
  }

  const onFileSelected = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = '' // allow re-selecting the same file later
    if (!file) return
    if (file.size > MAX_DOCUMENT_SIZE) {
      toast.error('Le fichier depasse la taille maximale de 10 Mo')
      return
    }
    uploadMutation.mutate(file)
  }

  return (
    <PortalShell>
      <div className="mx-auto max-w-[1180px]">
        <section className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
          <div>
            <h1 className="text-xl leading-tight font-bold text-[#101b31]">
              Documents
            </h1>
            <p className="mt-1 text-[11px] text-[#5f6c81]">
              Televersez et gerez les fichiers attaches aux dossiers medicaux
              (max 10 Mo).
            </p>
          </div>
          <button
            type="button"
            onClick={onPickFile}
            disabled={!effectiveRecordId || uploadMutation.isPending}
            className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-[#075bd8] px-4 text-xs font-semibold text-white shadow-sm hover:bg-[#064fb9] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Upload className="size-4" strokeWidth={2.2} />
            {uploadMutation.isPending ? 'Televersement...' : 'Televerser'}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={onFileSelected}
          />
        </section>

        <section className="mt-4 grid gap-4 lg:grid-cols-[320px_1fr]">
          <aside className="overflow-hidden rounded-lg border border-[#cfd7e7] bg-white shadow-[0_2px_8px_rgba(16,29,53,0.06)]">
            <div className="border-b border-[#dce2ed] p-4">
              <h2 className="text-sm font-bold text-[#142039]">
                Dossiers medicaux
              </h2>
              <label className="relative mt-3 block">
                <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={recordSearch}
                  onChange={(event) => setRecordSearch(event.target.value)}
                  className="h-9 w-full rounded-md border border-[#cfd7e7] pr-3 pl-9 text-xs outline-none focus:border-[#075bd8] focus:ring-1 focus:ring-[#075bd8]"
                  placeholder="Patient, CIN ou numero"
                />
              </label>
            </div>

            {recordsQuery.isLoading ? (
              <div className="space-y-2 p-4">
                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="h-14 animate-pulse rounded-md bg-slate-100"
                  />
                ))}
              </div>
            ) : recordsQuery.isError ? (
              <div className="p-5 text-center">
                <AlertCircle className="mx-auto size-7 text-red-500" />
                <p className="mt-2 text-xs text-slate-600">
                  {getApiErrorMessage(recordsQuery.error)}
                </p>
                <button
                  type="button"
                  onClick={() => void recordsQuery.refetch()}
                  className="mt-3 inline-flex h-8 items-center gap-2 rounded-md bg-[#075bd8] px-3 text-xs font-semibold text-white"
                >
                  <RefreshCw className="size-3.5" />
                  Reessayer
                </button>
              </div>
            ) : filteredRecords.length === 0 ? (
              <div className="grid min-h-40 place-items-center p-5 text-center">
                <div>
                  <FileText className="mx-auto size-8 text-slate-400" />
                  <p className="mt-2 text-xs font-semibold text-slate-600">
                    Aucun dossier trouve
                  </p>
                </div>
              </div>
            ) : (
              <div className="max-h-[620px] divide-y divide-[#edf1f7] overflow-y-auto">
                {filteredRecords.map((record) => (
                  <button
                    key={record.id}
                    type="button"
                    onClick={() => record.id && setSelectedRecordId(record.id)}
                    className={`block w-full px-4 py-3 text-left transition hover:bg-blue-50 ${
                      effectiveRecordId === record.id ? 'bg-[#eef5ff]' : ''
                    }`}
                  >
                    <span className="block text-xs font-bold text-[#17233b]">
                      {textOrDash(record.patientName)}
                    </span>
                    <span className="mt-1 block text-[10px] text-slate-500">
                      CIN {textOrDash(record.patientCin)} - Dossier #{record.id}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </aside>

          <section className="overflow-hidden rounded-lg border border-[#cfd7e7] bg-white shadow-[0_2px_8px_rgba(16,29,53,0.06)]">
            <header className="flex flex-col gap-3 border-b border-[#dce2ed] bg-[#f8fbff] px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[10px] font-semibold tracking-[0.14em] text-[#075bd8] uppercase">
                  Dossier selectionne
                </p>
                <h2 className="mt-1 text-sm font-bold text-[#142039]">
                  {selectedRecord
                    ? textOrDash(selectedRecord.patientName)
                    : 'Selectionnez un dossier'}
                </h2>
              </div>
              <div className="inline-flex w-fit items-center gap-2 rounded-md border border-[#cfd7e7] bg-white px-3 py-2 text-xs font-semibold text-slate-600">
                <Paperclip className="size-4 text-[#075bd8]" />
                {documents.length} document(s)
              </div>
            </header>

            {documentsQuery.isLoading ? (
              <div className="space-y-3 p-4">
                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="h-16 animate-pulse rounded-md bg-slate-100"
                  />
                ))}
              </div>
            ) : documentsQuery.isError ? (
              <div className="grid min-h-72 place-items-center p-6 text-center">
                <div>
                  <AlertCircle className="mx-auto size-8 text-red-500" />
                  <h3 className="mt-3 text-sm font-bold text-[#142039]">
                    Impossible de charger les documents
                  </h3>
                  <p className="mt-1 text-xs text-slate-500">
                    {getApiErrorMessage(documentsQuery.error)}
                  </p>
                </div>
              </div>
            ) : documents.length === 0 ? (
              <div className="grid min-h-72 place-items-center p-6 text-center">
                <div>
                  <div className="mx-auto grid size-11 place-items-center rounded-full bg-blue-50 text-[#075bd8]">
                    <FolderOpen className="size-5" />
                  </div>
                  <h3 className="mt-3 text-sm font-bold text-[#142039]">
                    Aucun document pour ce dossier
                  </h3>
                  <p className="mt-1 text-xs text-slate-500">
                    Televersez le premier fichier du patient.
                  </p>
                </div>
              </div>
            ) : (
              <ul className="divide-y divide-[#edf1f7]">
                {documents.map((document) => (
                  <li
                    key={document.id}
                    className="flex items-center gap-3 px-4 py-3.5 hover:bg-[#fafbff]"
                  >
                    <span className="grid size-9 shrink-0 place-items-center rounded-md bg-blue-50 text-[#075bd8]">
                      <FileText className="size-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-bold text-[#17233b]">
                        {textOrDash(document.fileName)}
                      </p>
                      <p className="mt-0.5 text-[10px] text-slate-500">
                        {textOrDash(document.fileType)} -{' '}
                        {formatDateTime(document.uploadedAt)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(document)}
                      className="grid size-8 shrink-0 place-items-center rounded-md text-slate-500 hover:bg-red-50 hover:text-red-600"
                      aria-label="Supprimer le document"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </section>
      </div>

      <DoctorDialog
        open={Boolean(deleteTarget)}
        title="Supprimer ce document ?"
        description="Cette action ne peut pas etre annulee."
        onClose={() => !deleteMutation.isPending && setDeleteTarget(null)}
        size="sm"
      >
        <div className="p-5">
          <p className="text-sm font-semibold text-[#17233b]">
            {textOrDash(deleteTarget?.fileName)}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Televerse le {formatDateTime(deleteTarget?.uploadedAt)}
          </p>
          <div className="mt-6 flex justify-end gap-2 border-t pt-4">
            <button
              type="button"
              onClick={() => setDeleteTarget(null)}
              disabled={deleteMutation.isPending}
              className="h-10 rounded-md border px-4 text-xs font-semibold text-[#465269]"
            >
              Annuler
            </button>
            <button
              type="button"
              disabled={deleteMutation.isPending || !deleteTarget?.id}
              onClick={() =>
                deleteTarget?.id && deleteMutation.mutate(deleteTarget.id)
              }
              className="h-10 rounded-md bg-red-600 px-4 text-xs font-semibold text-white disabled:opacity-60"
            >
              {deleteMutation.isPending ? 'Suppression...' : 'Supprimer'}
            </button>
          </div>
        </div>
      </DoctorDialog>
    </PortalShell>
  )
}
