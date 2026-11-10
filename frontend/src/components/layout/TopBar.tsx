import { Bell, ExternalLink } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

interface Props {
  title: string
  subtitle?: string
}

export function TopBar({ title, subtitle }: Props) {
  const { user } = useAuth()

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
        {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-4">
        {/* Quick links for demo */}
        <div className="hidden md:flex items-center gap-2 text-xs text-gray-400">
          <a
            href="http://localhost:8761"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 hover:text-primary-600 transition-colors"
          >
            <ExternalLink className="h-3 w-3" />
            Eureka
          </a>
          <span>·</span>
          <a
            href="http://localhost:8081/swagger-ui.html"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 hover:text-primary-600 transition-colors"
          >
            Swagger
          </a>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <div className="text-sm font-medium text-gray-900">{user?.name}</div>
            <div className="text-xs text-gray-500">{user?.role}</div>
          </div>
          <div className="h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center text-white text-sm font-semibold">
            {user?.name?.[0] ?? 'U'}
          </div>
        </div>
      </div>
    </header>
  )
}
