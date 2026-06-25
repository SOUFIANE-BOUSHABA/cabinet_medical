import { Navigate, Route, Routes } from 'react-router-dom'
import { AppointmentBookingPage } from '@/features/appointments/pages/appointment-booking-page'
import { MyAppointmentsPage } from '@/features/appointments/pages/my-appointments-page'
import { StaffAppointmentsPage } from '@/features/appointments/pages/staff-appointments-page'
import { PatientAuthPage } from '@/features/auth/pages/patient-auth-page'
import { StaffLoginPage } from '@/features/auth/pages/staff-login-page'
import { ProtectedRoute, PublicOnlyRoute } from '@/features/auth/route-guards'
import { DoctorConsultationsPage } from '@/features/consultations/pages/doctor-consultations-page'
import { DashboardPage } from '@/features/dashboard/pages/dashboard-page'
import { DoctorManagementPage } from '@/features/doctors/pages/doctor-management-page'
import { PatientManagementPage } from '@/features/patients/pages/patient-management-page'
import { CabinetSettingsPage } from '@/features/settings/pages/cabinet-settings-page'
import { UserManagementPage } from '@/features/users/pages/user-management-page'
import { ModulePlaceholderPage } from '@/pages/module-placeholder-page'
import { NotFoundPage } from '@/pages/not-found-page'
import { SetupPage } from '@/pages/setup-page'
import { UnauthorizedPage } from '@/pages/unauthorized-page'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/patient/login" replace />} />

      <Route
        path="/staff/login"
        element={
          <PublicOnlyRoute>
            <StaffLoginPage />
          </PublicOnlyRoute>
        }
      />

      <Route
        path="/patient/login"
        element={
          <PublicOnlyRoute>
            <PatientAuthPage initialMode="login" />
          </PublicOnlyRoute>
        }
      />

      <Route
        path="/patient/register"
        element={
          <PublicOnlyRoute>
            <PatientAuthPage initialMode="register" />
          </PublicOnlyRoute>
        }
      />

      <Route
        element={
          <ProtectedRoute
            allowedRoles={['ADMIN', 'DOCTOR', 'SECRETARY']}
            portal="STAFF"
          />
        }
      >
        <Route
          path="/admin/dashboard"
          element={<DashboardPage expectedRole="ADMIN" />}
        />
        <Route
          path="/doctor/dashboard"
          element={<DashboardPage expectedRole="DOCTOR" />}
        />
        <Route
          path="/secretary/dashboard"
          element={<DashboardPage expectedRole="SECRETARY" />}
        />

        <Route path="/admin/patients" element={<PatientManagementPage />} />
        <Route
          path="/admin/pending-patients"
          element={
            <ModulePlaceholderPage
              expectedRole="ADMIN"
              title="Patients en attente"
            />
          }
        />
        <Route path="/admin/doctors" element={<DoctorManagementPage />} />
        <Route path="/admin/appointments" element={<StaffAppointmentsPage />} />
        <Route
          path="/admin/medical-records"
          element={
            <ModulePlaceholderPage
              expectedRole="ADMIN"
              title="Dossiers médicaux"
            />
          }
        />
        <Route
          path="/admin/notifications"
          element={
            <ModulePlaceholderPage expectedRole="ADMIN" title="Notifications" />
          }
        />
        <Route path="/admin/users" element={<UserManagementPage />} />
        <Route path="/admin/settings" element={<CabinetSettingsPage />} />

        <Route path="/secretary/patients" element={<PatientManagementPage />} />
        <Route
          path="/secretary/pending-patients"
          element={
            <ModulePlaceholderPage
              expectedRole="SECRETARY"
              title="Patients en attente"
            />
          }
        />
        <Route path="/secretary/doctors" element={<DoctorManagementPage />} />
        <Route
          path="/secretary/appointments"
          element={<StaffAppointmentsPage />}
        />
        <Route
          path="/secretary/medical-records"
          element={
            <ModulePlaceholderPage
              expectedRole="SECRETARY"
              title="Dossiers médicaux"
            />
          }
        />
        <Route
          path="/secretary/notifications"
          element={
            <ModulePlaceholderPage
              expectedRole="SECRETARY"
              title="Notifications"
            />
          }
        />

        <Route path="/doctor/patients" element={<PatientManagementPage />} />
        <Route path="/doctor/doctors" element={<DoctorManagementPage />} />
        <Route
          path="/doctor/appointments"
          element={<StaffAppointmentsPage />}
        />
        <Route
          path="/doctor/medical-records"
          element={
            <ModulePlaceholderPage
              expectedRole="DOCTOR"
              title="Dossiers médicaux"
            />
          }
        />
        <Route
          path="/doctor/consultations"
          element={<DoctorConsultationsPage />}
        />
        <Route
          path="/doctor/documents"
          element={
            <ModulePlaceholderPage expectedRole="DOCTOR" title="Documents" />
          }
        />
        <Route
          path="/doctor/notifications"
          element={
            <ModulePlaceholderPage
              expectedRole="DOCTOR"
              title="Notifications"
            />
          }
        />
      </Route>

      <Route
        element={<ProtectedRoute allowedRoles={['PATIENT']} portal="PATIENT" />}
      >
        <Route
          path="/patient/dashboard"
          element={<DashboardPage expectedRole="PATIENT" />}
        />
        <Route path="/patient/doctors" element={<DoctorManagementPage />} />
        <Route
          path="/patient/appointments/book"
          element={<Navigate to="/patient/request-appointment" replace />}
        />
        <Route
          path="/patient/request-appointment"
          element={<AppointmentBookingPage />}
        />
        <Route path="/patient/appointments" element={<MyAppointmentsPage />} />
        <Route
          path="/patient/medical-record"
          element={
            <ModulePlaceholderPage
              expectedRole="PATIENT"
              title="Mon dossier médical"
            />
          }
        />
        <Route
          path="/patient/notifications"
          element={
            <ModulePlaceholderPage
              expectedRole="PATIENT"
              title="Notifications"
            />
          }
        />
      </Route>

      <Route path="/setup" element={<SetupPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export default App
