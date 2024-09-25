import Link from 'next/link'
import Participants from '@/components/participants'
import { Button } from '@/components/ui/button'
import { faTrash } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Doc, Id } from '@convex/_generated/dataModel'
import React from 'react'

interface RetroCardProps extends React.HTMLAttributes<HTMLDivElement> {
  retro: Doc<'retros'> | any
  handleClick: (retroId: Id<'retros'> | undefined) => void
  isOwner: (retro: Doc<'retros'>) => boolean
  formatDate: (date: any) => string
  secondaryActionText: string
}

export default function RetroCard(props: RetroCardProps) {
  const {
    retro,
    handleClick,
    isOwner,
    formatDate,
    secondaryActionText,
    ...rest
  } = props

  return (
    <Card {...rest}>
      <CardHeader>
        <div className="flex justify-between gap-x-6">
          <div>
            <CardTitle className="mb-1">{retro?.name}</CardTitle>
            <CardDescription>
              Created by {retro?.owner?.name ?? ''}
              {isOwner(retro) && ' (you)'}{' '}
              <span className="text-zinc-400">
                | {formatDate(retro?._creationTime)}
              </span>
            </CardDescription>
          </div>
          <div className="hidden shrink-0 sm:flex sm:flex-col sm:items-end">
            <Participants size={40} users={retro?.users} />
          </div>
        </div>
      </CardHeader>
      <CardFooter className="flex gap-4">
        <Link href={`/retro/${retro?._id}`}>
          <Button variant="outline">Open retro</Button>
        </Link>

        {isOwner(retro) && (
          <Button variant="secondary" onClick={() => handleClick(retro?._id)}>
            <FontAwesomeIcon icon={faTrash} className="mr-2 h-4 w-4" />
            {secondaryActionText}
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
