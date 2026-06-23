import { X } from 'lucide-react'

interface Props {
  isOpen: boolean
  onClose: () => void
  patient: any
}

export function PatientDetailsDrawer({ isOpen, onClose, patient }: Props) {
  if (!isOpen || !patient) return null

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/50 p-4 backdrop-blur-sm">
      {/* Centered Popup Container */}
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <h2 className="text-lg font-bold text-[#142039]">Détails du patient</h2>
          <button onClick={onClose} className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
            <X className="size-5" />
          </button>
        </div>
        
        <div className="mt-6 space-y-6">
          <div>
            <h3 className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">Informations personnelles</h3>
            <p className="mt-2 text-base font-bold text-[#17233b]">{patient.firstName} {patient.lastName}</p>
            <div className="mt-2 space-y-1">
              <p className="text-sm text-slate-600">CIN: <span className="font-medium text-slate-900">{patient.cin}</span></p>
              <p className="text-sm text-slate-600">Genre: <span className="font-medium text-slate-900">{patient.gender === 'MALE' ? 'Homme' : 'Femme'}</span></p>
              <p className="text-sm text-slate-600">Date de naissance: <span className="font-medium text-slate-900">{patient.birthDate}</span></p>
            </div>
          </div>
          
          <div>
            <h3 className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">Contact</h3>
            <div className="mt-2 space-y-1">
              <p className="text-sm text-slate-600">Email: <span className="font-medium text-slate-900">{patient.email}</span></p>
              <p className="text-sm text-slate-600">Tél: <span className="font-medium text-slate-900">{patient.phone}</span></p>
              <p className="text-sm text-slate-600">Adresse: <span className="font-medium text-slate-900">{patient.address || 'Non spécifiée'}</span></p>
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <button onClick={onClose} className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200">
            Fermer
          </button>
        </div>
      </div>
    </div>
  )
}