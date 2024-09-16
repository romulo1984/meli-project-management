import { Doc } from '@convex/_generated/dataModel'
import Image from 'next/image'

import { PARTICIPANT_IMG_SIZE } from '../../helpers/constants'

interface ParticipantsProps {
  users: Array<Doc<'users'> | null> | undefined
  size?: number
}

export default function Participants(props: ParticipantsProps) {
  const { users, size } = props

  const sizeClass = PARTICIPANT_IMG_SIZE[
    size as keyof typeof PARTICIPANT_IMG_SIZE
  ]
    ? PARTICIPANT_IMG_SIZE[size as keyof typeof PARTICIPANT_IMG_SIZE]
    : PARTICIPANT_IMG_SIZE[32]

  return (
    <div className="flex mr-2">
      {users?.map(user => (
        <div
          className={`hover:scale-125 transition-transform flex items-center shadow rounded-full p-0 -mr-2 z-1 ${sizeClass}`}
          key={user?._id}
        >
          <Image
            className="rounded-full max-h-full h-full"
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
