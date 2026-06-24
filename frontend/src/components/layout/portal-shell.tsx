import { Bell, LogOut, Menu, Search, X } from 'lucide-react'
import { useState, type PropsWithChildren } from 'react'
import { NavLink } from 'react-router-dom'
import { BrandLogo } from '@/features/auth/ui/brand-logo'
import { useAuth } from '@/features/auth/use-auth'
import {
  roleLabels,
  roleNavigation,
} from '@/features/dashboard/dashboard-model'
import { cn } from '@/lib/utils/cn'

export function PortalShell({ children }: PropsWithChildren) {
  const { user, logout } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)

  if (!user) return null

  const navigation = roleNavigation[user.role]
  const initials = user.displayName
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <div className="min-h-dvh bg-[linear-gradient(180deg,#f7faff_0%,#eef5ff_100%)] text-[#101d35]">
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
          'fixed inset-y-0 left-0 z-40 flex w-[288px] flex-col overflow-hidden border-r border-slate-200 bg-white px-5 py-6 shadow-[18px_0_54px_rgba(15,23,42,0.08)] transition-transform lg:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <BrandLogo compact className="text-[30px] text-[#075fd7]" />
            <p className="mt-1 pl-1 text-[10px] font-bold tracking-[0.2em] text-slate-400 uppercase">
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
          className="mt-8 min-h-0 flex-1 space-y-1 overflow-y-auto pr-1"
          aria-label="Navigation principale"
        >
          {navigation.map(({ label, to, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                cn(
                  'flex min-h-11 items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-bold transition-[background-color,color,transform,box-shadow] active:scale-[0.98]',
                  isActive
                    ? 'bg-[#075fd7] text-white shadow-[0_14px_32px_rgba(7,95,215,0.22)]'
                    : 'text-slate-600 hover:bg-blue-50 hover:text-[#075fd7]',
                )
              }
            >
              <Icon className="size-5 shrink-0" strokeWidth={1.9} />
              <span className="truncate">{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="mt-5 border-t border-slate-200 pt-5">
          <button
            type="button"
            onClick={() => void logout()}
            className="flex min-h-11 w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-sm font-bold text-rose-600 transition hover:bg-rose-50"
          >
            <LogOut className="size-5" strokeWidth={1.9} aria-hidden="true" />
            Déconnexion
          </button>
        </div>
      </aside>

      <div className="lg:pl-[288px]">
        <header className="sticky top-0 z-20 flex h-[72px] items-center justify-between border-b border-slate-200 bg-white/85 px-4 backdrop-blur-xl sm:px-6">
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
                className="h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 pr-4 pl-10 text-sm font-medium text-slate-700 placeholder:text-slate-400"
                placeholder="Rechercher"
              />
            </label>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              className="hidden size-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm hover:bg-blue-50 hover:text-[#075fd7] sm:grid"
              aria-label="Notifications"
            >
              <Bell className="size-5" aria-hidden="true" />
            </button>
            <div className="hidden text-right leading-tight sm:block">
              <p className="text-xs font-bold tracking-[0.16em] text-[#075fd7] uppercase">
                {roleLabels[user.role]}
              </p>
              <p className="mt-1 max-w-40 truncate text-sm font-semibold text-[#14213a]">
                {user.displayName}
              </p>
            </div>
            <div
              className="grid size-10 place-items-center rounded-full bg-[#d9e5ff] text-xs font-bold text-[#075fd7] ring-2 ring-white"
              aria-hidden="true"
            >
              {initials}
            </div>
          </div>
        </header>

        <main className="px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  )
}
