import { CalendarClock } from 'lucide-react'
import type { DashboardAppointment } from '@/features/dashboard/dashboard-model'
import { DashboardEmptyState } from '@/features/dashboard/ui/dashboard-empty-state'
import { DashboardLoadingSkeleton } from '@/features/dashboard/ui/dashboard-loading-skeleton'
import { cn } from '@/lib/utils/cn'

interface UpcomingAppointmentsCardProps {
  appointments: DashboardAppointment[]
  loading: boolean
}

export function UpcomingAppointmentsCard({
  appointments,
  loading,
}: UpcomingAppointmentsCardProps) {
  return (
    <section className="rounded-3xl border border-white/70 bg-white p-5 shadow-[0_18px_45px_rgba(15,23,42,0.06)] ring-1 ring-slate-100">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-lg font-semibold tracking-tight text-[#14213a]">
          Prochains rendez-vous
        </h2>
        <CalendarClock className="size-5 text-[#075fd7]" aria-hidden="true" />
      </div>

      {loading ? <DashboardLoadingSkeleton /> : null}
      {!loading && !appointments.length ? (
        <DashboardEmptyState
          title="Aucun rendez-vous"
          description="Les prochains rendez-vous apparaîtront ici."
        />
      ) : null}
      {!loading && appointments.length ? (
        <div className="space-y-3">
          {appointments.map((appointment) => (
            <article
              key={appointment.id}
              className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-[#14213a]">
                    {appointment.patient}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {appointment.doctor}
                  </p>
                </div>
                <span
                  className={cn(
                    'rounded-full px-3 py-1 text-xs font-bold',
                    appointment.urgent
                      ? 'bg-rose-50 text-rose-700'
                      : 'bg-blue-50 text-[#075fd7]',
                  )}
                >
                  {appointment.urgent ? 'Urgent' : appointment.status}
                </span>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <span className="rounded-xl bg-white px-3 py-2 font-semibold text-slate-600">
                  {appointment.date}
                </span>
                <span className="rounded-xl bg-white px-3 py-2 font-semibold text-[#075fd7]">
                  {appointment.time}
                </span>
              </div>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  )
}
