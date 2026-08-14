import CapitalizeFirstLetter from "@/helpers/commons";
import "./styles.scss";
import useVoiceToText from "@/helpers/voiceToText";
import { MentionsInput, Mention } from "react-mentions";
import { Doc } from "@convex/_generated/dataModel";
import { Check } from "lucide-react";

type Note = {
  body: string;
  anonymous: boolean;
};

interface NoteFormProps {
  newNote: Note;
  saveHandler: (e: React.FormEvent<HTMLFormElement>) => void;
  setNewNote?: (note: Note) => void;
  toggleOpened?: () => void;
  opened: boolean;
  users: Doc<"users">[] | any;
}

export default function NoteForm(props: NoteFormProps) {
  const { saveHandler, setNewNote, toggleOpened, newNote, opened, users } =
    props;
  const { recognizing, startRecognition, stopRecognition } = useVoiceToText(
    (spokenText) => {
      setNewNote?.({ ...newNote, body: CapitalizeFirstLetter(spokenText) });
    }
  );

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    stopRecognition();
    saveHandler(e);
  };

  // Toggle dictation: start fresh (clearing the field) or stop if listening.
  const toggleDictation = () => {
    if (recognizing) {
      stopRecognition();
      return;
    }
    setNewNote?.({ ...newNote, body: "" });
    startRecognition();
  };

  // Closing the form must also cancel any in-flight dictation.
  const handleClose = () => {
    stopRecognition();
    toggleOpened?.();
  };

  const renderSuggestion = (
    suggestion: any,
    _search: string,
    _highlightedDisplay: any,
    _index: number,
    _focused: boolean
  ) => (
    <div className="inside-item">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        width={24}
        height={24}
        className="w-6 h-6 me-2 rounded-full object-cover object-center"
        src={suggestion.avatar}
        alt={suggestion.display}
      />
      {suggestion.display}
    </div>
  );

  return (
    <div>
      <form className="flex flex-col mb-4" onSubmit={onSubmit}>
        {opened ? (
          <>
            <MentionsInput
              className="mentions-note-input"
              placeholder={
                recognizing ? "Listening..." : "Write your note here..."
              }
              disabled={recognizing}
              value={newNote.body}
              singleLine={false}
              onChange={(e) =>
                setNewNote?.({ ...newNote, body: e.target.value })
              }
              onKeyDown={(e) => {
                if (e.metaKey && e.key == "Enter") {
                  document.getElementById('btn-note-form-submit')?.click()
                }
              }}
              rows={4}
              autoFocus
              required
            >
              <Mention
                trigger="@"
                data={users.map((user: Doc<"users">) => ({
                  id: user._id,
                  display: user.name,
                  avatar: user.avatar,
                }))}
                renderSuggestion={renderSuggestion}
                style={{
                  backgroundColor: "#f472b65e",
                  borderRadius: "3px",
                  padding: "1px 0",
                }}
              />
            </MentionsInput>
            <div className="flex justify-between items-center">
              <label className="flex cursor-pointer select-none items-center gap-2 text-sm text-zinc-500">
                <input
                  id="anonymous-checkbox"
                  type="checkbox"
                  checked={newNote.anonymous}
                  onChange={(e) =>
                    setNewNote?.({ ...newNote, anonymous: e.target.checked })
                  }
                  className="peer sr-only"
                />
                <span className="flex h-5 w-5 items-center justify-center rounded-md border border-zinc-300 bg-white text-white transition-colors peer-checked:border-indigo-600 peer-checked:bg-indigo-600 peer-focus-visible:ring-2 peer-focus-visible:ring-indigo-200">
                  <Check className="h-3.5 w-3.5" strokeWidth={3} />
                </span>
                Anonymous
              </label>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleClose}
                  type="button"
                  title="Cancel"
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-100 text-zinc-500 transition-colors hover:bg-zinc-200"
                >
                  <svg
                    className="h-3.5 w-3.5 fill-current"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 384 512"
                  >
                    <path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z" />
                  </svg>
                </button>
                <button
                  onClick={toggleDictation}
                  type="button"
                  title={recognizing ? "Stop listening" : "Dictate"}
                  aria-pressed={recognizing}
                  className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors ${
                    recognizing
                      ? "bg-red-50 text-red-600 hover:bg-red-100"
                      : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200"
                  }`}
                >
                  <svg
                    className={`h-4 w-4 fill-current ${
                      recognizing ? "animate-pulse" : ""
                    }`}
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 384 512"
                  >
                    <path d="M192 0C139 0 96 43 96 96V256c0 53 43 96 96 96s96-43 96-96V96c0-53-43-96-96-96zM64 216c0-13.3-10.7-24-24-24s-24 10.7-24 24v40c0 89.1 66.2 162.7 152 174.4V464H120c-13.3 0-24 10.7-24 24s10.7 24 24 24h72 72c13.3 0 24-10.7 24-24s-10.7-24-24-24H216V430.4c85.8-11.7 152-85.3 152-174.4V216c0-13.3-10.7-24-24-24s-24 10.7-24 24v40c0 70.7-57.3 128-128 128s-128-57.3-128-128V216z" />
                  </svg>
                </button>
                <button
                  id="btn-note-form-submit"
                  type="submit"
                  className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-500"
                >
                  Save
                </button>
              </div>
            </div>
          </>
        ) : (
          <button
            onClick={toggleOpened}
            type="button"
            className="mb-2 w-full rounded-xl border border-dashed border-zinc-200 bg-white py-3 text-sm font-medium text-zinc-400 transition-colors hover:border-indigo-300 hover:bg-indigo-50/40 hover:text-indigo-500"
          >
            + Write a note
          </button>
        )}
      </form>
    </div>
  );
}
