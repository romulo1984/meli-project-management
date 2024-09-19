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

interface NoteProps {
  note: Doc<'notes'>
  user: Doc<'users'> | undefined | null
  me?: Doc<'users'> | undefined | null
  actionType?: boolean
  blur?: boolean
  highlighted?: boolean
  childrenNotes?: Doc<'notes'>[]
  roundTop: boolean
  roundBottom: boolean
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
        label: 'Delete',
        icon: 'pi pi-trash',
        disabled: !isOwner,
        command: () => setDeleteIntention(true),
      },
    ],
    [isOwner, speechNote, toggleEdition],
  )

  return (
    <div
      ref={cardRef}
      title={note.body}
      className={`transition-all w-full bg-white p-3 text-zinc-500 text-sm shadow ${containerStyle}`}
      onDoubleClick={toggleEdition}
      onContextMenu={showContextMenu}
    >
      <div className={`mb-2 ${obfuscate ? 'blur-sm' : ''}`}>
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
