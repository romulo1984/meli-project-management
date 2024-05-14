import { api } from "@convex/_generated/api"
import { Id } from "@convex/_generated/dataModel"
import { useMutation } from "convex/react"
import { useState } from "react"

type SettingsItem<T> = {
    key: string
    label: string
    value: T
}
export type NotesShowingStatus = 'showing' | 'hidden'
export interface Settings {
    notesShowingStatus: SettingsItem<NotesShowingStatus>
}

interface UseSettingsProps {
    retroId: Id<'retros'>
    default: Settings
}

type SettingHandler = (value: string, currentState: Settings) => Settings

const useSettings = (props: UseSettingsProps) => {
    const retroId = props.retroId
    const [settings, setSettings] = useState(props.default)
    const UpdateNotesShowingStatus = useMutation(api.retros.updateNotesShowingStatus)
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
            }
        }

        return mapping[name]
    }

    const handleSettingChange = (settingName: string) => {
        const handler = settingToHandler(settings, settingName)

        if (!handler) {
            throw new Error('Failed to handle setting change')
        }

        const newSettingsState = handler(settingName, settings)
        setSettings(newSettingsState)
    }

    return {
        settings,
        handleSettingChange
    }
}

export default useSettings