import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  TargetModel, OptimizationMode, PromptResult,
  PromptHistoryItem, AppSettings, ActiveView
} from '../types'
import { generateId } from '../utils/helpers'

interface AppStore {
  // UI state
  activeView: ActiveView
  setActiveView: (v: ActiveView) => void

  // Workspace state
  rawInput: string
  setRawInput: (v: string) => void
  targetModel: TargetModel
  setTargetModel: (m: TargetModel) => void
  mode: OptimizationMode
  setMode: (m: OptimizationMode) => void
  customInstructions: string
  setCustomInstructions: (v: string) => void
  isLoading: boolean
  setIsLoading: (v: boolean) => void
  result: PromptResult | null
  setResult: (r: PromptResult | null) => void
  activeResultTab: 'refined' | 'compressed' | 'compare'
  setActiveResultTab: (t: 'refined' | 'compressed' | 'compare') => void
  editablePrompt: string
  setEditablePrompt: (v: string) => void

  // History
  history: PromptHistoryItem[]
  addToHistory: (item: Omit<PromptHistoryItem, 'id' | 'created_at'>) => void
  removeFromHistory: (id: string) => void
  clearHistory: () => void
  loadHistoryItem: (item: PromptHistoryItem) => void

  // Settings
  settings: AppSettings
  updateSettings: (s: Partial<AppSettings>) => void
}

export const useStore = create<AppStore>()(
  persist(
    (set) => ({
      activeView: 'workspace',
      setActiveView: (v) => set({ activeView: v }),

      rawInput: '',
      setRawInput: (v) => set({ rawInput: v }),
      targetModel: 'claude',
      setTargetModel: (m) => set({ targetModel: m }),
      mode: 'balanced',
      setMode: (m) => set({ mode: m }),
      customInstructions: '',
      setCustomInstructions: (v) => set({ customInstructions: v }),
      isLoading: false,
      setIsLoading: (v) => set({ isLoading: v }),
      result: null,
      setResult: (r) => set({ result: r, editablePrompt: r?.refined_prompt ?? '' }),
      activeResultTab: 'refined',
      setActiveResultTab: (t) => set({ activeResultTab: t }),
      editablePrompt: '',
      setEditablePrompt: (v) => set({ editablePrompt: v }),

      history: [],
      addToHistory: (item) => {
        const newItem: PromptHistoryItem = {
          ...item,
          id: generateId(),
          created_at: new Date().toISOString(),
        }
        set((s) => ({ history: [newItem, ...s.history].slice(0, 50) }))
      },
      removeFromHistory: (id) =>
        set((s) => ({ history: s.history.filter((h) => h.id !== id) })),
      clearHistory: () => set({ history: [] }),
      loadHistoryItem: (item) => {
        set({
          rawInput: item.raw_input,
          targetModel: item.target_model,
          mode: item.mode,
          result: {
            refined_prompt: item.refined_prompt,
            compressed_prompt: item.compressed_prompt,
            token_stats: item.token_stats,
            quality_score: item.quality_score,
            target_model: item.target_model,
            mode: item.mode,
          },
          editablePrompt: item.refined_prompt,
          activeView: 'workspace',
          activeResultTab: 'refined',
        })
      },

      settings: {
        defaultModel: 'claude',
        defaultMode: 'balanced',
        theme: 'light',
        autoSave: true,
      },
      updateSettings: (s) =>
        set((state) => ({ settings: { ...state.settings, ...s } })),
    }),
    {
      name: 'promptpilot-store',
      partialize: (s) => ({
        history: s.history,
        settings: s.settings,
        targetModel: s.targetModel,
        mode: s.mode,
      }),
    }
  )
)
