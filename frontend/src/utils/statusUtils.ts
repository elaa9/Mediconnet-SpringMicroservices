export type StatusColor = 'green' | 'blue' | 'red' | 'yellow' | 'gray'

export function getAppointmentStatusColor(status: string): string {
  switch (status?.toUpperCase()) {
    case 'CONFIRMED':  return 'bg-green-100 text-green-800'
    case 'PENDING':    return 'bg-yellow-100 text-yellow-800'
    case 'CANCELLED':  return 'bg-red-100 text-red-800'
    case 'COMPLETED':  return 'bg-blue-100 text-blue-800'
    default:           return 'bg-gray-100 text-gray-800'
  }
}

export function formatDate(dateStr?: string): string {
  if (!dateStr) return '—'
  try {
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric'
    })
  } catch {
    return dateStr
  }
}

export function formatDateTime(dateStr?: string): string {
  if (!dateStr) return '—'
  try {
    return new Date(dateStr).toLocaleString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    })
  } catch {
    return dateStr
  }
}

export function getErrorMessage(error: unknown): string {
  if (!error) return 'An unknown error occurred'
  const e = error as { friendlyMessage?: string; response?: { data?: { message?: string } }; message?: string }
  return (
    e.friendlyMessage ||
    e.response?.data?.message ||
    e.message ||
    'An unexpected error occurred'
  )
}
