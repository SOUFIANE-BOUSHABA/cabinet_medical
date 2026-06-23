import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AlertCircle, Calendar, ChevronLeft, ChevronRight, Clock, XCircle } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { PortalShell } from '@/components/layout/portal-shell'
import { cancelAppointment, type Appointment } from '@/features/appointments/api/appointments-api'
import { appointmentKeys, myAppointmentsQuery } from '@/features/appointments/api/appointment-queries'
import { DoctorDialog } from '@/features/doctors/ui/doctor-dialog'
import { getApiErrorMessage } from '@/lib/api/client'

const PAGE_SIZE = 20

const statusLabels: Record<string, string> = {
  PENDING: 'En attente',
  CONFIRMED: 'Confirmé',
  CANCELLED: 'Annulé',
  COMPLETED: 'Terminé',
}

const statusColors: Record<string, string> = {
  PENDING: 'bg-amber-50 text-amber-700',
  CONFIRMED: 'bg-green-50 text-green-700',
  CANCELLED: 'bg-red-50 text-red-700',
  COMPLETED: 'bg-blue-50 text-blue-700',
}

function formatTime(time?: { hour?: number; minute?: number }) {
  if (!time) return '—'
  return `${String(time.hour ?? 0).padStart(2, '0')}:${String(time.minute ?? 0).padStart(2, '0')}`
}

function AppointmentsSkeleton() {
  return (
    <div className="animate-pulse space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-24 rounded-lg bg-slate-100" />
      ))}
    </div>
  )
}

export function MyAppointmentsPage() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(0)
  const [cancelTarget, setCancelTarget] = useState<Appointment | null>(null)

  const appointments = useQuery(myAppointmentsQuery(page, PAGE_SIZE))

  const cancelMutation = useMutation({
    mutationFn: cancelAppointment,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: appointmentKeys.myLists() })
      toast.success('Rendez-vous annulé')
      setCancelTarget(null)
      if ((appointments.data?.content?.length ?? 0) === 1 && page > 0) {
        setPage((current) => current - 1)
      }
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  })

  const content = appointments.data?.content ?? []
  const totalElements = appointments.data?.totalElements ?? 0
  const totalPages = appointments.data?.totalPages ?? 0
  const start = totalElements === 0 ? 0 : page * PAGE_SIZE + 1
  const end = Math.min((page + 1) * PAGE_SIZE, totalElements)

  return (
    <PortalShell>
      <div className="mx-auto max-w-[800px]">
        <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div>
            <h1 className="text-xl leading-tight font-bold tracking-[-0.03em] text-[#101b31]">
              Mes rendez-vous
            </h1>
            <p className="mt-1 text-[11px] text-[#5f6c81]">
              Consultez et gérez vos rendez-vous.
            </p>
          </div>
        </section>

        <section className="mt-3">
          {appointments.isLoading ? (
            <AppointmentsSkeleton />
          ) : appointments.isError ? (
            <div className="grid min-h-72 place-items-center rounded-lg border border-[#cfd7e7] bg-white p-6 text-center">
              <AlertCircle className="size-8 text-red-500" />
              <h2 className="mt-3 text-sm font-bold text-[#142039]">
                Impossible de charger vos rendez-vous
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                {getApiErrorMessage(appointments.error)}
              </p>
              <button
                type="button"
                onClick={() => void appointments.refetch()}
                className="mt-4 rounded-md bg-[#075bd8] px-4 py-2 text-xs font-semibold text-white"
              >
                Réessayer
              </button>
            </div>
          ) : content.length === 0 ? (
            <div className="grid min-h-72 place-items-center rounded-lg border border-[#cfd7e7] bg-white p-6 text-center">
              <Calendar className="size-8 text-[#075bd8]" />
              <h2 className="mt-3 text-sm font-bold text-[#142039]">
                Aucun rendez-vous
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Vous n'avez pas encore de rendez-vous programmés.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {content.map((appt) => (
                <article
                  key={appt.id}
                  className="rounded-lg border border-[#cfd7e7] bg-white p-4 shadow-[0_1px_3px_rgba(16,29,53,0.06)]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-bold text-[#17233b]">
                        Dr. {appt.doctorName ?? 'Non spécifié'}
                      </h3>
                      <p className="mt-0.5 text-xs text-slate-500">{appt.doctorName}</p>
                    </div>
                    <span
                      className={`inline-flex shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold ${statusColors[appt.status ?? 'PENDING']}`}
                    >
                      {statusLabels[appt.status ?? 'PENDING']}
                    </span>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-4 text-xs text-[#5f6c81]">
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="size-3.5" />
                      {appt.date ?? '—'}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="size-3.5" />
                      {formatTime(appt.startTime)} - {formatTime(appt.endTime)}
                    </span>
                  </div>

                  {appt.reason && (
                    <p className="mt-2 text-[11px] text-slate-500">
                      Motif : {appt.reason}
                    </p>
                  )}

                  {appt.status === 'PENDING' && (
                    <div className="mt-3 flex justify-end">
                      <button
                        type="button"
                        onClick={() => setCancelTarget(appt)}
                        className="inline-flex items-center gap-1 rounded-md border border-red-200 px-3 py-1.5 text-[10px] font-semibold text-red-600 hover:bg-red-50"
                      >
                        <XCircle className="size-3" />
                        Annuler
                      </button>
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}

          {!appointments.isLoading && !appointments.isError && totalElements > 0 && (
            <footer className="mt-4 flex flex-col gap-3 border-t border-[#dce2ed] px-1 py-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-[10px] text-[#657187]">
                Affichage de {start} à {end} sur {totalElements} rendez-vous
              </p>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={page === 0}
                  onClick={() => setPage((current) => current - 1)}
                  className="grid size-8 place-items-center rounded-md border text-slate-500 disabled:opacity-35"
                  aria-label="Page précédente"
                >
                  <ChevronLeft className="size-4" />
                </button>
                <span className="grid h-8 min-w-8 place-items-center rounded-md bg-[#075bd8] px-2 text-[11px] font-semibold text-white">
                  {page + 1}
                </span>
                <button
                  type="button"
                  disabled={totalPages === 0 || page >= totalPages - 1}
                  onClick={() => setPage((current) => current + 1)}
                  className="grid size-8 place-items-center rounded-md border text-slate-500 disabled:opacity-35"
                  aria-label="Page suivante"
                >
                  <ChevronRight className="size-4" />
                </button>
              </div>
            </footer>
          )}
        </section>
      </div>

      <DoctorDialog
        open={Boolean(cancelTarget)}
        title="Annuler ce rendez-vous ?"
        description="Cette action est irréversible."
        onClose={() => !cancelMutation.isPending && setCancelTarget(null)}
        size="sm"
      >
        <div className="p-5">
          <p className="text-sm font-semibold text-[#17233b]">
            Dr. {cancelTarget?.doctorName ?? 'Non spécifié'}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {cancelTarget?.date} à {formatTime(cancelTarget?.startTime)}
          </p>
          <div className="mt-6 flex justify-end gap-2 border-t pt-4">
            <button
              type="button"
              onClick={() => setCancelTarget(null)}
              disabled={cancelMutation.isPending}
              className="h-10 rounded-lg border px-4 text-xs font-semibold text-[#465269]"
            >
              Non
            </button>
            <button
              type="button"
              disabled={cancelMutation.isPending || !cancelTarget?.id}
              onClick={() => cancelTarget?.id && cancelMutation.mutate(cancelTarget.id)}
              className="h-10 rounded-lg bg-red-600 px-4 text-xs font-semibold text-white disabled:opacity-60"
            >
              {cancelMutation.isPending ? 'Annulation…' : 'Oui, annuler'}
            </button>
          </div>
        </div>
      </DoctorDialog>
    </PortalShell>
  )
}
