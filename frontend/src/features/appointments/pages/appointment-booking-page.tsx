import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  AlertCircle,
  Calendar,
  ChevronRight,
  Clock,
  LoaderCircle,
  Stethoscope,
} from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { PortalShell } from '@/components/layout/portal-shell'
import { getDoctors } from '@/features/doctors/api/doctors-api'
import {
  requestAppointment,
  type AvailableSlot,
} from '@/features/appointments/api/appointments-api'
import {
  appointmentKeys,
  availableSlotsQuery,
} from '@/features/appointments/api/appointment-queries'
import {
  requestAppointmentSchema,
  type RequestAppointmentFormValues,
} from '@/features/appointments/schemas/appointment-schemas'
import { getApiErrorMessage } from '@/lib/api/client'
import { formatTime, serializeTime } from '@/lib/utils/format'

function valueOrDash(value?: string) {
  return value?.trim() || 'Non renseigné'
}

export function AppointmentBookingPage() {
  const queryClient = useQueryClient()
  const [selectedDoctorId, setSelectedDoctorId] = useState<number | null>(null)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
  const [step, setStep] = useState<'doctor' | 'datetime' | 'confirm'>('doctor')

  const doctors = useQuery({
    queryKey: ['doctors', 'list', { page: 0, size: 50 }],
    queryFn: () => getDoctors({ page: 0, size: 50 }),
  })

  const slots = useQuery(
    availableSlotsQuery(selectedDoctorId ?? 0, selectedDate),
  )

  const form = useForm<RequestAppointmentFormValues>({
    resolver: zodResolver(requestAppointmentSchema),
    defaultValues: {
      doctorId: 0,
      date: '',
      startTime: '',
      reason: '',
    },
  })

  const requestMutation = useMutation({
    mutationFn: requestAppointment,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: appointmentKeys.myLists(),
      })
      toast.success('Demande envoyée. Elle sera validée par l’administration.')
      form.reset()
      setSelectedDoctorId(null)
      setSelectedDate('')
      setSelectedSlot(null)
      setStep('doctor')
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  })

  function handleSelectDoctor(doctorId: number) {
    setSelectedDoctorId(doctorId)
    form.setValue('doctorId', doctorId)
    setStep('datetime')
    setSelectedSlot(null)
  }

  function handleDateChange(date: string) {
    setSelectedDate(date)
    form.setValue('date', date)
    setSelectedSlot(null)
  }

  function handleSelectSlot(slot: AvailableSlot) {
    const time = formatTime(slot.startTime)
    setSelectedSlot(time)
    form.setValue('startTime', time)
    setStep('confirm')
  }

  async function handleSubmit(values: RequestAppointmentFormValues) {
    await requestMutation.mutateAsync({
      doctorId: values.doctorId,
      date: values.date,
      startTime: serializeTime(values.startTime),
      reason: values.reason || undefined,
    })
  }

  const selectedDoctor = doctors.data?.content?.find(
    (d) => d.id === selectedDoctorId,
  )

  return (
    <PortalShell>
      <div className="mx-auto max-w-[800px]">
        <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div>
            <h1 className="text-xl leading-tight font-bold tracking-[-0.03em] text-[#101b31]">
              Demander un rendez-vous
            </h1>
            <p className="mt-1 text-[11px] text-[#5f6c81]">
              Envoyez une demande: elle restera en attente jusqu’à validation
              par l’administration.
            </p>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-[#5f6c81]">
            <span
              className={step === 'doctor' ? 'font-bold text-[#075bd8]' : ''}
            >
              Médecin
            </span>
            <ChevronRight className="size-3" />
            <span
              className={step === 'datetime' ? 'font-bold text-[#075bd8]' : ''}
            >
              Date & heure
            </span>
            <ChevronRight className="size-3" />
            <span
              className={step === 'confirm' ? 'font-bold text-[#075bd8]' : ''}
            >
              Confirmation
            </span>
          </div>
        </section>

        {step === 'doctor' && (
          <section className="mt-4">
            {doctors.isLoading ? (
              <div className="animate-pulse space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-20 rounded-lg bg-slate-100" />
                ))}
              </div>
            ) : doctors.isError ? (
              <div className="grid min-h-48 place-items-center rounded-lg border border-[#cfd7e7] bg-white p-6 text-center">
                <AlertCircle className="size-8 text-red-500" />
                <p className="mt-2 text-sm text-slate-600">
                  {getApiErrorMessage(doctors.error)}
                </p>
                <button
                  type="button"
                  onClick={() => void doctors.refetch()}
                  className="mt-3 rounded-md bg-[#075bd8] px-4 py-2 text-xs font-semibold text-white"
                >
                  Réessayer
                </button>
              </div>
            ) : doctors.data?.content?.length === 0 ? (
              <div className="grid min-h-48 place-items-center rounded-lg border border-[#cfd7e7] bg-white p-6 text-center">
                <Stethoscope className="size-8 text-[#075bd8]" />
                <p className="mt-2 text-sm font-bold text-[#142039]">
                  Aucun médecin disponible
                </p>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {doctors.data?.content?.map((doctor) => (
                  <button
                    key={doctor.id}
                    type="button"
                    onClick={() => doctor.id && handleSelectDoctor(doctor.id)}
                    className="rounded-lg border border-[#cfd7e7] bg-white p-4 text-left shadow-[0_1px_3px_rgba(16,29,53,0.06)] transition-colors hover:border-[#075bd8] hover:shadow-md"
                  >
                    <h3 className="text-sm font-bold text-[#17233b]">
                      {valueOrDash(doctor.name)}
                    </h3>
                    <p className="mt-1 text-xs text-slate-500">
                      {valueOrDash(doctor.specialty)}
                    </p>
                    <p className="mt-1 text-[10px] text-slate-400">
                      {valueOrDash(doctor.availability)}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </section>
        )}

        {step === 'datetime' && selectedDoctor && (
          <section className="mt-4">
            <div className="mb-4 rounded-lg border border-[#cfd7e7] bg-white p-4">
              <h3 className="text-sm font-bold text-[#17233b]">
                {selectedDoctor.name}
              </h3>
              <p className="text-xs text-slate-500">
                {valueOrDash(selectedDoctor.specialty)}
              </p>
              <button
                type="button"
                onClick={() => setStep('doctor')}
                className="mt-2 text-[10px] font-semibold text-[#075bd8] hover:underline"
              >
                Changer de médecin
              </button>
            </div>

            <div className="mb-4">
              <label className="block text-xs font-semibold text-[#344055]">
                Date du rendez-vous
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => handleDateChange(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="mt-1.5 block h-10 w-full rounded-lg border border-[#d8deea] bg-white px-3 text-sm font-normal text-[#17233b]"
                />
              </label>
            </div>

            {selectedDate && (
              <>
                {slots.isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <LoaderCircle className="size-6 animate-spin text-[#075bd8]" />
                  </div>
                ) : slots.isError ? (
                  <div className="rounded-lg border border-[#cfd7e7] bg-white p-6 text-center">
                    <p className="text-xs text-red-600">
                      {getApiErrorMessage(slots.error)}
                    </p>
                  </div>
                ) : slots.data && slots.data.length > 0 ? (
                  <>
                    <p className="mb-2 text-[11px] font-semibold text-[#5f6c81]">
                      Créneaux disponibles
                    </p>
                    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                      {slots.data.map((slot, idx) => {
                        const time = formatTime(slot.startTime)
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleSelectSlot(slot)}
                            className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-[#cfd7e7] bg-white px-3 py-2 text-xs font-semibold text-[#17233b] transition-colors hover:border-[#075bd8] hover:bg-blue-50 hover:text-[#075bd8]"
                          >
                            <Clock className="size-3" />
                            {time}
                          </button>
                        )
                      })}
                    </div>
                  </>
                ) : (
                  <div className="rounded-lg border border-[#cfd7e7] bg-white p-6 text-center">
                    <Calendar className="mx-auto size-6 text-slate-400" />
                    <p className="mt-2 text-xs text-slate-500">
                      Aucun créneau disponible pour cette date.
                    </p>
                  </div>
                )}
              </>
            )}
          </section>
        )}

        {step === 'confirm' && selectedDoctor && selectedSlot && (
          <section className="mt-4">
            <div className="rounded-lg border border-[#cfd7e7] bg-white p-6">
              <h2 className="text-sm font-bold text-[#17233b]">
                Envoyer votre demande
              </h2>
              <p className="mt-1 text-xs font-medium text-amber-700">
                Statut après envoi: en attente. Un admin ou une secrétaire doit
                accepter la demande.
              </p>
              <dl className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-xs font-semibold text-slate-500">
                    Médecin
                  </dt>
                  <dd className="text-xs font-bold text-[#17233b]">
                    {selectedDoctor.name}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-xs font-semibold text-slate-500">Date</dt>
                  <dd className="text-xs font-bold text-[#17233b]">
                    {selectedDate}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-xs font-semibold text-slate-500">
                    Créneau
                  </dt>
                  <dd className="text-xs font-bold text-[#17233b]">
                    {selectedSlot}
                  </dd>
                </div>
              </dl>

              <div className="mt-4">
                <label className="block text-xs font-semibold text-[#344055]">
                  Motif (optionnel)
                  <textarea
                    {...form.register('reason')}
                    className="mt-1.5 min-h-20 w-full resize-y rounded-lg border border-[#d8deea] bg-white px-3 py-2.5 text-sm font-normal text-[#17233b] placeholder:text-slate-400"
                    placeholder="Décrivez brièvement le motif de votre visite"
                  />
                </label>
              </div>

              <div className="mt-6 flex justify-end gap-2 border-t pt-4">
                <button
                  type="button"
                  onClick={() => setStep('datetime')}
                  disabled={requestMutation.isPending}
                  className="h-10 rounded-lg border border-[#d7deea] px-4 text-xs font-semibold text-[#465269] hover:bg-slate-50 disabled:opacity-60"
                >
                  Retour
                </button>
                <button
                  type="button"
                  onClick={() => form.handleSubmit(handleSubmit)()}
                  disabled={requestMutation.isPending}
                  className="inline-flex h-10 min-w-28 items-center justify-center gap-2 rounded-lg bg-[#075bd8] px-4 text-xs font-semibold text-white shadow-sm hover:bg-[#064fb9] disabled:opacity-60"
                >
                  {requestMutation.isPending && (
                    <LoaderCircle className="size-4 animate-spin" />
                  )}
                  Envoyer la demande
                </button>
              </div>
            </div>
          </section>
        )}
      </div>
    </PortalShell>
  )
}
