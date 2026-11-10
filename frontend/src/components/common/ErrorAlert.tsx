import { AlertCircle, X } from 'lucide-react'

interface Props {
  message: string
  onDismiss?: () => void
}

export function ErrorAlert({ message, onDismiss }: Props) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
      <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
      <div className="flex-1 text-sm text-red-700">{message}</div>
      {onDismiss && (
        <button onClick={onDismiss} className="text-red-400 hover:text-red-600">
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}
