'use client'
import { useState, useCallback } from 'react'
import { Doc } from '@convex/_generated/dataModel'
import { api } from '@convex/_generated/api'
import { useMutation } from 'convex/react'

export default function useSelectedNotes() {
  const MergeNotes = useMutation(api.notes.mergeMultiple)
  const [mergeMode, setMergeMode] = useState(false)
  const [selectedPipeline, setSelectedPipeline] = useState<string | null>(null)
  const [selectedNotes, setSelectedNotes] = useState<Doc<'notes'>[]>([])

  const clearSelection = useCallback(() => {
    setSelectedNotes([])
    setSelectedPipeline(null)
  }, [])

  // Toggle a note in/out of the current selection. Selection order is
  // preserved: the first picked card is the merge target. If it is (or belongs
  // to) an existing group, the rest are added to that group; otherwise it
  // becomes the new group's parent. The real parent is resolved server-side
  // (see convex/notes.ts mergeMultiple). Merges are scoped to a single column,
  // so picking a note from another pipeline restarts the selection there.
  const toggleNote = useCallback(
    (note: Doc<'notes'>) => {
      setSelectedNotes(prev => {
        const alreadySelected = prev.some(n => n._id === note._id)

        if (alreadySelected) {
          const next = prev.filter(n => n._id !== note._id)
          if (next.length === 0) setSelectedPipeline(null)
          return next
        }

        if (note.pipeline !== selectedPipeline) {
          setSelectedPipeline(note.pipeline)
          return [note]
        }

        return [...prev, note]
      })
    },
    [selectedPipeline],
  )

  const enterMergeMode = useCallback(() => {
    setMergeMode(true)
  }, [])

  const exitMergeMode = useCallback(() => {
    setMergeMode(false)
    setSelectedNotes([])
    setSelectedPipeline(null)
  }, [])

  // Merge every other selected note into the first one picked (the target).
  // The server resolves the real group parent from that target, so an existing
  // group is joined rather than nested (see convex/notes.ts mergeMultiple).
  const mergeSelectedNotes = useCallback(() => {
    if (selectedNotes.length < 2) return

    const [target, ...sources] = selectedNotes

    MergeNotes({
      parentId: target._id,
      sourceIds: sources.map(n => n._id),
    })

    setSelectedNotes([])
    setSelectedPipeline(null)
  }, [MergeNotes, selectedNotes])

  return {
    mergeMode,
    enterMergeMode,
    exitMergeMode,
    selectedNotes,
    selectedPipeline,
    toggleNote,
    mergeSelectedNotes,
    clearSelection,
  }
}
