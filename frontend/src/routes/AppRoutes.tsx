import { Routes, Route, Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { AppLayout } from '../components/layout/AppLayout'
import { useAuth } from '../contexts/AuthContext'
import { LoginPage } from '../pages/auth/LoginPage'
import { DashboardPage } from '../pages/admin/DashboardPage'
import { PatientsPage } from '../pages/admin/PatientsPage'
import { DoctorsPage } from '../pages/admin/DoctorsPage'
import { AppointmentsPage } from '../pages/admin/AppointmentsPage'
import { ConsultationsPage } from '../pages/admin/ConsultationsPage'
import { MyProfilePage } from '../pages/patient/MyProfilePage'

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<AppLayout />}>
        <Route path="/dashboard" element={<RoleRoute roles={['ADMIN']}><DashboardPage /></RoleRoute>} />
        <Route path="/patients" element={<RoleRoute roles={['ADMIN']}><PatientsPage /></RoleRoute>} />
        <Route path="/doctors" element={<RoleRoute roles={['ADMIN']}><DoctorsPage /></RoleRoute>} />
        <Route path="/appointments" element={<AppointmentsPage />} />
        <Route path="/consultations" element={<RoleRoute roles={['ADMIN', 'DOCTOR']}><ConsultationsPage /></RoleRoute>} />
        <Route path="/my-profile" element={<RoleRoute roles={['PATIENT', 'DOCTOR']}><MyProfilePage /></RoleRoute>} />
      </Route>

      <Route path="/" element={<HomeRedirect />} />
      <Route path="*" element={<HomeRedirect />} />
    </Routes>
  )
}

function RoleRoute({ roles, children }: { roles: string[]; children: ReactNode }) {
  const { user } = useAuth()
  const home = user?.role === 'ADMIN' ? '/dashboard' : '/my-profile'
  return user && roles.includes(user.role)
    ? children
    : <Navigate to={home} replace />
}

function HomeRedirect() {
  const { user } = useAuth()
  return <Navigate to={user?.role === 'ADMIN' ? '/dashboard' : user ? '/my-profile' : '/login'} replace />
}
