'use client'
import useMyRetros from '@/helpers/hooks/useMyRetros'
import Loading from '@/components/loading'

import { api } from '@convex/_generated/api'
import { useMutation } from 'convex/react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { Doc, Id } from '@convex/_generated/dataModel'
import RetroCard from '@/components/repo-card'

export default function Retros() {
  const { retros, isLoading, me } = useMyRetros()
  const ArchiveRetro = useMutation(api.retros.updateStatus)

  const isOwner = (retro: any) => retro?.ownerId === me?._id
  const formatDate = (date: any) =>
    new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })

  const handleArchiveClick = (retroId: Id<'retros'> | undefined) => {
    if (retroId) {
      ArchiveRetro({
        id: retroId,
        status: 'archived',
      })
    }
  }

  const handleActiveClick = (retroId: Id<'retros'> | undefined) => {
    if (retroId) {
      ArchiveRetro({
        id: retroId,
        status: 'active',
      })
    }
  }

  const activeRetros = retros.filter(
    retro => retro.status === 'active' || retro.status === undefined,
  )
  const archivedRetros = retros.filter(retro => retro.status === 'archived')

  return (
    <div className="container mx-auto min-h-screen max-w-screen-xl py-6 px-6 flex flex-col gap-4">
      {isLoading ? (
        <Loading />
      ) : (
        <Tabs defaultValue="active" className="wx-auto">
          <TabsList>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="archived">Archived</TabsTrigger>
          </TabsList>
          <TabsContent value="active" className="flex flex-col gap-4">
            {activeRetros.length > 0 ? (
              activeRetros.map(retro => (
                <RetroCard
                  key={retro._id}
                  retro={retro as Doc<'retros'> | any}
                  handleClick={handleArchiveClick}
                  secondaryActionText="Archive"
                  isOwner={isOwner}
                  formatDate={formatDate}
                />
              ))
            ) : (
              <div className="text-center text-zinc-400 rounded-md py-10">
                <p>No active retros</p>
              </div>
            )}
          </TabsContent>
          <TabsContent value="archived" className="flex flex-col gap-4">
            {archivedRetros.length > 0 ? (
              archivedRetros.map(retro => (
                <RetroCard
                  key={retro._id}
                  retro={retro as Doc<'retros'> | any}
                  handleClick={handleActiveClick}
                  secondaryActionText="Activate"
                  isOwner={isOwner}
                  formatDate={formatDate}
                />
              ))
            ) : (
              <div className="text-center text-zinc-400 rounded-md py-10">
                <p>No archived retros</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
