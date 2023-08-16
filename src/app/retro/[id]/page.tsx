'use client'
import { useMutation, useQuery } from 'convex/react'
import { api } from '@convex/_generated/api'
import { Id } from '@convex/_generated/dataModel'

export default function Retro({ params }: { params: { id: string } }) {
  const retroId = params.id
  const retro = useQuery(api.retros.get, { id: retroId as Id<'retros'> })
  const notes = useQuery(api.notes.getRetroNotes, { retroId: retroId as Id<'retros'> })
  const users = useQuery(api.users.getRetroUsers, { retroId: retroId as Id<'retros'> })

  const getUser = (id: string) => users?.find((user) => user._id === id)
  
  return (
    <main className="flex min-h-screen justify-center gap-6 p-24">
      <h2>{retro?.name}</h2>
      {notes?.map((note) => (
        <div key={note._id} className="rounded-xl shadow-xl bg-white w-96 h-min p-6">
          <h2>{getUser(note.userId)?.name}</h2>
          <p>{note.body}</p>
        </div>
      ))}
    </main>
  )
}