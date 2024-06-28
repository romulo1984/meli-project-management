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
import NoteCard from "./card";

interface NoteProps {
  note: Doc<"notes">;
  user: Doc<"users"> | undefined | null;
  me?: Doc<"users"> | undefined | null;
  actionType?: boolean;
  blur?: boolean
  removeHandler?: () => void;
  likeHandler?: () => void;
  highlighted?: boolean,
  childrenNotes?: Doc<"notes">[]
}

interface NoteStructure {
  body: string
  anonymous: boolean
}

export default function Note(props: NoteProps) {
  const { note, user, me, actionType, removeHandler, likeHandler, blur = false, childrenNotes = [], highlighted } = props;

  const isOwner = me?._id === user?._id;

  const isAnonymous = note.anonymous !== undefined && note.anonymous === true;
  const obfuscate = blur && !isOwner

  return (
    <div className={`merge-container ${highlighted ? 'highlighted' : ''}`}>
      <NoteCard
        note={note}
        user={user}
        me={me}
        actionType={actionType}
        blur={blur}
        likeHandler={likeHandler}
        removeHandler={removeHandler}
      />

      {childrenNotes && childrenNotes.length > 0 && childrenNotes.map(child => (
        <NoteCard
          note={child}
          user={user}
          me={me}
          actionType={actionType}
          blur={blur}
          likeHandler={likeHandler}
          removeHandler={removeHandler}
        />
      ))}
    </div>
  );
}
