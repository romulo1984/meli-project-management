import Participants from '@/components/participants'
import {
  faTrash,
  faRotateLeft,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Doc } from '@convex/_generated/dataModel'

interface RetroCardProps {
  retro: Doc<'retros'> | any
  isOwner: (retro: Doc<'retros'>) => boolean
  onOpen: () => void
  onToggleArchive?: () => void
  archived?: boolean
}

const formatDate = (date: any) =>
  new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })

export default function RetroCard(props: RetroCardProps) {
  const { retro, isOwner, onOpen, onToggleArchive, archived } = props
  const owner = isOwner(retro)
  const memberCount = retro?.users?.length ?? 0

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onOpen()
        }
      }}
      className="group relative flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-zinc-200/70 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300"
    >
      <div className="h-1 w-full bg-gradient-to-r from-indigo-400 to-pink-400" />
      <div className="flex flex-1 flex-col gap-5 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-lg font-semibold text-slate-700 transition-colors group-hover:text-indigo-600">
              {retro?.name}
            </h3>
            <p className="mt-1 flex flex-wrap items-center gap-x-1.5 text-xs text-zinc-400">
              <span className="truncate">{retro?.owner?.name ?? 'Unknown'}</span>
              {owner && (
                <span className="rounded-full bg-indigo-50 px-1.5 py-0.5 text-[10px] font-medium text-indigo-500">
                  you
                </span>
              )}
              <span>·</span>
              <span>{formatDate(retro?._creationTime)}</span>
            </p>
          </div>
          {owner && onToggleArchive && (
            <button
              type="button"
              onClick={e => {
                e.stopPropagation()
                onToggleArchive()
              }}
              title={archived ? 'Restore retro' : 'Archive retro'}
              aria-label={archived ? 'Restore retro' : 'Archive retro'}
              className="shrink-0 rounded-lg p-2 text-zinc-300 transition-colors hover:bg-zinc-100 hover:text-indigo-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300"
            >
              <FontAwesomeIcon
                icon={archived ? faRotateLeft : faTrash}
                className="h-4 w-4"
              />
            </button>
          )}
        </div>
        <div className="mt-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Participants size={32} users={retro?.users} />
            <span className="text-xs text-zinc-400">
              {memberCount} {memberCount === 1 ? 'member' : 'members'}
            </span>
          </div>
          <span className="text-xs font-medium text-indigo-500 opacity-0 transition-opacity group-hover:opacity-100">
            Open →
          </span>
        </div>
      </div>
    </div>
  )
}
