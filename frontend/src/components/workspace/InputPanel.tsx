import { useState } from 'react'
import { Wand2, ChevronDown, Settings2 } from 'lucide-react'
import { useStore } from '../../store/useStore'
import { promptApi } from '../../utils/api'
import { estimateTokens } from '../../utils/helpers'
import toast from 'react-hot-toast'
import clsx from 'clsx'
import type { TargetModel, OptimizationMode } from '../../types'

const MODELS: { value: TargetModel; label: string; emoji: string }[] = [
  { value: 'claude',  label: 'Claude',  emoji: '🟣' },
  { value: 'gpt',     label: 'GPT',     emoji: '🟢' },
  { value: 'gemini',  label: 'Gemini',  emoji: '🔵' },
  { value: 'grok',    label: 'Grok',    emoji: '🟠' },
  { value: 'custom',  label: 'Custom',  emoji: '⚙️' },
]

const MODES: { value: OptimizationMode; label: string; desc: string }[] = [
  { value: 'detailed',  label: 'Detailed',  desc: 'Maximum clarity' },
  { value: 'balanced',  label: 'Balanced',  desc: 'Best default' },
  { value: 'minimal',   label: 'Minimal',   desc: 'Token-saving' },
]

export function InputPanel() {
  const {
    rawInput, setRawInput,
    targetModel, setTargetModel,
    mode, setMode,
    customInstructions, setCustomInstructions,
    isLoading, setIsLoading,
    setResult, settings,
    addToHistory,
  } = useStore()

  const [showAdvanced, setShowAdvanced] = useState(false)
  const inputTokens = estimateTokens(rawInput)

  const handleGenerate = async () => {
    if (!rawInput.trim()) {
      toast.error('Please enter your prompt idea first.')
      return
    }
    setIsLoading(true)
    try {
      const result = await promptApi.refine({
        raw_input: rawInput,
        target_model: targetModel,
        mode,
        custom_instructions: customInstructions || undefined,
      })
      setResult(result)
      if (settings.autoSave) {
        addToHistory({
          title: rawInput.slice(0, 60),
          raw_input: rawInput,
          refined_prompt: result.refined_prompt,
          compressed_prompt: result.compressed_prompt,
          target_model: targetModel,
          mode,
          token_stats: result.token_stats,
          quality_score: result.quality_score,
        })
      }
      toast.success('Prompt optimized!')
    } catch (err: any) {
      const msg = err?.response?.data?.detail || 'Failed to optimize prompt. Check your API key.'
      toast.error(msg)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Header */}
      <div>
        <h2 className="text-base font-semibold text-surface-900 dark:text-white">Your Idea</h2>
        <p className="text-xs text-surface-400 dark:text-surface-500 mt-0.5">Describe what you want — messy is fine.</p>
      </div>

      {/* Textarea */}
      <div className="relative flex-1 flex flex-col">
        <textarea
          value={rawInput}
          onChange={e => setRawInput(e.target.value)}
          placeholder="e.g. I want Claude to build me a modern SaaS dashboard with authentication, charts, admin panel and dark mode..."
          className="input-base flex-1 min-h-[200px] resize-none font-sans text-sm leading-relaxed"
          disabled={isLoading}
        />
        {rawInput && (
          <div className="absolute bottom-3 right-3 badge bg-surface-100 dark:bg-surface-700 text-surface-400 dark:text-surface-500">
            ~{inputTokens} tokens
          </div>
        )}
      </div>

      {/* Target Model */}
      <div>
        <label className="text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wide mb-2 block">
          Target Model
        </label>
        <div className="flex gap-2 flex-wrap">
          {MODELS.map(m => (
            <button
              key={m.value}
              onClick={() => setTargetModel(m.value)}
              className={clsx(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-150',
                targetModel === m.value
                  ? 'bg-brand-50 dark:bg-brand-900/20 border-brand-300 dark:border-brand-700 text-brand-700 dark:text-brand-300 shadow-glow-sm'
                  : 'bg-white dark:bg-surface-800 border-surface-200 dark:border-surface-700 text-surface-600 dark:text-surface-400 hover:border-surface-300 dark:hover:border-surface-600'
              )}
            >
              <span>{m.emoji}</span> {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Mode */}
      <div>
        <label className="text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wide mb-2 block">
          Optimization Mode
        </label>
        <div className="grid grid-cols-3 gap-2">
          {MODES.map(m => (
            <button
              key={m.value}
              onClick={() => setMode(m.value)}
              className={clsx(
                'flex flex-col items-center gap-0.5 px-3 py-2.5 rounded-xl border text-xs font-medium transition-all duration-150',
                mode === m.value
                  ? 'bg-brand-500 border-brand-500 text-white shadow-glow-sm'
                  : 'bg-white dark:bg-surface-800 border-surface-200 dark:border-surface-700 text-surface-600 dark:text-surface-400 hover:border-brand-300 dark:hover:border-brand-700'
              )}
            >
              <span className="font-semibold">{m.label}</span>
              <span className={clsx('text-[10px]', mode === m.value ? 'text-brand-100' : 'text-surface-400 dark:text-surface-500')}>{m.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Advanced */}
      <div>
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-1.5 text-xs text-surface-400 dark:text-surface-500 hover:text-surface-600 dark:hover:text-surface-300 transition-colors"
        >
          <Settings2 size={13} />
          Advanced options
          <ChevronDown size={13} className={clsx('transition-transform', showAdvanced && 'rotate-180')} />
        </button>
        {showAdvanced && (
          <div className="mt-2 animate-fade-in">
            <textarea
              value={customInstructions}
              onChange={e => setCustomInstructions(e.target.value)}
              placeholder="Custom instructions (e.g. always use TypeScript, avoid Redux, prefer Tailwind)..."
              className="input-base text-xs h-20 resize-none"
              disabled={isLoading}
            />
          </div>
        )}
      </div>

      {/* Generate button */}
      <button
        onClick={handleGenerate}
        disabled={isLoading || !rawInput.trim()}
        className="btn-primary w-full justify-center py-3 text-sm"
      >
        {isLoading ? (
          <>
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Optimizing…
          </>
        ) : (
          <>
            <Wand2 size={16} />
            Generate Optimized Prompt
          </>
        )}
      </button>
    </div>
  )
}
