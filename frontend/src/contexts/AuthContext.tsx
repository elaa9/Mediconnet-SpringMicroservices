import React, { createContext, useContext, useState, type ReactNode } from 'react'
import { patientApi } from '../api/patientApi'
import { doctorApi } from '../api/doctorApi'
import type { AuthUser } from '../types'

const AUTH_STORAGE_KEY = 'mediconnect_auth_v2'

/**
 * Patient and doctor accounts are authenticated by their owning microservice.
 * The admin shortcut remains a local academic-demo role.
 */

interface AuthContextType {
  user: AuthUser | null
  loginAsAdmin: () => void
  loginWithCredentials: (role: 'PATIENT' | 'DOCTOR', email: string, password: string) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const saved = localStorage.getItem(AUTH_STORAGE_KEY)
    return saved ? JSON.parse(saved) : null
  })

  const saveUser = (nextUser: AuthUser) => {
    setUser(nextUser)
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(nextUser))
  }

  const loginAsAdmin = () => {
    saveUser({
      role: 'ADMIN',
      name: 'Dr. Admin',
      email: 'admin@mediconnect.com',
    })
  }

  const loginWithCredentials = async (role: 'PATIENT' | 'DOCTOR', email: string, password: string) => {
    const response = role === 'PATIENT'
      ? await patientApi.login({ email, password })
      : await doctorApi.login({ email, password })
    saveUser(response.data)
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem(AUTH_STORAGE_KEY)
  }

  return (
    <AuthContext.Provider value={{
      user,
      loginAsAdmin,
      loginWithCredentials,
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
