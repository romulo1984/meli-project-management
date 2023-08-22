type Note = {
  body: string
  anonymous: boolean
}

interface NoteFormProps {
  newNote: Note
  saveHandler: (e: React.FormEvent<HTMLFormElement>) => void
  setNewNote?: (note: Note) => void
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
              value={newNote.body}
              onChange={(e) => setNewNote?.({ ...newNote, body: e.target.value })}
              rows={4}
            />
            <div className='flex justify-between items-center'>
              <div className="flex items-center">
                <input
                  id='anonymous-checkbox'
                  type='checkbox'
                  checked={newNote.anonymous}
                  onChange={(e) => setNewNote?.({ ...newNote, anonymous: e.target.checked })}
                  className='w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600'
                />
                <label htmlFor='anonymous-checkbox' className='ml-2 text-sm font-medium text-gray-900 dark:text-gray-300'>Anonymous</label>
              </div>
              <div className='flex justify-end'>
                <button
                  onClick={toggleOpened}
                  type='button'
                  className='bg-zinc-200 hover:bg-zinc-300 py-2 px-4 rounded-full text-center mr-2'
                >
                  <svg className='fill-zinc-500' xmlns='http://www.w3.org/2000/svg' height='1em' viewBox='0 0 384 512'>
                    <path d='M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z'/>
                  </svg>
                </button>
                <button
                  type='submit'
                  className='bg-indigo-600 hover:bg-indigo-700 py-2 px-6 rounded-lg text-center self-end'
                >
                  <span className='font-normal text-white'>Save note</span>
                </button>
              </div>
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