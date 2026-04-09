export type TargetModel = 'claude' | 'gpt' | 'gemini' | 'grok' | 'custom'
export type OptimizationMode = 'detailed' | 'balanced' | 'minimal'
export type ActiveView = 'workspace' | 'history' | 'templates' | 'settings'

export interface TokenStats {
  input_tokens: number
  optimized_tokens: number
  estimated_output_tokens: number
  total_estimated: number
  reduction_percentage: number
}

export interface QualityScore {
  clarity: number
  structure: number
  specificity: number
  token_efficiency: number
  overall: number
  feedback: string
  strengths: string[]
  improvements: string[]
}

export interface PromptResult {
  refined_prompt: string
  compressed_prompt: string
  token_stats: TokenStats
  quality_score: QualityScore
  target_model: string
  mode: string
}

export interface PromptHistoryItem {
  id: string
  title: string
  raw_input: string
  refined_prompt: string
  compressed_prompt: string
  target_model: TargetModel
  mode: OptimizationMode
  token_stats: TokenStats
  quality_score: QualityScore
  created_at: string
}

export interface Template {
  id: string
  title: string
  description: string
  icon: string
  category: string
  starter: string
}

export interface AppSettings {
  defaultModel: TargetModel
  defaultMode: OptimizationMode
  theme: 'light' | 'dark'
  autoSave: boolean
}
