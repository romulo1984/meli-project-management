"use client";
import useRetro from "@/helpers/hooks/useRetro";
import RandomNames from "@/helpers/randomNames";
import SpechText from "@/helpers/spechText";
import { api } from "@convex/_generated/api";
import { Doc, Id } from "@convex/_generated/dataModel";
import { useMutation } from "convex/react";
import Image from "next/image";
import { useMemo, useState } from "react";
import DropdownSelect from "../dropdownSelect";
import { AnonymousIcon, DeleteIcon, LikeIcon, SpeakerIcon } from "../icons";
import NoteBody from "../note-body";
import NoteForm from "../note-form";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit } from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";

interface NoteProps {
  note: Doc<"notes">
  user: Doc<"users"> | undefined | null
  me?: Doc<"users"> | undefined | null
  actionType?: boolean
  blur?: boolean
  highlighted?: boolean
  childrenNotes?: Doc<"notes">[]
  roundTop: boolean
  roundBottom: boolean
}

interface NoteStructure {
  body: string
  anonymous: boolean
}

export default function NoteCard(props: NoteProps) {
  const { note, user, me, actionType, blur = false, roundTop, roundBottom } = props;
  const { users } = useRetro({ retroId: note.retroId });
  const [speaking, setSpeaking] = useState(false);
  const [editing, setEditing] = useState({
    value: false,
    note: {
      body: note.body,
      anonymous: Boolean(note.anonymous)
    }
  })
  const [deleteIntention, setDeleteIntention] = useState(false)
  const AssigneNote = useMutation(api.notes.assigne);
  const UnnasignNote = useMutation(api.notes.unnasign);
  const UpdateNote = useMutation(api.notes.update);
  const RemoveNote = useMutation(api.notes.remove);
  const LikeNote = useMutation(api.notes.likeToggle);

  const isOwner = me?._id === user?._id;

  const isAnonymous = note.anonymous !== undefined && note.anonymous === true;
  const obfuscate = blur && !isOwner

  const randomName = useMemo(() => RandomNames(), []);

  const speechNote = () => {
    setSpeaking(true);
    SpechText(note?.body, "native").finally(() => {
      setSpeaking(false);
    });
  };

  const assigneHandler = (userId: Id<"users">) => {
    AssigneNote({ noteId: note._id, userId: userId });
  };

  const unnasignHandler = () => {
    UnnasignNote({ noteId: note._id });
  };

  const editionHandler = (data: NoteStructure) => {
    if (!isOwner) return
    UpdateNote({
      noteId: note._id,
      anonymous: data.anonymous,
      body: data.body,
    })
  }

  const assignedTo = users?.find((u) => u?._id === note.assignedTo);

  const youLiked =
    me && note.likes && note.likes.length > 0 && note.likes.includes(me._id);

  const LeftBottomIcons = () => {
    if (actionType)
      return (
        <DropdownSelect
          users={users}
          selected={assignedTo}
          assigneHandler={assigneHandler}
          unnasignHandler={unnasignHandler}
        />
      );

    if (obfuscate) {
      return (
        <div className="blur-sm">
          <AnonymousIcon />
          <span className="text-zinc-400 text-xs">Hidden</span>
        </div>
      );
    }

    if (isAnonymous)
      return (
        <div>
          <AnonymousIcon />
          <span className="text-zinc-400 text-xs">
            {isOwner ? "You" : randomName}
          </span>
        </div>
      );

    return (
      <div>
        <Image
          alt={user?.name || ""}
          className="w-5 h-5 rounded-full inline-block mr-2"
          src={user?.avatar || ""}
          width={24}
          height={24}
        />
        <span className="text-zinc-400 text-xs">
          {isOwner ? "You" : user?.name}
        </span>
      </div>
    );
  };


  const toggleEdition = () => {
    if (!isOwner) return

    setEditing({
      value: true,
      note: {
        body: note.body,
        anonymous: Boolean(note.anonymous),
      }
    })
  }

  const removeHandler = () => {
    RemoveNote({ id: note._id })
  }

  const likeHandler = () => {
    LikeNote({ noteId: note._id, userId: me!._id })
  }

  const handleIntentionalDelete = () => {
    if (!isOwner) return

    if (deleteIntention) {
      removeHandler();
      setDeleteIntention(false)

      return
    }

    const delay = 4000
    toast.error('Please, click one more time to confirm the delete action', {
      autoClose: delay
    })
    setTimeout(setDeleteIntention, delay, false)
    setDeleteIntention(true)
  }

  const containerStyle = useMemo<string>(() => {
    const styles = []

    if (roundTop) styles.push('rounded-t-lg')
    if (roundBottom) styles.push('rounded-b-lg')

    return styles.join(' ')
  }, [roundTop, roundBottom])

  return (
    <div
      title={note.body}
      className={`transition-all w-full bg-white p-3 text-zinc-500 text-sm shadow ${containerStyle}`}
      onDoubleClick={toggleEdition}
    >
      <div className={`mb-2 ${obfuscate ? 'blur-sm' : ''}`} >
        {!editing.value && <NoteBody note={note} users={users} obfuscate={obfuscate} />}
        {editing.value && (
          <NoteForm
            opened={editing.value}
            toggleOpened={() => setEditing(old => ({
              ...old,
              value: false,
            }))}
            newNote={editing.note}
            setNewNote={(newNote) => setEditing(old => ({
              ...old,
              note:  newNote
            }))}
            saveHandler={(_: React.FormEvent<HTMLFormElement>) => {
              editionHandler(editing.note)
              setEditing(old => ({ ...old, value: false }))
            }}
            users={users}
          />
        )}
      </div>
      <div className="flex justify-between items-center">
        {LeftBottomIcons()}

        {!obfuscate && (
          <div className="flex justify-end items-center gap-3">
            {isOwner && (
              <div onClick={toggleEdition} className="text-zinc-400">
                <FontAwesomeIcon icon={faEdit} />
              </div>
            )}
            <div
              onClick={likeHandler}
              className="flex items-center justify-center gap-1"
            >
              <LikeIcon liked={youLiked} />
              {note.likes && note.likes.length > 0 && (
                <p className="text-xs text-zinc-400">{note.likes.length}</p>
              )}
            </div>
            <div onClick={speechNote}>
              <SpeakerIcon speaking={speaking} />
            </div>
            {isOwner && (
              <div onClick={handleIntentionalDelete} title="Click twice to delete this card">
                <DeleteIcon fill={deleteIntention ? 'red-500' : 'zinc-400'} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
