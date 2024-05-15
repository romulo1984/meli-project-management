"use client";
import { Doc, Id } from "@convex/_generated/dataModel";
import Image from "next/image";
import RandomNames from "@/helpers/randomNames";
import SpechText from "@/helpers/spechText";
import { useMemo, useState } from "react";
import { SpeakerIcon, DeleteIcon, LikeIcon, AnonymousIcon } from "../icons";
import DropdownSelect from "../dropdownSelect";
import useRetro from "@/helpers/hooks/useRetro";
import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import NoteBody from "../note-body";
import NoteForm from "../note-form";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit } from "@fortawesome/free-solid-svg-icons";

interface NoteProps {
  note: Doc<"notes">;
  user: Doc<"users"> | undefined | null;
  me?: Doc<"users"> | undefined | null;
  actionType?: boolean;
  removeHandler?: () => void;
  likeHandler?: () => void;
}

interface NoteStructure {
  body: string
  anonymous: boolean
}

export default function Note(props: NoteProps) {
  const { note, user, me, actionType, removeHandler, likeHandler } = props;
  const { users } = useRetro({ retroId: note.retroId });
  const [speaking, setSpeaking] = useState(false);
  const [editing, setEditing] = useState({
    value: false,
    note: {
      body: note.body,
      anonymous: Boolean(note.anonymous)
    }
  })
  const AssigneNote = useMutation(api.notes.assigne);
  const UpdateNote = useMutation(api.notes.update);

  const isOwner = me?._id === user?._id;

  const isAnonymous = note.anonymous !== undefined && note.anonymous === true;

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
        />
      );

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
          className="w-6 h-6 rounded-full inline-block mr-2"
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

  return (
    <div className="w-full bg-white rounded-lg p-3 mb-4 text-zinc-500 text-sm shadow" onDoubleClick={toggleEdition}>
      <div className="mb-2">
        {!editing.value && <NoteBody note={note} users={users} />}
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
            users={[]}
          />
        )}
      </div>
      <div className="flex justify-between items-center">
        {LeftBottomIcons()}

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
            <div onClick={removeHandler}>
              <DeleteIcon />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
