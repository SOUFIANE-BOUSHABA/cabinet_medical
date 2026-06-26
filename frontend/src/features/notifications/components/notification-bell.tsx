import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Bell } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import {
  notificationKeys,
  roleNotificationsQuery,
} from '@/features/notifications/api/notification-queries'
import { NotificationDropdown } from '@/features/notifications/components/notification-dropdown'
import { useAuth } from '@/features/auth/use-auth'
import { getApiErrorMessage } from '@/lib/api/client'
import { cn } from '@/lib/utils/cn'
import type { UserRole } from '@/types/auth'

const inboxPaths: Record<UserRole, string> = {
  ADMIN: '/admin/notifications',
  DOCTOR: '/doctor/notifications',
  SECRETARY: '/secretary/notifications',
  PATIENT: '/patient/notifications',
}

export function NotificationBell() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const previousCountRef = useRef<number | null>(null)
  const canLoadInbox =
    user?.role === 'ADMIN' ||
    user?.role === 'DOCTOR' ||
    user?.role === 'SECRETARY' ||
    user?.role === 'PATIENT'

  const notifications = useQuery({
    ...roleNotificationsQuery(user?.role ?? 'PATIENT', 0, 5),
    enabled: Boolean(user && canLoadInbox),
    refetchInterval: canLoadInbox ? 60_000 : false,
    refetchIntervalInBackground: false,
  })

  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [open])

  const content = notifications.data?.content ?? []
  const count = notifications.data?.totalElements ?? content.length

  useEffect(() => {
    if (!canLoadInbox || notifications.isLoading || notifications.isError)
      return
    if (previousCountRef.current === null) {
      previousCountRef.current = count
      return
    }
    if (count > previousCountRef.current) {
      toast.info('Nouvelle notification disponible')
    }
    previousCountRef.current = count
  }, [canLoadInbox, count, notifications.isError, notifications.isLoading])

  if (!user) return null

  return (
    <div ref={rootRef} className="relative hidden sm:block">
      <button
        type="button"
        className={cn(
          'relative grid size-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm hover:bg-blue-50 hover:text-[#075fd7]',
          open && 'bg-blue-50 text-[#075fd7]',
        )}
        aria-label="Notifications"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        <Bell className="size-5" aria-hidden="true" />
        {count > 0 ? (
          <span className="absolute top-2 right-2 size-2 rounded-full bg-[#24b6a7] ring-2 ring-white" />
        ) : null}
      </button>

      {open ? (
        <NotificationDropdown
          notifications={content.slice(0, 5)}
          inboxPath={inboxPaths[user.role]}
          loading={notifications.isLoading}
          errorMessage={
            notifications.isError
              ? getApiErrorMessage(notifications.error)
              : undefined
          }
          onRetry={() => {
            void notifications.refetch()
            void queryClient.invalidateQueries({
              queryKey: notificationKeys.lists(),
            })
          }}
        />
      ) : null}
    </div>
  )
}
