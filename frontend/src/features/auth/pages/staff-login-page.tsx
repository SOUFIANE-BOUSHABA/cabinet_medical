import { zodResolver } from '@hookform/resolvers/zod'
import {
  BriefcaseMedical,
  Headphones,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { getAuthErrorMessage } from '@/features/auth/api/auth-errors'
import { getDashboardPath } from '@/features/auth/auth-routing'
import {
  staffLoginSchema,
  type StaffLoginValues,
} from '@/features/auth/schemas/auth-schemas'
import { useAuth } from '@/features/auth/use-auth'
import { AuthAlert } from '@/features/auth/ui/auth-alert'
import { AuthField } from '@/features/auth/ui/auth-field'
import { BrandLogo } from '@/features/auth/ui/brand-logo'
import { PasswordField } from '@/features/auth/ui/password-field'
import { SubmitButton } from '@/features/auth/ui/submit-button'
import { cn } from '@/lib/utils/cn'
import type { UserRole } from '@/types/auth'

type StaffRole = Exclude<UserRole, 'PATIENT'>

const roles: Array<{
  value: StaffRole
  label: string
  icon: typeof ShieldCheck
}> = [
  { value: 'ADMIN', label: 'Admin', icon: ShieldCheck },
  { value: 'DOCTOR', label: 'Médecin', icon: BriefcaseMedical },
  { value: 'SECRETARY', label: 'Secrétaire', icon: Headphones },
]

export function StaffLoginPage() {
  const navigate = useNavigate()
  const { loginStaff } = useAuth()
  const [selectedRole, setSelectedRole] = useState<StaffRole>('ADMIN')
  const [serverError, setServerError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<StaffLoginValues>({
    resolver: zodResolver(staffLoginSchema),
    defaultValues: { email: '', password: '', remember: false },
  })

  const onSubmit = handleSubmit(async ({ email, password, remember }) => {
    setServerError(null)
    try {
      const user = await loginStaff(
        { email: email.trim(), password },
        selectedRole,
        remember,
      )
      navigate(getDashboardPath(user.role), { replace: true })
    } catch (error) {
      setServerError(getAuthErrorMessage(error))
    }
  })

  return (
    <main className="min-h-dvh overflow-hidden bg-[#f4f6ff] px-5 py-10 text-[#14213a] sm:px-8">
      <div className="mx-auto flex min-h-[calc(100dvh-5rem)] w-full max-w-md flex-col items-center justify-center">
        <div className="mb-7 text-center">
          <BrandLogo compact className="mx-auto" />
          <h1 className="mt-6 text-[26px] font-semibold tracking-[-0.025em]">
            Portail Praticien
          </h1>
          <p className="mt-2 text-xs text-[#667087]">
            Connectez-vous pour accéder à la gestion clinique
          </p>
        </div>

        <section className="w-full rounded-2xl bg-white p-8 shadow-[0_18px_45px_rgba(33,53,88,0.12)] ring-1 ring-slate-100 sm:p-9">
          <div
            className="grid grid-cols-3 rounded-lg bg-[#eef3ff] p-1"
            role="group"
            aria-label="Choisir votre rôle"
          >
            {roles.map(({ value, label, icon: Icon }) => {
              const active = selectedRole === value
              return (
                <button
                  key={value}
                  type="button"
                  aria-pressed={active}
                  onClick={() => {
                    setSelectedRole(value)
                    setServerError(null)
                  }}
                  className={cn(
                    'flex h-14 flex-col items-center justify-center gap-1 rounded-md text-[11px] font-medium transition',
                    active
                      ? 'bg-[#075fd7] text-white shadow-sm'
                      : 'text-[#36435a] hover:bg-white/70',
                  )}
                >
                  <Icon
                    className="size-4"
                    strokeWidth={1.9}
                    aria-hidden="true"
                  />
                  {label}
                </button>
              )
            })}
          </div>

          <form className="mt-7 space-y-5" onSubmit={onSubmit} noValidate>
            {serverError ? (
              <AuthAlert variant="error">{serverError}</AuthAlert>
            ) : null}

            <AuthField
              label="Email Professionnel"
              type="email"
              autoComplete="email"
              placeholder="nom@medico.com"
              icon={Mail}
              error={errors.email?.message}
              {...register('email')}
            />

            <PasswordField
              label="Mot de passe"
              autoComplete="current-password"
              placeholder="••••••••"
              error={errors.password?.message}
              labelAction={
                <button
                  type="button"
                  onClick={() =>
                    toast.info("Contactez l'assistance technique du cabinet.")
                  }
                  className="text-[11px] font-semibold text-[#075fd7] hover:underline"
                >
                  Oublié ?
                </button>
              }
              {...register('password')}
            />

            <label className="flex w-fit cursor-pointer items-center gap-2 text-xs text-[#4f5b70]">
              <input
                type="checkbox"
                className="size-4 rounded border-slate-300 text-[#075fd7] accent-[#075fd7]"
                {...register('remember')}
              />
              Rester connecté sur cet appareil
            </label>

            <SubmitButton loading={isSubmitting}>Se connecter</SubmitButton>
          </form>

         
        </section>

        <footer className="mt-8 text-center text-[11px] leading-6 text-[#6f7a90]">
          <p>
            Problème de connexion ?{' '}
            <a
              href="mailto:support@medico.ma"
              className="font-medium text-[#075fd7] hover:underline"
            >
              Contactez l&apos;assistance technique
            </a>
          </p>
          <nav className="flex items-center justify-center gap-2 text-[#8b95a7]">
            <a href="#confidentialite" className="hover:text-[#536078]">
              Confidentialité
            </a>
            <span aria-hidden="true">•</span>
            <a href="#mentions" className="hover:text-[#536078]">
              Mentions Légales
            </a>
          </nav>
        </footer>
      </div>
    </main>
  )
}
