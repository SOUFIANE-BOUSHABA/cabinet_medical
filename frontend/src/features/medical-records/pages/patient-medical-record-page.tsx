import { useQuery } from '@tanstack/react-query'
import {
  AlertCircle,
  CalendarDays,
  ClipboardList,
  FileText,
  RefreshCw,
  Stethoscope,
} from 'lucide-react'
import { PortalShell } from '@/components/layout/portal-shell'
import { consultationsByRecordQuery } from '@/features/consultations/api/consultation-queries'
import { myMedicalRecordQuery } from '@/features/medical-records/api/medical-record-queries'
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

export function PatientMedicalRecordPage() {
  const recordQuery = useQuery(myMedicalRecordQuery())
  const recordId = recordQuery.data?.id ?? 0
  const consultationsQuery = useQuery(consultationsByRecordQuery(recordId))
  const consultations = consultationsQuery.data ?? []

  return (
    <PortalShell>
      <div className="mx-auto max-w-[900px]">
        <section>
          <h1 className="text-xl leading-tight font-bold text-[#101b31]">
            Mon dossier medical
          </h1>
          <p className="mt-1 text-[11px] text-[#5f6c81]">
            Retrouvez les informations de votre dossier et l'historique de vos
            consultations.
          </p>
        </section>

        {recordQuery.isLoading ? (
          <div className="mt-4 space-y-3">
            <div className="h-28 animate-pulse rounded-lg bg-slate-100" />
            <div className="h-40 animate-pulse rounded-lg bg-slate-100" />
          </div>
        ) : recordQuery.isError ? (
          <div className="mt-4 grid min-h-60 place-items-center rounded-lg border border-[#cfd7e7] bg-white p-6 text-center">
            <div>
              <AlertCircle className="mx-auto size-8 text-red-500" />
              <h3 className="mt-3 text-sm font-bold text-[#142039]">
                Dossier indisponible
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                {getApiErrorMessage(recordQuery.error)}
              </p>
              <button
                type="button"
                onClick={() => void recordQuery.refetch()}
                className="mt-3 inline-flex h-8 items-center gap-2 rounded-md bg-[#075bd8] px-3 text-xs font-semibold text-white"
              >
                <RefreshCw className="size-3.5" />
                Reessayer
              </button>
            </div>
          </div>
        ) : (
          <>
            <section className="mt-4 overflow-hidden rounded-lg border border-[#cfd7e7] bg-white shadow-[0_2px_8px_rgba(16,29,53,0.06)]">
              <header className="flex items-center justify-between gap-3 border-b border-[#dce2ed] bg-[#f8fbff] px-5 py-4">
                <div className="flex items-center gap-3">
                  <span className="grid size-10 place-items-center rounded-full bg-[#d9e6ff] text-[#075bd8]">
                    <FileText className="size-5" />
                  </span>
                  <div>
                    <h2 className="text-base font-bold text-[#142039]">
                      {textOrDash(recordQuery.data?.patientName)}
                    </h2>
                    <p className="text-[11px] text-slate-500">
                      CIN {textOrDash(recordQuery.data?.patientCin)} - Dossier #
                      {recordQuery.data?.id}
                    </p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-2 rounded-md border border-[#cfd7e7] bg-white px-3 py-2 text-xs font-semibold text-slate-600">
                  <ClipboardList className="size-4 text-[#075bd8]" />
                  {consultations.length} consultation(s)
                </span>
              </header>
              <dl className="grid gap-4 px-5 py-4 sm:grid-cols-2">
                <div>
                  <dt className="text-[10px] font-semibold tracking-wide text-slate-500 uppercase">
                    Ouvert le
                  </dt>
                  <dd className="mt-1 text-sm font-semibold text-[#17233b]">
                    {formatDateTime(recordQuery.data?.createdAt)}
                  </dd>
                </div>
                <div>
                  <dt className="text-[10px] font-semibold tracking-wide text-slate-500 uppercase">
                    Derniere mise a jour
                  </dt>
                  <dd className="mt-1 text-sm font-semibold text-[#17233b]">
                    {formatDateTime(recordQuery.data?.updatedAt)}
                  </dd>
                </div>
              </dl>
            </section>

            <section className="mt-4 overflow-hidden rounded-lg border border-[#cfd7e7] bg-white p-5 shadow-[0_2px_8px_rgba(16,29,53,0.06)]">
              <h3 className="flex items-center gap-2 text-sm font-bold text-[#142039]">
                <Stethoscope className="size-4 text-[#075bd8]" />
                Historique des consultations
              </h3>

              {consultationsQuery.isLoading ? (
                <div className="mt-3 space-y-3">
                  {[1, 2].map((item) => (
                    <div
                      key={item}
                      className="h-24 animate-pulse rounded-md bg-slate-100"
                    />
                  ))}
                </div>
              ) : consultationsQuery.isError ? (
                <div className="mt-3 rounded-md bg-red-50 p-4 text-center">
                  <AlertCircle className="mx-auto size-6 text-red-500" />
                  <p className="mt-2 text-xs text-slate-600">
                    {getApiErrorMessage(consultationsQuery.error)}
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
                      {consultation.notes ? (
                        <p className="mt-1 text-[11px] text-slate-600">
                          <span className="font-semibold text-slate-500">
                            Notes :{' '}
                          </span>
                          {consultation.notes}
                        </p>
                      ) : null}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </>
        )}
      </div>
    </PortalShell>
  )
}
