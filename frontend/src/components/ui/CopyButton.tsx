import { useState } from 'react'
import { Copy, Check } from 'lucide-react'
import { copyToClipboard } from '../../utils/helpers'
import toast from 'react-hot-toast'
import clsx from 'clsx'

interface CopyButtonProps {
  text: string
  className?: string
  label?: string
}

export function CopyButton({ text, className, label }: CopyButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await copyToClipboard(text)
    setCopied(true)
    toast.success('Copied to clipboard!')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleCopy}
      className={clsx(
        'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150',
        copied
          ? 'bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400'
          : 'btn-ghost',
        className
      )}
    >
      {copied ? <Check size={13} /> : <Copy size={13} />}
      {label ?? (copied ? 'Copied!' : 'Copy')}
    </button>
  )
}
