'use client'
import useRetro from '@/helpers/hooks/useRetro'
import RandomNames from '@/helpers/randomNames'
import SpechText from '@/helpers/spechText'
import { api } from '@convex/_generated/api'
import { Doc, Id } from '@convex/_generated/dataModel'
import { useMutation } from 'convex/react'
import Image from 'next/image'
import { useMemo, useState, useRef, useCallback } from 'react'
import DropdownSelect from '../dropdownSelect'
import { AnonymousIcon, LikeIcon } from '../icons'
import NoteBody from '../note-body'
import NoteForm from '../note-form'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEllipsisVertical } from '@fortawesome/free-solid-svg-icons'
import { ContextMenu } from 'primereact/contextmenu'
import { MenuItem } from 'primereact/menuitem'
import { ConfirmPopup } from 'primereact/confirmpopup'
import { useGenerateActionItems } from '@/helpers/hooks/useGenerateActionItems'

interface NoteProps extends React.HTMLAttributes<HTMLDivElement> {
  note: Doc<'notes'>
  user: Doc<'users'> | undefined | null
  me?: Doc<'users'> | undefined | null
  actionType?: boolean
  blur?: boolean
  highlighted?: boolean
  selected?: boolean
  childrenNotes?: Doc<'notes'>[]
  roundTop: boolean
  roundBottom: boolean
  mergeSelectedNotes?: (parent: Doc<'notes'>) => void
  toggleNote?: (
    event: React.MouseEvent<HTMLDivElement>,
    note: Doc<'notes'>,
  ) => void
  selectedNotes?: Doc<'notes'>[]
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
    mergeSelectedNotes,
    toggleNote,
    selectedNotes = [],
    childrenNotes = [],
    generateActionItems,
    isGenerating,
    ...rest
  } = props
  const { users } = useRetro({ retroId: note.retroId })
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
        <Image
          alt={user?.name || ''}
          className="w-5 h-5 rounded-full inline-block mr-2"
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

  const likeHandler = () => {
    LikeNote({ noteId: note._id, userId: me!._id })
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
        label: 'Select',
        icon: 'pi pi-plus-circle',
        visible:
          note.mergeParentId === undefined &&
          childrenNotes.length === 0 &&
          !selected,
        command: () => {
          toggleNote && toggleNote({ ctrlKey: true } as any, note)
        },
      },
      {
        label: 'Unselect',
        icon: 'pi pi-minus-circle',
        visible: selected,
        command: () => {
          toggleNote && toggleNote({ ctrlKey: true } as any, note)
        },
      },
      {
        // @ts-ignore
        label: (
          <div>
            <p>Merge</p>
            <p className="text-xs">
              <span className="text-slate-500 bg-slate-100 rounded-lg pe-1">{`${note.body.substring(
                0,
                20,
              )}...`}</span>
              <span> as parent</span>
            </p>
          </div>
        ),
        icon: 'pi pi-table',
        visible: selectedNotes.length > 1 && selected,
        command: () => mergeSelectedNotes && mergeSelectedNotes(note),
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
      mergeSelectedNotes,
      note,
      selected,
      selectedNotes.length,
      speechNote,
      toggleEdition,
      toggleNote,
      childrenNotes,
      generateActionItems,
      isGenerating,
    ],
  )

  return (
    <div
      ref={cardRef}
      title={note.body}
      className={`transition-all w-full bg-white p-3 text-zinc-500 text-sm shadow ${containerStyle} ${
        selected ? 'selected' : ''
      } ${rest.className}`}
      onDoubleClick={toggleEdition}
      onContextMenu={showContextMenu}
    >
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
      <div className="flex justify-between items-center">
        {LeftBottomIcons()}

        {!obfuscate && (
          <div className="flex justify-end items-center gap-2">
            <div
              onClick={likeHandler}
              className="flex items-center justify-center gap-1"
            >
              <LikeIcon liked={youLiked} />
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
