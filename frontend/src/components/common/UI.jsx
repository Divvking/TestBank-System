export function Spinner({ size = 'md', className = '' }) {
  const s = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-10 h-10' }[size] || 'w-6 h-6'
  return (
    <svg className={`animate-spin text-teal-600 ${s} ${className}`} fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  )
}

export function LoadingState({ message = 'Loading…' }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <Spinner size="lg" />
      <p className="text-sm text-gray-400">{message}</p>
    </div>
  )
}

export function ErrorState({ message = 'Something went wrong', onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <div className="text-4xl">⚠️</div>
      <p className="text-sm text-gray-500 dark:text-gray-400">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn-secondary text-xs mt-1">Try again</button>
      )}
    </div>
  )
}

export function StatCard({ label, value, icon: Icon, color = 'teal' }) {
  const colors = {
    teal:   'bg-teal-50 text-teal-600 dark:bg-teal-900/20 dark:text-teal-400',
    blue:   'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
    purple: 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400',
    orange: 'bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400',
  }
  return (
    <div className="card p-5 flex items-center gap-4">
      <div className={`p-3 rounded-xl ${colors[color] || colors.teal}`}>
        <Icon size={22} />
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{value ?? '—'}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
      </div>
    </div>
  )
}
