import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  AlertCircle,
  Bell,
  CalendarSearch,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Send,
} from 'lucide-react'
import { useMemo, useState, type FormEvent } from 'react'
import { Navigate } from 'react-router-dom'
import { toast } from 'sonner'
import { PageHeader } from '@/components/layout/page-header'
import { PortalShell } from '@/components/layout/portal-shell'
import {
  appointmentNotificationsQuery,
  notificationKeys,
  roleNotificationsQuery,
} from '@/features/notifications/api/notification-queries'
import {
  simulateNotification,
  type Notification,
} from '@/features/notifications/api/notifications-api'
import { NotificationCard } from '@/features/notifications/components/notification-card'
import { simulateNotificationSchema } from '@/features/notifications/schemas/notification-schemas'
import { useAuth } from '@/features/auth/use-auth'
import { getApiErrorMessage } from '@/lib/api/client'
import { cn } from '@/lib/utils/cn'
import type { UserRole } from '@/types/auth'

const PAGE_SIZE = 20

const roleCopy: Record<
  UserRole,
  {
    title: string
    subtitle: string
  }
> = {
  ADMIN: {
    title: 'Notifications du cabinet',
    subtitle:
      'Suivez les notifications enregistrées par le backend pour les patients.',
  },
  DOCTOR: {
    title: 'Notifications de rendez-vous',
    subtitle:
      'Consultez les notifications liées à vos rendez-vous et recherchez les alertes par rendez-vous.',
  },
  SECRETARY: {
    title: 'Notifications du secrétariat',
    subtitle:
      'Consultez les confirmations, rappels et annulations simulés par le backend.',
  },
  PATIENT: {
    title: 'Mes notifications',
    subtitle: 'Retrouvez les messages liés à vos rendez-vous.',
  },
}

const statusFilters = [
  { label: 'Toutes', value: 'ALL' },
  { label: 'Envoyées', value: 'SENT' },
  { label: 'En attente', value: 'PENDING' },
  { label: 'Échecs', value: 'FAILED' },
] as const

type StatusFilter = (typeof statusFilters)[number]['value']

interface NotificationsPageProps {
  expectedRole: UserRole
}

function canLoadRoleInbox(role: UserRole) {
  return (
    role === 'ADMIN' ||
    role === 'DOCTOR' ||
    role === 'SECRETARY' ||
    role === 'PATIENT'
  )
}

function canInspectAppointment(role: UserRole) {
  return role === 'ADMIN' || role === 'DOCTOR' || role === 'SECRETARY'
}

function NotificationsSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((item) => (
        <div
          key={item}
          className="h-28 animate-pulse rounded-2xl bg-slate-100"
        />
      ))}
    </div>
  )
}

function EmptyState({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="grid min-h-72 place-items-center rounded-3xl border border-slate-200 bg-white p-6 text-center">
      <div>
        <Bell className="mx-auto size-10 text-[#075fd7]" aria-hidden="true" />
        <h2 className="mt-3 text-base font-bold text-[#14213a]">{title}</h2>
        <p className="mt-1 max-w-md text-sm text-slate-500">{detail}</p>
      </div>
    </div>
  )
}

export function NotificationsPage({ expectedRole }: NotificationsPageProps) {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [page, setPage] = useState(0)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL')
  const [appointmentInput, setAppointmentInput] = useState('')
  const [appointmentId, setAppointmentId] = useState<number | null>(null)
  const [simulateAppointmentId, setSimulateAppointmentId] = useState('')
  const [simulateRecipient, setSimulateRecipient] = useState('')
  const [simulateMessage, setSimulateMessage] = useState('')
  const [simulateChannel, setSimulateChannel] = useState<'EMAIL' | 'WHATSAPP'>(
    'EMAIL',
  )

  const inboxEnabled = canLoadRoleInbox(expectedRole)
  const notifications = useQuery({
    ...roleNotificationsQuery(expectedRole, page, PAGE_SIZE),
    enabled: inboxEnabled,
  })
  const appointmentNotifications = useQuery(
    appointmentNotificationsQuery(appointmentId),
  )

  const simulateMutation = useMutation({
    mutationFn: simulateNotification,
    onSuccess: async () => {
      toast.success('Notification simulée')
      setSimulateMessage('')
      await queryClient.invalidateQueries({
        queryKey: notificationKeys.lists(),
      })
      if (appointmentId) {
        await queryClient.invalidateQueries({
          queryKey: notificationKeys.appointment(appointmentId),
        })
      }
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  })

  const content = useMemo(
    () => notifications.data?.content ?? [],
    [notifications.data?.content],
  )
  const filteredNotifications = useMemo(() => {
    if (statusFilter === 'ALL') return content
    return content.filter(
      (notification) => notification.status === statusFilter,
    )
  }, [content, statusFilter])

  if (!user) return null
  if (user.role !== expectedRole) return <Navigate to="/unauthorized" replace />

  const copy = roleCopy[expectedRole]
  const totalElements = notifications.data?.totalElements ?? 0
  const totalPages = notifications.data?.totalPages ?? 0
  const start = totalElements === 0 ? 0 : page * PAGE_SIZE + 1
  const end = Math.min((page + 1) * PAGE_SIZE, totalElements)
  const showAppointmentSearch = canInspectAppointment(expectedRole)
  const showSimulation = expectedRole !== 'PATIENT'

  const submitAppointmentSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const nextAppointmentId = Number(appointmentInput)
    if (!Number.isInteger(nextAppointmentId) || nextAppointmentId <= 0) {
      toast.error('Saisissez un identifiant de rendez-vous valide.')
      return
    }
    setAppointmentId(nextAppointmentId)
  }

  const submitSimulation = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const appointmentValue = simulateAppointmentId.trim()
    const parsed = simulateNotificationSchema.safeParse({
      appointmentId: appointmentValue ? Number(appointmentValue) : undefined,
      channel: simulateChannel,
      recipient: simulateRecipient.trim() || undefined,
      message: simulateMessage,
    })

    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? 'Formulaire invalide.')
      return
    }

    simulateMutation.mutate(parsed.data)
  }

  return (
    <PortalShell>
      <div className="mx-auto max-w-7xl space-y-6">
        <PageHeader
          eyebrow="Centre de notifications"
          title={copy.title}
          description={copy.subtitle}
          icon={Bell}
        />

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
          <div className="space-y-4">
            <div className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white p-4 shadow-[0_14px_40px_rgba(15,23,42,0.06)] sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-base font-bold text-[#14213a]">
                  Boîte de réception interne
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Le backend expose un statut de livraison, pas encore un statut
                  lu/non lu.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {statusFilters.map((filter) => (
                  <button
                    key={filter.value}
                    type="button"
                    onClick={() => setStatusFilter(filter.value)}
                    className={cn(
                      'rounded-full px-3 py-1.5 text-xs font-bold transition',
                      statusFilter === filter.value
                        ? 'bg-[#075fd7] text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-[#075fd7]',
                    )}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>

            {!inboxEnabled ? (
              <EmptyState
                title="Boîte globale indisponible"
                detail="Le backend ne fournit pas encore de point d'accès pour lister toutes les notifications du médecin connecté. Utilisez la recherche par rendez-vous ci-contre."
              />
            ) : notifications.isLoading ? (
              <NotificationsSkeleton />
            ) : notifications.isError ? (
              <div className="rounded-3xl border border-amber-200 bg-amber-50 p-5 text-amber-800">
                <div className="flex items-start gap-3">
                  <AlertCircle className="mt-0.5 size-5 shrink-0" />
                  <div>
                    <h2 className="text-sm font-bold">
                      Impossible de charger les notifications
                    </h2>
                    <p className="mt-1 text-sm">
                      {getApiErrorMessage(notifications.error)}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => void notifications.refetch()}
                  className="mt-4 rounded-xl bg-amber-100 px-4 py-2 text-xs font-bold text-amber-900"
                >
                  Réessayer
                </button>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <EmptyState
                title="Aucune notification pour le moment."
                detail="Aucune notification ne correspond au filtre sélectionné."
              />
            ) : (
              <div className="space-y-3">
                {filteredNotifications.map((notification, index) => (
                  <NotificationCard
                    key={notification.id ?? index}
                    notification={notification}
                  />
                ))}
              </div>
            )}

            {inboxEnabled &&
            !notifications.isLoading &&
            !notifications.isError ? (
              <footer className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs font-medium text-slate-500">
                  Affichage de {start} à {end} sur {totalElements}
                  notifications
                </p>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={page === 0}
                    onClick={() => setPage((current) => current - 1)}
                    className="grid size-9 place-items-center rounded-xl border border-slate-200 text-slate-500 disabled:opacity-35"
                    aria-label="Page précédente"
                  >
                    <ChevronLeft className="size-4" />
                  </button>
                  <span className="grid h-9 min-w-9 place-items-center rounded-xl bg-[#075fd7] px-2 text-xs font-bold text-white">
                    {page + 1}
                  </span>
                  <button
                    type="button"
                    disabled={totalPages === 0 || page >= totalPages - 1}
                    onClick={() => setPage((current) => current + 1)}
                    className="grid size-9 place-items-center rounded-xl border border-slate-200 text-slate-500 disabled:opacity-35"
                    aria-label="Page suivante"
                  >
                    <ChevronRight className="size-4" />
                  </button>
                </div>
              </footer>
            ) : null}
          </div>

          <aside className="space-y-4">
            {showAppointmentSearch ? (
              <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-[0_14px_40px_rgba(15,23,42,0.06)]">
                <div className="flex items-start gap-3">
                  <div className="grid size-10 shrink-0 place-items-center rounded-2xl bg-blue-50 text-[#075fd7]">
                    <CalendarSearch className="size-5" aria-hidden="true" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-[#14213a]">
                      Notifications du rendez-vous
                    </h2>
                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      Disponible pour admin, médecin et secrétaire.
                    </p>
                  </div>
                </div>

                <form
                  onSubmit={submitAppointmentSearch}
                  className="mt-4 flex gap-2"
                >
                  <label className="min-w-0 flex-1">
                    <span className="sr-only">ID rendez-vous</span>
                    <input
                      value={appointmentInput}
                      onChange={(event) =>
                        setAppointmentInput(event.target.value)
                      }
                      inputMode="numeric"
                      placeholder="ID rendez-vous"
                      className="h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-700"
                    />
                  </label>
                  <button
                    type="submit"
                    className="rounded-2xl bg-[#075fd7] px-4 text-xs font-bold text-white"
                  >
                    Voir
                  </button>
                </form>

                <div className="mt-4 space-y-2">
                  {appointmentNotifications.isFetching ? (
                    <div className="flex items-center gap-2 rounded-2xl bg-slate-50 p-4 text-sm font-semibold text-slate-500">
                      <Loader2 className="size-4 animate-spin" />
                      Chargement des notifications...
                    </div>
                  ) : appointmentNotifications.isError ? (
                    <p className="rounded-2xl bg-amber-50 p-4 text-sm font-medium text-amber-800">
                      {getApiErrorMessage(appointmentNotifications.error)}
                    </p>
                  ) : appointmentId ? (
                    (appointmentNotifications.data ?? []).length > 0 ? (
                      appointmentNotifications.data?.map(
                        (notification: Notification, index: number) => (
                          <NotificationCard
                            key={notification.id ?? index}
                            notification={notification}
                            compact
                          />
                        ),
                      )
                    ) : (
                      <p className="rounded-2xl bg-slate-50 p-4 text-sm font-medium text-slate-500">
                        Aucune notification trouvée pour ce rendez-vous.
                      </p>
                    )
                  ) : null}
                </div>
              </section>
            ) : null}

            {showSimulation ? (
              <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-[0_14px_40px_rgba(15,23,42,0.06)]">
                <div className="flex items-start gap-3">
                  <div className="grid size-10 shrink-0 place-items-center rounded-2xl bg-emerald-50 text-emerald-700">
                    <Send className="size-5" aria-hidden="true" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-[#14213a]">
                      Simuler une notification
                    </h2>
                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      Cet outil crée une notification de test via le backend. La
                      livraison e-mail ou WhatsApp est simulée.
                    </p>
                  </div>
                </div>

                <form onSubmit={submitSimulation} className="mt-4 space-y-3">
                  <label className="block">
                    <span className="text-xs font-black text-slate-500">
                      Canal
                    </span>
                    <select
                      value={simulateChannel}
                      onChange={(event) =>
                        setSimulateChannel(
                          event.target.value as 'EMAIL' | 'WHATSAPP',
                        )
                      }
                      className="mt-1 h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-700"
                    >
                      <option value="EMAIL">E-mail</option>
                      <option value="WHATSAPP">WhatsApp</option>
                    </select>
                  </label>

                  <label className="block">
                    <span className="text-xs font-black text-slate-500">
                      ID rendez-vous
                    </span>
                    <input
                      value={simulateAppointmentId}
                      onChange={(event) =>
                        setSimulateAppointmentId(event.target.value)
                      }
                      inputMode="numeric"
                      placeholder="Optionnel"
                      className="mt-1 h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-700"
                    />
                  </label>

                  <label className="block">
                    <span className="text-xs font-black text-slate-500">
                      Destinataire
                    </span>
                    <input
                      value={simulateRecipient}
                      onChange={(event) =>
                        setSimulateRecipient(event.target.value)
                      }
                      placeholder="Optionnel"
                      className="mt-1 h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-700"
                    />
                  </label>

                  <label className="block">
                    <span className="text-xs font-black text-slate-500">
                      Message
                    </span>
                    <textarea
                      value={simulateMessage}
                      onChange={(event) =>
                        setSimulateMessage(event.target.value)
                      }
                      placeholder="Message"
                      rows={4}
                      className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-medium text-slate-700"
                    />
                  </label>

                  <button
                    type="submit"
                    disabled={simulateMutation.isPending}
                    className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-[#075fd7] text-sm font-bold text-white disabled:opacity-60"
                  >
                    {simulateMutation.isPending ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Send className="size-4" />
                    )}
                    Simuler
                  </button>
                </form>
              </section>
            ) : null}
          </aside>
        </section>
      </div>
    </PortalShell>
  )
}
