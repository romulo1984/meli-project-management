'use client'
import { Doc } from '@convex/_generated/dataModel'
import NoteCard from './card'
import React from 'react'
import { useGenerateActionItems } from '@/helpers/hooks/useGenerateActionItems'

interface NoteProps extends React.HTMLAttributes<HTMLDivElement> {
  note: Doc<'notes'>
  users: Doc<'users'>[] | any
  me?: Doc<'users'> | undefined | null
  actionType?: boolean
  blur?: boolean
  childrenNotes?: Doc<'notes'>[]
  mergeMode?: boolean
  selectedPipeline?: string | null
  selectedNotes?: Doc<'notes'>[]
  toggleNote?: (note: Doc<'notes'>) => void
}

export default function Note(props: NoteProps) {
  const {
    note,
    me,
    actionType,
    blur = false,
    childrenNotes = [],
    users = [],
    mergeMode = false,
    selectedPipeline = null,
    selectedNotes = [],
    toggleNote,
    ...rest
  } = props

  const getUser = (id: string) =>
    users ? users?.find((u: Doc<'users'>) => u._id === id) : null

  const { generateActionItems, isGenerating } = useGenerateActionItems({
    retroId: note.retroId,
    userId: me?._id,
    items: [note, ...childrenNotes].map(n => n.body),
  })

  const hasChildren = childrenNotes && childrenNotes.length > 0
  const isMerged = note.mergeParentId !== undefined

  // In merge mode a card can be picked only if it is a stand-alone note in the
  // column currently being merged (a merge is scoped to a single pipeline).
  const selectable =
    mergeMode &&
    !hasChildren &&
    !isMerged &&
    (selectedPipeline === null || selectedPipeline === note.pipeline)

  const selectionIndex = selectedNotes.findIndex(n => n._id === note._id)
  const selected = selectionIndex !== -1
  // Cards that exist while merge mode is on but cannot take part in the
  // current merge (a merged group, or a different column) recede visually.
  const dimmed = mergeMode && !selectable && !selected

  return (
    <div
      className={`merge-container ${
        isGenerating ? 'generating-action-items-intermittent' : ''
      } ${dimmed ? 'opacity-50' : ''}`}
    >
      <NoteCard
        {...rest}
        note={note}
        user={getUser(note.userId)}
        me={me}
        actionType={actionType}
        blur={blur}
        roundTop
        roundBottom={!hasChildren}
        mergeMode={mergeMode}
        selectable={selectable}
        selected={selected}
        selectionIndex={selectionIndex}
        onSelectToggle={() => toggleNote && toggleNote(note)}
        childrenNotes={childrenNotes}
        generateActionItems={generateActionItems}
        isGenerating={isGenerating}
      />

      {hasChildren &&
        childrenNotes.map((child, i) => (
          <NoteCard
            {...rest}
            key={child._id}
            note={child}
            user={getUser(child.userId)}
            me={me}
            actionType={actionType}
            blur={blur}
            roundTop={false}
            roundBottom={i === childrenNotes.length - 1}
            generateActionItems={generateActionItems}
            isGenerating={isGenerating}
          />
        ))}
    </div>
  )
}
