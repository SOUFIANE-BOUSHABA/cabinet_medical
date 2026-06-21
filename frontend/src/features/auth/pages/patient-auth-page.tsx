import { zodResolver } from '@hookform/resolvers/zod'
import {
  CalendarDays,
  IdCard,
  LockKeyhole,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  UserRound,
} from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { getAuthErrorMessage } from '@/features/auth/api/auth-errors'
import { patientRegister } from '@/features/auth/api/auth-api'
import { getDashboardPath } from '@/features/auth/auth-routing'
import {
  patientLoginSchema,
  patientRegisterSchema,
  type PatientLoginValues,
  type PatientRegisterValues,
} from '@/features/auth/schemas/auth-schemas'
import { useAuth } from '@/features/auth/use-auth'
import { AuthAlert } from '@/features/auth/ui/auth-alert'
import { AuthField } from '@/features/auth/ui/auth-field'
import { BrandLogo } from '@/features/auth/ui/brand-logo'
import { PasswordField } from '@/features/auth/ui/password-field'
import { SubmitButton } from '@/features/auth/ui/submit-button'
import { cn } from '@/lib/utils/cn'

type AuthMode = 'login' | 'register'

interface PatientAuthPageProps {
  initialMode: AuthMode
}

export function PatientAuthPage({ initialMode }: PatientAuthPageProps) {
  const navigate = useNavigate()
  const mode = initialMode

  const changeMode = (nextMode: AuthMode) => {
    navigate(nextMode === 'login' ? '/patient/login' : '/patient/register', {
      replace: true,
    })
  }

  return (
    <main className="min-h-dvh bg-[#f6f7fb] text-[#11213f] lg:grid lg:grid-cols-2">
      <PatientBrandPanel />

      <section className="relative flex min-h-dvh items-center justify-center bg-[#f8f9ff] px-6 py-12 sm:px-12 lg:px-16">
        <div className="w-full max-w-[500px]">
          <div className="grid grid-cols-2 rounded-xl bg-[#eef2fc] p-1.5">
            <button
              type="button"
              onClick={() => changeMode('login')}
              className={cn(
                'h-11 rounded-lg text-sm font-medium transition',
                mode === 'login'
                  ? 'bg-white text-[#075fd7] shadow-sm ring-1 ring-slate-100'
                  : 'text-[#344158] hover:text-[#075fd7]',
              )}
            >
              Connexion
            </button>
            <button
              type="button"
              onClick={() => changeMode('register')}
              className={cn(
                'h-11 rounded-lg text-sm font-medium transition',
                mode === 'register'
                  ? 'bg-white text-[#075fd7] shadow-sm ring-1 ring-slate-100'
                  : 'text-[#344158] hover:text-[#075fd7]',
              )}
            >
              Inscription
            </button>
          </div>

          <div className="mt-8">
            {mode === 'login' ? (
              <PatientLoginForm />
            ) : (
              <PatientRegisterForm onLogin={() => changeMode('login')} />
            )}
          </div>

          <footer className="mt-14 text-center text-[11px] text-[#a0a9b9] lg:absolute lg:right-0 lg:bottom-5 lg:left-0">
            © 2026 Medico. Tous droits réservés. Sécurité certifiée HIPAA & RGPD
          </footer>
        </div>
      </section>
    </main>
  )
}

function PatientBrandPanel() {
  return (
    <section className="relative hidden min-h-dvh overflow-hidden bg-[linear-gradient(145deg,#82adf8_0%,#cbd5fb_48%,#75bbb9_100%)] px-14 py-16 lg:flex lg:items-center xl:px-24">
      <div className="relative z-10 w-full max-w-xl">
        <BrandLogo />
        <h1 className="mt-10 max-w-lg text-[38px] leading-[1.12] font-bold tracking-[-0.035em] text-[#0b2453]">
          Votre santé, simplifiée et sécurisée.
        </h1>
        <p className="mt-7 max-w-xl text-base leading-7 text-[#0750b4]">
          Accédez à vos dossiers médicaux, prenez rendez-vous et communiquez
          avec votre équipe de soins en toute confidentialité.
        </p>

        <div className="mt-14 grid max-w-xl grid-cols-2 gap-4">
          <FeatureCard
            icon={ShieldCheck}
            title="Patient vérifié"
            description="Authentification par CIN officielle"
          />
          <FeatureCard
            icon={LockKeyhole}
            title="Données cryptées"
            description="Sécurité de niveau clinique"
          />
        </div>
      </div>
    </section>
  )
}

function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof ShieldCheck
  title: string
  description: string
}) {
  return (
    <div className="rounded-2xl border border-white/35 bg-white/15 p-5 text-[#0b2453] backdrop-blur-sm">
      <Icon className="size-5 text-white/80" aria-hidden="true" />
      <p className="mt-5 text-sm font-semibold">{title}</p>
      <p className="mt-1 text-xs leading-5 text-[#174d8f]">{description}</p>
    </div>
  )
}

function PatientLoginForm() {
  const navigate = useNavigate()
  const { loginPatient } = useAuth()
  const [serverError, setServerError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PatientLoginValues>({
    resolver: zodResolver(patientLoginSchema),
    defaultValues: { cin: '', password: '' },
  })

  const onSubmit = handleSubmit(async ({ cin, password }) => {
    setServerError(null)
    try {
      const user = await loginPatient({ cin: cin.toUpperCase(), password })
      navigate(getDashboardPath(user.role), { replace: true })
    } catch (error) {
      setServerError(getAuthErrorMessage(error))
    }
  })

  return (
    <div>
      <h2 className="text-[26px] font-semibold tracking-[-0.025em]">
        Bienvenue
      </h2>
      <p className="mt-2 text-xs text-[#687387]">
        Veuillez entrer votre CIN et votre mot de passe pour accéder à votre
        espace.
      </p>

      <form className="mt-7 space-y-5" onSubmit={onSubmit} noValidate>
        {serverError ? (
          <AuthAlert variant="error">{serverError}</AuthAlert>
        ) : null}

        <AuthField
          label="NUMÉRO DE CIN"
          type="text"
          autoComplete="username"
          placeholder="Ex: AB123456"
          className="uppercase"
          icon={IdCard}
          error={errors.cin?.message}
          {...register('cin')}
        />
        <PasswordField
          label="MOT DE PASSE"
          autoComplete="current-password"
          placeholder="••••••••"
          error={errors.password?.message}
          {...register('password')}
        />

        <div className="flex items-center gap-2 rounded-lg border border-[#cfe1e3] bg-[#eaf4f5] px-3.5 py-3 text-xs font-medium text-[#277062]">
          <ShieldCheck className="size-4" aria-hidden="true" />
          Patient vérifié par CIN
        </div>

        <SubmitButton loading={isSubmitting}>Se connecter</SubmitButton>
      </form>

      <div className="mt-7 border-t pt-6 text-center text-xs text-[#697489]">
        Besoin d&apos;aide ?{' '}
        <a
          href="mailto:support@medico.ma"
          className="font-medium text-[#075fd7] hover:underline"
        >
          Contacter le support
        </a>
      </div>
    </div>
  )
}

function PatientRegisterForm({ onLogin }: { onLogin: () => void }) {
  const [serverError, setServerError] = useState<string | null>(null)
  const [registeredCin, setRegisteredCin] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PatientRegisterValues>({
    resolver: zodResolver(patientRegisterSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      cin: '',
      phone: '',
      email: '',
      birthDate: '',
      address: '',
      gender: '',
      password: '',
      confirmPassword: '',
    },
  })

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null)
    try {
      const response = await patientRegister({
        cin: values.cin.toUpperCase(),
        firstName: values.firstName,
        lastName: values.lastName,
        password: values.password,
        ...(values.phone ? { phone: values.phone } : {}),
        ...(values.email ? { email: values.email } : {}),
        ...(values.birthDate ? { birthDate: values.birthDate } : {}),
        ...(values.address ? { address: values.address } : {}),
        ...(values.gender ? { gender: values.gender } : {}),
      })
      setRegisteredCin(response.cin ?? values.cin.toUpperCase())
      reset()
    } catch (error) {
      setServerError(getAuthErrorMessage(error))
    }
  })

  if (registeredCin) {
    return (
      <div>
        <h2 className="text-[26px] font-semibold tracking-[-0.025em]">
          Compte créé
        </h2>
        <div className="mt-6">
          <AuthAlert variant="success">
            Votre compte a été créé avec succès. Il est en attente de
            validation.
          </AuthAlert>
        </div>
        <p className="mt-5 text-sm leading-6 text-[#687387]">
          Votre identifiant patient est <strong>{registeredCin}</strong>. Vous
          pourrez vous connecter dès que le cabinet aura validé votre compte.
        </p>
        <button
          type="button"
          onClick={onLogin}
          className="mt-7 h-12 w-full rounded-lg bg-[#075fd7] text-sm font-semibold text-white shadow-[0_6px_14px_rgba(9,96,220,0.18)] hover:bg-[#0756c1]"
        >
          Aller à la connexion
        </button>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-[26px] font-semibold tracking-[-0.025em]">
        Créer votre compte
      </h2>
      <p className="mt-2 text-xs text-[#687387]">
        Renseignez vos informations. Votre compte sera validé par le cabinet.
      </p>

      <form className="mt-7 space-y-5" onSubmit={onSubmit} noValidate>
        {serverError ? (
          <AuthAlert variant="error">{serverError}</AuthAlert>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2">
          <AuthField
            label="PRÉNOM"
            icon={UserRound}
            autoComplete="given-name"
            error={errors.firstName?.message}
            {...register('firstName')}
          />
          <AuthField
            label="NOM"
            icon={UserRound}
            autoComplete="family-name"
            error={errors.lastName?.message}
            {...register('lastName')}
          />
        </div>

        <AuthField
          label="NUMÉRO DE CIN"
          icon={IdCard}
          className="uppercase"
          placeholder="Ex: AB123456"
          error={errors.cin?.message}
          {...register('cin')}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <AuthField
            label="TÉLÉPHONE"
            type="tel"
            icon={Phone}
            autoComplete="tel"
            placeholder="06 00 00 00 00"
            error={errors.phone?.message}
            {...register('phone')}
          />
          <AuthField
            label="EMAIL"
            type="email"
            icon={Mail}
            autoComplete="email"
            error={errors.email?.message}
            {...register('email')}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <AuthField
            label="DATE DE NAISSANCE"
            type="date"
            icon={CalendarDays}
            max={new Date().toISOString().slice(0, 10)}
            error={errors.birthDate?.message}
            {...register('birthDate')}
          />
          <div className="space-y-2">
            <label
              htmlFor="gender"
              className="text-xs font-medium text-[#29354c]"
            >
              GENRE
            </label>
            <select
              id="gender"
              className="h-12 w-full rounded-lg border bg-white px-3.5 text-sm text-[#17233c] hover:border-[#9eacc2] focus:border-[#0960dc] focus:ring-3 focus:ring-blue-100"
              {...register('gender')}
            >
              <option value="">Non précisé</option>
              <option value="MALE">Homme</option>
              <option value="FEMALE">Femme</option>
              <option value="OTHER">Autre</option>
            </select>
          </div>
        </div>

        <AuthField
          label="ADRESSE"
          icon={MapPin}
          autoComplete="street-address"
          error={errors.address?.message}
          {...register('address')}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <PasswordField
            label="MOT DE PASSE"
            autoComplete="new-password"
            error={errors.password?.message}
            {...register('password')}
          />
          <PasswordField
            label="CONFIRMATION"
            autoComplete="new-password"
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />
        </div>

        <SubmitButton loading={isSubmitting}>Créer mon compte</SubmitButton>
      </form>
    </div>
  )
}
