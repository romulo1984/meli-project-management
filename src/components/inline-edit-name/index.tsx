import { useState, useEffect } from 'react'
import { Id } from '@convex/_generated/dataModel'
import { useMutation } from 'convex/react'
import { api } from '@convex/_generated/api'

interface InlineEditNameProps {
  retroId?: Id<'retros'>
  value?: string
  disabled?: boolean
}

export default function InlineEditName (props: InlineEditNameProps) {
  const { retroId, value, disabled } = props
  const [newName, setNewName] = useState<string>(value || '')
  const [editable, setEditable] = useState<boolean>(false)
  const UpdateRetro = useMutation(api.retros.update)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewName(e.target.value)
  }

  useEffect(() => {
    const handler = setTimeout(() => {
      if (editable && retroId && value && value !== newName) {
        UpdateRetro({ id: retroId, name: newName.trim() })
        setEditable(false)
      }
    }, 500)

    return () => {
      clearTimeout(handler)
    }
  }, [editable, newName, retroId, value, UpdateRetro])

  useEffect(() => {
    if (!editable && value) {
      setNewName(value)
    }
  }, [editable, value])

  return (
    <div className='w-full'>
      <input
        disabled={disabled || false}
        onClick={() => setEditable(true)}
        onChange={handleInputChange}
        value={newName}
        className='disabled:bg-white text-xl text-zinc-600 w-full' type='text'
      />
    </div>
  )
}