import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  AlertCircle,
  CalendarClock,
  CheckCircle2,
  Clock3,
  Flame,
  LoaderCircle,
  Plus,
  RotateCcw,
  Search,
  XCircle,
} from 'lucide-react'
import { useMemo, useState, type FormEvent } from 'react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/layout/page-header'
import { PortalShell } from '@/components/layout/portal-shell'
import {
  appointmentKeys,
  appointmentsQuery,
} from '@/features/appointments/api/appointment-queries'
import {
  cancelAppointment,
  completeAppointment,
  confirmAppointment,
  createAppointment,
  createUrgentAppointment,
  updateAppointment,
  type Appointment,
  type AppointmentStatus,
} from '@/features/appointments/api/appointments-api'
import { getDoctors } from '@/features/doctors/api/doctors-api'
import { DoctorDialog } from '@/features/doctors/ui/doctor-dialog'
import { getPatients } from '@/features/patients/api/patients-api'
import { useAuth } from '@/features/auth/use-auth'
import { getApiErrorMessage } from '@/lib/api/client'
import { cn } from '@/lib/utils/cn'
import {
  formatDate,
  formatTime,
  serializeTime,
  valueOrDash,
} from '@/lib/utils/format'

const PAGE_SIZE = 12
const statuses: Array<AppointmentStatus | ''> = [
  '',
  'PENDING',
  'CONFIRMED',
  'COMPLETED',
  'CANCELLED',
]

const statusLabels: Record<AppointmentStatus, string> = {
  PENDING: 'En attente',
  CONFIRMED: 'Confirmé',
  CANCELLED: 'Annulé',
  COMPLETED: 'Terminé',
}

const statusClasses: Record<AppointmentStatus, string> = {
  PENDING: 'bg-amber-50 text-amber-700 ring-amber-200',
  CONFIRMED: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  CANCELLED: 'bg-rose-50 text-rose-700 ring-rose-200',
  COMPLETED: 'bg-blue-50 text-blue-700 ring-blue-200',
}

interface AppointmentFormState {
  patientId: string
  doctorId: string
  date: string
  startTime: string
  reason: string
  status: AppointmentStatus
  urgent: boolean
}

const blankForm = (): AppointmentFormState => ({
  patientId: '',
  doctorId: '',
  date: new Date().toISOString().slice(0, 10),
  startTime: '09:00',
  reason: '',
  status: 'CONFIRMED',
  urgent: false,
})

function toForm(appointment: Appointment): AppointmentFormState {
  return {
    patientId: String(appointment.patientId ?? ''),
    doctorId: String(appointment.doctorId ?? ''),
    date: appointment.date ?? new Date().toISOString().slice(0, 10),
    startTime: formatTime(appointment.startTime).replace('—', '09:00'),
    reason: appointment.reason ?? '',
    status: appointment.status ?? 'CONFIRMED',
    urgent: appointment.type === 'URGENT' || Boolean(appointment.isUrgent),
  }
}

export function StaffAppointmentsPage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [page, setPage] = useState(0)
  const [status, setStatus] = useState<AppointmentStatus | ''>('')
  const [date, setDate] = useState('')
  const [search, setSearch] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Appointment | null>(null)
  const [form, setForm] = useState<AppointmentFormState>(() => blankForm())

  const canManage = user?.role === 'ADMIN' || user?.role === 'SECRETARY'
  const appointments = useQuery(
    appointmentsQuery({
      page,
      size: PAGE_SIZE,
      status: status || undefined,
      date: date || undefined,
    }),
  )
  const patients = useQuery({
    queryKey: ['patients', 'picker', 0, 100],
    queryFn: () => getPatients({ page: 0, size: 100, sort: 'firstName,asc' }),
  })
  const doctors = useQuery({
    queryKey: ['doctors', 'picker', 0, 100],
    queryFn: () => getDoctors({ page: 0, size: 100, sort: 'id,desc' }),
  })

  const refreshLists = async () => {
    await queryClient.invalidateQueries({ queryKey: appointmentKeys.lists() })
  }

  const createMutation = useMutation({
    mutationFn: async (values: AppointmentFormState) => {
      const payload = {
        patientId: Number(values.patientId),
        doctorId: Number(values.doctorId),
        date: values.date,
        startTime: serializeTime(values.startTime),
        reason: values.reason || undefined,
      }
      if (values.urgent) return createUrgentAppointment(payload)
      return createAppointment({ ...payload, status: values.status })
    },
    onSuccess: async () => {
      toast.success('Rendez-vous créé')
      setFormOpen(false)
      setForm(blankForm())
      await refreshLists()
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  })

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      values,
    }: {
      id: number
      values: AppointmentFormState
    }) =>
      updateAppointment(id, {
        doctorId: Number(values.doctorId),
        date: values.date,
        startTime: serializeTime(values.startTime),
        reason: values.reason || undefined,
      }),
    onSuccess: async () => {
      toast.success('Rendez-vous mis à jour')
      setEditing(null)
      setFormOpen(false)
      await refreshLists()
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  })

  const actionMutation = useMutation({
    mutationFn: async ({
      id,
      action,
    }: {
      id: number
      action: 'confirm' | 'cancel' | 'complete'
    }) => {
      if (action === 'confirm') return confirmAppointment(id)
      if (action === 'complete') return completeAppointment(id)
      return cancelAppointment(id)
    },
    onSuccess: async (_, variables) => {
      const label =
        variables.action === 'confirm'
          ? 'accepté'
          : variables.action === 'complete'
            ? 'terminé'
            : 'annulé'
      toast.success(`Rendez-vous ${label}`)
      await refreshLists()
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  })

  const rows = useMemo(() => {
    const normalized = search.trim().toLowerCase()
    const content = appointments.data?.content ?? []
    if (!normalized) return content
    return content.filter((appointment) =>
      [
        appointment.patientName,
        appointment.doctorName,
        appointment.reason,
        appointment.status,
      ]
        .join(' ')
        .toLowerCase()
        .includes(normalized),
    )
  }, [appointments.data?.content, search])

  const totalElements = appointments.data?.totalElements ?? 0
  const totalPages = appointments.data?.totalPages ?? 0
  const patientOptions = patients.data?.content ?? []
  const doctorOptions = doctors.data?.content ?? []
  const pending = rows.filter((item) => item.status === 'PENDING').length
  const urgent = rows.filter(
    (item) => item.type === 'URGENT' || item.isUrgent,
  ).length
  const submitting = createMutation.isPending || updateMutation.isPending

  const openCreate = () => {
    setEditing(null)
    setForm(blankForm())
    setFormOpen(true)
  }

  const openEdit = (appointment: Appointment) => {
    setEditing(appointment)
    setForm(toForm(appointment))
    setFormOpen(true)
  }

  const submitForm = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!form.patientId || !form.doctorId) {
      toast.error('Sélectionnez un patient et un médecin')
      return
    }
    if (editing?.id) {
      await updateMutation.mutateAsync({ id: editing.id, values: form })
      return
    }
    await createMutation.mutateAsync(form)
  }

  return (
    <PortalShell>
      <div className="mx-auto max-w-7xl space-y-6">
        <PageHeader
          eyebrow="Agenda cabinet"
          title="Gestion des rendez-vous"
          description="Planifiez, confirmez et suivez les rendez-vous du cabinet avec des filtres rapides et des actions directes."
          icon={CalendarClock}
        >
          {canManage ? (
            <button
              type="button"
              onClick={openCreate}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-[#075fd7] px-5 text-sm font-black text-white shadow-[0_18px_35px_rgba(7,95,215,0.25)] transition hover:-translate-y-0.5 hover:bg-[#064fb9]"
            >
              <Plus className="size-4" />
              Nouveau rendez-vous
            </button>
          ) : null}
        </PageHeader>

        <section className="grid gap-4 md:grid-cols-3">
          <article className="rounded-3xl bg-white p-5 shadow-[0_16px_45px_rgba(15,23,42,0.06)] ring-1 ring-slate-100">
            <p className="text-xs font-black tracking-[0.18em] text-slate-400 uppercase">
              Total
            </p>
            <p className="mt-3 text-4xl font-black text-[#101b31]">
              {totalElements}
            </p>
            <p className="mt-2 text-sm font-semibold text-slate-500">
              Rendez-vous trouvés
            </p>
          </article>
          <button
            type="button"
            onClick={() => {
              setStatus('PENDING')
              setPage(0)
            }}
            className="rounded-3xl bg-white p-5 text-left shadow-[0_16px_45px_rgba(15,23,42,0.06)] ring-1 ring-slate-100 transition hover:-translate-y-0.5 hover:ring-amber-200"
          >
            <p className="text-xs font-black tracking-[0.18em] text-amber-500 uppercase">
              Demandes en attente
            </p>
            <p className="mt-3 text-4xl font-black text-[#101b31]">{pending}</p>
            <p className="mt-2 text-sm font-semibold text-slate-500">
              À accepter par le staff
            </p>
          </button>
          <article className="rounded-3xl bg-white p-5 shadow-[0_16px_45px_rgba(15,23,42,0.06)] ring-1 ring-slate-100">
            <p className="text-xs font-black tracking-[0.18em] text-rose-500 uppercase">
              Urgences
            </p>
            <p className="mt-3 text-4xl font-black text-[#101b31]">{urgent}</p>
            <p className="mt-2 text-sm font-semibold text-slate-500">
              Priorité clinique
            </p>
          </article>
        </section>

        <section className="rounded-[2rem] bg-white p-4 shadow-[0_18px_55px_rgba(15,23,42,0.07)] ring-1 ring-slate-100">
          <div className="grid gap-3 border-b border-slate-100 pb-4 lg:grid-cols-[1fr_180px_180px_auto]">
            <label className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 pr-4 pl-11 text-sm font-bold transition outline-none focus:border-[#075fd7] focus:bg-white focus:ring-4 focus:ring-blue-100"
                placeholder="Rechercher patient, médecin, motif..."
              />
            </label>
            <select
              value={status}
              onChange={(event) => {
                setStatus(event.target.value as AppointmentStatus | '')
                setPage(0)
              }}
              className="h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold outline-none focus:border-[#075fd7] focus:ring-4 focus:ring-blue-100"
            >
              {statuses.map((item) => (
                <option key={item || 'all'} value={item}>
                  {item ? statusLabels[item] : 'Tous les statuts'}
                </option>
              ))}
            </select>
            <input
              type="date"
              value={date}
              onChange={(event) => {
                setDate(event.target.value)
                setPage(0)
              }}
              className="h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold outline-none focus:border-[#075fd7] focus:ring-4 focus:ring-blue-100"
            />
            <button
              type="button"
              onClick={() => {
                setSearch('')
                setStatus('')
                setDate('')
                setPage(0)
              }}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-slate-200 px-4 text-sm font-black text-slate-600 transition hover:bg-slate-50"
            >
              <RotateCcw className="size-4" />
              Reset
            </button>
          </div>

          {appointments.isLoading ? (
            <div className="grid min-h-80 place-items-center">
              <LoaderCircle className="size-8 animate-spin text-[#075fd7]" />
            </div>
          ) : appointments.isError ? (
            <div className="grid min-h-80 place-items-center text-center">
              <div>
                <AlertCircle className="mx-auto size-9 text-rose-500" />
                <p className="mt-3 text-sm font-bold text-slate-700">
                  {getApiErrorMessage(appointments.error)}
                </p>
              </div>
            </div>
          ) : rows.length === 0 ? (
            <div className="grid min-h-80 place-items-center text-center">
              <div>
                <Clock3 className="mx-auto size-10 text-slate-300" />
                <h2 className="mt-3 text-lg font-black text-[#101b31]">
                  Aucun rendez-vous
                </h2>
                <p className="mt-1 text-sm font-medium text-slate-500">
                  Changez les filtres ou créez un nouveau rendez-vous.
                </p>
              </div>
            </div>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[920px] border-collapse text-left">
                <thead>
                  <tr className="text-xs font-black tracking-[0.08em] text-slate-400 uppercase">
                    <th className="px-4 py-3">Patient</th>
                    <th className="px-4 py-3">Médecin</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Statut</th>
                    <th className="px-4 py-3">Motif</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rows.map((appointment) => {
                    const currentStatus = appointment.status ?? 'PENDING'
                    return (
                      <tr
                        key={appointment.id}
                        className="text-sm font-semibold text-slate-600 transition hover:bg-slate-50/80"
                      >
                        <td className="px-4 py-4">
                          <p className="font-black text-[#101b31]">
                            {valueOrDash(appointment.patientName)}
                          </p>
                          <p className="mt-1 text-xs text-slate-400">
                            #{appointment.patientId}
                          </p>
                        </td>
                        <td className="px-4 py-4">
                          {valueOrDash(appointment.doctorName)}
                        </td>
                        <td className="px-4 py-4">
                          <p className="font-black text-[#101b31]">
                            {formatDate(appointment.date)}
                          </p>
                          <p className="mt-1 text-xs text-slate-400">
                            {formatTime(appointment.startTime)} -{' '}
                            {formatTime(appointment.endTime)}
                          </p>
                        </td>
                        <td className="px-4 py-4">
                          <span
                            className={cn(
                              'inline-flex rounded-full px-3 py-1 text-xs font-black ring-1',
                              statusClasses[currentStatus],
                            )}
                          >
                            {appointment.isUrgent ||
                            appointment.type === 'URGENT'
                              ? 'Urgent · '
                              : ''}
                            {statusLabels[currentStatus]}
                          </span>
                        </td>
                        <td className="max-w-64 px-4 py-4">
                          <span className="line-clamp-2">
                            {valueOrDash(appointment.reason)}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex justify-end gap-2">
                            {canManage ? (
                              <button
                                type="button"
                                onClick={() => openEdit(appointment)}
                                className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-black text-slate-600 hover:bg-slate-50"
                              >
                                Modifier
                              </button>
                            ) : null}
                            {canManage && currentStatus === 'PENDING' ? (
                              <button
                                type="button"
                                onClick={() =>
                                  appointment.id &&
                                  actionMutation.mutate({
                                    id: appointment.id,
                                    action: 'confirm',
                                  })
                                }
                                className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-emerald-50 px-3 text-xs font-black text-emerald-700 hover:bg-emerald-100"
                                title="Accepter la demande"
                              >
                                <CheckCircle2 className="size-4" />
                                Accepter
                              </button>
                            ) : null}
                            {currentStatus === 'CONFIRMED' ? (
                              <button
                                type="button"
                                onClick={() =>
                                  appointment.id &&
                                  actionMutation.mutate({
                                    id: appointment.id,
                                    action: 'complete',
                                  })
                                }
                                className="grid size-9 place-items-center rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100"
                                title="Terminer"
                              >
                                <Clock3 className="size-4" />
                              </button>
                            ) : null}
                            {canManage && currentStatus !== 'CANCELLED' ? (
                              <button
                                type="button"
                                onClick={() =>
                                  appointment.id &&
                                  actionMutation.mutate({
                                    id: appointment.id,
                                    action: 'cancel',
                                  })
                                }
                                className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-rose-50 px-3 text-xs font-black text-rose-700 hover:bg-rose-100"
                                title={
                                  currentStatus === 'PENDING'
                                    ? 'Refuser la demande'
                                    : 'Annuler le rendez-vous'
                                }
                              >
                                <XCircle className="size-4" />
                                {currentStatus === 'PENDING'
                                  ? 'Refuser'
                                  : 'Annuler'}
                              </button>
                            ) : null}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}

          {totalPages > 1 ? (
            <footer className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
              <p className="text-sm font-bold text-slate-500">
                Page {page + 1} sur {totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={page === 0}
                  onClick={() => setPage((current) => current - 1)}
                  className="h-10 rounded-xl border border-slate-200 px-4 text-sm font-black text-slate-600 disabled:opacity-40"
                >
                  Précédent
                </button>
                <button
                  type="button"
                  disabled={page >= totalPages - 1}
                  onClick={() => setPage((current) => current + 1)}
                  className="h-10 rounded-xl border border-slate-200 px-4 text-sm font-black text-slate-600 disabled:opacity-40"
                >
                  Suivant
                </button>
              </div>
            </footer>
          ) : null}
        </section>
      </div>

      <DoctorDialog
        open={formOpen}
        title={editing ? 'Modifier le rendez-vous' : 'Nouveau rendez-vous'}
        description="Les créneaux sont contrôlés par le backend pour éviter les conflits."
        onClose={() => !submitting && setFormOpen(false)}
      >
        <form className="space-y-4 p-5" onSubmit={submitForm}>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-xs font-black text-slate-500">Patient</span>
              <select
                required
                value={form.patientId}
                disabled={Boolean(editing)}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    patientId: event.target.value,
                  }))
                }
                className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold"
              >
                <option value="">
                  {patients.isLoading ? 'Chargement...' : 'Sélectionner'}
                </option>
                {patientOptions.map((patient) => (
                  <option key={patient.id} value={patient.id}>
                    {patient.firstName} {patient.lastName} · {patient.cin}
                  </option>
                ))}
              </select>
              {patients.isError ? (
                <p className="mt-2 text-xs font-bold text-rose-600">
                  {getApiErrorMessage(patients.error)}
                </p>
              ) : null}
            </label>
            <label className="block">
              <span className="text-xs font-black text-slate-500">Médecin</span>
              <select
                required
                value={form.doctorId}
                disabled={doctors.isLoading || doctors.isError}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    doctorId: event.target.value,
                  }))
                }
                className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold"
              >
                <option value="">
                  {doctors.isLoading
                    ? 'Chargement des médecins...'
                    : doctors.isError
                      ? 'Impossible de charger les médecins'
                      : doctorOptions.length === 0
                        ? 'Aucun médecin disponible'
                        : 'Sélectionner'}
                </option>
                {doctorOptions.map((doctor) => (
                  <option key={doctor.id} value={doctor.id}>
                    Dr. {doctor.name || doctor.email || `#${doctor.id}`} ·{' '}
                    {doctor.specialty || 'Médecin'}
                  </option>
                ))}
              </select>
              {doctors.isError ? (
                <p className="mt-2 text-xs font-bold text-rose-600">
                  {getApiErrorMessage(doctors.error)}
                </p>
              ) : null}
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-xs font-black text-slate-500">Date</span>
              <input
                type="date"
                required
                value={form.date}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    date: event.target.value,
                  }))
                }
                className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm font-bold"
              />
            </label>
            <label className="block">
              <span className="text-xs font-black text-slate-500">Heure</span>
              <input
                type="time"
                required
                value={form.startTime}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    startTime: event.target.value,
                  }))
                }
                className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm font-bold"
              />
            </label>
          </div>

          {!editing ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-xs font-black text-slate-500">
                  Statut initial
                </span>
                <select
                  value={form.status}
                  disabled={form.urgent}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      status: event.target.value as AppointmentStatus,
                    }))
                  }
                  className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold"
                >
                  <option value="CONFIRMED">Confirmé</option>
                  <option value="PENDING">En attente</option>
                </select>
              </label>
              <label className="mt-6 flex h-11 items-center gap-2 rounded-xl border border-rose-100 bg-rose-50 px-3 text-sm font-black text-rose-700">
                <input
                  type="checkbox"
                  checked={form.urgent}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      urgent: event.target.checked,
                    }))
                  }
                  className="size-4 accent-rose-600"
                />
                <Flame className="size-4" />
                Rendez-vous urgent
              </label>
            </div>
          ) : null}

          <label className="block">
            <span className="text-xs font-black text-slate-500">Motif</span>
            <textarea
              value={form.reason}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  reason: event.target.value,
                }))
              }
              className="mt-1 min-h-24 w-full rounded-xl border border-slate-200 px-3 py-3 text-sm font-semibold"
              placeholder="Motif de consultation..."
            />
          </label>

          <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={() => setFormOpen(false)}
              className="h-11 rounded-xl border border-slate-200 px-4 text-sm font-black text-slate-600"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex h-11 min-w-32 items-center justify-center gap-2 rounded-xl bg-[#075fd7] px-5 text-sm font-black text-white disabled:opacity-60"
            >
              {submitting ? (
                <LoaderCircle className="size-4 animate-spin" />
              ) : null}
              Enregistrer
            </button>
          </div>
        </form>
      </DoctorDialog>
    </PortalShell>
  )
}
