import { Doc } from "@convex/_generated/dataModel"
import Image from 'next/image'

interface ParticipantsProps {
  users: Array<Doc<'users'> | null> | undefined
}

export default function Participants (props: ParticipantsProps) {
  const { users } = props

  return (
    <div className='flex mr-2'>
      {users?.map((user) => (
        <div className='flex items-center shadow rounded-full h-[32px] p-0 -mr-2 z-1' key={user?._id}>
          <Image
            className='rounded-full'
            alt={user?.name || ''}
            title={user?.name || ''}
            src={user?.avatar || ''}
            width={32}
            height={32}
          />
        </div>
      ))}
    </div>
  )
}