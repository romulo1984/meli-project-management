'use client'
import useMyRetros from '@/helpers/hooks/useMyRetros'
import Loading from '@/components/loading'
import { Doc } from '@convex/_generated/dataModel'
import Link from 'next/link'

export default function Retros() {
  const { retros, isLoading, me } = useMyRetros()

  const isOwner = (retro: Doc<'retros'> | null) => retro?.ownerId === me?._id
  const formatDate = (date: any) => (new Date(date)).toLocaleDateString('pt-BR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  return (
    <ul role='list' className='container mx-auto min-h-screen max-w-screen-xl py-6 px-6 flex flex-col'>
      {isLoading ? <Loading /> : (
        retros.map((retro) => (
          <Link href={`/retro/${retro?._id}`} key={retro?._id} className="flex justify-between gap-x-6 py-5">
            <div className="flex min-w-0 gap-x-4">
              <div className="min-w-0 flex-auto">
                <p className="text-sm font-semibold leading-6 text-gray-900">{retro?.name}</p>
                <p className="mt-1 truncate text-xs leading-5 text-gray-500">
                  {isOwner(retro) ? 'Created by me' : 'Created by another person'}
                </p>
              </div>
            </div>
            <div className="hidden shrink-0 sm:flex sm:flex-col sm:items-end">
              <p className="text-sm leading-6 text-gray-900">{formatDate(retro?._creationTime)}</p>
            </div>
          </Link>
        )))}
    </ul>
  )
}