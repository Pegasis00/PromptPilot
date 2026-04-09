import { InputPanel } from './InputPanel'
import { ResultPanel } from './ResultPanel'

export function WorkspaceView() {
  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full">
      {/* Left: Input */}
      <div className="lg:w-[420px] shrink-0 card p-6 flex flex-col">
        <InputPanel />
      </div>

      {/* Right: Results */}
      <div className="flex-1 overflow-y-auto pr-1">
        <ResultPanel />
      </div>
    </div>
  )
}
