import { useState } from 'react'
import { Download, Minimize2, RefreshCw, Pencil, CheckCheck } from 'lucide-react'
import { useStore } from '../../store/useStore'
import { promptApi } from '../../utils/api'
import { exportTxt } from '../../utils/helpers'
import { CopyButton } from '../ui/CopyButton'
import { TokenStatsCard } from '../ui/TokenStatsCard'
import { ScoreBar, OverallScore } from '../ui/ScoreBar'
import { ResultSkeleton } from '../ui/Skeleton'
import toast from 'react-hot-toast'
import clsx from 'clsx'

type Tab = 'refined' | 'compressed' | 'compare'

export function ResultPanel() {
  const {
    result, isLoading,
    activeResultTab, setActiveResultTab,
    editablePrompt, setEditablePrompt,
    targetModel,
  } = useStore()

  const [isEditing, setIsEditing] = useState(false)
  const [isCompressing, setIsCompressing] = useState(false)
  const [isReanalyzing, setIsReanalyzing] = useState(false)

  if (isLoading) return <ResultSkeleton />

  if (!result) return <EmptyState />

  const handleCompress = async () => {
    setIsCompressing(true)
    try {
      const res = await promptApi.compress({
        prompt: editablePrompt,
        target_reduction: 30,
        target_model: targetModel,
      })
      setEditablePrompt(res.compressed_prompt)
      toast.success(`Compressed by ${res.reduction_percentage.toFixed(1)}%!`)
    } catch {
      toast.error('Compression failed.')
    } finally {
      setIsCompressing(false)
    }
  }

  const handleReanalyze = async () => {
    setIsReanalyzing(true)
    try {
      await promptApi.analyze({ prompt: editablePrompt, target_model: targetModel })
      toast.success('Analysis updated!')
      // Optionally update quality in store — for now just toast
    } catch {
      toast.error('Analysis failed.')
    } finally {
      setIsReanalyzing(false)
    }
  }

  const activePrompt = activeResultTab === 'compressed' ? result.compressed_prompt : editablePrompt
  const qs = result.quality_score

  return (
    <div className="flex flex-col gap-4 animate-slide-up">
      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-surface-100 dark:bg-surface-800 rounded-xl w-fit">
        {(['refined', 'compressed', 'compare'] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => setActiveResultTab(t)}
            className={clsx(
              'px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all duration-150',
              activeResultTab === t ? 'tab-active' : 'tab-inactive'
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Prompt display */}
      {activeResultTab !== 'compare' ? (
        <div className="card p-5 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-surface-400 dark:text-surface-500 uppercase tracking-wide">
              {activeResultTab === 'compressed' ? 'Compressed Prompt' : 'Refined Prompt'}
            </span>
            <div className="flex items-center gap-1">
              {activeResultTab === 'refined' && (
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className={clsx('btn-ghost text-xs py-1 px-2', isEditing && 'text-brand-600 dark:text-brand-400')}
                >
                  {isEditing ? <><CheckCheck size={12} /> Done</> : <><Pencil size={12} /> Edit</>}
                </button>
              )}
              <CopyButton text={activePrompt} />
              <button
                onClick={() => exportTxt(activePrompt, 'prompt.txt')}
                className="btn-ghost text-xs py-1 px-2"
              >
                <Download size={12} /> Export
              </button>
            </div>
          </div>

          {isEditing && activeResultTab === 'refined' ? (
            <textarea
              value={editablePrompt}
              onChange={e => setEditablePrompt(e.target.value)}
              className="input-base font-mono text-xs leading-relaxed min-h-[200px] resize-none"
            />
          ) : (
            <div className="bg-surface-50 dark:bg-surface-800/60 rounded-xl p-4 font-mono text-xs leading-relaxed text-surface-700 dark:text-surface-200 whitespace-pre-wrap max-h-[300px] overflow-y-auto">
              {activePrompt}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-2 pt-1">
            <button
              onClick={handleCompress}
              disabled={isCompressing}
              className="btn-secondary text-xs py-1.5"
            >
              {isCompressing
                ? <><span className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" /> Compressing…</>
                : <><Minimize2 size={12} /> Reduce Tokens</>
              }
            </button>
            <button
              onClick={handleReanalyze}
              disabled={isReanalyzing}
              className="btn-secondary text-xs py-1.5"
            >
              {isReanalyzing
                ? <><span className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" /> Analyzing…</>
                : <><RefreshCw size={12} /> Re-analyze</>
              }
            </button>
          </div>
        </div>
      ) : (
        /* Compare view */
        <div className="grid grid-cols-2 gap-3">
          <div className="card p-4 space-y-2">
            <span className="text-[10px] font-bold text-surface-400 dark:text-surface-500 uppercase tracking-widest">Original</span>
            <div className="text-xs text-surface-600 dark:text-surface-300 leading-relaxed font-mono bg-surface-50 dark:bg-surface-800/60 rounded-lg p-3 max-h-[220px] overflow-y-auto whitespace-pre-wrap">
              {useStore.getState().rawInput || '(empty)'}
            </div>
          </div>
          <div className="card p-4 space-y-2">
            <span className="text-[10px] font-bold text-brand-500 uppercase tracking-widest">Refined</span>
            <div className="text-xs text-surface-700 dark:text-surface-200 leading-relaxed font-mono bg-brand-50/50 dark:bg-brand-900/10 rounded-lg p-3 max-h-[220px] overflow-y-auto whitespace-pre-wrap border border-brand-100 dark:border-brand-900/30">
              {result.refined_prompt}
            </div>
          </div>
        </div>
      )}

      {/* Token Stats */}
      <div className="card p-5 space-y-3">
        <h3 className="text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wide">Token Analysis</h3>
        <TokenStatsCard stats={result.token_stats} />
      </div>

      {/* Quality Score */}
      <div className="card p-5 space-y-4">
        <h3 className="text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wide">Prompt Quality</h3>
        <div className="flex gap-5 items-start">
          <OverallScore score={qs.overall} />
          <div className="flex-1 space-y-3">
            <ScoreBar label="Clarity"          score={qs.clarity}          delay={0}   />
            <ScoreBar label="Structure"        score={qs.structure}        delay={100} />
            <ScoreBar label="Specificity"      score={qs.specificity}      delay={200} />
            <ScoreBar label="Token Efficiency" score={qs.token_efficiency} delay={300} />
          </div>
        </div>

        {/* Feedback */}
        <p className="text-xs text-surface-500 dark:text-surface-400 leading-relaxed border-t border-surface-100 dark:border-surface-800 pt-3">
          {qs.feedback}
        </p>

        {/* Strengths + Improvements */}
        <div className="grid grid-cols-2 gap-3">
          {qs.strengths?.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wide">✓ Strengths</span>
              {qs.strengths.map((s, i) => (
                <p key={i} className="text-xs text-surface-600 dark:text-surface-300 leading-snug">• {s}</p>
              ))}
            </div>
          )}
          {qs.improvements?.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wide">→ Improve</span>
              {qs.improvements.map((s, i) => (
                <p key={i} className="text-xs text-surface-600 dark:text-surface-300 leading-snug">• {s}</p>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[400px] gap-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-brand-50 dark:bg-brand-900/20 flex items-center justify-center shadow-glow-sm">
        <span className="text-3xl">✨</span>
      </div>
      <div>
        <p className="font-semibold text-surface-700 dark:text-surface-300 text-sm">Ready to optimize</p>
        <p className="text-xs text-surface-400 dark:text-surface-500 mt-1 max-w-[260px]">
          Describe your idea on the left and hit <strong>Generate</strong> to transform it into a polished prompt.
        </p>
      </div>
    </div>
  )
}
