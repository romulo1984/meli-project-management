'use client'
import { Button } from '@/components/ui/button'
import { Layers, X } from 'lucide-react'

interface MergeModeBarProps {
  count: number
  onMerge: () => void
  onCancel: () => void
}

export default function MergeModeBar(props: MergeModeBarProps) {
  const { count, onMerge, onCancel } = props
  const canMerge = count >= 2

  return (
    <div className="fixed inset-x-0 bottom-6 z-50 flex justify-center px-4 pointer-events-none">
      <div className="pointer-events-auto flex flex-wrap items-center justify-center gap-x-4 gap-y-2 rounded-2xl border border-zinc-200 bg-white/95 px-4 py-3 shadow-lg backdrop-blur">
        <div className="flex items-center gap-2 text-sm font-medium text-zinc-600">
          <Layers className="h-4 w-4 text-indigo-600" strokeWidth={1.5} />
          <span>
            {count === 0
              ? 'Select cards to merge'
              : `${count} card${count > 1 ? 's' : ''} selected`}
          </span>
        </div>
        <span className="hidden text-xs text-zinc-400 sm:inline">
          The first card you pick becomes the parent
        </span>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="mr-1 h-4 w-4" strokeWidth={1.5} />
            Cancel
          </Button>
          <Button size="sm" onClick={onMerge} disabled={!canMerge}>
            <Layers className="mr-1 h-4 w-4" strokeWidth={1.5} />
            {canMerge ? `Merge ${count} cards` : 'Merge'}
          </Button>
        </div>
      </div>
    </div>
  )
}
