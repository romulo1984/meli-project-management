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
import { toast } from "react-toastify";

interface NoteProps {
  note: Doc<"notes">;
  user: Doc<"users"> | undefined | null;
  me?: Doc<"users"> | undefined | null;
  actionType?: boolean;
  blur?: boolean
  removeHandler?: () => void;
  likeHandler?: () => void;
}

export default function Note(props: NoteProps) {
  const { note, user, me, actionType, removeHandler, likeHandler, blur = false } = props;
  const { users } = useRetro({ retroId: note.retroId });
  const [speaking, setSpeaking] = useState(false);
  const [deleteIntention, setDeleteIntention] = useState(false)
  const AssigneNote = useMutation(api.notes.assigne);

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

  const handleIntentionalDelete = () => {
    if (!isOwner) return

    if (deleteIntention) {
      removeHandler && removeHandler()
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

  return (
    <div className="w-full bg-white rounded-lg p-3 mb-4 text-zinc-500 text-sm shadow">
      <p className={`mb-2 ${obfuscate ? 'blur-sm' : ''}`}>
        <NoteBody note={note} users={users} obfuscate={obfuscate} />
      </p>
      <div className="flex justify-between items-center">
        {LeftBottomIcons()}

        {!obfuscate && (
          <div className="flex justify-end items-center gap-3">
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
