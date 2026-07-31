import { useCountdown } from '../../hooks'
import { Clock } from 'lucide-react'

export default function Timer({ durationMinutes, onExpire }) {
  const { display, isLow } = useCountdown(durationMinutes * 60, onExpire)

  return (
    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-mono text-lg font-semibold border
      ${isLow
        ? 'bg-red-50 text-red-700 border-red-200 animate-pulse dark:bg-red-900/20 dark:text-red-400 dark:border-red-800'
        : 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-900/20 dark:text-teal-400 dark:border-teal-800'
      }`}>
      <Clock size={18} />
      {display}
    </div>
  )
}
