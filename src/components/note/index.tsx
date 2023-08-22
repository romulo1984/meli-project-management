'use client'
import { Doc, Id } from '@convex/_generated/dataModel'
import Image from 'next/image'
import RandomNames from '@/helpers/randomNames'

interface NoteProps {
  note: Doc<'notes'>
  user: Doc<'users'> | undefined | null
  me?: Doc<'users'> | undefined | null
  removeHandler?: (id: Id<'notes'>) => void
}

export default function Note (props: NoteProps) {
  const { note, user, me, removeHandler } = props

  const isOwner = me?._id === user?._id

  const isAnonymous = note.anonymous !== undefined && note.anonymous === true

  return (
    <div className='w-full bg-white rounded-lg p-3 mb-4 text-zinc-500 text-sm shadow'>
      <p className='mb-2'>{note.body}</p>
      <div className='flex justify-between items-center'>
        {!isAnonymous ? (
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
        ) : (
          <div>
            <svg className='h-[20px] w-[20px] fill-zinc-400 inline-block mr-2' xmlns='http://www.w3.org/2000/svg' height='1em' viewBox='0 0 512 512'>
              <path d='M464 256A208 208 0 1 0 48 256a208 208 0 1 0 416 0zM0 256a256 256 0 1 1 512 0A256 256 0 1 1 0 256zm169.8-90.7c7.9-22.3 29.1-37.3 52.8-37.3h58.3c34.9 0 63.1 28.3 63.1 63.1c0 22.6-12.1 43.5-31.7 54.8L280 264.4c-.2 13-10.9 23.6-24 23.6c-13.3 0-24-10.7-24-24V250.5c0-8.6 4.6-16.5 12.1-20.8l44.3-25.4c4.7-2.7 7.6-7.7 7.6-13.1c0-8.4-6.8-15.1-15.1-15.1H222.6c-3.4 0-6.4 2.1-7.5 5.3l-.4 1.2c-4.4 12.5-18.2 19-30.6 14.6s-19-18.2-14.6-30.6l.4-1.2zM224 352a32 32 0 1 1 64 0 32 32 0 1 1 -64 0z'/>
            </svg>
            <span className='text-zinc-400 text-xs'>{isOwner ? 'You' : RandomNames()}</span>
          </div>
        )}
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