import { useState, useEffect } from 'react'
import { Id } from '@convex/_generated/dataModel'
import { useMutation } from 'convex/react'
import { api } from '@convex/_generated/api'

interface InlineEditNameProps {
  retroId?: Id<'retros'>
  value?: string
}

export default function InlineEditName (props: InlineEditNameProps) {
  const { retroId, value } = props
  const [newName, setNewName] = useState<string>(value || '')
  const UpdateRetro = useMutation(api.retros.update)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewName(e.target.value)
  }

  useEffect(() => {
    const handler = setTimeout(() => {
      if (retroId && value && value !== newName) {
        UpdateRetro({ id: retroId, name: newName.trim() })
      }
    }, 500)

    return () => {
      clearTimeout(handler)
    }
  }, [newName, retroId, value, UpdateRetro])

  return (
    <div className='w-full'>
      <input
        onChange={handleInputChange}
        value={newName}
        className='text-xl text-zinc-600 w-full' type='text'
      />
    </div>
  )
}