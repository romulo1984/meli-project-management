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
  highlighted?: boolean
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
    highlighted = false,
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

  // In merge mode any top-level card in the column currently being merged can
  // be picked — including an existing group parent, whose whole group is then
  // merged into the target. Merges stay scoped to a single pipeline.
  const selectable =
    mergeMode &&
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
      } ${dimmed ? 'opacity-50' : ''} ${highlighted ? 'highlighted' : ''}`}
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
            mergeMode={mergeMode}
            // A merged group selects/hovers as ONE unit: children share the
            // group's selectable + selected state and route clicks to the
            // parent's toggle. No `selectionIndex`, so only the parent shows the
            // order badge.
            selectable={selectable}
            selected={selected}
            onSelectToggle={() => toggleNote && toggleNote(note)}
            generateActionItems={generateActionItems}
            isGenerating={isGenerating}
          />
        ))}
    </div>
  )
}
