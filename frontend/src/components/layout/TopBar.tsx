import { Sun, Moon, Zap } from 'lucide-react'
import { useTheme } from '../../hooks/useTheme'

export function TopBar() {
  const { theme, toggleTheme } = useTheme()

  return (
    <header className="h-14 border-b border-surface-100 dark:border-surface-800 bg-white/90 dark:bg-surface-950/90 backdrop-blur-md flex items-center px-6 gap-4 sticky top-0 z-50">
      {/* Logo */}
      <div className="flex items-center gap-2.5 select-none">
        <div className="w-7 h-7 rounded-lg bg-brand-500 flex items-center justify-center shadow-glow-sm">
          <Zap size={15} className="text-white fill-white" />
        </div>
        <span className="font-display font-700 text-lg tracking-tight text-surface-900 dark:text-white">
          Prompt<span className="gradient-text">Pilot</span>
        </span>
        <span className="badge bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 border border-brand-200 dark:border-brand-800 text-[10px] font-semibold tracking-wide">
          AI
        </span>
      </div>

      <div className="flex-1" />

      {/* Right actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={toggleTheme}
          className="btn-ghost w-9 h-9 p-0 flex items-center justify-center rounded-lg"
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark'
            ? <Sun size={16} className="text-amber-400" />
            : <Moon size={16} />
          }
        </button>
      </div>
    </header>
  )
}
