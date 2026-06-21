import { zodResolver } from '@hookform/resolvers/zod'
import { LoaderCircle } from 'lucide-react'
import { useEffect } from 'react'
import { useForm, type Resolver } from 'react-hook-form'
import type { Doctor } from '@/features/doctors/api/doctors-api'
import {
  createDoctorSchema,
  type CreateDoctorFormValues,
  type UpdateDoctorFormValues,
  updateDoctorSchema,
} from '@/features/doctors/schemas/doctor-schemas'

interface DoctorFormProps {
  mode: 'create' | 'edit'
  doctor?: Doctor
  submitting: boolean
  onCancel: () => void
  onSubmit: (
    values: CreateDoctorFormValues | UpdateDoctorFormValues,
  ) => Promise<void>
}

interface DoctorFormFields {
  name: string
  email?: string
  password?: string
  specialty?: string
  availability?: string
}

function FormField({
  label,
  error,
  children,
}: {
  label: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <label className="block text-xs font-semibold text-[#344055]">
      {label}
      <span className="mt-1.5 block">{children}</span>
      {error && (
        <span className="mt-1 block text-[11px] font-medium text-red-600">
          {error}
        </span>
      )}
    </label>
  )
}

const inputClass =
  'h-10 w-full rounded-lg border border-[#d8deea] bg-white px-3 text-sm font-normal text-[#17233b] placeholder:text-slate-400'

export function DoctorForm({
  mode,
  doctor,
  submitting,
  onCancel,
  onSubmit,
}: DoctorFormProps) {
  const form = useForm<DoctorFormFields>({
    resolver: zodResolver(
      mode === 'create' ? createDoctorSchema : updateDoctorSchema,
    ) as Resolver<DoctorFormFields>,
    defaultValues: {
      name: doctor?.name ?? '',
      email: '',
      password: '',
      specialty: doctor?.specialty ?? '',
      availability: doctor?.availability ?? '',
    },
  })

  useEffect(() => {
    if (mode === 'edit' && doctor) {
      form.reset({
        name: doctor.name ?? '',
        specialty: doctor.specialty ?? '',
        availability: doctor.availability ?? '',
      })
    }
  }, [doctor, form, mode])

  return (
    <form
      onSubmit={form.handleSubmit(async (values) => {
        await onSubmit(
          mode === 'create'
            ? (values as CreateDoctorFormValues)
            : (values as UpdateDoctorFormValues),
        )
      })}
      className="p-5"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          label="Nom complet"
          error={form.formState.errors.name?.message}
        >
          <input
            {...form.register('name')}
            className={inputClass}
            placeholder="Dr. Nom Prénom"
            autoFocus
          />
        </FormField>

        {mode === 'create' && (
          <FormField
            label="Adresse email"
            error={form.formState.errors.email?.message}
          >
            <input
              {...form.register('email')}
              className={inputClass}
              type="email"
              placeholder="medecin@cabinet.ma"
            />
          </FormField>
        )}

        {mode === 'create' && (
          <FormField
            label="Mot de passe"
            error={form.formState.errors.password?.message}
          >
            <input
              {...form.register('password')}
              className={inputClass}
              type="password"
              autoComplete="new-password"
              placeholder="6 caractères minimum"
            />
          </FormField>
        )}

        <FormField
          label="Spécialité"
          error={form.formState.errors.specialty?.message}
        >
          <input
            {...form.register('specialty')}
            className={inputClass}
            placeholder="Médecine générale"
          />
        </FormField>

        <div className="sm:col-span-2">
          <FormField
            label="Disponibilité"
            error={form.formState.errors.availability?.message}
          >
            <textarea
              {...form.register('availability')}
              className="min-h-24 w-full resize-y rounded-lg border border-[#d8deea] bg-white px-3 py-2.5 text-sm font-normal text-[#17233b] placeholder:text-slate-400"
              placeholder="Ex. Lundi - Vendredi, 09:00 - 17:00"
            />
          </FormField>
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-2 border-t pt-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
          className="h-10 rounded-lg border border-[#d7deea] px-4 text-xs font-semibold text-[#465269] hover:bg-slate-50 disabled:opacity-60"
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex h-10 min-w-28 items-center justify-center gap-2 rounded-lg bg-[#075bd8] px-4 text-xs font-semibold text-white shadow-sm hover:bg-[#064fb9] disabled:opacity-60"
        >
          {submitting && <LoaderCircle className="size-4 animate-spin" />}
          {mode === 'create' ? 'Créer le médecin' : 'Enregistrer'}
        </button>
      </div>
    </form>
  )
}
