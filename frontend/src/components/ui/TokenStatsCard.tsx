import { Hash, TrendingDown, Layers } from 'lucide-react'
import type { TokenStats } from '../../types'
import { formatNumber } from '../../utils/helpers'

interface TokenStatsCardProps {
  stats: TokenStats
}

export function TokenStatsCard({ stats }: TokenStatsCardProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <StatCell
        icon={<Hash size={13} />}
        label="Input Tokens"
        value={formatNumber(stats.input_tokens)}
        color="text-surface-600 dark:text-surface-300"
      />
      <StatCell
        icon={<Layers size={13} />}
        label="Optimized Tokens"
        value={formatNumber(stats.optimized_tokens)}
        color="text-brand-600 dark:text-brand-400"
      />
      <StatCell
        icon={<Layers size={13} />}
        label="Est. Output Tokens"
        value={formatNumber(stats.estimated_output_tokens)}
        color="text-surface-600 dark:text-surface-300"
      />
      <StatCell
        icon={<TrendingDown size={13} />}
        label="Token Savings"
        value={`${stats.reduction_percentage > 0 ? '-' : ''}${Math.abs(stats.reduction_percentage)}%`}
        color={stats.reduction_percentage > 0 ? 'text-brand-600 dark:text-brand-400' : 'text-surface-500'}
      />
    </div>
  )
}

function StatCell({ icon, label, value, color }: {
  icon: React.ReactNode
  label: string
  value: string
  color: string
}) {
  return (
    <div className="bg-surface-50 dark:bg-surface-800/60 rounded-xl p-3 flex flex-col gap-1.5">
      <div className="flex items-center gap-1.5 text-surface-400 dark:text-surface-500">
        {icon}
        <span className="text-[11px] font-medium uppercase tracking-wide">{label}</span>
      </div>
      <span className={`text-lg font-display font-bold tabular-nums ${color}`}>{value}</span>
    </div>
  )
}
