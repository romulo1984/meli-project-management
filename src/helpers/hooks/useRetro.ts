import { useState, useEffect } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { useUser } from '@clerk/clerk-react'
import { api } from '@convex/_generated/api'
import { Id } from '@convex/_generated/dataModel'

interface useRetroProps {
  retroId: Id<'retros'>
}

const useRetro = (props: useRetroProps) => {
  const { retroId } = props
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useUser()

  const UpdateTimer = useMutation(api.retros.updateTimer)
  const retro = useQuery(api.retros.get, { id: retroId })
  const notes = retro?.notes
  const users = retro?.users

  const me = users?.find((u) => u?.tokenIdentifier === user?.id)

  const setTimer = (timer: number) => UpdateTimer({ id: retroId, timer })
  const startTimer = () => UpdateTimer({ id: retroId, timerStatus: 'started', startTimer: new Date().getTime() })
  const resetTimer = () => UpdateTimer({ id: retroId, timerStatus: 'not_started', startTimer: 0 })

  useEffect(() => {
    if (retro && notes && users) {
      setIsLoading(false)
    }
  }, [retro, notes, users])

  return {
    isLoading,
    retro,
    notes,
    users,
    me,
    setTimer,
    startTimer,
    resetTimer
  }
}

export default useRetro