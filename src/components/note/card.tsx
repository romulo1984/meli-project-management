'use client'
import useRetro from '@/helpers/hooks/useRetro'
import RandomNames from '@/helpers/randomNames'
import SpechText from '@/helpers/spechText'
import { api } from '@convex/_generated/api'
import { Doc, Id } from '@convex/_generated/dataModel'
import { useMutation } from 'convex/react'
import { useMemo, useState, useRef, useCallback } from 'react'
import DropdownSelect from '../dropdownSelect'
import { AnonymousIcon, LikeIcon } from '../icons'
import NoteBody from '../note-body'
import NoteForm from '../note-form'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEllipsisVertical } from '@fortawesome/free-solid-svg-icons'
import { Unlink } from 'lucide-react'
import { ContextMenu } from 'primereact/contextmenu'
import { MenuItem } from 'primereact/menuitem'
import { ConfirmPopup } from 'primereact/confirmpopup'
import { useGenerateActionItems } from '@/helpers/hooks/useGenerateActionItems'
import { toast } from 'react-toastify'
import { cn } from '@/lib/utils'

interface NoteProps extends React.HTMLAttributes<HTMLDivElement> {
  note: Doc<'notes'>
  user: Doc<'users'> | undefined | null
  me?: Doc<'users'> | undefined | null
  actionType?: boolean
  blur?: boolean
  selected?: boolean
  childrenNotes?: Doc<'notes'>[]
  roundTop: boolean
  roundBottom: boolean
  mergeMode?: boolean
  selectable?: boolean
  selectionIndex?: number
  onSelectToggle?: () => void
  generateActionItems: () => void
  isGenerating: boolean
}

interface NoteStructure {
  body: string
  anonymous: boolean
}

export default function NoteCard(props: NoteProps) {
  const {
    note,
    user,
    me,
    actionType,
    blur = false,
    roundTop,
    roundBottom,
    selected = false,
    mergeMode = false,
    selectable = false,
    selectionIndex = -1,
    onSelectToggle,
    childrenNotes = [],
    generateActionItems,
    isGenerating,
    ...rest
  } = props

  // When merge mode is active on a selectable card the whole card becomes a
  // selection toggle: inner controls are suppressed and clicks pick the card.
  const selectionActive = mergeMode && selectable
  const { users, retro } = useRetro({ retroId: note.retroId })
  // Per-person vote budget for this retro (default 3) — used only for the
  // "out of votes" toast copy; the real enforcement is server-side.
  const maxLikes = retro?.maxLikes ?? 3
  const [editing, setEditing] = useState({
    value: false,
    note: {
      body: note.body,
      anonymous: Boolean(note.anonymous),
    },
  })
  const [deleteIntention, setDeleteIntention] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)
  const cardContextMenuRef = useRef<ContextMenu>(null)
  const AssigneNote = useMutation(api.notes.assigne)
  const UnnasignNote = useMutation(api.notes.unnasign)
  const UpdateNote = useMutation(api.notes.update)
  const RemoveNote = useMutation(api.notes.remove)
  const LikeNote = useMutation(api.notes.likeToggle)
  const Unmerge = useMutation(api.notes.unmerge)
  const UnmergeAll = useMutation(api.notes.unmergeAll)

  const isOwner = me?._id === user?._id

  // A merged child card gets its own quick "detach" control (see below), the
  // discoverable per-card counterpart of the context-menu "Unmerge".
  const isChild = note.mergeParentId !== undefined

  const isAnonymous = note.anonymous !== undefined && note.anonymous === true
  const obfuscate = blur && !isOwner

  const randomName = useMemo(() => RandomNames(), [])

  const speechNote = useCallback(() => {
    SpechText(note?.body, 'native')
  }, [note])

  const assigneHandler = (userId: Id<'users'>) => {
    AssigneNote({ noteId: note._id, userId: userId })
  }

  const unnasignHandler = () => {
    UnnasignNote({ noteId: note._id })
  }

  const editionHandler = (data: NoteStructure) => {
    if (!isOwner) return
    UpdateNote({
      noteId: note._id,
      anonymous: data.anonymous,
      body: data.body,
    })
  }

  const assignedTo = users?.find(u => u?._id === note.assignedTo)

  // You cannot vote on your own card (also enforced server-side). Used to hide
  // the like control on the author's own note.
  const isSelfNote = me?._id === note.userId

  const youLiked =
    me && note.likes && note.likes.length > 0 && note.likes.includes(me._id)

  const LeftBottomIcons = () => {
    if (actionType)
      return (
        <DropdownSelect
          users={users}
          selected={assignedTo}
          assigneHandler={assigneHandler}
          unnasignHandler={unnasignHandler}
        />
      )

    if (obfuscate) {
      return (
        <div className="blur-sm">
          <AnonymousIcon />
          <span className="text-zinc-400 text-xs">Hidden</span>
        </div>
      )
    }

    if (isAnonymous)
      return (
        <div>
          <AnonymousIcon />
          <span className="text-zinc-400 text-xs">
            {isOwner ? 'You' : randomName}
          </span>
        </div>
      )

    return (
      <div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          alt={user?.name || ''}
          className="w-5 h-5 rounded-full object-cover object-center inline-block mr-2"
          src={user?.avatar || ''}
          width={24}
          height={24}
        />
        <span className="text-zinc-400 text-xs">
          {isOwner ? 'You' : user?.name}
        </span>
      </div>
    )
  }

  const toggleEdition = useCallback(() => {
    if (!isOwner) return

    setEditing({
      value: true,
      note: {
        body: note.body,
        anonymous: Boolean(note.anonymous),
      },
    })
  }, [isOwner, note])

  const removeHandler = useCallback(() => {
    RemoveNote({ id: note._id })
  }, [RemoveNote, note._id])

  const likeHandler = async () => {
    if (!me) return
    // The mutation enforces the no-self-vote and per-person budget rules and
    // reports back why a like was refused. Surface the budget case to the user.
    const result = await LikeNote({ noteId: note._id, userId: me._id })
    if (!result.ok && result.reason === 'budget') {
      toast(`You've used all ${maxLikes} votes`)
    }
  }

  const containerStyle = useMemo<string>(() => {
    const styles = []

    if (roundTop) styles.push('rounded-t-lg')
    if (roundBottom) styles.push('rounded-b-lg')

    return styles.join(' ')
  }, [roundTop, roundBottom])

  const showContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    cardContextMenuRef?.current?.show(e)
  }

  // Merge-mode visual state — deliberately non-overlapping so the states never
  // fight each other (or the pink highlight `outline` on the wrapper):
  //   - selectable & not selected → pointer + a subtle indigo hover ring
  //   - selected                  → a solid ring (indigo for the merge target
  //     at index 0, slate for the rest, including a selected group's children)
  //   - ineligible / dimmed       → no affordance at all
  // Using `ring` (a box-shadow) instead of `outline` lets the hover and
  // selected states compose cleanly and not clash with the wrapper outline.
  const mergeSelectionClasses = selected
    ? cn(
        'select-none ring-2',
        selectionIndex === 0 ? 'ring-indigo-500' : 'ring-slate-400',
        selectionActive && 'cursor-pointer',
      )
    : selectionActive
      ? 'cursor-pointer select-none ring-2 ring-transparent hover:ring-indigo-300'
      : ''

  const contextMenuItems = useMemo<MenuItem[]>(
    () => [
      {
        label: 'Speech',
        icon: 'pi pi-volume-up',
        command: speechNote,
      },
      {
        label: 'Edit',
        icon: 'pi pi-pen-to-square',
        disabled: !isOwner,
        command: toggleEdition,
      },
      {
        label: 'Unmerge',
        icon: 'pi pi-clone',
        visible: note.mergeParentId !== undefined,
        command: () => Unmerge({ id: note._id }),
      },
      {
        label: 'Unmerge all',
        icon: 'pi pi-clone',
        visible: childrenNotes.length > 0,
        command: () => UnmergeAll({ parentId: note._id }),
      },
      {
        label: 'Delete',
        icon: 'pi pi-trash',
        disabled: !isOwner,
        command: () => setDeleteIntention(true),
      },
      {
        label: 'Generate action',
        icon: 'pi pi-sparkles',
        visible: note.pipeline === 'bad',
        disabled: isGenerating,
        command: () => {
          generateActionItems()
        },
      },
    ],
    [
      Unmerge,
      UnmergeAll,
      isOwner,
      note,
      speechNote,
      toggleEdition,
      childrenNotes,
      generateActionItems,
      isGenerating,
    ],
  )

  return (
    <div
      ref={cardRef}
      title={note.body}
      className={cn(
        'group relative w-full bg-white p-3 text-sm text-zinc-500 shadow transition-all',
        containerStyle,
        mergeSelectionClasses,
        rest.className,
      )}
      onClick={selectionActive ? onSelectToggle : undefined}
      onDoubleClick={selectionActive ? undefined : toggleEdition}
      onContextMenu={selectionActive ? undefined : showContextMenu}
    >
      {isChild && !mergeMode && (
        <button
          type="button"
          onClick={e => {
            e.stopPropagation()
            Unmerge({ id: note._id })
          }}
          title="Detach from group"
          aria-label="Detach from group"
          className="absolute right-1.5 top-1.5 z-10 flex h-6 w-6 items-center justify-center rounded-md bg-white/70 text-zinc-400 opacity-0 shadow-sm backdrop-blur-sm transition-all hover:bg-zinc-100 hover:text-indigo-600 focus:opacity-100 focus-visible:opacity-100 group-hover:opacity-100"
        >
          <Unlink className="h-3.5 w-3.5" strokeWidth={1.5} />
        </button>
      )}
      {mergeMode && selected && selectionIndex >= 0 && (
        <div
          className={`absolute -top-2 -right-2 z-10 flex h-6 min-w-[1.5rem] items-center justify-center rounded-full px-2 text-xs font-semibold text-white shadow ${
            selectionIndex === 0 ? 'bg-indigo-600' : 'bg-slate-500'
          }`}
          title={selectionIndex === 0 ? 'Parent card' : `Card ${selectionIndex + 1}`}
        >
          {selectionIndex === 0 ? 'Parent' : selectionIndex + 1}
        </div>
      )}
      <div className={`break-anywhere mb-2 ${obfuscate ? 'blur-sm' : ''}`}>
        {!editing.value && (
          <NoteBody note={note} users={users} obfuscate={obfuscate} />
        )}
        {editing.value && (
          <NoteForm
            opened={editing.value}
            toggleOpened={() =>
              setEditing(old => ({
                ...old,
                value: false,
              }))
            }
            newNote={editing.note}
            setNewNote={newNote =>
              setEditing(old => ({
                ...old,
                note: newNote,
              }))
            }
            saveHandler={(_: React.FormEvent<HTMLFormElement>) => {
              editionHandler(editing.note)
              setEditing(old => ({ ...old, value: false }))
            }}
            users={users}
          />
        )}
      </div>
      <div
        className={`flex justify-between items-center ${
          selectionActive ? 'pointer-events-none' : ''
        }`}
      >
        {LeftBottomIcons()}

        {!obfuscate && (
          <div className="flex justify-end items-center gap-2">
            {/* Likes stay visible on every card — including your own — so the
                author can see their score. Only the *action* is locked on a
                self-note (also refused server-side): no click, muted, and a
                not-allowed cursor to make it clear. */}
            <div
              onClick={isSelfNote ? undefined : likeHandler}
              title={
                isSelfNote
                  ? "You can't vote on your own card"
                  : youLiked
                    ? 'Remove your vote'
                    : 'Vote for this card'
              }
              className={cn(
                'flex items-center justify-center gap-1 rounded-md px-2 py-1 transition-colors',
                isSelfNote
                  ? 'cursor-not-allowed opacity-60'
                  : 'cursor-pointer hover:bg-zinc-100',
              )}
            >
              <LikeIcon liked={youLiked} disabled={isSelfNote} />
              {note.likes && note.likes.length > 0 && (
                <p className="text-xs text-zinc-400">{note.likes.length}</p>
              )}
            </div>
            <FontAwesomeIcon
              onClick={showContextMenu}
              className="px-2"
              icon={faEllipsisVertical}
            />
          </div>
        )}
      </div>
      <ContextMenu model={contextMenuItems} ref={cardContextMenuRef} />
      <ConfirmPopup
        target={cardRef.current || undefined}
        visible={deleteIntention}
        onHide={() => setDeleteIntention(false)}
        message="Are you sure you want to proceed?"
        icon="pi pi-exclamation-triangle"
        accept={removeHandler}
      />
    </div>
  )
}
