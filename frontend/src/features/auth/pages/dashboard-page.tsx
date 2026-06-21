import { LogOut, ShieldCheck } from 'lucide-react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/features/auth/use-auth'
import { BrandLogo } from '@/features/auth/ui/brand-logo'
import type { UserRole } from '@/types/auth'

const roleNames: Record<UserRole, string> = {
  ADMIN: 'Administrateur',
  DOCTOR: 'Médecin',
  SECRETARY: 'Secrétaire',
  PATIENT: 'Patient',
}

export function DashboardPage({ expectedRole }: { expectedRole: UserRole }) {
  const { user, logout } = useAuth()
  if (!user) return null
  if (user.role !== expectedRole) return <Navigate to="/unauthorized" replace />

  return (
    <main className="min-h-dvh bg-[#f4f6ff] p-6 sm:p-10">
      <div className="mx-auto max-w-5xl">
        <header className="flex items-center justify-between gap-4 rounded-2xl bg-white px-5 py-4 shadow-sm ring-1 ring-slate-100">
          <BrandLogo compact />
          <button
            type="button"
            onClick={() => void logout()}
            className="inline-flex items-center gap-2 rounded-lg border px-3.5 py-2 text-sm font-medium text-[#47546a] hover:bg-slate-50"
          >
            <LogOut className="size-4" aria-hidden="true" />
            Déconnexion
          </button>
        </header>

        <section className="mt-8 rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-100 sm:p-10">
          <div className="grid size-12 place-items-center rounded-2xl bg-blue-50 text-[#075fd7]">
            <ShieldCheck aria-hidden="true" />
          </div>
          <p className="mt-6 text-sm font-semibold text-[#075fd7]">
            Espace {roleNames[user.role]}
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#14213a]">
            Bonjour, {user.displayName}
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-[#687387]">
            Votre authentification est active. Les modules du dashboard seront
            connectés aux endpoints métier dans la prochaine étape.
          </p>
        </section>
      </div>
    </main>
  )
}
