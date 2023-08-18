'use client'
import { useState } from 'react'
import useRetro from '@/helpers/hooks/useRetro'
import { Id } from '@convex/_generated/dataModel'
import { useMutation } from 'convex/react'
import { api } from '@convex/_generated/api'

interface RetroProps {
  params: {
    id: Id<'retros'>
  }
}

export default function Retro(props: RetroProps) {
  const [note, setNote] = useState('')
  const retroId = props.params.id
  const {retro, notes, users} = useRetro({ retroId })
  const CreateNote = useMutation(api.notes.store)

  const getUser = (id: string) => users?.find((user) => user?._id === id)
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const firstUser = users?.[0]
    if (retro && firstUser) {
      CreateNote({ body: note, pipeline: 'good', retroId: retro?._id, userId: firstUser._id })
    }
    setNote('')
  }

  return (
    <main className="flex min-h-screen flex-col items-center w-x-auto">
      <h2>{retro?.name}</h2>
      <div className="flex justify-center gap-6 p-24 flex-wrap">
        {notes?.map((note) => (
          <div key={note._id} className="rounded-xl shadow-xl bg-white w-96 h-min p-6">
            <h2>{getUser(note.userId)?.name}</h2>
            <p>{note.body}</p>
          </div>
        ))}
      </div>
      <div className='flex flex-col'>
        <form className='flex flex-col' onSubmit={handleSubmit}>
          <textarea value={note} onChange={(e) => setNote(e.target.value)} cols={30} rows={10}></textarea>
          <button type="submit">Submit</button>
        </form>
      </div>
    </main>
  )
}