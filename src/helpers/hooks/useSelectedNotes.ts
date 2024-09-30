'use client'
import { useState, useCallback } from 'react'
import { Doc } from '@convex/_generated/dataModel'
import { api } from '@convex/_generated/api'
import { useMutation } from 'convex/react'

export default function useSelectedNotes() {
  const MergeNotes = useMutation(api.notes.mergeMultiple)
  const [selectedPipeline, setselectedPipeline] = useState<string | null>(null)
  const [selectedNotes, setSelectedNotes] = useState<Doc<'notes'>[]>([])

  const toggleNote = useCallback(
    (event: React.MouseEvent<HTMLDivElement>, note: Doc<'notes'>) => {
      if (event.ctrlKey || event.metaKey) {
        setSelectedNotes(prev => {
          if (prev.includes(note)) return prev.filter(n => n !== note)

          if (note.pipeline !== selectedPipeline) {
            setselectedPipeline(note.pipeline)
            return [note]
          }

          setselectedPipeline(note.pipeline)
          return [...prev, note]
        })
      }
    },
    [selectedPipeline],
  )

  const mergeSelectedNotes = useCallback(
    (parent: Doc<'notes'>) => {
      if (selectedNotes.length > 1) {
        const parentId = parent._id
        const sourceIds = selectedNotes
          .filter(n => n._id !== parentId)
          .map(n => n._id)

        MergeNotes({
          sourceIds,
          parentId,
        })
        setSelectedNotes([])
      }
    },
    [MergeNotes, selectedNotes],
  )

  return {
    selectedNotes,
    toggleNote,
    mergeSelectedNotes,
    selectedPipeline,
  }
}
