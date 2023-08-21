'use client'
import { Doc, Id } from '@convex/_generated/dataModel'
import Image from 'next/image'

interface NoteProps {
  note: Doc<'notes'>
  user: Doc<'users'> | undefined | null
  me?: Doc<'users'> | undefined | null
  removeHandler?: (id: Id<'notes'>) => void
}

export default function Note (props: NoteProps) {
  const { note, user, me, removeHandler } = props

  const isOwner = me?._id === user?._id

  return (
    <div className='w-full bg-white rounded-lg p-3 mb-4 text-zinc-500 text-sm shadow'>
      <p className='mb-2'>{note.body}</p>
      <div className='flex justify-between items-center'>
        <div>
          <Image
            alt={user?.name || ''}
            className='w-6 h-6 rounded-full inline-block mr-2'
            src={user?.avatar || ''}
            width={24}
            height={24}
          />
          <span className='text-zinc-400 text-xs'>{isOwner ? 'You' : user?.name}</span>
        </div>
        {isOwner && <div className='flex gap-2'>
          <svg
            className='cursor-pointer fill-zinc-400 hover:fill-red-500'
            onClick={() => removeHandler && removeHandler(note._id)}
            xmlns="http://www.w3.org/2000/svg"
            height="1em"
            viewBox="0 0 448 512"
            fill='currentColor'
          >
            <path d="M135.2 17.7L128 32H32C14.3 32 0 46.3 0 64S14.3 96 32 96H416c17.7 0 32-14.3 32-32s-14.3-32-32-32H320l-7.2-14.3C307.4 6.8 296.3 0 284.2 0H163.8c-12.1 0-23.2 6.8-28.6 17.7zM416 128H32L53.2 467c1.6 25.3 22.6 45 47.9 45H346.9c25.3 0 46.3-19.7 47.9-45L416 128z"/>
          </svg>
        </div>}
      </div>
    </div>
  )
}