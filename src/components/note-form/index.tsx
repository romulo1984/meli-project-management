import CapitalizeFirstLetter from "@/helpers/commons";
import "./styles.scss";
import useVoiceToText from "@/helpers/voiceToText";
import { useEffect } from "react";
import { MentionsInput, Mention } from "react-mentions";
import { Doc } from "@convex/_generated/dataModel";
import Image from "next/image";

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
  const { recognizing, text, startRecognition } = useVoiceToText();

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    saveHandler(e);
  };

  const transcript = () => {
    setNewNote?.({ ...newNote, body: "" });
    startRecognition();
  };

  useEffect(() => {
    if (text !== "") {
      setNewNote?.({ ...newNote, body: CapitalizeFirstLetter(text) });
    }
  }, [text]);

  const renderSuggestion = (
    suggestion: any,
    search: string,
    highlightedDisplay: any,
    index: number,
    focused: boolean
  ) => (
    <div className="inside-item">
      <Image
        width={24}
        height={24}
        className="w-6 h-6 me-2 rounded-full"
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
              rows={4}
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
              <div className="flex items-center">
                <input
                  id="anonymous-checkbox"
                  type="checkbox"
                  checked={newNote.anonymous}
                  onChange={(e) =>
                    setNewNote?.({ ...newNote, anonymous: e.target.checked })
                  }
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
                <label
                  htmlFor="anonymous-checkbox"
                  className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300"
                >
                  Anonymous
                </label>
              </div>
              <div className="flex justify-end">
                <button
                  onClick={toggleOpened}
                  type="button"
                  className="bg-zinc-200 hover:bg-zinc-300 py-2 px-4 rounded-full text-center mr-2"
                >
                  <svg
                    className="fill-zinc-500"
                    xmlns="http://www.w3.org/2000/svg"
                    height="1em"
                    viewBox="0 0 384 512"
                  >
                    <path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z" />
                  </svg>
                </button>
                <button
                  disabled={recognizing}
                  onClick={transcript}
                  type="button"
                  className="bg-zinc-200 hover:bg-zinc-300 py-2 px-4 rounded-full text-center mr-2"
                >
                  <svg
                    className={`fill-zinc-500 ${
                      recognizing ? "selected-svg" : ""
                    }`}
                    xmlns="http://www.w3.org/2000/svg"
                    height="1em"
                    viewBox="0 0 384 512"
                  >
                    <path d="M192 0C139 0 96 43 96 96V256c0 53 43 96 96 96s96-43 96-96V96c0-53-43-96-96-96zM64 216c0-13.3-10.7-24-24-24s-24 10.7-24 24v40c0 89.1 66.2 162.7 152 174.4V464H120c-13.3 0-24 10.7-24 24s10.7 24 24 24h72 72c13.3 0 24-10.7 24-24s-10.7-24-24-24H216V430.4c85.8-11.7 152-85.3 152-174.4V216c0-13.3-10.7-24-24-24s-24 10.7-24 24v40c0 70.7-57.3 128-128 128s-128-57.3-128-128V216z" />
                  </svg>
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 py-2 px-6 rounded-lg text-center self-end"
                >
                  <span className="font-normal text-white">Save</span>
                </button>
              </div>
            </div>
          </>
        ) : (
          <button
            onClick={toggleOpened}
            type="button"
            className="bg-zinc-200 hover:bg-zinc-300 p-4 mb-2 w-full rounded-xl text-center"
          >
            <span className="font-normal text-zinc-500">Write note</span>
          </button>
        )}
      </form>
    </div>
  );
}
