import { AlertCircle, Bell, Loader2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { NotificationCard } from '@/features/notifications/components/notification-card'
import type { Notification } from '@/features/notifications/api/notifications-api'

interface NotificationDropdownProps {
  notifications: Notification[]
  inboxPath: string
  loading: boolean
  errorMessage?: string
  disabledMessage?: string
  onRetry: () => void
}

export function NotificationDropdown({
  notifications,
  inboxPath,
  loading,
  errorMessage,
  disabledMessage,
  onRetry,
}: NotificationDropdownProps) {
  return (
    <section className="absolute top-12 right-0 z-50 w-[min(360px,calc(100vw-2rem))] overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.18)]">
      <header className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
        <div>
          <p className="text-sm font-bold text-[#14213a]">Notifications</p>
          <p className="mt-0.5 text-[11px] text-slate-500">
            Dernières alertes du cabinet
          </p>
        </div>
        <Bell className="size-5 text-[#075fd7]" aria-hidden="true" />
      </header>

      <div className="max-h-[420px] overflow-y-auto p-3">
        {disabledMessage ? (
          <div className="rounded-2xl bg-slate-50 p-4 text-sm font-medium text-slate-600">
            {disabledMessage}
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center gap-2 py-8 text-sm font-semibold text-slate-500">
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            Chargement des notifications...
          </div>
        ) : errorMessage ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            <div className="flex items-start gap-2">
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              <p>{errorMessage}</p>
            </div>
            <button
              type="button"
              onClick={onRetry}
              className="mt-3 rounded-xl bg-amber-100 px-3 py-2 text-xs font-bold text-amber-900"
            >
              Réessayer
            </button>
          </div>
        ) : notifications.length === 0 ? (
          <div className="grid min-h-36 place-items-center rounded-2xl bg-slate-50 p-4 text-center">
            <div>
              <Bell className="mx-auto size-7 text-slate-400" />
              <p className="mt-2 text-sm font-bold text-[#14213a]">
                Aucune notification pour le moment.
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Les nouvelles alertes apparaîtront ici.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map((notification, index) => (
              <NotificationCard
                key={notification.id ?? index}
                notification={notification}
                compact
              />
            ))}
          </div>
        )}
      </div>

      <footer className="border-t border-slate-100 p-3">
        <Link
          to={inboxPath}
          className="block rounded-2xl bg-[#075fd7] px-4 py-2.5 text-center text-xs font-bold text-white shadow-[0_12px_28px_rgba(7,95,215,0.24)]"
        >
          Voir toutes les notifications
        </Link>
      </footer>
    </section>
  )
}
