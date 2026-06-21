import { Navigate, Route, Routes } from 'react-router-dom'
import { DashboardPage } from '@/features/auth/pages/dashboard-page'
import { PatientAuthPage } from '@/features/auth/pages/patient-auth-page'
import { StaffLoginPage } from '@/features/auth/pages/staff-login-page'
import { ProtectedRoute, PublicOnlyRoute } from '@/features/auth/route-guards'
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
      </Route>

      <Route
        element={<ProtectedRoute allowedRoles={['PATIENT']} portal="PATIENT" />}
      >
        <Route
          path="/patient/dashboard"
          element={<DashboardPage expectedRole="PATIENT" />}
        />
      </Route>

      <Route path="/setup" element={<SetupPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export default App
