import clsx from 'clsx'
import { scoreBg } from '../../utils/helpers'

interface ScoreBarProps {
  label: string
  score: number
  delay?: number
}

export function ScoreBar({ label, score, delay = 0 }: ScoreBarProps) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="text-surface-500 dark:text-surface-400 font-medium">{label}</span>
        <span className={clsx('font-semibold tabular-nums', score >= 80 ? 'text-brand-600 dark:text-brand-400' : score >= 60 ? 'text-amber-600 dark:text-amber-400' : 'text-red-500')}>{score}</span>
      </div>
      <div className="score-bar">
        <div
          className={clsx('score-fill', scoreBg(score))}
          style={{ width: `${score}%`, transitionDelay: `${delay}ms` }}
        />
      </div>
    </div>
  )
}

interface OverallScoreProps {
  score: number
  size?: 'sm' | 'md' | 'lg'
}

export function OverallScore({ score, size = 'md' }: OverallScoreProps) {
  const sizes = { sm: 'text-2xl', md: 'text-4xl', lg: 'text-5xl' }
  const ringSize = { sm: 64, md: 80, lg: 96 }
  const r = ringSize[size] / 2 - 6
  const circ = 2 * Math.PI * r
  const dash = (score / 100) * circ

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: ringSize[size], height: ringSize[size] }}>
        <svg width={ringSize[size]} height={ringSize[size]} className="-rotate-90">
          <circle cx={ringSize[size]/2} cy={ringSize[size]/2} r={r} fill="none" strokeWidth="5"
            className="stroke-surface-100 dark:stroke-surface-800" />
          <circle cx={ringSize[size]/2} cy={ringSize[size]/2} r={r} fill="none" strokeWidth="5"
            stroke={score >= 80 ? '#22c55e' : score >= 60 ? '#f59e0b' : '#ef4444'}
            strokeLinecap="round"
            strokeDasharray={`${dash} ${circ}`}
            style={{ transition: 'stroke-dasharray 0.7s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={clsx('font-display font-bold tabular-nums', sizes[size],
            score >= 80 ? 'text-brand-600 dark:text-brand-400' : score >= 60 ? 'text-amber-600 dark:text-amber-400' : 'text-red-500'
          )}>{score}</span>
        </div>
      </div>
      <span className="text-xs text-surface-400 dark:text-surface-500 font-medium">Overall</span>
    </div>
  )
}
