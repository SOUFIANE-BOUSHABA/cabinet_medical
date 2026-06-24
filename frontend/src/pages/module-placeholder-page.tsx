import { Construction } from 'lucide-react'
import { Navigate } from 'react-router-dom'
import { PortalShell } from '@/components/layout/portal-shell'
import { useAuth } from '@/features/auth/use-auth'
import type { UserRole } from '@/types/auth'

interface ModulePlaceholderPageProps {
  expectedRole: UserRole
  title: string
}

export function ModulePlaceholderPage({
  expectedRole,
  title,
}: ModulePlaceholderPageProps) {
  const { user } = useAuth()

  if (!user) return null
  if (user.role !== expectedRole) return <Navigate to="/unauthorized" replace />

  return (
    <PortalShell>
      <section className="grid min-h-[520px] place-items-center rounded-[2rem] border border-white/70 bg-white p-8 text-center shadow-[0_18px_45px_rgba(15,23,42,0.06)] ring-1 ring-slate-100">
        <div>
          <span className="mx-auto grid size-16 place-items-center rounded-3xl bg-blue-50 text-[#075fd7]">
            <Construction className="size-8" aria-hidden="true" />
          </span>
          <h1 className="mt-6 text-3xl font-semibold tracking-tight text-[#14213a]">
            {title}
          </h1>
          <p className="mt-3 text-base font-medium text-slate-500">
            Module en cours de développement
          </p>
        </div>
      </section>
    </PortalShell>
  )
}
