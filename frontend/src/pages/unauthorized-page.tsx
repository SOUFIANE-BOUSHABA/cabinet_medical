import { ShieldX } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/features/auth/use-auth'
import { getDashboardPath } from '@/features/auth/auth-routing'

export function UnauthorizedPage() {
  const { user } = useAuth()
  const destination = user ? getDashboardPath(user.role) : '/staff/login'

  return (
    <main className="grid min-h-dvh place-items-center bg-[#f4f6ff] p-6 text-center">
      <div className="max-w-md rounded-3xl bg-white p-10 shadow-sm ring-1 ring-slate-100">
        <ShieldX className="mx-auto size-10 text-red-500" aria-hidden="true" />
        <h1 className="mt-5 text-2xl font-semibold text-[#14213a]">
          Accès refusé
        </h1>
        <p className="mt-3 text-sm leading-6 text-[#687387]">
          Votre rôle ne permet pas d&apos;accéder à cette page.
        </p>
        <Link
          to={destination}
          className="mt-6 inline-flex rounded-lg bg-[#075fd7] px-5 py-3 text-sm font-semibold text-white hover:bg-[#0756c1]"
        >
          Retour à mon espace
        </Link>
      </div>
    </main>
  )
}
