import type { Template } from '../types'

export function estimateTokens(text: string): number {
  if (!text) return 0
  const words = text.match(/\w+/g)?.length ?? 0
  const chars = text.length
  return Math.max(1, Math.round((words * 1.3 + chars / 4) / 2))
}

export function formatNumber(n: number): string {
  return n.toLocaleString()
}

export function truncate(str: string, maxLen = 80): string {
  if (str.length <= maxLen) return str
  return str.slice(0, maxLen).trimEnd() + '…'
}

export function generateId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

export function timeAgo(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

export function scoreColor(score: number): string {
  if (score >= 80) return 'text-brand-600 dark:text-brand-400'
  if (score >= 60) return 'text-amber-600 dark:text-amber-400'
  return 'text-red-500 dark:text-red-400'
}

export function scoreBg(score: number): string {
  if (score >= 80) return 'bg-brand-500'
  if (score >= 60) return 'bg-amber-500'
  return 'bg-red-500'
}

export function copyToClipboard(text: string): Promise<void> {
  return navigator.clipboard.writeText(text)
}

export function exportTxt(content: string, filename = 'prompt.txt'): void {
  const blob = new Blob([content], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export const TEMPLATES: Template[] = [
  { id: 't1', title: 'Build a SaaS App', description: 'Full-stack SaaS with auth & payments', icon: '🚀', category: 'Development', starter: 'Build a full-stack SaaS application with user authentication, subscription billing, dashboard, and admin panel.' },
  { id: 't2', title: 'React Frontend', description: 'Modern React UI with components', icon: '⚛️', category: 'Development', starter: 'Build a modern React frontend with reusable components, routing, state management, and a clean design system.' },
  { id: 't3', title: 'FastAPI Backend', description: 'RESTful API with database', icon: '⚡', category: 'Development', starter: 'Build a FastAPI backend with REST endpoints, database models, authentication middleware, and proper error handling.' },
  { id: 't4', title: 'Fix My Code', description: 'Debug and improve existing code', icon: '🔧', category: 'Development', starter: 'Review and fix the bugs in my code. Explain what was wrong and why your solution is better.' },
  { id: 't5', title: 'Generate PRD', description: 'Product requirements document', icon: '📋', category: 'Product', starter: 'Write a detailed product requirements document (PRD) for a new feature including user stories, acceptance criteria, and technical notes.' },
  { id: 't6', title: 'Write System Prompt', description: 'AI agent system prompt', icon: '🤖', category: 'AI', starter: 'Write a professional system prompt for an AI assistant that is helpful, safe, and specialized for a specific domain.' },
  { id: 't7', title: 'Improve UI/UX', description: 'Design critique and improvements', icon: '🎨', category: 'Design', starter: 'Review my UI design and suggest specific improvements for usability, accessibility, visual hierarchy, and user experience.' },
  { id: 't8', title: 'Build AI Agent', description: 'Autonomous AI agent workflow', icon: '🧠', category: 'AI', starter: 'Build an AI agent that can autonomously complete multi-step tasks using tools, memory, and decision-making logic.' },
  { id: 't9', title: 'Create Landing Page', description: 'Marketing landing page', icon: '🌐', category: 'Design', starter: 'Create a high-converting landing page for my product with a hero section, features, testimonials, pricing, and CTA.' },
  { id: 't10', title: 'Debug Architecture', description: 'System design review', icon: '🏗️', category: 'Development', starter: 'Review my system architecture and identify bottlenecks, single points of failure, scalability issues, and security gaps.' },
  { id: 't11', title: 'Build Mobile App', description: 'React Native mobile app', icon: '📱', category: 'Development', starter: 'Build a cross-platform mobile app with React Native including navigation, state management, API integration, and native features.' },
  { id: 't12', title: 'Data Analysis', description: 'Analyze and visualize data', icon: '📊', category: 'Data', starter: 'Analyze this dataset and provide insights, visualizations, statistical summaries, and actionable recommendations.' },
]

export const MODEL_INFO = {
  claude:  { label: 'Claude',  color: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300', dot: 'bg-violet-500' },
  gpt:     { label: 'GPT',    color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300', dot: 'bg-emerald-500' },
  gemini:  { label: 'Gemini', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300', dot: 'bg-blue-500' },
  grok:    { label: 'Grok',   color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300', dot: 'bg-orange-500' },
  custom:  { label: 'Custom', color: 'bg-surface-100 text-surface-600 dark:bg-surface-800 dark:text-surface-300', dot: 'bg-surface-400' },
}
