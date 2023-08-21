'use client'
import { Doc } from '@convex/_generated/dataModel'
import Image from 'next/image'

interface NoteProps {
  note: Doc<'notes'>
  user: Doc<'users'> | undefined | null
}

export default function Note (props: NoteProps) {
  const { note, user } = props

  return (
    <div className='w-full bg-white rounded-lg p-3 mb-4 text-zinc-500 text-sm shadow'>
      <p className='mb-2'>{note.body}</p>
      <div>
        <Image
          alt={user?.name || ''}
          className='w-6 h-6 rounded-full inline-block mr-2'
          src={user?.avatar || ''}
          width={24}
          height={24}
        />
        <span className='text-zinc-400 text-xs'>{user?.name}</span>
      </div>
    </div>
  )
}