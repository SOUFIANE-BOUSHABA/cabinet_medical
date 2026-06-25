import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  AlertCircle,
  Clock3,
  LoaderCircle,
  Save,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
} from 'lucide-react'
import { useMemo, useState, type FormEvent } from 'react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/layout/page-header'
import { PortalShell } from '@/components/layout/portal-shell'
import { useAuth } from '@/features/auth/use-auth'
import {
  type CabinetSettings,
  updateCabinetSettings,
} from '@/features/settings/api/settings-api'
import {
  cabinetSettingsQuery,
  settingsKeys,
} from '@/features/settings/api/settings-queries'
import { getApiErrorMessage } from '@/lib/api/client'
import { formatTime, serializeTime } from '@/lib/utils/format'

interface SettingsFormState {
  dailyAppointmentLimit: string
  appointmentDuration: string
  openingTime: string
  closingTime: string
}

const defaultForm: SettingsFormState = {
  dailyAppointmentLimit: '24',
  appointmentDuration: '30',
  openingTime: '08:00',
  closingTime: '18:00',
}

function asTimeInput(value?: string) {
  return value && /^\d{2}:\d{2}$/.test(value) ? value : ''
}

function toFormState(settings?: CabinetSettings): SettingsFormState {
  if (!settings) return defaultForm
  return {
    dailyAppointmentLimit: String(
      settings.dailyAppointmentLimit ?? defaultForm.dailyAppointmentLimit,
    ),
    appointmentDuration: String(
      settings.appointmentDuration ?? defaultForm.appointmentDuration,
    ),
    openingTime:
      asTimeInput(formatTime(settings.openingTime)) || defaultForm.openingTime,
    closingTime:
      asTimeInput(formatTime(settings.closingTime)) || defaultForm.closingTime,
  }
}

function formKey(form: SettingsFormState) {
  return [
    form.dailyAppointmentLimit,
    form.appointmentDuration,
    form.openingTime,
    form.closingTime,
  ].join('|')
}

interface SettingsEditorProps {
  canUpdate: boolean
  initialForm: SettingsFormState
}

function SettingsEditor({ canUpdate, initialForm }: SettingsEditorProps) {
  const queryClient = useQueryClient()
  const [form, setForm] = useState<SettingsFormState>(initialForm)

  const updateMutation = useMutation({
    mutationFn: (values: SettingsFormState) =>
      updateCabinetSettings({
        dailyAppointmentLimit: Number(values.dailyAppointmentLimit),
        appointmentDuration: Number(values.appointmentDuration),
        openingTime: serializeTime(values.openingTime),
        closingTime: serializeTime(values.closingTime),
      }),
    onSuccess: async () => {
      toast.success('Paramètres enregistrés')
      await queryClient.invalidateQueries({ queryKey: settingsKeys.all })
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  })

  const cards = useMemo(
    () => [
      {
        label: 'Capacité journalière',
        value: form.dailyAppointmentLimit,
        suffix: 'RDV / jour',
        icon: SlidersHorizontal,
      },
      {
        label: 'Durée par créneau',
        value: form.appointmentDuration,
        suffix: 'minutes',
        icon: Clock3,
      },
      {
        label: 'Ouverture cabinet',
        value: `${form.openingTime} - ${form.closingTime}`,
        suffix: 'plage active',
        icon: ShieldCheck,
      },
    ],
    [form],
  )

  const submitForm = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!canUpdate) {
      toast.error('Seul un administrateur peut modifier les paramètres')
      return
    }
    if (Number(form.dailyAppointmentLimit) <= 0) {
      toast.error('Le nombre de rendez-vous doit être supérieur à 0')
      return
    }
    if (Number(form.appointmentDuration) <= 0) {
      toast.error('La durée du créneau doit être supérieure à 0')
      return
    }
    await updateMutation.mutateAsync(form)
  }

  return (
    <>
      <section className="grid gap-4 md:grid-cols-3">
        {cards.map((card) => {
          const Icon = card.icon
          return (
            <article
              key={card.label}
              className="rounded-3xl bg-white p-5 shadow-[0_16px_45px_rgba(15,23,42,0.06)] ring-1 ring-slate-100"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-black tracking-[0.18em] text-slate-400 uppercase">
                    {card.label}
                  </p>
                  <p className="mt-3 text-3xl font-black text-[#101b31]">
                    {card.value}
                  </p>
                  <p className="mt-2 text-sm font-semibold text-slate-500">
                    {card.suffix}
                  </p>
                </div>
                <span className="grid size-12 place-items-center rounded-2xl bg-blue-50 text-[#075fd7] ring-1 ring-blue-100">
                  <Icon className="size-5" />
                </span>
              </div>
            </article>
          )
        })}
      </section>

      <form
        className="rounded-[2rem] bg-white p-5 shadow-[0_18px_55px_rgba(15,23,42,0.07)] ring-1 ring-slate-100"
        onSubmit={submitForm}
      >
        <div className="border-b border-slate-100 pb-5">
          <h2 className="text-lg font-black text-[#101b31]">
            Règles de planification
          </h2>
         
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="text-xs font-black text-slate-500">
              Limite de rendez-vous par jour
            </span>
            <input
              type="number"
              min={1}
              required
              disabled={!canUpdate}
              value={form.dailyAppointmentLimit}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  dailyAppointmentLimit: event.target.value,
                }))
              }
              className="mt-1 h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold outline-none focus:border-[#075fd7] focus:ring-4 focus:ring-blue-100 disabled:bg-slate-50 disabled:text-slate-400"
            />
          </label>

          <label className="block">
            <span className="text-xs font-black text-slate-500">
              Durée d’un rendez-vous
            </span>
            <input
              type="number"
              min={1}
              required
              disabled={!canUpdate}
              value={form.appointmentDuration}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  appointmentDuration: event.target.value,
                }))
              }
              className="mt-1 h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold outline-none focus:border-[#075fd7] focus:ring-4 focus:ring-blue-100 disabled:bg-slate-50 disabled:text-slate-400"
            />
          </label>

          <label className="block">
            <span className="text-xs font-black text-slate-500">
              Heure d’ouverture
            </span>
            <input
              type="time"
              required
              disabled={!canUpdate}
              value={form.openingTime}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  openingTime: event.target.value,
                }))
              }
              className="mt-1 h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold outline-none focus:border-[#075fd7] focus:ring-4 focus:ring-blue-100 disabled:bg-slate-50 disabled:text-slate-400"
            />
          </label>

          <label className="block">
            <span className="text-xs font-black text-slate-500">
              Heure de fermeture
            </span>
            <input
              type="time"
              required
              disabled={!canUpdate}
              value={form.closingTime}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  closingTime: event.target.value,
                }))
              }
              className="mt-1 h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold outline-none focus:border-[#075fd7] focus:ring-4 focus:ring-blue-100 disabled:bg-slate-50 disabled:text-slate-400"
            />
          </label>
        </div>

        {!canUpdate ? (
          <p className="mt-4 rounded-2xl bg-amber-50 px-4 py-3 text-sm font-bold text-amber-700 ring-1 ring-amber-100">
            Mode lecture seule: connectez-vous avec un compte admin pour
            modifier ces paramètres.
          </p>
        ) : null}

        <div className="mt-6 flex justify-end border-t border-slate-100 pt-5">
          <button
            type="submit"
            disabled={!canUpdate || updateMutation.isPending}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-[#075fd7] px-5 text-sm font-black text-white shadow-[0_18px_35px_rgba(7,95,215,0.25)] transition hover:-translate-y-0.5 hover:bg-[#064fb9] disabled:translate-y-0 disabled:opacity-60"
          >
            {updateMutation.isPending ? (
              <LoaderCircle className="size-4 animate-spin" />
            ) : (
              <Save className="size-4" />
            )}
            Enregistrer les paramètres
          </button>
        </div>
      </form>
    </>
  )
}

export function CabinetSettingsPage() {
  const { user } = useAuth()
  const settings = useQuery(cabinetSettingsQuery())
  const canUpdate = user?.role === 'ADMIN'
  const initialForm = toFormState(settings.data)

  return (
    <PortalShell>
      <div className="mx-auto max-w-6xl space-y-6">
        <PageHeader
          eyebrow="Configuration"
          title="Paramètres du cabinet"
          description="Pilotez les règles globales utilisées par le backend pour générer les créneaux et limiter les conflits de rendez-vous."
          icon={Settings}
        />

        {settings.isLoading ? (
          <section className="grid min-h-96 place-items-center rounded-[2rem] bg-white shadow-[0_18px_55px_rgba(15,23,42,0.07)] ring-1 ring-slate-100">
            <LoaderCircle className="size-8 animate-spin text-[#075fd7]" />
          </section>
        ) : settings.isError ? (
          <section className="grid min-h-96 place-items-center rounded-[2rem] bg-white text-center shadow-[0_18px_55px_rgba(15,23,42,0.07)] ring-1 ring-slate-100">
            <div>
              <AlertCircle className="mx-auto size-9 text-rose-500" />
              <p className="mt-3 text-sm font-bold text-slate-700">
                {getApiErrorMessage(settings.error)}
              </p>
            </div>
          </section>
        ) : (
          <SettingsEditor
            key={formKey(initialForm)}
            canUpdate={canUpdate}
            initialForm={initialForm}
          />
        )}
      </div>
    </PortalShell>
  )
}
