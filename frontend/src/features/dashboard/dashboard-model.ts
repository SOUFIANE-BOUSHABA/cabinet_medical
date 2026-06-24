import {
  Bell,
  BriefcaseMedical,
  CalendarDays,
  ClipboardList,
  FileText,
  Settings,
  Stethoscope,
  UserRoundPlus,
  Users,
  type LucideIcon,
} from 'lucide-react'
import type { DashboardResponseByRole } from '@/features/dashboard/api/dashboard-api'
import type { components } from '@/types/api'
import type { UserRole } from '@/types/auth'

type DashboardResponse = DashboardResponseByRole[UserRole] | undefined
type Appointment = components['schemas']['AppointmentResponse']

export interface DashboardStat {
  key: string
  label: string
  value: number
  helper: string
  icon: LucideIcon
  tone: 'blue' | 'green' | 'amber' | 'red' | 'slate'
}

export interface DashboardActivity {
  title: string
  detail: string
  time: string
}

export interface DashboardAppointment {
  id: string
  patient: string
  doctor: string
  date: string
  time: string
  status: string
  urgent: boolean
}

export interface DashboardQuickAction {
  label: string
  to: string
  icon: LucideIcon
}

export interface DashboardViewModel {
  eyebrow: string
  title: string
  subtitle: string
  stats: DashboardStat[]
  activity: DashboardActivity[]
  appointments: DashboardAppointment[]
  quickActions: DashboardQuickAction[]
}

export interface NavigationItem {
  label: string
  to: string
  icon: LucideIcon
}

export const roleLabels: Record<UserRole, string> = {
  ADMIN: 'Administrateur',
  DOCTOR: 'Médecin',
  SECRETARY: 'Secrétaire',
  PATIENT: 'Patient',
}

export const roleNavigation: Record<UserRole, NavigationItem[]> = {
  ADMIN: [
    { label: 'Tableau de bord', to: '/admin/dashboard', icon: ClipboardList },
    { label: 'Patients', to: '/admin/patients', icon: Users },
    {
      label: 'Patients en attente',
      to: '/admin/pending-patients',
      icon: UserRoundPlus,
    },
    { label: 'Médecins', to: '/admin/doctors', icon: BriefcaseMedical },
    { label: 'Rendez-vous', to: '/admin/appointments', icon: CalendarDays },
    {
      label: 'Dossiers médicaux',
      to: '/admin/medical-records',
      icon: FileText,
    },
    { label: 'Notifications', to: '/admin/notifications', icon: Bell },
    { label: 'Utilisateurs', to: '/admin/users', icon: Users },
    { label: 'Paramètres', to: '/admin/settings', icon: Settings },
  ],
  SECRETARY: [
    {
      label: 'Tableau de bord',
      to: '/secretary/dashboard',
      icon: ClipboardList,
    },
    { label: 'Patients', to: '/secretary/patients', icon: Users },
    {
      label: 'Patients en attente',
      to: '/secretary/pending-patients',
      icon: UserRoundPlus,
    },
    { label: 'Médecins', to: '/secretary/doctors', icon: BriefcaseMedical },
    {
      label: 'Rendez-vous',
      to: '/secretary/appointments',
      icon: CalendarDays,
    },
    {
      label: 'Dossiers médicaux',
      to: '/secretary/medical-records',
      icon: FileText,
    },
    { label: 'Notifications', to: '/secretary/notifications', icon: Bell },
  ],
  DOCTOR: [
    { label: 'Tableau de bord', to: '/doctor/dashboard', icon: ClipboardList },
    { label: 'Patients', to: '/doctor/patients', icon: Users },
    { label: 'Médecins', to: '/doctor/doctors', icon: BriefcaseMedical },
    { label: 'Rendez-vous', to: '/doctor/appointments', icon: CalendarDays },
    {
      label: 'Dossiers médicaux',
      to: '/doctor/medical-records',
      icon: FileText,
    },
    { label: 'Consultations', to: '/doctor/consultations', icon: Stethoscope },
    { label: 'Documents', to: '/doctor/documents', icon: FileText },
    { label: 'Notifications', to: '/doctor/notifications', icon: Bell },
  ],
  PATIENT: [
    { label: 'Tableau de bord', to: '/patient/dashboard', icon: ClipboardList },
    { label: 'Médecins', to: '/patient/doctors', icon: BriefcaseMedical },
    {
      label: 'Mes rendez-vous',
      to: '/patient/appointments',
      icon: CalendarDays,
    },
    {
      label: 'Demander un rendez-vous',
      to: '/patient/request-appointment',
      icon: UserRoundPlus,
    },
    {
      label: 'Mon dossier médical',
      to: '/patient/medical-record',
      icon: FileText,
    },
    { label: 'Notifications', to: '/patient/notifications', icon: Bell },
  ],
}

const roleCopy: Record<
  UserRole,
  Pick<DashboardViewModel, 'eyebrow' | 'title' | 'subtitle'>
> = {
  ADMIN: {
    eyebrow: 'Tableau de bord',
    title: 'Vue d’ensemble du cabinet',
    subtitle:
      'Pilotez les patients, médecins et rendez-vous avec une vue claire des priorités.',
  },
  DOCTOR: {
    eyebrow: 'Espace médecin',
    title: 'Votre journée clinique',
    subtitle:
      'Suivez les consultations, urgences et rendez-vous à venir sans perdre le fil.',
  },
  SECRETARY: {
    eyebrow: 'Accueil',
    title: 'Coordination du cabinet',
    subtitle:
      'Gardez les demandes, confirmations et flux patients sous contrôle.',
  },
  PATIENT: {
    eyebrow: 'Espace patient',
    title: 'Votre santé en un coup d’œil',
    subtitle:
      'Retrouvez vos rendez-vous, demandes et notifications importantes.',
  },
}

const quickActions: Record<UserRole, DashboardQuickAction[]> = {
  ADMIN: [
    { label: 'Patients', to: '/admin/patients', icon: Users },
    { label: 'Médecins', to: '/admin/doctors', icon: BriefcaseMedical },
    { label: 'Voir détails', to: '/admin/appointments', icon: CalendarDays },
  ],
  DOCTOR: [
    { label: 'Patients', to: '/doctor/patients', icon: Users },
    { label: 'Consultations', to: '/doctor/consultations', icon: Stethoscope },
    {
      label: 'Dossiers médicaux',
      to: '/doctor/medical-records',
      icon: FileText,
    },
  ],
  SECRETARY: [
    { label: 'Patients', to: '/secretary/patients', icon: Users },
    {
      label: 'Patients en attente',
      to: '/secretary/pending-patients',
      icon: UserRoundPlus,
    },
    {
      label: 'Rendez-vous',
      to: '/secretary/appointments',
      icon: CalendarDays,
    },
  ],
  PATIENT: [
    { label: 'Médecins', to: '/patient/doctors', icon: BriefcaseMedical },
    {
      label: 'Demander un rendez-vous',
      to: '/patient/request-appointment',
      icon: CalendarDays,
    },
    {
      label: 'Mon dossier médical',
      to: '/patient/medical-record',
      icon: FileText,
    },
  ],
}

function numberValue(value: number | undefined) {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0
}

function statusLabel(status: Appointment['status']) {
  const labels: Record<NonNullable<Appointment['status']>, string> = {
    PENDING: 'En attente',
    CONFIRMED: 'Confirmé',
    CANCELLED: 'Annulé',
    COMPLETED: 'Terminé',
  }
  return status ? labels[status] : 'En attente'
}

function appointmentTime(appointment: Appointment) {
  if (appointment.startTime) return String(appointment.startTime).slice(0, 5)
  return 'Heure à confirmer'
}

function normalizeAppointments(appointments: Appointment[] | undefined) {
  return (appointments ?? []).slice(0, 5).map((appointment, index) => ({
    id: String(appointment.id ?? index),
    patient: appointment.patientName || 'Patient',
    doctor: appointment.doctorName || 'Médecin à confirmer',
    date: appointment.date || 'Date à confirmer',
    time: appointmentTime(appointment),
    status: statusLabel(appointment.status),
    urgent: appointment.isUrgent || appointment.type === 'URGENT',
  }))
}

function adminStats(data: DashboardResponseByRole['ADMIN']): DashboardStat[] {
  return [
    {
      key: 'totalPatients',
      label: 'Patients',
      value: numberValue(data?.totalPatients),
      helper: 'Total enregistrés',
      icon: Users,
      tone: 'blue',
    },
    {
      key: 'todayAppointments',
      label: 'Rendez-vous aujourd’hui',
      value: numberValue(data?.todayAppointments),
      helper: 'Aujourd’hui',
      icon: CalendarDays,
      tone: 'green',
    },
    {
      key: 'totalDoctors',
      label: 'Médecins',
      value: numberValue(data?.totalDoctors),
      helper: 'Équipe active',
      icon: BriefcaseMedical,
      tone: 'blue',
    },
    {
      key: 'pendingAppointments',
      label: 'En attente',
      value: numberValue(data?.pendingAppointments),
      helper: 'Rendez-vous à valider',
      icon: ClipboardList,
      tone: 'amber',
    },
    {
      key: 'pendingPatientAccounts',
      label: 'Patients en attente',
      value: numberValue(data?.pendingPatientAccounts),
      helper: 'Comptes à vérifier',
      icon: UserRoundPlus,
      tone: 'red',
    },
    {
      key: 'totalUsers',
      label: 'Utilisateurs',
      value: numberValue(data?.totalUsers),
      helper: 'Accès configurés',
      icon: Users,
      tone: 'slate',
    },
  ]
}

function doctorStats(data: DashboardResponseByRole['DOCTOR']): DashboardStat[] {
  return [
    {
      key: 'todayAppointmentsCount',
      label: 'Rendez-vous aujourd’hui',
      value: numberValue(data?.todayAppointmentsCount),
      helper: 'Agenda du jour',
      icon: CalendarDays,
      tone: 'green',
    },
    {
      key: 'urgentAppointmentsToday',
      label: 'Urgences',
      value: numberValue(data?.urgentAppointmentsToday),
      helper: 'À prioriser',
      icon: ClipboardList,
      tone: 'red',
    },
    {
      key: 'totalConsultations',
      label: 'Consultations',
      value: numberValue(data?.totalConsultations),
      helper: 'Total réalisées',
      icon: Stethoscope,
      tone: 'blue',
    },
  ]
}

function secretaryStats(
  data: DashboardResponseByRole['SECRETARY'],
): DashboardStat[] {
  return [
    {
      key: 'pendingAppointmentRequests',
      label: 'Demandes en attente',
      value: numberValue(data?.pendingAppointmentRequests),
      helper: 'À traiter',
      icon: ClipboardList,
      tone: 'amber',
    },
    {
      key: 'totalPatients',
      label: 'Patients',
      value: numberValue(data?.totalPatients),
      helper: 'Total enregistrés',
      icon: Users,
      tone: 'blue',
    },
    {
      key: 'pendingPatientAccounts',
      label: 'Patients en attente',
      value: numberValue(data?.pendingPatientAccounts),
      helper: 'Comptes à vérifier',
      icon: UserRoundPlus,
      tone: 'red',
    },
    {
      key: 'todayAppointments',
      label: 'Rendez-vous aujourd’hui',
      value: numberValue(data?.todayAppointments),
      helper: 'Flux du jour',
      icon: CalendarDays,
      tone: 'green',
    },
    {
      key: 'confirmedToday',
      label: 'Confirmés',
      value: numberValue(data?.confirmedToday),
      helper: 'Aujourd’hui',
      icon: CalendarDays,
      tone: 'blue',
    },
    {
      key: 'cancelledToday',
      label: 'Annulés',
      value: numberValue(data?.cancelledToday),
      helper: 'Aujourd’hui',
      icon: Bell,
      tone: 'slate',
    },
  ]
}

function patientStats(
  data: DashboardResponseByRole['PATIENT'],
): DashboardStat[] {
  return [
    {
      key: 'pendingRequests',
      label: 'En attente',
      value: numberValue(data?.pendingRequests),
      helper: 'Demandes envoyées',
      icon: ClipboardList,
      tone: 'amber',
    },
    {
      key: 'confirmedAppointments',
      label: 'Mes rendez-vous',
      value: numberValue(data?.confirmedAppointments),
      helper: 'Confirmés',
      icon: CalendarDays,
      tone: 'green',
    },
    {
      key: 'notifications',
      label: 'Notifications',
      value: numberValue(data?.notifications),
      helper: 'À consulter',
      icon: Bell,
      tone: 'blue',
    },
  ]
}

function activityFromStats(role: UserRole, stats: DashboardStat[]) {
  const nonZero = stats.filter((stat) => stat.value > 0).slice(0, 3)

  return nonZero.map((stat) => ({
    title: stat.label,
    detail:
      role === 'PATIENT'
        ? `${stat.value} élément(s) disponible(s) dans votre espace.`
        : `${stat.value} élément(s) à suivre pour le cabinet.`,
    time: 'Aujourd’hui',
  }))
}

export function createDashboardViewModel(
  role: UserRole,
  response: DashboardResponse,
): DashboardViewModel {
  const copy = roleCopy[role]

  if (role === 'ADMIN') {
    const data = response as DashboardResponseByRole['ADMIN'] | undefined
    const stats = adminStats(data)
    return {
      ...copy,
      stats,
      activity: activityFromStats(role, stats),
      appointments: [],
      quickActions: quickActions[role],
    }
  }

  if (role === 'DOCTOR') {
    const data = response as DashboardResponseByRole['DOCTOR'] | undefined
    const stats = doctorStats(data)
    return {
      ...copy,
      stats,
      activity: activityFromStats(role, stats),
      appointments: normalizeAppointments(data?.todayAppointments),
      quickActions: quickActions[role],
    }
  }

  if (role === 'SECRETARY') {
    const data = response as DashboardResponseByRole['SECRETARY'] | undefined
    const stats = secretaryStats(data)
    return {
      ...copy,
      stats,
      activity: activityFromStats(role, stats),
      appointments: [],
      quickActions: quickActions[role],
    }
  }

  const data = response as DashboardResponseByRole['PATIENT'] | undefined
  const stats = patientStats(data)
  return {
    ...copy,
    stats,
    activity: activityFromStats(role, stats),
    appointments: normalizeAppointments(data?.upcomingAppointments),
    quickActions: quickActions[role],
  }
}
