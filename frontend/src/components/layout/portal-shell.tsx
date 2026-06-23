import { LayoutDashboard, LogOut, Menu, Stethoscope, Users, X } from 'lucide-react'
import { useState, type PropsWithChildren } from 'react'
import { NavLink } from 'react-router-dom'
import { BrandLogo } from '@/features/auth/ui/brand-logo'
import { useAuth } from '@/features/auth/use-auth'
import { getDashboardPath } from '@/features/auth/auth-routing'
import { cn } from '@/lib/utils/cn'
import type { UserRole } from '@/types/auth'

const roleLabels: Record<UserRole, string> = {
  ADMIN: 'Admin',
  DOCTOR: 'Médecin',
  SECRETARY: 'Secrétaire',
  PATIENT: 'Patient',
}

function doctorsPath(role: UserRole) {
  return `/${role.toLowerCase()}/doctors`
}

function patientsPath(role: UserRole) {
  return `/${role.toLowerCase()}/patients`
}

export function PortalShell({ children }: PropsWithChildren) {
  const { user, logout } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)

  if (!user) return null

  const navigation = [
    {
      label: 'Tableau de bord',
      to: getDashboardPath(user.role),
      icon: LayoutDashboard,
    },
    {
      label: 'Médecins',
      to: doctorsPath(user.role),
      icon: Stethoscope,
    },
    {
      label: 'Patients',
      to: patientsPath(user.role),
      icon: Users,
    },
  ]

  const initials = user.displayName
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <div className="min-h-dvh bg-[#f6f8ff] text-[#101d35]">
      {mobileOpen && (
        <button
          type="button"
          aria-label="Fermer le menu"
          className="fixed inset-0 z-30 bg-slate-950/30 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex w-[260px] flex-col overflow-hidden border-r border-[#dfe4f0] bg-white px-4 py-5 transition-transform md:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex items-start justify-between gap-2">
          <div>
            <BrandLogo compact className="text-[28px] text-[#075bd8]" />
            <p className="mt-1 pl-1 text-[9px] font-medium text-slate-500">
              Gestion Clinique
            </p>
          </div>
          <button
            type="button"
            className="mt-1 grid size-8 place-items-center rounded-lg text-slate-500 md:hidden"
            onClick={() => setMobileOpen(false)}
            aria-label="Fermer le menu"
          >
            <X className="size-4" />
          </button>
        </div>

        <nav className="mt-7 space-y-1" aria-label="Navigation principale">
          {navigation.map(({ label, to, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-[11px] font-semibold transition-colors',
                  isActive
                    ? 'bg-[#a9bdfc] text-[#153d87]'
                    : 'text-[#344055] hover:bg-slate-50',
                )
              }
            >
              <Icon className="size-4" strokeWidth={1.8} aria-hidden="true" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto border-t border-slate-200 pt-4">
          <button
            type="button"
            onClick={() => void logout()}
            className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-[12px] font-semibold text-[#344055] hover:bg-slate-50"
          >
            <LogOut className="size-4" strokeWidth={1.8} aria-hidden="true" />
            Déconnexion
          </button>
        </div>
      </aside>

      <div className="md:pl-[260px]">
        <header className="flex h-[68px] items-center justify-between border-b border-[#dfe4f0] bg-[#f9faff] px-4 sm:px-6">
          <button
            type="button"
            className="grid size-9 place-items-center rounded-lg border bg-white text-slate-600 md:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Ouvrir le menu"
          >
            <Menu className="size-5" />
          </button>
          <div className="hidden md:block" />
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-[11px] font-semibold text-[#1e293b]">
                {roleLabels[user.role]}
              </p>
              <p className="max-w-36 truncate text-[10px] text-slate-500">
                {user.displayName}
              </p>
            </div>
            <div
              className="grid size-9 place-items-center rounded-full bg-[#d9e5ff] text-[11px] font-bold text-[#075bd8] ring-2 ring-white"
              aria-hidden="true"
            >
              {initials}
            </div>
          </div>
        </header>

        <main className="px-4 py-5">{children}</main>
      </div>
    </div>
  )
}