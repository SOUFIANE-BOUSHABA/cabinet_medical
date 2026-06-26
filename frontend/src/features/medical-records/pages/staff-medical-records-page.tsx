import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  AlertCircle,
  CalendarDays,
  ClipboardList,
  FileText,
  FolderPlus,
  RefreshCw,
  Search,
  Stethoscope,
  UserRound,
} from 'lucide-react'
import { useMemo, useState, type FormEvent } from 'react'
import { toast } from 'sonner'
import { PortalShell } from '@/components/layout/portal-shell'
import { consultationsByRecordQuery } from '@/features/consultations/api/consultation-queries'
import { DoctorDialog } from '@/features/doctors/ui/doctor-dialog'
import {
  medicalRecordKeys,
  medicalRecordsQuery,
} from '@/features/medical-records/api/medical-record-queries'
import {
  createMedicalRecord,
  type MedicalRecord,
} from '@/features/medical-records/api/medical-records-api'
import { patientsQuery } from '@/features/patients/api/patient-queries'
import { getApiErrorMessage } from '@/lib/api/client'

function textOrDash(value?: string | null) {
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

export function StaffMedicalRecordsPage() {
  const queryClient = useQueryClient()
  const [selectedRecordId, setSelectedRecordId] = useState(0)
  const [recordSearch, setRecordSearch] = useState('')
  const [createOpen, setCreateOpen] = useState(false)
  const [patientSearch, setPatientSearch] = useState('')
  const [chosenPatientId, setChosenPatientId] = useState(0)

  const recordsQuery = useQuery(medicalRecordsQuery())
  const records = useMemo(
    () => recordsQuery.data?.content ?? [],
    [recordsQuery.data?.content],
  )
  const effectiveRecordId = selectedRecordId || records[0]?.id || 0
  const selectedRecord = records.find(
    (record) => record.id === effectiveRecordId,
  )
  const consultationsQuery = useQuery(
    consultationsByRecordQuery(effectiveRecordId),
  )
  const consultations = consultationsQuery.data ?? []

  const patientList = useQuery({
    ...patientsQuery(0, 100),
    enabled: createOpen,
  })
  const existingPatientIds = useMemo(
    () => new Set(records.map((record) => record.patientId)),
    [records],
  )
  const selectablePatients = useMemo(() => {
    const items = (patientList.data?.content ?? []).filter(
      (patient) => patient.id && !existingPatientIds.has(patient.id),
    )
    const search = patientSearch.trim().toLowerCase()
    if (!search) return items
    return items.filter((patient) =>
      [patient.firstName, patient.lastName, patient.cin]
        .join(' ')
        .toLowerCase()
        .includes(search),
    )
  }, [patientList.data?.content, existingPatientIds, patientSearch])

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
    mutationFn: createMedicalRecord,
    onSuccess: async (created) => {
      await queryClient.invalidateQueries({
        queryKey: medicalRecordKeys.lists(),
      })
      toast.success('Dossier medical cree avec succes')
      if (created.id) setSelectedRecordId(created.id)
      closeCreate()
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  })

  const closeCreate = () => {
    if (createMutation.isPending) return
    setCreateOpen(false)
    setChosenPatientId(0)
    setPatientSearch('')
  }

  const submitCreate = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!chosenPatientId) {
      toast.error('Selectionnez un patient')
      return
    }
    createMutation.mutate({ patientId: chosenPatientId })
  }

  return (
    <PortalShell>
      <div className="mx-auto max-w-[1180px]">
        <section className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
          <div>
            <h1 className="text-xl leading-tight font-bold text-[#101b31]">
              Dossiers medicaux
            </h1>
            <p className="mt-1 text-[11px] text-[#5f6c81]">
              Consultez les dossiers des patients et leur historique de
              consultations.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-[#075bd8] px-4 text-xs font-semibold text-white shadow-sm hover:bg-[#064fb9]"
          >
            <FolderPlus className="size-4" strokeWidth={2.2} />
            Nouveau dossier
          </button>
        </section>

        <section className="mt-4 grid gap-4 lg:grid-cols-[320px_1fr]">
          <aside className="overflow-hidden rounded-lg border border-[#cfd7e7] bg-white shadow-[0_2px_8px_rgba(16,29,53,0.06)]">
            <div className="border-b border-[#dce2ed] p-4">
              <h2 className="text-sm font-bold text-[#142039]">
                Patients ({records.length})
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
            {selectedRecord ? (
              <RecordDetail
                record={selectedRecord}
                consultations={consultations}
                isLoading={consultationsQuery.isLoading}
                isError={consultationsQuery.isError}
                error={consultationsQuery.error}
              />
            ) : (
              <div className="grid min-h-72 place-items-center p-6 text-center">
                <div>
                  <div className="mx-auto grid size-11 place-items-center rounded-full bg-blue-50 text-[#075bd8]">
                    <FileText className="size-5" />
                  </div>
                  <h3 className="mt-3 text-sm font-bold text-[#142039]">
                    Selectionnez un dossier
                  </h3>
                  <p className="mt-1 text-xs text-slate-500">
                    Choisissez un patient dans la liste pour afficher son
                    dossier.
                  </p>
                </div>
              </div>
            )}
          </section>
        </section>
      </div>

      <DoctorDialog
        open={createOpen}
        title="Nouveau dossier medical"
        description="Selectionnez le patient pour lequel ouvrir un dossier."
        onClose={closeCreate}
      >
        <form onSubmit={submitCreate} className="space-y-4 p-5">
          <label className="relative block">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
            <input
              value={patientSearch}
              onChange={(event) => setPatientSearch(event.target.value)}
              className="h-10 w-full rounded-md border border-[#cfd7e7] pr-3 pl-9 text-sm outline-none focus:border-[#075bd8] focus:ring-1 focus:ring-[#075bd8]"
              placeholder="Rechercher un patient (nom ou CIN)"
            />
          </label>

          {patientList.isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="h-12 animate-pulse rounded-md bg-slate-100"
                />
              ))}
            </div>
          ) : patientList.isError ? (
            <p className="text-xs text-red-600">
              {getApiErrorMessage(patientList.error)}
            </p>
          ) : selectablePatients.length === 0 ? (
            <p className="rounded-md bg-slate-50 p-4 text-center text-xs text-slate-500">
              Aucun patient disponible sans dossier.
            </p>
          ) : (
            <div className="max-h-64 divide-y divide-[#edf1f7] overflow-y-auto rounded-md border border-[#dce2ed]">
              {selectablePatients.map((patient) => (
                <button
                  key={patient.id}
                  type="button"
                  onClick={() => setChosenPatientId(patient.id ?? 0)}
                  className={`flex w-full items-center gap-3 px-3 py-2.5 text-left transition hover:bg-blue-50 ${
                    chosenPatientId === patient.id ? 'bg-[#eef5ff]' : ''
                  }`}
                >
                  <span className="grid size-8 shrink-0 place-items-center rounded-full bg-[#d9e6ff] text-[#075bd8]">
                    <UserRound className="size-4" />
                  </span>
                  <span>
                    <span className="block text-xs font-bold text-[#17233b]">
                      {patient.firstName} {patient.lastName}
                    </span>
                    <span className="block text-[10px] text-slate-500">
                      CIN {textOrDash(patient.cin)}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          )}

          <div className="flex justify-end gap-2 border-t pt-4">
            <button
              type="button"
              onClick={closeCreate}
              disabled={createMutation.isPending}
              className="h-10 rounded-md border border-[#cfd7e7] px-4 text-xs font-semibold text-slate-600"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending || !chosenPatientId}
              className="h-10 rounded-md bg-[#075bd8] px-4 text-xs font-semibold text-white disabled:opacity-60"
            >
              {createMutation.isPending ? 'Creation...' : 'Creer le dossier'}
            </button>
          </div>
        </form>
      </DoctorDialog>
    </PortalShell>
  )
}

function RecordDetail({
  record,
  consultations,
  isLoading,
  isError,
  error,
}: {
  record: MedicalRecord
  consultations: Array<{
    id?: number
    consultationDate?: string
    doctorName?: string
    diagnosis?: string
    treatment?: string
  }>
  isLoading: boolean
  isError: boolean
  error: unknown
}) {
  return (
    <>
      <header className="flex flex-col gap-3 border-b border-[#dce2ed] bg-[#f8fbff] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[10px] font-semibold tracking-[0.14em] text-[#075bd8] uppercase">
            Dossier medical
          </p>
          <h2 className="mt-1 text-base font-bold text-[#142039]">
            {textOrDash(record.patientName)}
          </h2>
          <p className="mt-0.5 text-[11px] text-slate-500">
            CIN {textOrDash(record.patientCin)} - Dossier #{record.id}
          </p>
        </div>
        <div className="inline-flex w-fit items-center gap-2 rounded-md border border-[#cfd7e7] bg-white px-3 py-2 text-xs font-semibold text-slate-600">
          <ClipboardList className="size-4 text-[#075bd8]" />
          {consultations.length} consultation(s)
        </div>
      </header>

      <dl className="grid gap-4 border-b border-[#dce2ed] px-5 py-4 sm:grid-cols-2">
        <div>
          <dt className="text-[10px] font-semibold tracking-wide text-slate-500 uppercase">
            Ouvert le
          </dt>
          <dd className="mt-1 text-sm font-semibold text-[#17233b]">
            {formatDateTime(record.createdAt)}
          </dd>
        </div>
        <div>
          <dt className="text-[10px] font-semibold tracking-wide text-slate-500 uppercase">
            Derniere mise a jour
          </dt>
          <dd className="mt-1 text-sm font-semibold text-[#17233b]">
            {formatDateTime(record.updatedAt)}
          </dd>
        </div>
      </dl>

      <div className="px-5 py-4">
        <h3 className="flex items-center gap-2 text-sm font-bold text-[#142039]">
          <Stethoscope className="size-4 text-[#075bd8]" />
          Historique des consultations
        </h3>

        {isLoading ? (
          <div className="mt-3 space-y-3">
            {[1, 2].map((item) => (
              <div
                key={item}
                className="h-20 animate-pulse rounded-md bg-slate-100"
              />
            ))}
          </div>
        ) : isError ? (
          <div className="mt-3 rounded-md bg-red-50 p-4 text-center">
            <AlertCircle className="mx-auto size-6 text-red-500" />
            <p className="mt-2 text-xs text-slate-600">
              {getApiErrorMessage(error)}
            </p>
          </div>
        ) : consultations.length === 0 ? (
          <div className="mt-3 grid place-items-center rounded-md bg-slate-50 py-10 text-center">
            <div>
              <CalendarDays className="mx-auto size-7 text-slate-400" />
              <p className="mt-2 text-xs font-semibold text-slate-600">
                Aucune consultation enregistree
              </p>
            </div>
          </div>
        ) : (
          <ul className="mt-3 space-y-3">
            {consultations.map((consultation) => (
              <li
                key={consultation.id}
                className="rounded-md border border-[#dce2ed] p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs font-bold text-[#17233b]">
                    {formatDate(consultation.consultationDate)}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    {textOrDash(consultation.doctorName)}
                  </span>
                </div>
                <p className="mt-2 text-[11px] text-slate-600">
                  <span className="font-semibold text-slate-500">
                    Diagnostic :{' '}
                  </span>
                  {textOrDash(consultation.diagnosis)}
                </p>
                <p className="mt-1 text-[11px] text-slate-600">
                  <span className="font-semibold text-slate-500">
                    Traitement :{' '}
                  </span>
                  {textOrDash(consultation.treatment)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  )
}
