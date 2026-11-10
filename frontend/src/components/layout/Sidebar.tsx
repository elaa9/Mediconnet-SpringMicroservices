import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, Users, UserCheck, Calendar, FileText,
  Activity, LogOut, Heart
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

interface NavItem {
  label: string
  path: string
  icon: React.ElementType
  roles: string[]
}

const navItems: NavItem[] = [
  { label: 'Dashboard',       path: '/dashboard',      icon: LayoutDashboard, roles: ['ADMIN'] },
  { label: 'Patients',        path: '/patients',       icon: Users,           roles: ['ADMIN'] },
  { label: 'Doctors',         path: '/doctors',        icon: UserCheck,       roles: ['ADMIN'] },
  { label: 'Appointments',    path: '/appointments',   icon: Calendar,        roles: ['ADMIN', 'DOCTOR', 'PATIENT'] },
  { label: 'Consultations',   path: '/consultations',  icon: FileText,        roles: ['ADMIN', 'DOCTOR'] },
  { label: 'My Profile',      path: '/my-profile',     icon: Activity,        roles: ['PATIENT', 'DOCTOR'] },
]

export function Sidebar() {
  const location = useLocation()
  const { user, logout } = useAuth()

  const visibleItems = navItems.filter(item =>
    user && item.roles.includes(user.role)
  )

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary-600 rounded-lg">
            <Heart className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="font-bold text-gray-900 text-lg leading-tight">MediConnect</div>
            <div className="text-xs text-gray-500">Healthcare Platform</div>
          </div>
        </div>
      </div>

      {/* User info */}
      {user && (
        <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
          <div className="text-xs text-gray-500 uppercase font-semibold mb-1">Logged in as</div>
          <div className="text-sm font-medium text-gray-800">{user.name}</div>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
            user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' :
            user.role === 'DOCTOR' ? 'bg-blue-100 text-blue-700' :
            'bg-green-100 text-green-700'
          }`}>
            {user.role}
          </span>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-1">
          {visibleItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path)
            const Icon = item.icon
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary-50 text-primary-700 border border-primary-100'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? 'text-primary-600' : 'text-gray-400'}`} />
                  {item.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </aside>
  )
}
