interface NotLoggedAlertProps {
  onAction?: () => void
}

export default function NotLoggedAlert({ onAction }: NotLoggedAlertProps) {
  return (
    <div className="bg-zinc-50 rounded-lg p-4 mb-4 flex flex-col sm:flex-row items-center justify-center gap-3 text-center">
      <h3 className="text-lg text-zinc-400">
        Set a display name to add and manage notes
      </h3>
      {onAction && (
        <button
          type="button"
          onClick={onAction}
          className="text-sm rounded-full bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-500 transition-colors"
        >
          Set your name
        </button>
      )}
    </div>
  )
}
