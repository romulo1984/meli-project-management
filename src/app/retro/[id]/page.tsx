'use client'
import EditColumnsModal from '@/components/edit-columns-modal'
import RetroNameModal from '@/components/retro-name-modal'
import Loading from '@/components/loading'
import NotLoggedAlert from '@/components/not-logged-alert'
import Note from '@/components/note'
import NoteForm from '@/components/note-form'
import Participants from '@/components/participants'
import { Sortable } from '@/components/sortable'
import Timer from '@/components/timer'
import SettingsMenu, { SettingsMenuItem } from '@/components/settings-menu'
import { useJoinRetro } from '@/helpers/hooks/useJoinRetro'
import useHighlightMode from '@/helpers/hooks/useHighlightMode'
import useRetro from '@/helpers/hooks/useRetro'
import useSelectedNotes from '@/helpers/hooks/useSelectedNotes'
import useSettings from '@/helpers/hooks/useSettings'
import { useIdentity } from '@/contexts/IdentityProvider'
import { api } from '@convex/_generated/api'
import { Doc, Id } from '@convex/_generated/dataModel'
import { Button } from '@/components/ui/button'
import { Sparkles, Pencil } from 'lucide-react'
import MergeModeBar from '@/components/merge-mode-bar'
import {
  DndContext,
  DragEndEvent,
  UniqueIdentifier,
  closestCenter,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { useMutation } from 'convex/react'
import { useEffect, useMemo, useState } from 'react'
import { useGenerateActionItems } from '@/helpers/hooks/useGenerateActionItems'
import { SelectModel } from '@/components/select-model'

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

// Friendly placeholder shown when a column has no cards yet.
function EmptyColumn() {
  return (
    <p className="mt-1 rounded-xl border border-dashed border-zinc-200 py-8 text-center text-xs text-zinc-400">
      No cards yet
    </p>
  )
}

// Shared column shell: soft card look matching the landing page (rounded,
// subtle border + shadow, gentle hover). Radius/spacing kept consistent.
const columnClassName =
  'flex w-full flex-col rounded-2xl border border-zinc-200/70 bg-zinc-50 p-4 shadow-sm transition-shadow hover:shadow-md'

export default function Retro(props: RetroProps) {
  const retroId = props.params.id
  const [note, setNote] = useState({ body: '', anonymous: false })
  const [pipeline, setPipeline] = useState<'good' | 'bad' | 'action'>('good')
  const [opened, setOpened] = useState({
    bad: false,
    good: false,
    action: false,
  })
  const [isEditColumnsOpen, setEditColumnsOpen] = useState(false)
  const [focusColumn, setFocusColumn] = useState<
    'good' | 'bad' | 'action' | undefined
  >(undefined)
  const [isNameModalOpen, setNameModalOpen] = useState(false)
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
  const UpdateMaxLikes = useMutation(api.retros.updateMaxLikes)
  const UpdateSortByVotes = useMutation(api.retros.updateSortByVotes)
  const { hasName, ready, promptName } = useIdentity()
  useJoinRetro({ retroId })

  useEffect(() => {
    // First time in a retro (e.g. via a shared link) → ask for a display name
    // so the person's notes and joins are attributed.
    if (ready && !hasName) promptName()
  }, [ready, hasName, promptName])
  const { handleSettingChange } = useSettings({
    retroId: retroId,
  })
  const {
    mergeMode,
    enterMergeMode,
    exitMergeMode,
    selectedNotes,
    selectedPipeline,
    toggleNote,
    mergeSelectedNotes,
  } = useSelectedNotes()
  const { generateActionItems, isGenerating } = useGenerateActionItems({
    retroId,
    userId: me?._id,
    items: notes?.filter(n => n.pipeline === 'bad').map(n => n.body) || [],
  })
  const [selectedModel, setModel] = useState('claude-3-5-sonnet')

  const { isController, isControlledByOther, highlightNote, toggle } =
    useHighlightMode({
      retroId,
      userId: me?._id,
      controllerId: retro?.highlightControllerId,
    })
  const highlightedNoteId = retro?.highlightedNoteId

  // Hover handlers that broadcast the highlighted card — only wired up while
  // the local user controls Highlight mode.
  const highlightHandlers = (noteId: Id<'notes'>) =>
    isController
      ? {
          onMouseEnter: () => highlightNote(noteId),
          onMouseLeave: () => highlightNote(undefined),
        }
      : undefined

  // Column labels are owner-editable; fall back to the defaults when unset/empty.
  const goodLabel = retro?.goodLabel || 'Good'
  const badLabel = retro?.badLabel || 'Bad'
  const actionLabel = retro?.actionLabel || 'Actions'
  const isOwner = retro?.ownerId === me?._id

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

  // Open the edit-columns modal focused on a specific column's input (from that
  // column's header pencil), so the owner can retype the label straight away.
  const openEditColumns = (column: 'good' | 'bad' | 'action') => {
    setFocusColumn(column)
    setEditColumnsOpen(true)
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

    // A group's vote total is the parent's likes plus every merged child's
    // likes (children live in `actionChildren`, keyed by the parent's _id).
    const groupVotes = (n: any): number =>
      (n.likes?.length ?? 0) +
      (actionChildren[n._id] ?? []).reduce(
        (sum: number, child: NoteItem) => sum + (child.likes?.length ?? 0),
        0,
      )

    // Owner-toggled, shared ordering: by total group votes (desc) when
    // `sortByVotes` is on, otherwise the manual drag-and-drop `position`.
    const byPosition = (a: any, b: any) => a.position - b.position
    const byVotes = (a: any, b: any) => groupVotes(b) - groupVotes(a)
    const sorter = retro?.sortByVotes ? byVotes : byPosition

    good = good.sort(sorter)
    bad = bad.sort(sorter)
    action = action.sort(sorter)

    return {
      good,
      bad,
      action,
      children: actionChildren,
    }
  }, [notes, retro?.sortByVotes])

  const formatDate = (date: any) =>
    new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })

  // Drag & drop now only reorders cards within a column. Merging is handled by
  // the dedicated merge mode (see MergeModeBar / useSelectedNotes).
  const handleDragEnd = (event: DragEndEvent) => {
    const { over, active } = event

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

  // Rows for the gear settings menu (all toggles). Add a new setting by
  // appending one object here.
  const settingsMenuItems: SettingsMenuItem[] = [
    {
      key: settings.notesShowingStatus.key,
      label: settings.notesShowingStatus.label,
      description: 'Blur every note until you reveal them',
      active: settings.notesShowingStatus.value === 'hidden',
      disabled: !hasName,
      onToggle: () =>
        handleSettingChange(settings.notesShowingStatus.key, settings),
    },
    {
      key: 'merge_mode',
      label: 'Merge mode',
      description: 'Select cards to group them together',
      active: mergeMode,
      onToggle: mergeMode ? exitMergeMode : enterMergeMode,
    },
    {
      key: 'highlight_mode',
      label: 'Highlight mode',
      description: isControlledByOther
        ? 'In use by another participant'
        : 'Point everyone to the card you hover',
      active: isController,
      disabled: !hasName || !me || isControlledByOther,
      onToggle: toggle,
    },
  ]

  // Owner-only board controls. The self-vote / budget rules these drive are
  // enforced server-side in Convex — this menu is just the control surface.
  // `retroId` (the route param) is the always-defined id; `retro._id` from the
  // query is optional because the doc may not be loaded yet.
  if (isOwner) {
    settingsMenuItems.push(
      {
        key: 'sort_by_votes',
        label: 'Sort by most voted',
        description: 'Order cards by total votes',
        active: Boolean(retro?.sortByVotes),
        onToggle: () =>
          UpdateSortByVotes({ id: retroId, sortByVotes: !retro?.sortByVotes }),
      },
      {
        key: 'max_likes',
        label: 'Max votes per person',
        description: 'How many likes each person can spend',
        value: retro?.maxLikes ?? 3,
        min: 1,
        max: 20,
        onChange: (value: number) =>
          UpdateMaxLikes({ id: retroId, maxLikes: value }),
      },
    )
  }

  // const showGenerateActionItemsButton =
  //   parsedNotes.bad.length > 0 &&
  //   parsedNotes.action.length === 0 &&
  //   hasName &&
  //   settings.notesShowingStatus.value !== 'hidden'

  // Disabled AI action items generation to all bad notes
  const showGenerateActionItemsButton = false

  return (
    <DndContext onDragEnd={handleDragEnd} collisionDetection={closestCenter}>
      <main className="container mx-auto min-h-screen max-w-screen-xl py-6 px-6 flex flex-col">
        {isLoading ? (
          <Loading />
        ) : (
          <>
            <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-6">
              <div className="flex flex-col md:w-1/2">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl text-zinc-600 truncate">
                    {retro?.name}
                  </h2>
                  {isOwner && (
                    <button
                      type="button"
                      onClick={() => setNameModalOpen(true)}
                      title="Rename retro"
                      aria-label="Rename retro"
                      className="shrink-0 text-zinc-300 hover:text-indigo-500 transition-colors"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <p className="text-sm text-zinc-400">
                  Created in {formatDate(retro?._creationTime)}
                </p>
              </div>
              <div className="flex gap-4 flex-row-reverse md:flex-row justify-between content-end items-center">
                <SettingsMenu items={settingsMenuItems} />
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
            {!hasName && <NotLoggedAlert onAction={promptName} />}
            <div className="grid md:grid-cols-3 gap-6">
              <div className={columnClassName}>
                <div className="mb-4 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <p className="text-lg font-medium text-zinc-600">
                      {goodLabel}
                    </p>
                    {isOwner && (
                      <button
                        type="button"
                        onClick={() => openEditColumns('good')}
                        title="Rename columns"
                        aria-label="Rename columns"
                        className="text-zinc-300 hover:text-indigo-500 transition-colors"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                  <span className="inline-flex h-6 min-w-[1.5rem] items-center justify-center rounded-full bg-white px-2 text-xs font-medium text-zinc-400 ring-1 ring-zinc-200">
                    {parsedNotes.good?.length}
                  </span>
                </div>
                {hasName && (
                  <NoteForm
                    opened={opened.good}
                    toggleOpened={() => toggleOpened('good')}
                    newNote={note}
                    setNewNote={setNote}
                    saveHandler={handleSubmit}
                    users={users}
                  />
                )}
                {parsedNotes.good.length === 0 && <EmptyColumn />}
                {parsedNotes.good && (
                  <SortableContext
                    items={parsedNotes.good}
                    strategy={verticalListSortingStrategy}
                  >
                    {parsedNotes.good?.map(note => (
                      <Sortable key={note._id} id={note._id} disabled={mergeMode}>
                        <div className="w-full" {...highlightHandlers(note._id)}>
                          <Note
                            highlighted={highlightedNoteId === note._id}
                            key={note._id}
                            note={note}
                            users={users}
                            me={me}
                            blur={settings.notesShowingStatus.value === 'hidden'}
                            childrenNotes={parsedNotes.children[note._id]}
                            mergeMode={mergeMode}
                            selectedPipeline={selectedPipeline}
                            selectedNotes={selectedNotes}
                            toggleNote={toggleNote}
                          />
                        </div>
                      </Sortable>
                    ))}
                  </SortableContext>
                )}
              </div>
              <div className={columnClassName}>
                <div className="mb-4 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <p className="text-lg font-medium text-zinc-600">
                      {badLabel}
                    </p>
                    {isOwner && (
                      <button
                        type="button"
                        onClick={() => openEditColumns('bad')}
                        title="Rename columns"
                        aria-label="Rename columns"
                        className="text-zinc-300 hover:text-indigo-500 transition-colors"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                  <span className="inline-flex h-6 min-w-[1.5rem] items-center justify-center rounded-full bg-white px-2 text-xs font-medium text-zinc-400 ring-1 ring-zinc-200">
                    {parsedNotes.bad?.length}
                  </span>
                </div>
                {hasName && (
                  <NoteForm
                    opened={opened.bad}
                    toggleOpened={() => toggleOpened('bad')}
                    newNote={note}
                    setNewNote={setNote}
                    saveHandler={handleSubmit}
                    users={users}
                  />
                )}
                {parsedNotes.bad.length === 0 && <EmptyColumn />}
                {parsedNotes.bad && (
                  <SortableContext
                    items={parsedNotes.bad}
                    strategy={verticalListSortingStrategy}
                  >
                    {parsedNotes.bad?.map(note => (
                      <Sortable key={note._id} id={note._id} disabled={mergeMode}>
                        <div className="w-full" {...highlightHandlers(note._id)}>
                          <Note
                            highlighted={highlightedNoteId === note._id}
                            key={note._id}
                            note={note}
                            users={users}
                            me={me}
                            blur={settings.notesShowingStatus.value === 'hidden'}
                            childrenNotes={parsedNotes.children[note._id]}
                            mergeMode={mergeMode}
                            selectedPipeline={selectedPipeline}
                            selectedNotes={selectedNotes}
                            toggleNote={toggleNote}
                          />
                        </div>
                      </Sortable>
                    ))}
                  </SortableContext>
                )}
              </div>
              <div className={columnClassName}>
                <div className="mb-4 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-lg font-medium text-zinc-600">
                      {actionLabel}
                    </span>
                    {isOwner && (
                      <button
                        type="button"
                        onClick={() => openEditColumns('action')}
                        title="Rename columns"
                        aria-label="Rename columns"
                        className="text-zinc-300 hover:text-indigo-500 transition-colors"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                    )}
                    {isGenerating && (
                      <Sparkles
                        className="h-4 w-4 text-violet-800 generating-action-items-intermittent"
                        strokeWidth="1"
                      />
                    )}
                  </div>
                  <span className="inline-flex h-6 min-w-[1.5rem] items-center justify-center rounded-full bg-white px-2 text-xs font-medium text-zinc-400 ring-1 ring-zinc-200">
                    {parsedNotes.action?.length}
                  </span>
                </div>
                {hasName && (
                  <NoteForm
                    opened={opened.action}
                    toggleOpened={() => toggleOpened('action')}
                    newNote={note}
                    setNewNote={setNote}
                    saveHandler={handleSubmit}
                    users={users}
                  />
                )}
                {parsedNotes.action.length === 0 &&
                  !showGenerateActionItemsButton && <EmptyColumn />}
                {parsedNotes.action && (
                  <SortableContext
                    items={parsedNotes.action}
                    strategy={verticalListSortingStrategy}
                  >
                    {showGenerateActionItemsButton && (
                      <div className="flex flex-col items-center w-full text-center gap-2">
                        <p className="text-sm text-zinc-400">
                          Automatically generate action notes with AI
                        </p>
                        <div className="flex gap-2">
                          <SelectModel
                            value={selectedModel}
                            setValue={setModel}
                          />
                          <Button
                            variant="outline"
                            className="text-violet-800"
                            onClick={() => generateActionItems(selectedModel)}
                            disabled={isGenerating || !selectedModel}
                          >
                            <Sparkles
                              className={`mr-2 h-4 w-4 ${
                                isGenerating
                                  ? 'generating-action-items-intermittent'
                                  : ''
                              }`}
                              strokeWidth="1"
                            />
                            Generate actions
                          </Button>
                        </div>
                      </div>
                    )}
                    {parsedNotes.action?.map(note => (
                      <Sortable key={note._id} id={note._id} disabled={mergeMode}>
                        <div className="w-full" {...highlightHandlers(note._id)}>
                          <Note
                            className={
                              isGenerating ? 'generating-action-items' : ''
                            }
                            highlighted={highlightedNoteId === note._id}
                            key={note._id}
                            note={note}
                            users={users}
                            me={me}
                            actionType={hasName}
                            blur={settings.notesShowingStatus.value === 'hidden'}
                            childrenNotes={parsedNotes.children[note._id]}
                            mergeMode={mergeMode}
                            selectedPipeline={selectedPipeline}
                            selectedNotes={selectedNotes}
                            toggleNote={toggleNote}
                          />
                        </div>
                      </Sortable>
                    ))}
                  </SortableContext>
                )}
              </div>
            </div>
            {isOwner && (
              <>
                <RetroNameModal
                  retroId={retro?._id}
                  open={isNameModalOpen}
                  onOpenChange={setNameModalOpen}
                  name={retro?.name || ''}
                />
                <EditColumnsModal
                  retroId={retro?._id}
                  open={isEditColumnsOpen}
                  onOpenChange={setEditColumnsOpen}
                  goodLabel={goodLabel}
                  badLabel={badLabel}
                  actionLabel={actionLabel}
                  focusColumn={focusColumn}
                />
              </>
            )}
            {mergeMode && (
              <MergeModeBar
                count={selectedNotes.length}
                onMerge={mergeSelectedNotes}
                onCancel={exitMergeMode}
              />
            )}
          </>
        )}
      </main>
    </DndContext>
  )
}
