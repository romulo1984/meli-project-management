'use client'
import { Doc, Id } from '@convex/_generated/dataModel'
import Image from 'next/image'
import RandomNames from '@/helpers/randomNames'
import SpechText from '@/helpers/spechText'
import { useMemo } from 'react'

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

  const randomName = useMemo(() => RandomNames(), [])

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
            <span className='text-zinc-400 text-xs'>{isOwner ? 'You' : randomName}</span>
          </div>
        )}
        <div className='flex justify-end items-center gap-3'>
          <div onClick={() => SpechText(note?.body)}>
            <svg className='cursor-pointer fill-zinc-400 hover:fill-blue-600' xmlns='http://www.w3.org/2000/svg' height='1em' viewBox='0 0 640 512'>
              <path d='M533.6 32.5C598.5 85.3 640 165.8 640 256s-41.5 170.8-106.4 223.5c-10.3 8.4-25.4 6.8-33.8-3.5s-6.8-25.4 3.5-33.8C557.5 398.2 592 331.2 592 256s-34.5-142.2-88.7-186.3c-10.3-8.4-11.8-23.5-3.5-33.8s23.5-11.8 33.8-3.5zM473.1 107c43.2 35.2 70.9 88.9 70.9 149s-27.7 113.8-70.9 149c-10.3 8.4-25.4 6.8-33.8-3.5s-6.8-25.4 3.5-33.8C475.3 341.3 496 301.1 496 256s-20.7-85.3-53.2-111.8c-10.3-8.4-11.8-23.5-3.5-33.8s23.5-11.8 33.8-3.5zm-60.5 74.5C434.1 199.1 448 225.9 448 256s-13.9 56.9-35.4 74.5c-10.3 8.4-25.4 6.8-33.8-3.5s-6.8-25.4 3.5-33.8C393.1 284.4 400 271 400 256s-6.9-28.4-17.7-37.3c-10.3-8.4-11.8-23.5-3.5-33.8s23.5-11.8 33.8-3.5zM301.1 34.8C312.6 40 320 51.4 320 64V448c0 12.6-7.4 24-18.9 29.2s-25 3.1-34.4-5.3L131.8 352H64c-35.3 0-64-28.7-64-64V224c0-35.3 28.7-64 64-64h67.8L266.7 40.1c9.4-8.4 22.9-10.4 34.4-5.3z' />
            </svg>
          </div>
          {isOwner &&
          <div onClick={() => removeHandler && removeHandler(note._id)}>
            <svg
              className='cursor-pointer fill-zinc-400 hover:fill-red-500'
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
    </div>
  )
}