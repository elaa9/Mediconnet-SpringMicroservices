import { useState, type FormEvent } from 'react'
import { Navigate } from 'react-router-dom'
import { Heart, Shield } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { getErrorMessage } from '../../utils/statusUtils'
import type { UserRole } from '../../types'

export function LoginPage() {
  const { user, isAuthenticated, loginAsAdmin, loginWithCredentials } = useAuth()
  const [role, setRole] = useState<'PATIENT' | 'DOCTOR'>('PATIENT')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (isAuthenticated) {
    return <Navigate to={user?.role === 'ADMIN' ? '/dashboard' : '/my-profile'} replace />
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await loginWithCredentials(role, email.trim(), password)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  const handleAdminLogin = () => {
    loginAsAdmin()
  }

  const roleOptions: { value: UserRole; label: string }[] = [
    { value: 'PATIENT', label: 'Patient' },
    { value: 'DOCTOR', label: 'Doctor' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-primary-600 rounded-xl mb-4">
            <Heart className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">MediConnect</h1>
          <p className="text-gray-500 mt-2">Healthcare Management Platform</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label" htmlFor="role">Sign in as</label>
            <select
              id="role"
              className="input-field"
              value={role}
              onChange={event => setRole(event.target.value === 'DOCTOR' ? 'DOCTOR' : 'PATIENT')}
            >
              {roleOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="email">Email</label>
            <input
              id="email"
              className="input-field"
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={event => setEmail(event.target.value)}
            />
          </div>
          <div>
            <label className="label" htmlFor="password">Password</label>
            <input
              id="password"
              className="input-field"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={event => setPassword(event.target.value)}
            />
          </div>
          {error && <p role="alert" className="text-sm text-red-700 bg-red-50 rounded-lg p-3">{error}</p>}
          <button type="submit" className="btn-primary w-full justify-center" disabled={submitting}>
            {submitting ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <div className="mt-6 border-t pt-5">
          <p className="text-sm text-gray-600 mb-3">Admin access for managing records:</p>
          <button
            type="button"
            onClick={handleAdminLogin}
            className="w-full flex items-center justify-center gap-2 p-3 border border-purple-200 rounded-xl text-purple-700 hover:bg-purple-50"
          >
            <Shield className="h-4 w-4" />
            Continue as demo admin
          </button>
        </div>
      </div>
    </div>
  )
}
