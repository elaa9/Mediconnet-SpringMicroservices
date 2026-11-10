import { Routes, Route, Navigate } from 'react-router-dom'
import { AppLayout } from '../components/layout/AppLayout'
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
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/patients" element={<PatientsPage />} />
        <Route path="/doctors" element={<DoctorsPage />} />
        <Route path="/appointments" element={<AppointmentsPage />} />
        <Route path="/consultations" element={<ConsultationsPage />} />
        <Route path="/my-profile" element={<MyProfilePage />} />
      </Route>

      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
