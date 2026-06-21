import {
  Blocks,
  CheckCircle2,
  FileCode2,
  Route,
  ShieldCheck,
  TestTube2,
} from 'lucide-react'

const foundations = [
  { label: 'React + TypeScript', icon: FileCode2 },
  { label: 'Tailwind CSS', icon: Blocks },
  { label: 'Routing ready', icon: Route },
  { label: 'JWT API client', icon: ShieldCheck },
  { label: 'Testing ready', icon: TestTube2 },
]

export function SetupPage() {
  return (
    <main className="grid min-h-dvh place-items-center p-6">
      <section className="w-full max-w-3xl rounded-3xl border bg-white p-8 shadow-sm sm:p-12">
        <div className="mb-8 flex size-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
          <CheckCircle2 aria-hidden="true" />
        </div>

        <p className="mb-3 text-sm font-semibold tracking-wide text-emerald-700 uppercase">
          Cabinet Medical
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
          Frontend foundation is ready.
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
          The technical foundation is connected and intentionally neutral. The
          product screens can now be designed without reworking the project
          structure.
        </p>

        <ul className="mt-8 grid gap-3 sm:grid-cols-2">
          {foundations.map(({ label, icon: Icon }) => (
            <li
              key={label}
              className="flex items-center gap-3 rounded-2xl border bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700"
            >
              <Icon className="size-4 text-emerald-700" aria-hidden="true" />
              {label}
            </li>
          ))}
        </ul>
      </section>
    </main>
  )
}
