import { useState, useEffect } from 'react'
import { Id } from '@convex/_generated/dataModel'
import { useMutation } from 'convex/react'
import { api } from '@convex/_generated/api'

type Column = 'good' | 'bad' | 'action'

interface InlineEditColumnLabelProps {
  retroId?: Id<'retros'>
  column: Column
  // Already resolved to the default ("Good"/"Bad"/"Actions") when unset.
  value: string
  disabled?: boolean
  className?: string
}

// Keep in sync with MAX_COLUMN_LABEL_LENGTH in convex/retros.ts (server clamps too).
const MAX_COLUMN_LABEL_LENGTH = 30

export default function InlineEditColumnLabel(props: InlineEditColumnLabelProps) {
  const { retroId, column, value, disabled, className } = props
  const [newLabel, setNewLabel] = useState<string>(value)
  const [editable, setEditable] = useState<boolean>(false)
  const UpdateColumnLabel = useMutation(api.retros.updateColumnLabel)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewLabel(e.target.value)
  }

  useEffect(() => {
    const handler = setTimeout(() => {
      if (editable && retroId && value !== newLabel) {
        UpdateColumnLabel({ id: retroId, column, label: newLabel.trim() })
        setEditable(false)
      }
    }, 500)

    return () => {
      clearTimeout(handler)
    }
  }, [editable, newLabel, retroId, column, value, UpdateColumnLabel])

  useEffect(() => {
    if (!editable) {
      setNewLabel(value)
    }
  }, [editable, value])

  return (
    <input
      disabled={disabled || false}
      onClick={() => setEditable(true)}
      onChange={handleInputChange}
      value={newLabel}
      maxLength={MAX_COLUMN_LABEL_LENGTH}
      type="text"
      className={`w-full bg-transparent text-lg text-zinc-500 outline-none pr-2 ${
        className || ''
      }`}
    />
  )
}
