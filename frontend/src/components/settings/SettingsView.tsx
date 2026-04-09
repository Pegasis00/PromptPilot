import { useStore } from '../../store/useStore'
import { Sun, Moon, Save, Bot, Gauge } from 'lucide-react'
import { useTheme } from '../../hooks/useTheme'
import clsx from 'clsx'
import type { TargetModel, OptimizationMode } from '../../types'

const MODELS: { value: TargetModel; label: string }[] = [
  { value: 'claude', label: 'Claude' },
  { value: 'gpt',    label: 'GPT'    },
  { value: 'gemini', label: 'Gemini' },
  { value: 'grok',   label: 'Grok'   },
  { value: 'custom', label: 'Custom' },
]

const MODES: { value: OptimizationMode; label: string }[] = [
  { value: 'detailed', label: 'Detailed' },
  { value: 'balanced', label: 'Balanced' },
  { value: 'minimal',  label: 'Minimal'  },
]

export function SettingsView() {
  const { settings, updateSettings } = useStore()
  const { theme, toggleTheme } = useTheme()

  return (
    <div className="max-w-lg space-y-6 animate-fade-in">
      <div>
        <h2 className="text-lg font-display font-bold text-surface-900 dark:text-white">Settings</h2>
        <p className="text-sm text-surface-400 dark:text-surface-500 mt-0.5">Customize your PromptPilot experience.</p>
      </div>

      {/* Theme */}
      <SettingsCard icon={<Sun size={16} />} title="Appearance" description="Choose your preferred color theme.">
        <div className="flex gap-2">
          {(['light', 'dark'] as const).map(t => (
            <button
              key={t}
              onClick={() => t !== theme && toggleTheme()}
              className={clsx(
                'flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all',
                theme === t
                  ? 'bg-brand-50 dark:bg-brand-900/20 border-brand-300 dark:border-brand-700 text-brand-700 dark:text-brand-300'
                  : 'bg-white dark:bg-surface-800 border-surface-200 dark:border-surface-700 text-surface-600 dark:text-surface-400'
              )}
            >
              {t === 'light' ? <Sun size={14} /> : <Moon size={14} />}
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </SettingsCard>

      {/* Default model */}
      <SettingsCard icon={<Bot size={16} />} title="Default Model" description="The target AI model pre-selected when you open the workspace.">
        <div className="flex gap-2 flex-wrap">
          {MODELS.map(m => (
            <button
              key={m.value}
              onClick={() => updateSettings({ defaultModel: m.value })}
              className={clsx(
                'px-3 py-1.5 rounded-lg border text-xs font-medium transition-all',
                settings.defaultModel === m.value
                  ? 'bg-brand-500 border-brand-500 text-white shadow-glow-sm'
                  : 'bg-white dark:bg-surface-800 border-surface-200 dark:border-surface-700 text-surface-600 dark:text-surface-400'
              )}
            >
              {m.label}
            </button>
          ))}
        </div>
      </SettingsCard>

      {/* Default mode */}
      <SettingsCard icon={<Gauge size={16} />} title="Default Mode" description="Default optimization level for new prompts.">
        <div className="flex gap-2">
          {MODES.map(m => (
            <button
              key={m.value}
              onClick={() => updateSettings({ defaultMode: m.value })}
              className={clsx(
                'px-3 py-1.5 rounded-lg border text-xs font-medium transition-all',
                settings.defaultMode === m.value
                  ? 'bg-brand-500 border-brand-500 text-white shadow-glow-sm'
                  : 'bg-white dark:bg-surface-800 border-surface-200 dark:border-surface-700 text-surface-600 dark:text-surface-400'
              )}
            >
              {m.label}
            </button>
          ))}
        </div>
      </SettingsCard>

      {/* Auto-save */}
      <SettingsCard icon={<Save size={16} />} title="Auto-save History" description="Automatically save optimized prompts to history.">
        <button
          onClick={() => updateSettings({ autoSave: !settings.autoSave })}
          className={clsx(
            'relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200',
            settings.autoSave ? 'bg-brand-500' : 'bg-surface-200 dark:bg-surface-700'
          )}
        >
          <span className={clsx(
            'inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200',
            settings.autoSave ? 'translate-x-6' : 'translate-x-1'
          )} />
        </button>
      </SettingsCard>

      {/* About */}
      <div className="card p-5 bg-brand-50/50 dark:bg-brand-900/10 border-brand-100 dark:border-brand-900/30">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-6 h-6 rounded-md bg-brand-500 flex items-center justify-center">
            <span className="text-white text-xs">⚡</span>
          </div>
          <span className="font-semibold text-sm text-surface-800 dark:text-surface-200">PromptPilot AI v1.0</span>
        </div>
        <p className="text-xs text-surface-500 dark:text-surface-400 leading-relaxed">
          Powered by Groq's ultra-fast inference. Optimizes prompts for Claude, GPT, Gemini, Grok and custom models.
          Built with FastAPI + React + Tailwind.
        </p>
      </div>
    </div>
  )
}

function SettingsCard({ icon, title, description, children }: {
  icon: React.ReactNode
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <div className="card p-5 space-y-4">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-brand-50 dark:bg-brand-900/20 flex items-center justify-center text-brand-600 dark:text-brand-400 shrink-0">
          {icon}
        </div>
        <div>
          <h3 className="text-sm font-semibold text-surface-800 dark:text-surface-200">{title}</h3>
          <p className="text-xs text-surface-400 dark:text-surface-500 mt-0.5">{description}</p>
        </div>
      </div>
      {children}
    </div>
  )
}
