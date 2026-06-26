import {
  AlertCircle,
  CalendarClock,
  CheckCircle2,
  Mail,
  MessageCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import type { Notification } from '@/features/notifications/api/notifications-api'

const channelLabels: Record<string, string> = {
  EMAIL: 'E-mail',
  WHATSAPP: 'WhatsApp',
}

const statusLabels: Record<string, string> = {
  PENDING: 'En attente',
  SENT: 'Envoyée',
  FAILED: 'Échec',
}

const statusClasses: Record<string, string> = {
  PENDING: 'bg-amber-50 text-amber-700 ring-amber-200',
  SENT: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  FAILED: 'bg-rose-50 text-rose-700 ring-rose-200',
}

function formatSentAt(value?: string) {
  if (!value) return 'Date non confirmée'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

function ChannelIcon({ channel }: { channel?: Notification['channel'] }) {
  if (channel === 'WHATSAPP') {
    return <MessageCircle className="size-4" aria-hidden="true" />
  }
  return <Mail className="size-4" aria-hidden="true" />
}

function StatusIcon({ status }: { status?: Notification['status'] }) {
  if (status === 'FAILED') {
    return <AlertCircle className="size-4" aria-hidden="true" />
  }
  if (status === 'SENT') {
    return <CheckCircle2 className="size-4" aria-hidden="true" />
  }
  return <CalendarClock className="size-4" aria-hidden="true" />
}

interface NotificationCardProps {
  notification: Notification
  compact?: boolean
}

export function NotificationCard({
  notification,
  compact = false,
}: NotificationCardProps) {
  const status = notification.status ?? 'PENDING'
  const channel = notification.channel ?? 'EMAIL'

  return (
    <article
      className={cn(
        'rounded-2xl border border-slate-200 bg-white shadow-[0_12px_34px_rgba(15,23,42,0.06)]',
        compact ? 'p-3' : 'p-4',
      )}
    >
      <div className="flex items-start gap-3">
        <div className="grid size-10 shrink-0 place-items-center rounded-2xl bg-blue-50 text-[#075fd7]">
          <ChannelIcon channel={channel} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold tracking-[0.12em] text-[#075fd7] uppercase">
              {channelLabels[channel] ?? channel}
            </span>
            {notification.appointmentId ? (
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500">
                RDV #{notification.appointmentId}
              </span>
            ) : null}
          </div>

          <p
            className={cn(
              'mt-1 font-semibold text-[#14213a]',
              compact ? 'line-clamp-2 text-xs' : 'text-sm leading-6',
            )}
          >
            {notification.message || 'Notification sans message'}
          </p>

          <div
            className={cn(
              'mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500',
              compact && 'mt-2',
            )}
          >
            <span className="inline-flex items-center gap-1">
              <CalendarClock className="size-3.5" aria-hidden="true" />
              {formatSentAt(notification.sentAt)}
            </span>
            {notification.recipient ? (
              <span className="truncate">Pour {notification.recipient}</span>
            ) : null}
          </div>
        </div>

        <span
          className={cn(
            'inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold ring-1',
            statusClasses[status] ?? statusClasses.PENDING,
          )}
        >
          <StatusIcon status={status} />
          {statusLabels[status] ?? status}
        </span>
      </div>
    </article>
  )
}
