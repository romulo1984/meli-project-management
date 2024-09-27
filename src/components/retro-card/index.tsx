import React from 'react'
import Participants from '@/components/participants'
import { Button } from '@/components/ui/button'
import { IconDefinition } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Link from 'next/link'
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Doc, Id } from '@convex/_generated/dataModel'

type Action = {
  text: string
  onClick: () => void
  show?: boolean
  icon?: IconDefinition
  href?: string
  variant?:
    | 'link'
    | 'secondary'
    | 'outline'
    | 'default'
    | 'destructive'
    | 'ghost'
    | null
    | undefined
}

interface RetroCardProps extends React.HTMLAttributes<HTMLDivElement> {
  retro: Doc<'retros'> | any
  isOwner: (retro: Doc<'retros'>) => boolean
  actions: Action[]
}

const formatDate = (date: any) =>
  new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

export default function RetroCard(props: RetroCardProps) {
  const { retro, isOwner, actions, ...rest } = props

  return (
    <Card {...rest}>
      <CardHeader>
        <div className="flex justify-between gap-x-6">
          <div>
            <Link href={`/retro/${retro?._id}`}>
              <CardTitle className="mb-1">{retro?.name}</CardTitle>
            </Link>
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
        {actions
          ?.filter(({ show = true }) => show)
          ?.map(({ text, variant, icon, onClick }, index) => (
            <Button
              key={index}
              variant={variant ?? 'outline'}
              onClick={onClick}
            >
              {icon && <FontAwesomeIcon icon={icon} className="mr-2 h-4 w-4" />}
              {text}
            </Button>
          ))}
      </CardFooter>
    </Card>
  )
}
