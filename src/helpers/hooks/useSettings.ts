import { api } from "@convex/_generated/api"
import { Id } from "@convex/_generated/dataModel"
import { useMutation } from "convex/react"

type SettingsItem<T> = {
  key: string
  label: string
  value: T
}
export type NotesShowingStatus = 'showing' | 'hidden'
export type HighlightMode = 'enabled' | 'disabled'
export interface Settings {
  notesShowingStatus: SettingsItem<NotesShowingStatus>
  highlightMode: SettingsItem<HighlightMode>
}

type SettingHandler = (value: string, currentState: Settings) => Settings

interface UseSettingsProps {
  retroId: Id<'retros'>
}

const useSettings = (props: UseSettingsProps) => {
  const retroId = props.retroId
  const UpdateNotesShowingStatus = useMutation(api.retros.updateNotesShowingStatus)
  const UpdateHighlightModeStatus = useMutation(api.retros.updateHighlightModeStatus)
  const settingToHandler = (settings : Settings, name: string) : SettingHandler => {
    const mapping = {
      [settings.notesShowingStatus.key]: (_value: string, { notesShowingStatus, ...rest} : Settings) : Settings => {
        const newStatus = {
          'showing': 'hidden',
          'hidden': 'showing'
        }

        notesShowingStatus.value = newStatus[notesShowingStatus.value] as NotesShowingStatus
        UpdateNotesShowingStatus({
          id: retroId,
          status: notesShowingStatus.value
        })

        return {
          ...rest,
          notesShowingStatus
        }
      },
      [settings.highlightMode.key]: (_value: string,  s: Settings) : Settings => {
        const map = {
          'enabled': 'disabled',
          'disabled': 'enabled',
        }

        UpdateHighlightModeStatus({
          id: retroId,
          status: map[s.highlightMode.value]
        })

        return {
          ...s
        }
      }
    }

    return mapping[name]
  }

  const handleSettingChange = (settingName: string, settings: Settings) => {
    const handler = settingToHandler(settings, settingName)

    if (!handler) {
      throw new Error('Failed to handle setting change')
    }

    handler(settingName, settings)
  }

  return {
    handleSettingChange
  }
}

export default useSettings
