import { Doc } from '@convex/_generated/dataModel'
import Image from 'next/image'

interface ParticipantsProps {
  users: Array<Doc<'users'> | null> | undefined
  size?: number
}

export default function Participants (props: ParticipantsProps) {
  const { users, size } = props

  const sizeClass = size ? `h-[${size}]` : 'h-[32]'

  return (
    <div className='flex mr-2'>
      {users?.map((user) => (
        <div className={`hover:scale-125 transition-transform flex items-center shadow rounded-full p-0 -mr-2 z-1 ${sizeClass}`} key={user?._id}>
          <Image
            className='rounded-full'
            alt={user?.name || ''}
            title={user?.name || ''}
            src={user?.avatar || ''}
            width={size ?? 32}
            height={size ?? 32}
          />
        </div>
      ))}
    </div>
  )
}