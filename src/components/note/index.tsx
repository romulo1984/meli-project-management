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
  highlighted?: boolean
  childrenNotes?: Doc<'notes'>[]
  toggleNote: (
    event: React.MouseEvent<HTMLDivElement>,
    note: Doc<'notes'>,
  ) => void
  selectedNotes: Doc<'notes'>[]
  mergeSelectedNotes: (parent: Doc<'notes'>) => void
}

export default function Note(props: NoteProps) {
  const {
    note,
    me,
    actionType,
    blur = false,
    childrenNotes = [],
    highlighted,
    users = [],
    toggleNote,
    selectedNotes,
    mergeSelectedNotes,
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

  return (
    <div
      className={`merge-container ${highlighted ? 'highlighted' : ''} ${
        isGenerating ? 'generating-action-items-intermittent' : ''
      }`}
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
        onClick={!hasChildren ? e => toggleNote(e, note) : () => {}}
        selected={!hasChildren && !!selectedNotes.find(n => n._id === note._id)}
        mergeSelectedNotes={mergeSelectedNotes}
        selectedNotes={selectedNotes}
        childrenNotes={childrenNotes}
        toggleNote={toggleNote}
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
