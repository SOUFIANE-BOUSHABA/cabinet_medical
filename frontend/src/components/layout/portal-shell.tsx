import { ChevronRight, LogOut, Menu, Search, X } from 'lucide-react'
import { useState, type PropsWithChildren } from 'react'
import { NavLink } from 'react-router-dom'
import { BrandLogo } from '@/features/auth/ui/brand-logo'
import { useAuth } from '@/features/auth/use-auth'
import {
  roleLabels,
  roleNavigation,
} from '@/features/dashboard/dashboard-model'
import { NotificationBell } from '@/features/notifications/components/notification-bell'
import { cn } from '@/lib/utils/cn'

export function PortalShell({ children }: PropsWithChildren) {
  const { user, logout } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)

  if (!user) return null

  const navigation = roleNavigation[user.role] ?? []
  const initials = user.displayName
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <div className="min-h-dvh bg-[#f4f8ff] text-[#101d35]">
      {mobileOpen ? (
        <button
          type="button"
          aria-label="Fermer le menu"
          className="fixed inset-0 z-30 bg-slate-950/35 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      ) : null}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex w-[292px] flex-col overflow-hidden border-r border-slate-200/80 bg-white/95 px-5 py-6 shadow-[18px_0_54px_rgba(15,23,42,0.06)] backdrop-blur-xl transition-transform lg:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <BrandLogo compact className="text-[31px] text-[#075fd7]" />
            <p className="mt-2 pl-1 text-[10px] font-black tracking-[0.24em] text-slate-400 uppercase">
              Gestion Clinique
            </p>
          </div>

          <button
            type="button"
            className="mt-1 grid size-9 place-items-center rounded-xl text-slate-500 hover:bg-slate-50 lg:hidden"
            onClick={() => setMobileOpen(false)}
            aria-label="Fermer le menu"
          >
            <X className="size-5" />
          </button>
        </div>

        <nav
          className="mt-9 min-h-0 flex-1 space-y-1.5 overflow-y-auto pr-1"
          aria-label="Navigation principale"
        >
          {navigation.map(({ label, to, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                cn(
                  'group flex min-h-12 items-center gap-3 rounded-2xl px-3.5 py-3 text-sm font-extrabold transition-[background-color,color,transform,box-shadow] active:scale-[0.98]',
                  isActive
                    ? 'bg-[#075fd7] text-white shadow-[0_16px_34px_rgba(7,95,215,0.22)]'
                    : 'text-slate-600 hover:bg-[#eef5ff] hover:text-[#075fd7]',
                )
              }
            >
              <Icon className="size-5 shrink-0" strokeWidth={1.9} />
              <span className="truncate">{label}</span>
              <ChevronRight className="ml-auto size-4 opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-60" />
            </NavLink>
          ))}
        </nav>

        <div className="mt-5 border-t border-slate-200 pt-5">
          <button
            type="button"
            onClick={() => void logout()}
            className="flex min-h-12 w-full items-center gap-3 rounded-2xl px-3.5 py-3 text-left text-sm font-extrabold text-rose-600 transition hover:bg-rose-50"
          >
            <LogOut className="size-5" strokeWidth={1.9} aria-hidden="true" />
            Déconnexion
          </button>
        </div>
      </aside>

      <div className="lg:pl-[292px]">
        <header className="sticky top-0 z-20 flex h-[76px] items-center justify-between border-b border-slate-200/80 bg-white/88 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <button
              type="button"
              className="grid size-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm lg:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Ouvrir le menu"
            >
              <Menu className="size-5" />
            </button>

            <label className="relative hidden w-full max-w-md sm:block">
              <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-slate-400" />
              <input
                className="h-12 w-full rounded-2xl border border-slate-200 bg-[#f8fbff] pr-4 pl-10 text-sm font-bold text-slate-700 transition outline-none placeholder:text-slate-400 focus:border-[#075fd7] focus:bg-white focus:ring-4 focus:ring-blue-100"
                placeholder="Rechercher"
              />
            </label>
          </div>

          <div className="flex items-center gap-3">
            <NotificationBell />

            <div className="hidden text-right leading-tight sm:block">
              <p className="text-xs font-black tracking-[0.18em] text-[#075fd7] uppercase">
                {roleLabels[user.role]}
              </p>
              <p className="mt-1 max-w-40 truncate text-sm font-extrabold text-[#14213a]">
                {user.displayName}
              </p>
            </div>

            <div
              className="grid size-12 place-items-center rounded-full bg-[#d9e6ff] text-sm font-black text-[#075fd7] ring-4 ring-white"
              aria-hidden="true"
            >
              {initials}
            </div>
          </div>
        </header>

        <main className="px-4 py-8 sm:px-6 lg:px-10">{children}</main>
      </div>
    </div>
  )
}
