import axios from 'axios'
import type { PromptResult, TargetModel, OptimizationMode } from '../types'

const envBase = import.meta.env.VITE_API_BASE?.trim()
const normalizedBase = envBase
  ? envBase.replace(/\/+$/, '')
  : '/api'

const api = axios.create({
  baseURL: normalizedBase,
  timeout: 60000,
  headers: { 'Content-Type': 'application/json' },
})

export interface RefineRequest {
  raw_input: string
  target_model: TargetModel
  mode: OptimizationMode
  custom_instructions?: string
}

export interface CompressRequest {
  prompt: string
  target_reduction?: number
  target_model: TargetModel
}

export interface CompressResponse {
  compressed_prompt: string
  original_tokens: number
  compressed_tokens: number
  reduction_percentage: number
}

export interface AnalyzeRequest {
  prompt: string
  target_model: TargetModel
}

export const promptApi = {
  refine: async (data: RefineRequest): Promise<PromptResult> => {
    const res = await api.post('/prompt/refine', data)
    return res.data
  },

  compress: async (data: CompressRequest): Promise<CompressResponse> => {
    const res = await api.post('/prompt/compress', data)
    return res.data
  },

  analyze: async (data: AnalyzeRequest) => {
    const res = await api.post('/prompt/analyze', data)
    return res.data
  },

  health: async () => {
    const res = await api.get('/health')
    return res.data
  }
}

export default api
