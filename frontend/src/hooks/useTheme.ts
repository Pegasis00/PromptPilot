import { useEffect } from 'react'
import { useStore } from '../store/useStore'

export function useTheme() {
  const { settings, updateSettings } = useStore()

  useEffect(() => {
    if (settings.theme === 'dark') {
      document.body.classList.add('dark')
    } else {
      document.body.classList.remove('dark')
    }
  }, [settings.theme])

  const toggleTheme = () => {
    updateSettings({ theme: settings.theme === 'dark' ? 'light' : 'dark' })
  }

  return { theme: settings.theme, toggleTheme }
}
