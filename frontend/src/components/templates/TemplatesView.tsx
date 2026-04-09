import { useState } from 'react'
import { TEMPLATES } from '../../utils/helpers'
import { useStore } from '../../store/useStore'
import { ArrowRight } from 'lucide-react'

const CATEGORIES = ['All', ...Array.from(new Set(TEMPLATES.map(t => t.category)))]

export function TemplatesView() {
  const { setRawInput, setActiveView } = useStore()
  const [active, setActive] = useState('All')

  const filtered = active === 'All'
    ? TEMPLATES
    : TEMPLATES.filter(t => t.category === active)

  const handleUse = (starter: string) => {
    setRawInput(starter)
    setActiveView('workspace')
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-lg font-display font-bold text-surface-900 dark:text-white">Prompt Templates</h2>
        <p className="text-sm text-surface-400 dark:text-surface-500 mt-1">Start from a battle-tested template. Click any card to load it.</p>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 flex-wrap">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setActive(cat)}
            className={active === cat
              ? 'badge bg-brand-500 text-white px-3 py-1.5 text-xs font-semibold'
              : 'badge bg-surface-100 dark:bg-surface-800 text-surface-500 dark:text-surface-400 hover:bg-surface-200 dark:hover:bg-surface-700 px-3 py-1.5 text-xs font-medium transition-colors'
            }
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map(t => (
          <button
            key={t.id}
            onClick={() => handleUse(t.starter)}
            className="card p-5 text-left group hover:shadow-card-hover hover:border-brand-200 dark:hover:border-brand-800 transition-all duration-200 cursor-pointer"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="text-2xl">{t.icon}</div>
              <ArrowRight size={14} className="text-surface-300 dark:text-surface-600 group-hover:text-brand-500 group-hover:translate-x-0.5 transition-all mt-0.5" />
            </div>
            <div className="mt-3">
              <h3 className="font-semibold text-sm text-surface-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                {t.title}
              </h3>
              <p className="text-xs text-surface-400 dark:text-surface-500 mt-0.5">{t.description}</p>
            </div>
            <div className="mt-3">
              <span className="badge bg-surface-100 dark:bg-surface-800 text-surface-400 dark:text-surface-500 text-[10px]">
                {t.category}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
