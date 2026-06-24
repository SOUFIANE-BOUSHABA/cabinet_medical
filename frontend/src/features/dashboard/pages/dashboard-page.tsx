import { useQuery } from '@tanstack/react-query'
import { AlertCircle } from 'lucide-react'
import { Navigate } from 'react-router-dom'
import { PortalShell } from '@/components/layout/portal-shell'
import { dashboardQuery } from '@/features/dashboard/api/dashboard-queries'
import { createDashboardViewModel } from '@/features/dashboard/dashboard-model'
import { DashboardStatGrid } from '@/features/dashboard/ui/dashboard-stat-grid'
import { QuickActionsCard } from '@/features/dashboard/ui/quick-actions-card'
import { RecentActivityCard } from '@/features/dashboard/ui/recent-activity-card'
import { UpcomingAppointmentsCard } from '@/features/dashboard/ui/upcoming-appointments-card'
import { useAuth } from '@/features/auth/use-auth'
import type { UserRole } from '@/types/auth'

interface DashboardPageProps {
  expectedRole: UserRole
}

export function DashboardPage({ expectedRole }: DashboardPageProps) {
  const { user } = useAuth()
  const dashboard = useQuery(dashboardQuery(expectedRole))
  const viewModel = createDashboardViewModel(expectedRole, dashboard.data)

  if (!user) return null
  if (user.role !== expectedRole) return <Navigate to="/unauthorized" replace />

  return (
    <PortalShell>
      <div className="space-y-6">
        <section className="relative overflow-hidden rounded-[2rem] bg-[linear-gradient(135deg,#075fd7_0%,#0f8bd5_52%,#24b6a7_100%)] p-6 text-white shadow-[0_24px_70px_rgba(7,95,215,0.22)] sm:p-8">
          <div className="absolute top-8 right-8 size-32 rounded-full bg-white/15 blur-3xl" />
          <div className="absolute -bottom-14 left-12 size-36 rounded-full bg-cyan-200/20 blur-3xl" />
          <div className="relative max-w-3xl">
            <p className="inline-flex rounded-full bg-white/15 px-4 py-2 text-xs font-bold tracking-[0.22em] text-white/85 uppercase">
              {viewModel.eyebrow}
            </p>
            <h1 className="mt-5 max-w-2xl text-3xl font-semibold tracking-tight sm:text-5xl">
              {viewModel.title}
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/85 sm:text-base">
              {viewModel.subtitle}
            </p>
          </div>
        </section>

        {dashboard.isError ? (
          <div className="flex items-start gap-3 rounded-3xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-800">
            <AlertCircle
              className="mt-0.5 size-5 shrink-0"
              aria-hidden="true"
            />
            <p>
              Les données du tableau de bord sont momentanément indisponibles.
              Une vue vide reste affichée pour permettre le test de l’interface.
            </p>
          </div>
        ) : null}

        <DashboardStatGrid
          loading={dashboard.isLoading}
          stats={viewModel.stats}
        />

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
          <RecentActivityCard
            items={viewModel.activity}
            loading={dashboard.isLoading}
          />
          <div className="space-y-6">
            <UpcomingAppointmentsCard
              appointments={viewModel.appointments}
              loading={dashboard.isLoading}
            />
            <QuickActionsCard actions={viewModel.quickActions} />
          </div>
        </div>
      </div>
    </PortalShell>
  )
}
