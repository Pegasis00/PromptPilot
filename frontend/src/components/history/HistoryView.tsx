import { Trash2, Clock, Zap } from 'lucide-react'
import { useStore } from '../../store/useStore'
import { timeAgo, truncate, MODEL_INFO } from '../../utils/helpers'
import { OverallScore } from '../ui/ScoreBar'

export function HistoryView() {
  const { history, removeFromHistory, clearHistory, loadHistoryItem } = useStore()

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3 text-center animate-fade-in">
        <div className="w-12 h-12 rounded-xl bg-surface-100 dark:bg-surface-800 flex items-center justify-center">
          <Clock size={20} className="text-surface-300 dark:text-surface-600" />
        </div>
        <div>
          <p className="font-semibold text-surface-600 dark:text-surface-400 text-sm">No history yet</p>
          <p className="text-xs text-surface-400 dark:text-surface-500 mt-0.5">Your optimized prompts will appear here.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-display font-bold text-surface-900 dark:text-white">History</h2>
          <p className="text-xs text-surface-400 dark:text-surface-500 mt-0.5">{history.length} saved prompt{history.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={clearHistory}
          className="btn-ghost text-xs text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
        >
          <Trash2 size={13} /> Clear all
        </button>
      </div>

      <div className="space-y-3">
        {history.map(item => {
          const modelInfo = MODEL_INFO[item.target_model] ?? MODEL_INFO.custom
          return (
            <div
              key={item.id}
              className="card p-4 hover:shadow-card-hover hover:border-brand-200 dark:hover:border-brand-800 transition-all duration-200 group"
            >
              <div className="flex items-start gap-4">
                <div className="shrink-0">
                  <OverallScore score={item.quality_score.overall} size="sm" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium text-surface-800 dark:text-surface-200 leading-snug line-clamp-2">
                      {truncate(item.title, 100)}
                    </p>
                    <button
                      onClick={() => removeFromHistory(item.id)}
                      className="shrink-0 btn-ghost p-1.5 text-surface-300 dark:text-surface-600 hover:text-red-500"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>

                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <span className={`badge text-[10px] px-2 py-0.5 ${modelInfo.color}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${modelInfo.dot} inline-block mr-1`} />
                      {modelInfo.label}
                    </span>
                    <span className="badge bg-surface-100 dark:bg-surface-800 text-surface-500 dark:text-surface-400 text-[10px] capitalize">
                      {item.mode}
                    </span>
                    <span className="flex items-center gap-1 text-[10px] text-surface-400 dark:text-surface-500">
                      <Zap size={10} /> ~{item.token_stats.optimized_tokens} tokens
                    </span>
                    <span className="flex items-center gap-1 text-[10px] text-surface-400 dark:text-surface-500">
                      <Clock size={10} /> {timeAgo(item.created_at)}
                    </span>
                  </div>

                  <button
                    onClick={() => loadHistoryItem(item)}
                    className="mt-3 btn-secondary text-xs py-1.5 px-3 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    Load this prompt →
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
