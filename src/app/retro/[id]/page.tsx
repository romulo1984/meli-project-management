'use client'
import { useState } from 'react'
import useRetro from '@/helpers/hooks/useRetro'
import { Id } from '@convex/_generated/dataModel'
import { useMutation } from 'convex/react'
import { api } from '@convex/_generated/api'
import Note from '@/components/note'
import NoteForm from '@/components/note-form'
import { useUser } from '@clerk/clerk-react'
import NotLoggedAlert from '@/components/not-logged-alert'
import Participants from '@/components/participants'
import { useJoinRetro } from '@/helpers/hooks/useJoinRetro'
import Loading from '@/components/loading'
import InlineEditName from '@/components/inline-edit-name'

interface RetroProps {
  params: {
    id: Id<'retros'>
  }
}

export default function Retro(props: RetroProps) {
  const retroId = props.params.id
  const [note, setNote] = useState({ body: '', anonymous: false })
  const [pipeline, setPipeline] = useState<'good' | 'bad' | 'action'>('good')
  const [opened, setOpened] = useState({ bad: false, good: false, action: false })
  const { isLoading, retro, notes, users, me } = useRetro({ retroId })
  const CreateNote = useMutation(api.notes.store)
  const RemoveNote = useMutation(api.notes.remove)
  const { isSignedIn } = useUser()
  useJoinRetro({ retroId })

  const getUser = (id: string) => users?.find((user) => user?._id === id)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    if (retro && me) {
      CreateNote({ body: note.body, pipeline, retroId: retro?._id, userId: me._id, anonymous: note.anonymous })
      setOpened({ good: false, bad: false, action: false })
    }
    setNote({ body: '', anonymous: false })
  }

  const toggleOpened = (pipeline: 'good' | 'bad' | 'action') => {
    setPipeline(pipeline)
    setOpened({ good: false, bad: false, action: false, [pipeline]: !opened[pipeline] })
  }

  const badNotes = notes?.filter((note) => note.pipeline === 'bad')
  const goodNotes = notes?.filter((note) => note.pipeline === 'good')
  const actionNotes = notes?.filter((note) => note.pipeline === 'action')

  const formatDate = (date: any) => (new Date(date)).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  return (
    <main className='container mx-auto min-h-screen max-w-screen-xl py-6 px-6 flex flex-col'>
      {isLoading ? <Loading /> : (
        <>
          <div className='flex justify-between items-center mb-8'>
            <div className='flex flex-col w-full'>
              <InlineEditName
                disabled={retro?.ownerId !== me?._id}
                retroId={retro?._id}
                value={retro?.name}
              />
              <p className='text-sm text-zinc-400'>
                Created in {formatDate(retro?._creationTime)}
              </p>
            </div>
            <Participants users={users} />
          </div>
          {!isSignedIn && <NotLoggedAlert />}
          <div className='flex gap-6'>
            <div className='w-full bg-zinc-100 rounded-lg p-4'>
              <div className='flex justify-between'>
                <h3 className='text-lg text-zinc-500 mb-4'>Good</h3>
                <p className='text-zinc-400'>
                  {goodNotes?.length}
                </p>
              </div>
              {isSignedIn && <NoteForm
                opened={opened.good}
                toggleOpened={() => toggleOpened('good')}
                newNote={note}
                setNewNote={setNote}
                saveHandler={handleSubmit}
              />}
              {goodNotes?.map((note) => (
                <Note
                  key={note._id}
                  note={note}
                  user={getUser(note.userId)}
                  me={me}
                  removeHandler={() => RemoveNote({ id: note._id })}
                />
              ))}
            </div>
            <div className='w-full bg-zinc-100 rounded-lg p-4'>
              <div className='flex justify-between'>
                <h3 className='text-lg text-zinc-500 mb-4'>Bad</h3>
                <p className='text-zinc-400'>
                  {badNotes?.length}
                </p>
              </div>
              {isSignedIn && <NoteForm
                opened={opened.bad}
                toggleOpened={() => toggleOpened('bad')}
                newNote={note}
                setNewNote={setNote}
                saveHandler={handleSubmit}
              />}
              {badNotes?.map((note) => (
                <Note
                  key={note._id}
                  note={note} 
                  user={getUser(note.userId)}
                  me={me}
                  removeHandler={() => RemoveNote({ id: note._id })}
                />
              ))}
            </div>
            <div className='w-full bg-zinc-100 rounded-lg p-4'>
              <div className='flex justify-between'>
                <h3 className='text-lg text-zinc-500 mb-4'>Actions</h3>
                <p className='text-zinc-400'>
                  {actionNotes?.length}
                </p>
              </div>
              {isSignedIn && <NoteForm
                opened={opened.action}
                toggleOpened={() => toggleOpened('action')}
                newNote={note}
                setNewNote={setNote}
                saveHandler={handleSubmit}
              />}
              {actionNotes?.map((note) => (
                <Note
                  key={note._id}
                  note={note} 
                  user={getUser(note.userId)}
                  me={me}
                  removeHandler={() => RemoveNote({ id: note._id })}
                />
              ))}
            </div>
          </div>
        </>
      )}
    </main>
  )
}