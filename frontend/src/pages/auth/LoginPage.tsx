import { Navigate } from 'react-router-dom'
import { Heart, Shield, Stethoscope, User } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import type { UserRole } from '../../types'

interface DemoCard {
  role: UserRole
  icon: React.ElementType
  color: string
  bg: string
  title: string
  description: string
}

const demoRoles: DemoCard[] = [
  {
    role: 'ADMIN',
    icon: Shield,
    color: 'text-purple-600',
    bg: 'bg-purple-50 border-purple-200 hover:bg-purple-100',
    title: 'Admin',
    description: 'Full access — manage patients, doctors, appointments, and consultations',
  },
  {
    role: 'DOCTOR',
    icon: Stethoscope,
    color: 'text-blue-600',
    bg: 'bg-blue-50 border-blue-200 hover:bg-blue-100',
    title: 'Doctor',
    description: 'Dr. Youssef El Idrissi — view appointments and manage consultations',
  },
  {
    role: 'PATIENT',
    icon: User,
    color: 'text-green-600',
    bg: 'bg-green-50 border-green-200 hover:bg-green-100',
    title: 'Patient',
    description: 'Alice Martin — view your profile and upcoming appointments',
  },
]

export function LoginPage() {
  const { isAuthenticated, login } = useAuth()

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-primary-600 rounded-xl mb-4">
            <Heart className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">MediConnect</h1>
          <p className="text-gray-500 mt-2">Healthcare Management Platform</p>
        </div>

        {/* Demo notice */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-amber-800 font-medium">Academic Demo Mode</p>
          <p className="text-xs text-amber-700 mt-1">
            Select a role below to access the platform. No password required.
            This simulates role-based access for the university demonstration.
          </p>
        </div>

        {/* Role selection */}
        <div className="space-y-3">
          <p className="text-sm font-medium text-gray-700 mb-3">Select your demo role:</p>
          {demoRoles.map(({ role, icon: Icon, color, bg, title, description }) => (
            <button
              key={role}
              onClick={() => login(role)}
              className={`w-full text-left p-4 border rounded-xl transition-all duration-150 ${bg}`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-white ${color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <div className={`font-semibold ${color}`}>{title}</div>
                  <div className="text-xs text-gray-600 mt-0.5">{description}</div>
                </div>
              </div>
            </button>
          ))}
        </div>

        <p className="text-xs text-gray-400 text-center mt-6">
          JEE2 University Project — MediConnect Microservices Demo
        </p>
      </div>
    </div>
  )
}
