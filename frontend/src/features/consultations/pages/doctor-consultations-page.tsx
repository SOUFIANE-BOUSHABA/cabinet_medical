import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  AlertCircle,
  CalendarDays,
  ClipboardList,
  Eye,
  FileText,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
} from 'lucide-react'
import { useMemo, useState, type FormEvent } from 'react'
import { toast } from 'sonner'
import { PortalShell } from '@/components/layout/portal-shell'
import {
  consultationDetailQuery,
  consultationKeys,
  consultationsByRecordQuery,
  medicalRecordsQuery,
} from '@/features/consultations/api/consultation-queries'
import {
  createConsultation,
  deleteConsultation,
  type Consultation,
  type MedicalRecord,
  updateConsultation,
} from '@/features/consultations/api/consultations-api'
import { DoctorDialog } from '@/features/doctors/ui/doctor-dialog'
import { getApiErrorMessage } from '@/lib/api/client'

interface ConsultationFormState {
  consultationDate: string
  diagnosis: string
  notes: string
  treatment: string
}

const emptyForm = (): ConsultationFormState => ({
  consultationDate: new Date().toISOString().slice(0, 10),
  diagnosis: '',
  notes: '',
  treatment: '',
})

function textOrDash(value?: string) {
  return value?.trim() || 'Non renseigne'
}

function formatDate(value?: string) {
  if (!value) return 'Non renseigne'
  return new Intl.DateTimeFormat('fr-FR').format(new Date(`${value}T00:00:00`))
}

function formatDateTime(value?: string) {
  if (!value) return 'Non renseigne'
  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

function toFormState(consultation: Consultation): ConsultationFormState {
  return {
    consultationDate:
      consultation.consultationDate ?? emptyForm().consultationDate,
    diagnosis: consultation.diagnosis ?? '',
    notes: consultation.notes ?? '',
    treatment: consultation.treatment ?? '',
  }
}

function RecordOption({ record }: { record: MedicalRecord }) {
  return (
    <>
      {textOrDash(record.patientName)}
      {record.patientCin ? ` - ${record.patientCin}` : ''}
      {record.id ? ` (#${record.id})` : ''}
    </>
  )
}

export function DoctorConsultationsPage() {
  const queryClient = useQueryClient()
  const [selectedRecordId, setSelectedRecordId] = useState(0)
  const [recordSearch, setRecordSearch] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editingConsultation, setEditingConsultation] =
    useState<Consultation | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Consultation | null>(null)
  const [detailId, setDetailId] = useState<number | null>(null)
  const [form, setForm] = useState<ConsultationFormState>(() => emptyForm())

  const recordsQuery = useQuery(medicalRecordsQuery())
  const detailQuery = useQuery(consultationDetailQuery(detailId ?? 0))

  const records = useMemo(
    () => recordsQuery.data?.content ?? [],
    [recordsQuery.data?.content],
  )
  const effectiveRecordId = selectedRecordId || records[0]?.id || 0
  const consultationsQuery = useQuery(
    consultationsByRecordQuery(effectiveRecordId),
  )
  const selectedRecord = records.find(
    (record) => record.id === effectiveRecordId,
  )

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

  const createMutation = useMutation({
    mutationFn: createConsultation,
    onSuccess: async (created) => {
      await queryClient.invalidateQueries({
        queryKey: consultationKeys.byRecord(
          created.medicalRecordId ?? effectiveRecordId,
        ),
      })
      toast.success('Consultation creee avec succes')
      setFormOpen(false)
      setForm(emptyForm())
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  })

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      values,
    }: {
      id: number
      values: ConsultationFormState
    }) =>
      updateConsultation(id, {
        consultationDate: values.consultationDate,
        diagnosis: values.diagnosis,
        notes: values.notes,
        treatment: values.treatment,
      }),
    onSuccess: async (updated) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: consultationKeys.byRecord(
            updated.medicalRecordId ?? effectiveRecordId,
          ),
        }),
        updated.id
          ? queryClient.invalidateQueries({
              queryKey: consultationKeys.detail(updated.id),
            })
          : Promise.resolve(),
      ])
      toast.success('Consultation mise a jour')
      setEditingConsultation(null)
      setFormOpen(false)
      setForm(emptyForm())
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  })

  const deleteMutation = useMutation({
    mutationFn: deleteConsultation,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: consultationKeys.byRecord(effectiveRecordId),
      })
      toast.success('Consultation supprimee')
      setDeleteTarget(null)
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  })

  const openCreate = () => {
    setEditingConsultation(null)
    setForm(emptyForm())
    setFormOpen(true)
  }

  const openEdit = (consultation: Consultation) => {
    setEditingConsultation(consultation)
    setForm(toFormState(consultation))
    setFormOpen(true)
  }

  const submitForm = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!effectiveRecordId) {
      toast.error('Selectionnez un dossier medical')
      return
    }

    try {
      if (editingConsultation?.id) {
        await updateMutation.mutateAsync({
          id: editingConsultation.id,
          values: form,
        })
        return
      }

      await createMutation.mutateAsync({
        medicalRecordId: effectiveRecordId,
        consultationDate: form.consultationDate,
        diagnosis: form.diagnosis,
        notes: form.notes,
        treatment: form.treatment,
      })
    } catch {
      // The mutation displays the API error toast.
    }
  }

  const consultations = consultationsQuery.data ?? []
  const submitting = createMutation.isPending || updateMutation.isPending

  return (
    <PortalShell>
      <div className="mx-auto max-w-[1180px]">
        <section className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
          <div>
            <h1 className="text-xl leading-tight font-bold text-[#101b31]">
              Consultations
            </h1>
            <p className="mt-1 text-[11px] text-[#5f6c81]">
              Ajoutez, consultez et mettez a jour les consultations par dossier
              medical.
            </p>
          </div>
          <button
            type="button"
            onClick={openCreate}
            disabled={!effectiveRecordId}
            className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-[#075bd8] px-4 text-xs font-semibold text-white shadow-sm hover:bg-[#064fb9] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus className="size-4" strokeWidth={2.2} />
            Nouvelle consultation
          </button>
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
                  {selectedRecord ? (
                    <RecordOption record={selectedRecord} />
                  ) : (
                    'Selectionnez un dossier'
                  )}
                </h2>
              </div>
              <div className="inline-flex w-fit items-center gap-2 rounded-md border border-[#cfd7e7] bg-white px-3 py-2 text-xs font-semibold text-slate-600">
                <ClipboardList className="size-4 text-[#075bd8]" />
                {consultations.length} consultation(s)
              </div>
            </header>

            {consultationsQuery.isLoading ? (
              <div className="space-y-3 p-4">
                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="h-24 animate-pulse rounded-md bg-slate-100"
                  />
                ))}
              </div>
            ) : consultationsQuery.isError ? (
              <div className="grid min-h-72 place-items-center p-6 text-center">
                <div>
                  <AlertCircle className="mx-auto size-8 text-red-500" />
                  <h3 className="mt-3 text-sm font-bold text-[#142039]">
                    Impossible de charger les consultations
                  </h3>
                  <p className="mt-1 text-xs text-slate-500">
                    {getApiErrorMessage(consultationsQuery.error)}
                  </p>
                </div>
              </div>
            ) : consultations.length === 0 ? (
              <div className="grid min-h-72 place-items-center p-6 text-center">
                <div>
                  <div className="mx-auto grid size-11 place-items-center rounded-full bg-blue-50 text-[#075bd8]">
                    <CalendarDays className="size-5" />
                  </div>
                  <h3 className="mt-3 text-sm font-bold text-[#142039]">
                    Aucune consultation pour ce dossier
                  </h3>
                  <p className="mt-1 text-xs text-slate-500">
                    Creez la premiere consultation medicale du patient.
                  </p>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left">
                  <thead className="bg-[#f6f8ff] text-[10px] font-semibold text-[#26334b]">
                    <tr>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Medecin</th>
                      <th className="px-4 py-3">Diagnostic</th>
                      <th className="px-4 py-3">Traitement</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {consultations.map((consultation) => (
                      <tr
                        key={consultation.id}
                        className="border-t border-[#dce2ed] text-[11px] text-[#334158] hover:bg-[#fafbff]"
                      >
                        <td className="px-4 py-3.5 font-semibold whitespace-nowrap text-[#17233b]">
                          {formatDate(consultation.consultationDate)}
                        </td>
                        <td className="px-4 py-3.5">
                          {textOrDash(consultation.doctorName)}
                        </td>
                        <td className="max-w-64 px-4 py-3.5">
                          <span className="line-clamp-2">
                            {textOrDash(consultation.diagnosis)}
                          </span>
                        </td>
                        <td className="max-w-64 px-4 py-3.5">
                          <span className="line-clamp-2">
                            {textOrDash(consultation.treatment)}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex justify-end gap-1">
                            <button
                              type="button"
                              onClick={() =>
                                consultation.id && setDetailId(consultation.id)
                              }
                              className="grid size-8 place-items-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-[#075bd8]"
                              aria-label="Voir la consultation"
                            >
                              <Eye className="size-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => openEdit(consultation)}
                              className="grid size-8 place-items-center rounded-md text-slate-500 hover:bg-blue-50 hover:text-[#075bd8]"
                              aria-label="Modifier la consultation"
                            >
                              <Pencil className="size-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteTarget(consultation)}
                              className="grid size-8 place-items-center rounded-md text-slate-500 hover:bg-red-50 hover:text-red-600"
                              aria-label="Supprimer la consultation"
                            >
                              <Trash2 className="size-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </section>
      </div>

      <DoctorDialog
        open={formOpen}
        title={
          editingConsultation
            ? 'Modifier la consultation'
            : 'Nouvelle consultation'
        }
        description="Le medecin est associe automatiquement a votre compte connecte."
        onClose={() => {
          if (submitting) return
          setFormOpen(false)
          setEditingConsultation(null)
        }}
      >
        <form onSubmit={submitForm} className="space-y-4 p-5">
          <label className="block">
            <span className="text-xs font-semibold text-slate-600">
              Date de consultation
            </span>
            <input
              type="date"
              required
              value={form.consultationDate}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  consultationDate: event.target.value,
                }))
              }
              className="mt-1 h-10 w-full rounded-md border border-[#cfd7e7] px-3 text-sm outline-none focus:border-[#075bd8] focus:ring-1 focus:ring-[#075bd8]"
            />
          </label>

          <label className="block">
            <span className="text-xs font-semibold text-slate-600">
              Diagnostic
            </span>
            <textarea
              value={form.diagnosis}
              maxLength={1000}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  diagnosis: event.target.value,
                }))
              }
              className="mt-1 min-h-20 w-full rounded-md border border-[#cfd7e7] px-3 py-2 text-sm outline-none focus:border-[#075bd8] focus:ring-1 focus:ring-[#075bd8]"
            />
          </label>

          <label className="block">
            <span className="text-xs font-semibold text-slate-600">Notes</span>
            <textarea
              value={form.notes}
              maxLength={2000}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  notes: event.target.value,
                }))
              }
              className="mt-1 min-h-20 w-full rounded-md border border-[#cfd7e7] px-3 py-2 text-sm outline-none focus:border-[#075bd8] focus:ring-1 focus:ring-[#075bd8]"
            />
          </label>

          <label className="block">
            <span className="text-xs font-semibold text-slate-600">
              Traitement
            </span>
            <textarea
              value={form.treatment}
              maxLength={2000}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  treatment: event.target.value,
                }))
              }
              className="mt-1 min-h-20 w-full rounded-md border border-[#cfd7e7] px-3 py-2 text-sm outline-none focus:border-[#075bd8] focus:ring-1 focus:ring-[#075bd8]"
            />
          </label>

          <div className="flex justify-end gap-2 border-t pt-4">
            <button
              type="button"
              onClick={() => setFormOpen(false)}
              disabled={submitting}
              className="h-10 rounded-md border border-[#cfd7e7] px-4 text-xs font-semibold text-slate-600"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="h-10 rounded-md bg-[#075bd8] px-4 text-xs font-semibold text-white disabled:opacity-60"
            >
              {submitting ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </DoctorDialog>

      <DoctorDialog
        open={detailId !== null}
        title="Detail de la consultation"
        onClose={() => setDetailId(null)}
      >
        <div className="p-5">
          {detailQuery.isLoading ? (
            <div className="space-y-3">
              <div className="h-5 w-1/2 animate-pulse rounded bg-slate-100" />
              <div className="h-20 animate-pulse rounded bg-slate-100" />
              <div className="h-20 animate-pulse rounded bg-slate-100" />
            </div>
          ) : detailQuery.isError ? (
            <p className="text-sm text-red-600">
              {getApiErrorMessage(detailQuery.error)}
            </p>
          ) : (
            <dl className="grid gap-4 text-sm">
              <div>
                <dt className="text-xs font-semibold text-slate-500">Date</dt>
                <dd className="mt-1 font-bold text-[#17233b]">
                  {formatDate(detailQuery.data?.consultationDate)}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold text-slate-500">
                  Medecin
                </dt>
                <dd className="mt-1 text-[#17233b]">
                  {textOrDash(detailQuery.data?.doctorName)}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold text-slate-500">
                  Diagnostic
                </dt>
                <dd className="mt-1 whitespace-pre-wrap text-[#17233b]">
                  {textOrDash(detailQuery.data?.diagnosis)}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold text-slate-500">Notes</dt>
                <dd className="mt-1 whitespace-pre-wrap text-[#17233b]">
                  {textOrDash(detailQuery.data?.notes)}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold text-slate-500">
                  Traitement
                </dt>
                <dd className="mt-1 whitespace-pre-wrap text-[#17233b]">
                  {textOrDash(detailQuery.data?.treatment)}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold text-slate-500">
                  Cree le
                </dt>
                <dd className="mt-1 text-[#17233b]">
                  {formatDateTime(detailQuery.data?.createdAt)}
                </dd>
              </div>
            </dl>
          )}
        </div>
      </DoctorDialog>

      <DoctorDialog
        open={Boolean(deleteTarget)}
        title="Supprimer cette consultation ?"
        description="Cette action ne peut pas etre annulee."
        onClose={() => !deleteMutation.isPending && setDeleteTarget(null)}
        size="sm"
      >
        <div className="p-5">
          <p className="text-sm font-semibold text-[#17233b]">
            Consultation du {formatDate(deleteTarget?.consultationDate)}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {textOrDash(deleteTarget?.diagnosis)}
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
