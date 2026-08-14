import { api } from '@convex/_generated/api'
import { Id } from '@convex/_generated/dataModel'
import { useMutation } from 'convex/react'
import { useCallback, useEffect, useRef } from 'react'

// Cap the shared-highlight writes driven by mouse movement to at most one per
// this many ms so hovering across cards doesn't spam Convex.
const HIGHLIGHT_THROTTLE_MS = 200

interface UseHighlightModeProps {
  retroId: Id<'retros'>
  /** Convex id of the current participant (null until they pick a name). */
  userId?: Id<'users'> | null
  /** Current controller from the live retro doc (null/undefined = nobody). */
  controllerId?: Id<'users'> | null
}

/**
 * Client controller for real-time "Highlight mode".
 *
 * Only one participant controls highlighting at a time; the server enforces the
 * lock (see convex/retros.ts). This hook exposes whether the local user holds
 * control, whether someone else does, a toggle to claim/release it, and a
 * throttled `highlightNote` used from card hover handlers. Control is released
 * automatically when the controlling component unmounts.
 */
const useHighlightMode = ({
  retroId,
  userId,
  controllerId,
}: UseHighlightModeProps) => {
  const claimControl = useMutation(api.retros.claimHighlightControl)
  const releaseControl = useMutation(api.retros.releaseHighlightControl)
  const setHighlightedNote = useMutation(api.retros.setHighlightedNote)

  const isController = Boolean(userId) && controllerId === userId
  const isControlledByOther = Boolean(controllerId) && controllerId !== userId

  // Throttle bookkeeping for the mouse-driven highlight writes.
  const throttleTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastWriteAtRef = useRef(0)
  const pendingNoteIdRef = useRef<Id<'notes'> | undefined>(undefined)

  const flushHighlight = useCallback(
    (noteId?: Id<'notes'>) => {
      if (!userId) return
      lastWriteAtRef.current = Date.now()
      setHighlightedNote({ id: retroId, userId, noteId })
    },
    [retroId, userId, setHighlightedNote],
  )

  const highlightNote = useCallback(
    (noteId?: Id<'notes'>) => {
      // Skip work when we don't hold control; the server rejects it anyway.
      if (!isController || !userId) return

      pendingNoteIdRef.current = noteId
      const elapsed = Date.now() - lastWriteAtRef.current

      if (throttleTimeoutRef.current) {
        clearTimeout(throttleTimeoutRef.current)
        throttleTimeoutRef.current = null
      }

      if (elapsed >= HIGHLIGHT_THROTTLE_MS) {
        flushHighlight(noteId)
        return
      }

      // Trailing edge: make sure the last hovered state is written.
      throttleTimeoutRef.current = setTimeout(() => {
        throttleTimeoutRef.current = null
        flushHighlight(pendingNoteIdRef.current)
      }, HIGHLIGHT_THROTTLE_MS - elapsed)
    },
    [isController, userId, flushHighlight],
  )

  const enable = useCallback(() => {
    if (!userId) return
    claimControl({ id: retroId, userId })
  }, [claimControl, retroId, userId])

  const disable = useCallback(() => {
    if (!userId) return
    if (throttleTimeoutRef.current) {
      clearTimeout(throttleTimeoutRef.current)
      throttleTimeoutRef.current = null
    }
    releaseControl({ id: retroId, userId })
  }, [releaseControl, retroId, userId])

  const toggle = useCallback(() => {
    if (isController) {
      disable()
    } else {
      enable()
    }
  }, [isController, disable, enable])

  // Release control if the controller navigates away / unmounts. Refs keep the
  // cleanup effect empty-deps so it runs only on unmount — otherwise it would
  // release + reclaim on every render.
  const isControllerRef = useRef(isController)
  const disableRef = useRef(disable)
  useEffect(() => {
    isControllerRef.current = isController
  }, [isController])
  useEffect(() => {
    disableRef.current = disable
  }, [disable])
  useEffect(() => {
    return () => {
      if (throttleTimeoutRef.current) {
        clearTimeout(throttleTimeoutRef.current)
        throttleTimeoutRef.current = null
      }
      if (isControllerRef.current) {
        disableRef.current()
      }
    }
  }, [])

  return {
    isController,
    isControlledByOther,
    highlightNote,
    toggle,
  }
}

export default useHighlightMode
