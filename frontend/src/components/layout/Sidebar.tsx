import { Wand2, History, LayoutTemplate, Settings } from 'lucide-react'
import { useStore } from '../../store/useStore'
import type { ActiveView } from '../../types'
import clsx from 'clsx'

const NAV = [
  { id: 'workspace' as ActiveView, label: 'Workspace', icon: Wand2 },
  { id: 'templates' as ActiveView, label: 'Templates', icon: LayoutTemplate },
  { id: 'history'   as ActiveView, label: 'History',   icon: History },
  { id: 'settings'  as ActiveView, label: 'Settings',  icon: Settings },
]

export function Sidebar() {
  const { activeView, setActiveView, history } = useStore()

  return (
    <aside className="w-16 md:w-56 border-r border-surface-100 dark:border-surface-800 bg-surface-50/60 dark:bg-surface-900/60 flex flex-col py-4 shrink-0">
      <nav className="flex flex-col gap-1 px-2">
        {NAV.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveView(id)}
            className={clsx(
              'flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-150',
              activeView === id
                ? 'bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 shadow-glow-sm'
                : 'text-surface-500 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 hover:text-surface-700 dark:hover:text-surface-200'
            )}
          >
            <Icon size={17} className="shrink-0" />
            <span className="hidden md:block">{label}</span>
            {id === 'history' && history.length > 0 && (
              <span className="hidden md:flex ml-auto text-[10px] font-semibold bg-surface-200 dark:bg-surface-700 text-surface-500 dark:text-surface-400 rounded-full px-1.5 py-0.5 min-w-[20px] items-center justify-center">
                {history.length > 99 ? '99+' : history.length}
              </span>
            )}
          </button>
        ))}
      </nav>
    </aside>
  )
}
