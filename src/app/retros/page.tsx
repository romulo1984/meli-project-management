'use client'
import useMyRetros from '@/helpers/hooks/useMyRetros'
import Loading from '@/components/loading'

import { api } from '@convex/_generated/api'
import { useMutation } from 'convex/react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { faTrash, faRotateLeft } from '@fortawesome/free-solid-svg-icons'

import { Doc, Id } from '@convex/_generated/dataModel'
import RetroCard from '@/components/retro-card'
import { useRouter } from 'next/navigation'

export default function Retros() {
  const router = useRouter()
  const { retros, isLoading, me } = useMyRetros()
  const ArchiveRetro = useMutation(api.retros.updateStatus)

  const isOwner = (retro: any) => retro?.ownerId === me?._id

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
                  isOwner={isOwner}
                  actions={[
                    {
                      text: 'Open Retro',
                      onClick: () => router.push(`/retro/${retro._id}`),
                    },
                    {
                      text: 'Archive',
                      show: isOwner(retro),
                      onClick: () => handleArchiveClick(retro._id),
                      variant: 'secondary',
                      icon: faTrash,
                    },
                  ]}
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
                  isOwner={isOwner}
                  actions={[
                    {
                      text: 'Open Retro',
                      onClick: () => router.push(`/retro/${retro._id}`),
                    },
                    {
                      text: 'Restore',
                      show: isOwner(retro),
                      onClick: () => handleActiveClick(retro._id),
                      variant: 'secondary',
                      icon: faRotateLeft,
                    },
                  ]}
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
