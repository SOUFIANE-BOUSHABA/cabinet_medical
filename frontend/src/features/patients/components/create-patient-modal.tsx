import { useMutation, useQueryClient } from '@tanstack/react-query'
import { X } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import {
  createPatient,
  type CreatePatientPayload,
  type Patient,
  type UpdatePatientPayload,
  updatePatient,
} from '@/features/patients/api/patients-api'
import { patientKeys } from '@/features/patients/api/patient-queries'

interface Props {
  isOpen: boolean
  onClose: () => void
  initialData?: Patient | null
}

type PatientFormData = CreatePatientPayload & { password: string }

function getInitialFormData(patient?: Patient | null): PatientFormData {
  return {
    firstName: patient?.firstName || '',
    lastName: patient?.lastName || '',
    email: patient?.email || '',
    cin: patient?.cin || '',
    phone: patient?.phone || '',
    birthDate: patient?.birthDate || '',
    gender: patient?.gender || 'MALE',
    address: patient?.address || '',
    password: 'Password123!',
  }
}

export function CreatePatientModal({ isOpen, onClose, initialData }: Props) {
  const queryClient = useQueryClient()

  const [formData, setFormData] = useState<PatientFormData>(() =>
    getInitialFormData(initialData),
  )

  const isEditing = !!initialData

  const toPayload = (): CreatePatientPayload => ({
    firstName: formData.firstName,
    lastName: formData.lastName,
    email: formData.email,
    cin: formData.cin,
    phone: formData.phone,
    birthDate: formData.birthDate,
    gender: formData.gender,
    address: formData.address,
    password: formData.password,
  })

  const mutation = useMutation({
    mutationFn: () => {
      const payload = toPayload()
      if (isEditing && initialData?.id) {
        return updatePatient(
          initialData.id,
          payload satisfies UpdatePatientPayload,
        )
      }
      return createPatient(payload)
    },
    onSuccess: () => {
      toast.success(
        isEditing
          ? 'Patient modifié avec succès !'
          : 'Patient ajouté avec succès !',
      )
      queryClient.invalidateQueries({ queryKey: patientKeys.lists() })
      onClose()
    },
    onError: () => {
      toast.error(
        isEditing
          ? 'Erreur lors de la modification.'
          : "Erreur lors de l'ajout.",
      )
    },
  })

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    mutation.mutate()
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <h2 className="text-lg font-bold text-[#142039]">
            {isEditing ? 'Modifier le patient' : 'Ajouter un patient'}
          </h2>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="size-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Prénom
              </label>
              <input
                required
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Nom
              </label>
              <input
                required
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                CIN
              </label>
              <input
                required
                name="cin"
                value={formData.cin}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Téléphone
              </label>
              <input
                required
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Date de naissance
              </label>
              {/* Changed name to birthDate below! */}
              <input
                required
                type="date"
                name="birthDate"
                value={formData.birthDate}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Genre
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
              >
                <option value="MALE">Homme</option>
                <option value="FEMALE">Femme</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">
              Email
            </label>
            <input
              required
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">
              Adresse
            </label>
            <input
              required
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
            />
          </div>

          <div className="mt-6 flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="rounded-lg bg-[#075bd8] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#064fb9] disabled:opacity-50"
            >
              {mutation.isPending
                ? 'Enregistrement...'
                : isEditing
                  ? 'Modifier'
                  : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
