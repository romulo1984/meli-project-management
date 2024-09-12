"use client";
import { Doc, Id } from "@convex/_generated/dataModel";
import { UniqueIdentifier } from "@dnd-kit/core";
import NoteCard from "./card";

interface NoteItem extends Doc<"notes"> {
  id: UniqueIdentifier;
}
interface NoteProps {
  note: Doc<"notes">;
  users: Doc<"users">[] | any;
  me?: Doc<"users"> | undefined | null;
  actionType?: boolean;
  blur?: boolean;
  forceBlur?: boolean;
  highlighted?: boolean;
  childrenNotes?: Doc<"notes">[];
  hoverHandler?: (note: NoteItem) => void;
  blurHandler?: (note: NoteItem) => void;
  highlighted?: boolean;
  retroHighlightNoteId?: Id<"notes">;
}

export default function Note(props: NoteProps) {
  const {
    note,
    me,
    actionType,
    blur = false,
    childrenNotes = [],
    highlighted,
    users = [],
    forceBlur = false,
    retroHighlightNoteId,
    hoverHandler,
    blurHandler,
  } = props;

  const getUser = (id: string) =>
    users ? users?.find((u: Doc<"users">) => u._id === id) : null;

  return (
    <div className={`merge-container ${highlighted ? "highlighted" : ""}`}>
      <NoteCard
        note={note}
        user={getUser(note.userId)}
        me={me}
        actionType={actionType}
        blur={blur}
        forceBlur={retroHighlightNoteId && retroHighlightNoteId !== note._id}
        roundTop={true}
        roundBottom={!childrenNotes || childrenNotes.length < 1}
        superHighlighted={retroHighlightNoteId == note._id}
        hoverHandler={() => hoverHandler(note)}
        blurHandler={() => blurHandler(note)}
      />

      {childrenNotes &&
        childrenNotes.length > 0 &&
        childrenNotes.map((child, i) => (
          <NoteCard
            key={child._id}
            note={child}
            user={getUser(child.userId)}
            me={me}
            actionType={actionType}
            blur={blur}
            forceBlur={
              retroHighlightNoteId && retroHighlightNoteId !== child._id
            }
            roundTop={false}
            roundBottom={i === childrenNotes.length - 1}
            superHighlighted={retroHighlightNoteId == child._id}
            hoverHandler={() => hoverHandler(child)}
            blurHandler={() => blurHandler(child)}
          />
        ))}
    </div>
  );
}
