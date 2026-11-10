import React, { createContext, useContext, useState, type ReactNode } from 'react'
import type { DemoUser, UserRole } from '../types'

/**
 * Demo Authentication Context
 *
 * This is a simplified role-selection mechanism for academic demonstration.
 * In a production system, this would be replaced by JWT-based authentication
 * with a dedicated auth microservice.
 *
 * Demo users are hardcoded for easy presentation:
 * - Admin: full access to all management pages
 * - Doctor: access to their own appointments and consultations
 * - Patient: access to their own profile and appointments
 */

interface AuthContextType {
  user: DemoUser | null
  login: (role: UserRole) => void
  logout: () => void
  isAuthenticated: boolean
}

const DEMO_USERS: Record<UserRole, DemoUser> = {
  ADMIN: {
    role: 'ADMIN',
    name: 'Dr. Admin',
    email: 'admin@mediconnect.com',
  },
  DOCTOR: {
    role: 'DOCTOR',
    name: 'Dr. Youssef El Idrissi',
    id: 1,
    email: 'youssef.elidrissi@mediconnect.com',
  },
  PATIENT: {
    role: 'PATIENT',
    name: 'Alice Martin',
    id: 1,
    email: 'alice.martin@example.com',
  },
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<DemoUser | null>(() => {
    const saved = localStorage.getItem('mediconnect_user')
    return saved ? JSON.parse(saved) : null
  })

  const login = (role: UserRole) => {
    const demoUser = DEMO_USERS[role]
    setUser(demoUser)
    localStorage.setItem('mediconnect_user', JSON.stringify(demoUser))
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('mediconnect_user')
  }

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      isAuthenticated: user !== null,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
