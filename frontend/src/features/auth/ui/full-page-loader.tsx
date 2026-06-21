import { LoaderCircle } from 'lucide-react'

export function FullPageLoader() {
  return (
    <main className="grid min-h-dvh place-items-center bg-[#f6f8ff]">
      <div className="text-center text-[#516079]">
        <LoaderCircle
          className="mx-auto size-7 animate-spin text-[#0960dc]"
          aria-hidden="true"
        />
        <p className="mt-3 text-sm">Chargement de votre espace…</p>
      </div>
    </main>
  )
}
