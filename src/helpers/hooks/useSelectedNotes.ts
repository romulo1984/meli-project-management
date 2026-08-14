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
  // preserved, so the first picked note is the merge parent. Merges are
  // scoped to a single column, so picking a note from another pipeline
  // restarts the selection in that pipeline.
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

  // Merge every selected note into the first one picked (the parent).
  const mergeSelectedNotes = useCallback(() => {
    if (selectedNotes.length < 2) return

    const [parent, ...sources] = selectedNotes

    MergeNotes({
      parentId: parent._id,
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
