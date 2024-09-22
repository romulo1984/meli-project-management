'use client'
import Dropdown, { DropdownItem } from '@/components/dropdown'
import InlineEditName from '@/components/inline-edit-name'
import Loading from '@/components/loading'
import NotLoggedAlert from '@/components/not-logged-alert'
import Note from '@/components/note'
import NoteForm from '@/components/note-form'
import Participants from '@/components/participants'
import { Sortable } from '@/components/sortable'
import Timer from '@/components/timer'
import { useJoinRetro } from '@/helpers/hooks/useJoinRetro'
import useRetro from '@/helpers/hooks/useRetro'
import useSelectedNotes from '@/helpers/hooks/useSelectedNotes'
import useSettings from '@/helpers/hooks/useSettings'
import { useUser } from '@clerk/nextjs'
import { api } from '@convex/_generated/api'
import { Doc, Id } from '@convex/_generated/dataModel'
import {
  DndContext,
  DragCancelEvent,
  DragEndEvent,
  DragOverEvent,
  Over,
  UniqueIdentifier,
  closestCenter,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { useMutation } from 'convex/react'
import { useMemo, useRef, useState } from 'react'
import { confirmAlert } from 'react-confirm-alert'
import 'react-confirm-alert/src/react-confirm-alert.css'

interface RetroProps {
  params: {
    id: Id<'retros'>
  }
}

interface NoteItem extends Doc<'notes'> {
  id: UniqueIdentifier
}

interface ParsedNoteChildren {
  [key: string]: NoteItem[]
}

interface ParsedNotes {
  good: NoteItem[]
  bad: NoteItem[]
  action: NoteItem[]
  children: ParsedNoteChildren
}

const defaultParsedNotes: ParsedNotes = {
  good: [],
  bad: [],
  action: [],
  children: {},
}

export default function Retro(props: RetroProps) {
  const retroId = props.params.id
  const [note, setNote] = useState({ body: '', anonymous: false })
  const [pipeline, setPipeline] = useState<'good' | 'bad' | 'action'>('good')
  const [opened, setOpened] = useState({
    bad: false,
    good: false,
    action: false,
  })
  const {
    isLoading,
    retro,
    notes,
    users,
    me,
    setTimer,
    startTimer,
    resetTimer,
    settings,
  } = useRetro({ retroId })
  const CreateNote = useMutation(api.notes.store)
  const UpdatePositions = useMutation(api.notes.updatePositions)
  const MergeNotes = useMutation(api.notes.merge)
  const { isSignedIn } = useUser()
  useJoinRetro({ retroId })
  const { handleSettingChange } = useSettings({
    retroId: retroId,
  })
  const mergeOverRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [mergeTarget, setMergeTarget] = useState<Over>()
  const { toggleNote, selectedNotes, mergeSelectedNotes } = useSelectedNotes()

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    if (retro && me) {
      CreateNote({
        body: note.body,
        pipeline,
        retroId: retro._id ?? retroId,
        userId: me._id,
        anonymous: note.anonymous,
      })
      setOpened({ good: false, bad: false, action: false })
    }
    setNote({ body: '', anonymous: false })
  }

  const toggleOpened = (pipeline: 'good' | 'bad' | 'action') => {
    setPipeline(pipeline)
    setOpened({
      good: false,
      bad: false,
      action: false,
      [pipeline]: !opened[pipeline],
    })
  }

  const parsedNotes = useMemo(() => {
    if (!notes) {
      return defaultParsedNotes
    }

    let good = []
    let bad = []
    let action = []
    let actionChildren: ParsedNoteChildren = {}
    const sortedNotes = notes?.map(n => ({ ...n, id: n._id }))

    for (let currentNote of sortedNotes) {
      const parentId = String(currentNote.mergeParentId)
      if (parentId && parentId !== 'undefined') {
        if (!Object.keys(actionChildren).includes(parentId)) {
          actionChildren[parentId] = [currentNote]
          continue
        }

        actionChildren[parentId].push(currentNote)
        continue
      }

      if (currentNote.pipeline === 'good') {
        good.push(currentNote)
        continue
      }

      if (currentNote.pipeline === 'bad') {
        bad.push(currentNote)
        continue
      }

      if (currentNote.pipeline === 'action') {
        action.push(currentNote)
      }
    }

    good = good?.sort((a: any, b: any) => a.position - b.position)
    bad = bad.sort((a: any, b: any) => a.position - b.position)
    action = action.sort((a: any, b: any) => a.position - b.position)

    return {
      good,
      bad,
      action,
      children: actionChildren,
    }
  }, [notes])

  const formatDate = (date: any) =>
    new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })

  const handleDragCancel = (event: DragCancelEvent) => {
    mergeOverRef.current && clearTimeout(mergeOverRef.current)
    setMergeTarget(undefined)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { over, active } = event
    mergeOverRef.current && clearTimeout(mergeOverRef.current)
    setMergeTarget(undefined)

    if (over && over?.id !== active?.id) {
      const items = [...active?.data?.current?.sortable?.items]
      const oldIndex = items.indexOf(active.id)
      const newIndex = items.indexOf(over.id)

      const newItems = arrayMove(items, oldIndex, newIndex).map(
        (id, index) => ({ id, position: index }),
      )

      UpdatePositions({ notes: newItems })
    }
  }

  const handleDragOver = (event: DragOverEvent) => {
    const { over, active } = event

    if (!over || !active) {
      return
    }

    if (over.id === active.id) {
      return
    }

    const overNote = notes?.find(n => n._id === over.id)!
    const activeNote = notes?.find(n => n._id === active.id)!

    if (overNote.pipeline !== activeNote.pipeline) {
      return
    }

    setTimeout(setMergeTarget, 300, over)
    mergeOverRef.current && clearTimeout(mergeOverRef.current)
    mergeOverRef.current = setTimeout(() => {
      clearTimeout(mergeOverRef.current!)

      confirmAlert({
        title: 'Merge contents',
        message:
          'Do you want to merge the contents of both cards? This action is unreversible',
        buttons: [
          {
            label: 'No',
            onClick: () => null,
          },
          {
            label: 'Yes, merge',
            onClick: () => {
              MergeNotes({
                sourceId: activeNote._id,
                parentId: overNote._id,
              })

              setMergeTarget(undefined)
            },
          },
        ],
      })
    }, 600)
  }

  const settingsDropdownItems = (): DropdownItem[] => {
    const items: DropdownItem[] = []

    items.push({
      label: settings.notesShowingStatus.label,
      name: settings.notesShowingStatus.key,
      selected: settings.notesShowingStatus.value === 'hidden',
      disabled: !isSignedIn,
    })

    return items
  }

  return (
    <DndContext
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDragCancel={handleDragCancel}
      collisionDetection={closestCenter}
    >
      <main className="container mx-auto min-h-screen max-w-screen-xl py-6 px-6 flex flex-col">
        {isLoading ? (
          <Loading />
        ) : (
          <>
            <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-6">
              <div className="flex flex-col md:w-1/2">
                <InlineEditName
                  disabled={retro?.ownerId !== me?._id}
                  retroId={retro?._id}
                  value={retro?.name}
                />
                <p className="text-sm text-zinc-400">
                  Created in {formatDate(retro?._creationTime)}
                </p>
              </div>
              <div className="flex gap-4 flex-row-reverse md:flex-row justify-between content-end items-center">
                <Dropdown
                  color="zinc-400"
                  background="slate-50"
                  items={settingsDropdownItems()}
                  onItemPressed={(name: string) => {
                    if (!isSignedIn) return
                    handleSettingChange(name, settings)
                  }}
                />
                <Timer
                  timer={retro?.timer || 0}
                  start={retro?.startTimer || 0}
                  status={retro?.timerStatus || 'not_started'}
                  setTimer={setTimer}
                  startTimer={startTimer}
                  resetTimer={resetTimer}
                />
                <Participants users={users} />
              </div>
            </div>
            {!isSignedIn && <NotLoggedAlert />}
            <div className="grid md:grid-cols-3 gap-6">
              <div className="w-full bg-zinc-100 rounded-lg p-4">
                <div className="flex justify-between">
                  <h3 className="text-lg text-zinc-500 mb-4">Good</h3>
                  <p className="text-zinc-400">{parsedNotes.good?.length}</p>
                </div>
                {isSignedIn && (
                  <NoteForm
                    opened={opened.good}
                    toggleOpened={() => toggleOpened('good')}
                    newNote={note}
                    setNewNote={setNote}
                    saveHandler={handleSubmit}
                    users={users}
                  />
                )}
                {parsedNotes.good && (
                  <SortableContext
                    items={parsedNotes.good}
                    strategy={verticalListSortingStrategy}
                  >
                    {parsedNotes.good?.map(note => (
                      <Sortable key={note._id} id={note._id}>
                        <Note
                          highlighted={mergeTarget?.id === note._id}
                          key={note._id}
                          note={note}
                          users={users}
                          me={me}
                          blur={settings.notesShowingStatus.value === 'hidden'}
                          childrenNotes={parsedNotes.children[note._id]}
                          selectedNotes={selectedNotes}
                          toggleNote={toggleNote}
                          mergeSelectedNotes={mergeSelectedNotes}
                        />
                      </Sortable>
                    ))}
                  </SortableContext>
                )}
              </div>
              <div className="w-full bg-zinc-100 rounded-lg p-4">
                <div className="flex justify-between">
                  <h3 className="text-lg text-zinc-500 mb-4">Bad</h3>
                  <p className="text-zinc-400">{parsedNotes.bad?.length}</p>
                </div>
                {isSignedIn && (
                  <NoteForm
                    opened={opened.bad}
                    toggleOpened={() => toggleOpened('bad')}
                    newNote={note}
                    setNewNote={setNote}
                    saveHandler={handleSubmit}
                    users={users}
                  />
                )}
                {parsedNotes.bad && (
                  <SortableContext
                    items={parsedNotes.bad}
                    strategy={verticalListSortingStrategy}
                  >
                    {parsedNotes.bad?.map(note => (
                      <Sortable key={note._id} id={note._id}>
                        <Note
                          highlighted={mergeTarget?.id === note._id}
                          key={note._id}
                          note={note}
                          users={users}
                          me={me}
                          blur={settings.notesShowingStatus.value === 'hidden'}
                          childrenNotes={parsedNotes.children[note._id]}
                          selectedNotes={selectedNotes}
                          toggleNote={toggleNote}
                          mergeSelectedNotes={mergeSelectedNotes}
                        />
                      </Sortable>
                    ))}
                  </SortableContext>
                )}
              </div>
              <div className="w-full bg-zinc-100 rounded-lg p-4">
                <div className="flex justify-between">
                  <h3 className="text-lg text-zinc-500 mb-4">Actions</h3>
                  <p className="text-zinc-400">{parsedNotes.action?.length}</p>
                </div>
                {isSignedIn && (
                  <NoteForm
                    opened={opened.action}
                    toggleOpened={() => toggleOpened('action')}
                    newNote={note}
                    setNewNote={setNote}
                    saveHandler={handleSubmit}
                    users={users}
                  />
                )}
                {parsedNotes.action && (
                  <SortableContext
                    items={parsedNotes.action}
                    strategy={verticalListSortingStrategy}
                  >
                    {parsedNotes.action?.map(note => (
                      <Sortable key={note._id} id={note._id}>
                        <Note
                          highlighted={mergeTarget?.id === note._id}
                          key={note._id}
                          note={note}
                          users={users}
                          me={me}
                          actionType={isSignedIn}
                          blur={settings.notesShowingStatus.value === 'hidden'}
                          childrenNotes={parsedNotes.children[note._id]}
                          selectedNotes={selectedNotes}
                          toggleNote={toggleNote}
                          mergeSelectedNotes={mergeSelectedNotes}
                        />
                      </Sortable>
                    ))}
                  </SortableContext>
                )}
              </div>
            </div>
          </>
        )}
      </main>
    </DndContext>
  )
}
