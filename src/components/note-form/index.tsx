interface NoteFormProps {
  newNote: string
  saveHandler: (e: React.FormEvent<HTMLFormElement>) => void
  setNewNote?: (note: string) => void
  toggleOpened?: () => void
  opened: boolean
}

export default function NoteForm (props: NoteFormProps) {
  const { saveHandler, setNewNote, toggleOpened, newNote, opened } = props

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    saveHandler(e)
  }

  return (
    <div>
      <form className='flex flex-col mb-4' onSubmit={onSubmit}>
        {opened ?
          <>
            <textarea
              className='w-full bg-zinc-200 hover:bg-zinc-300 text-gray-800 p-4 mb-2 w-full rounded-lg'
              value={newNote}
              onChange={(e) => setNewNote?.(e.target.value)}
              rows={4}
            />
            <div className='flex justify-end'>
              <button
                onClick={toggleOpened}
                type='button'
                className='bg-zinc-200 hover:bg-zinc-300 py-2 px-6 mb-2 rounded-lg text-center mr-2'
              >
                <span className='font-normal text-zinc-500'>Cancel</span>
              </button>
              <button
                type='submit'
                className='bg-indigo-600 hover:bg-indigo-700 py-2 px-6 mb-2 rounded-lg text-center self-end'
              >
                <span className='font-normal text-white'>Write note</span>
              </button>
            </div>
          </>
        :
          <button
            onClick={toggleOpened}
            type='button'
            className='bg-zinc-200 hover:bg-zinc-300 p-4 mb-2 w-full rounded-xl text-center'
          >
            <span className='font-normal text-zinc-500'>Write note</span>
          </button>
        }
      </form>
    </div>
  )
}