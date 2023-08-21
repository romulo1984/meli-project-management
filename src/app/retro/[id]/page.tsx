'use client'
import { useState } from 'react'
import useRetro from '@/helpers/hooks/useRetro'
import { Id } from '@convex/_generated/dataModel'
import { useMutation } from 'convex/react'
import { api } from '@convex/_generated/api'
import Note from '@/components/note'
import NoteForm from '@/components/note-form'

interface RetroProps {
  params: {
    id: Id<'retros'>
  }
}

export default function Retro(props: RetroProps) {
  const retroId = props.params.id
  const [note, setNote] = useState('')
  const [pipeline, setPipeline] = useState<'good' | 'bad' | 'action'>('good')
  const [opened, setOpened] = useState({ bad: false, good: false, action: false })
  const {retro, notes, users} = useRetro({ retroId })
  const CreateNote = useMutation(api.notes.store)

  const getUser = (id: string) => users?.find((user) => user?._id === id)
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    const firstUser = users?.[0]
    if (retro && firstUser) {
      CreateNote({ body: note, pipeline, retroId: retro?._id, userId: firstUser._id })
    }
    setNote('')
  }

  const toggleOpened = (pipeline: 'good' | 'bad' | 'action') => {
    setPipeline(pipeline)
    setOpened({ good: false, bad: false, action: false, [pipeline]: !opened[pipeline] })
  }

  const badNotes = notes?.filter((note) => note.pipeline === 'bad')
  const goodNotes = notes?.filter((note) => note.pipeline === 'good')
  const actionNotes = notes?.filter((note) => note.pipeline === 'action')

  return (
    <main className='container mx-auto min-h-screen max-w-screen-xl py-6 px-6 flex flex-col'>
      <h2 className='text-xl text-zinc-600 mb-8'>{retro?.name}</h2>
      <div className='flex gap-6'>
        <div className='w-full bg-zinc-100 rounded-lg p-4'>
          <h3 className='text-lg text-zinc-500 mb-4'>Good</h3>
          <NoteForm
            opened={opened.good}
            toggleOpened={() => toggleOpened('good')}
            newNote={note}
            setNewNote={setNote}
            saveHandler={handleSubmit}
          />
          {goodNotes?.map((note) => (
            <Note key={note._id} note={note} user={getUser(note.userId)} />
          ))}
        </div>
        <div className='w-full bg-zinc-100 rounded-lg p-4'>
          <h3 className='text-lg text-zinc-500 mb-4'>Bad</h3>
          <NoteForm
            opened={opened.bad}
            toggleOpened={() => toggleOpened('bad')}
            newNote={note}
            setNewNote={setNote}
            saveHandler={handleSubmit}
          />
          {badNotes?.map((note) => (
            <Note key={note._id} note={note} user={getUser(note.userId)} />
          ))}
        </div>
        <div className='w-full bg-zinc-100 rounded-lg p-4'>
          <h3 className='text-lg text-zinc-500 mb-4'>Actions</h3>
          <NoteForm
            opened={opened.action}
            toggleOpened={() => toggleOpened('action')}
            newNote={note}
            setNewNote={setNote}
            saveHandler={handleSubmit}
          />
          {actionNotes?.map((note) => (
            <Note key={note._id} note={note} user={getUser(note.userId)} />
          ))}
        </div>
      </div>
    </main>
  )
}