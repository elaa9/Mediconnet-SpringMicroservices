import { useEffect, useState } from 'react'
import { Users, UserCheck, Calendar, FileText, TrendingUp, ExternalLink } from 'lucide-react'
import { TopBar } from '../../components/layout/TopBar'
import { LoadingSpinner } from '../../components/common/LoadingSpinner'
import { getAppointmentStatusColor, formatDate } from '../../utils/statusUtils'
import { patientApi } from '../../api/patientApi'
import { doctorApi } from '../../api/doctorApi'
import { appointmentApi } from '../../api/appointmentApi'
import { consultationApi } from '../../api/consultationApi'
import type { Appointment } from '../../types'

interface Stats {
  patients: number
  doctors: number
  appointments: number
  consultations: number
}

export function DashboardPage() {
  const [stats, setStats] = useState<Stats>({ patients: 0, doctors: 0, appointments: 0, consultations: 0 })
  const [recentAppointments, setRecentAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pRes, dRes, aRes, cRes] = await Promise.allSettled([
          patientApi.getAll(),
          doctorApi.getAll(),
          appointmentApi.getAll(),
          consultationApi.getAll(),
        ])
        const patients     = pRes.status === 'fulfilled' ? pRes.value.data : []
        const doctors      = dRes.status === 'fulfilled' ? dRes.value.data : []
        const appointments = aRes.status === 'fulfilled' ? aRes.value.data : []
        const consultations= cRes.status === 'fulfilled' ? cRes.value.data : []

        setStats({
          patients: patients.length,
          doctors: doctors.length,
          appointments: appointments.length,
          consultations: consultations.length,
        })
        setRecentAppointments(appointments.slice(0, 5))
      } catch (err) {
        setError('Failed to load dashboard data. Make sure all services are running.')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const statCards = [
    { label: 'Total Patients',     value: stats.patients,     icon: Users,      color: 'text-blue-600',   bg: 'bg-blue-50' },
    { label: 'Total Doctors',      value: stats.doctors,      icon: UserCheck,  color: 'text-green-600',  bg: 'bg-green-50' },
    { label: 'Appointments',       value: stats.appointments, icon: Calendar,   color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Consultations',      value: stats.consultations,icon: FileText,   color: 'text-orange-600', bg: 'bg-orange-50' },
  ]

  return (
    <div>
      <TopBar title="Dashboard" subtitle="MediConnect overview" />
      <div className="p-6 space-y-6">

        {error && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-amber-800 text-sm">
            ⚠️ {error}
          </div>
        )}

        {loading ? (
          <LoadingSpinner message="Loading dashboard data..." />
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {statCards.map(({ label, value, icon: Icon, color, bg }) => (
                <div key={label} className="card">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">{label}</p>
                      <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
                    </div>
                    <div className={`p-3 rounded-xl ${bg}`}>
                      <Icon className={`h-6 w-6 ${color}`} />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Recent appointments */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Recent Appointments</h2>
                <TrendingUp className="h-5 w-5 text-gray-400" />
              </div>
              {recentAppointments.length === 0 ? (
                <p className="text-sm text-gray-500 py-4">No appointments yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="table-header">Patient</th>
                        <th className="table-header">Doctor</th>
                        <th className="table-header">Date</th>
                        <th className="table-header">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {recentAppointments.map(apt => (
                        <tr key={apt.id} className="hover:bg-gray-50">
                          <td className="table-cell">{apt.patientName || `Patient #${apt.patientId}`}</td>
                          <td className="table-cell">{apt.doctorName || `Doctor #${apt.doctorId}`}</td>
                          <td className="table-cell">{formatDate(apt.appointmentDate)}</td>
                          <td className="table-cell">
                            <span className={`badge ${getAppointmentStatusColor(apt.status)}`}>
                              {apt.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Quick links */}
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Service URLs</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {[
                  { name: 'Eureka Dashboard', url: 'http://localhost:8761', desc: 'Service registry' },
                  { name: 'Patient Swagger', url: 'http://localhost:8081/swagger-ui.html', desc: 'Port 8081' },
                  { name: 'Doctor Swagger', url: 'http://localhost:8082/swagger-ui.html', desc: 'Port 8082' },
                  { name: 'Appointment Swagger', url: 'http://localhost:8083/swagger-ui.html', desc: 'Port 8083' },
                  { name: 'Consultation Swagger', url: 'http://localhost:8084/swagger-ui.html', desc: 'Port 8084' },
                ].map(({ name, url, desc }) => (
                  <a
                    key={url}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group"
                  >
                    <div>
                      <div className="text-sm font-medium text-gray-900 group-hover:text-primary-600">{name}</div>
                      <div className="text-xs text-gray-500">{desc}</div>
                    </div>
                    <ExternalLink className="h-4 w-4 text-gray-400 group-hover:text-primary-500" />
                  </a>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
