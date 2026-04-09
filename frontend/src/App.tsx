import { Toaster } from 'react-hot-toast'
import { TopBar } from './components/layout/TopBar'
import { Sidebar } from './components/layout/Sidebar'
import { WorkspaceView } from './components/workspace/WorkspaceView'
import { TemplatesView } from './components/templates/TemplatesView'
import { HistoryView } from './components/history/HistoryView'
import { SettingsView } from './components/settings/SettingsView'
import { useStore } from './store/useStore'
import { useTheme } from './hooks/useTheme'

export default function App() {
  useTheme() // apply theme on mount
  const { activeView } = useStore()

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-surface-950 transition-colors duration-200">
      <TopBar />

      <div className="flex flex-1 overflow-hidden" style={{ height: 'calc(100vh - 56px)' }}>
        <Sidebar />

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-[1400px] mx-auto p-6 h-full">
            {activeView === 'workspace'  && <WorkspaceView />}
            {activeView === 'templates'  && <TemplatesView />}
            {activeView === 'history'    && <HistoryView />}
            {activeView === 'settings'   && <SettingsView />}
          </div>
        </main>
      </div>

      <Toaster
        position="bottom-right"
        toastOptions={{
          className: 'dark:bg-surface-800 dark:text-white text-sm font-medium',
          style: { borderRadius: '12px', fontSize: '13px' },
          success: { iconTheme: { primary: '#22c55e', secondary: '#fff' } },
        }}
      />
    </div>
  )
}
