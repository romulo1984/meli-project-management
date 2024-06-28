"use client";
import { Doc, Id } from "@convex/_generated/dataModel";
import NoteCard from "./card";

interface NoteProps {
  note: Doc<"notes">;
  user: Doc<"users"> | undefined | null;
  me?: Doc<"users"> | undefined | null;
  actionType?: boolean;
  blur?: boolean
  highlighted?: boolean,
  childrenNotes?: Doc<"notes">[]
}


export default function Note(props: NoteProps) {
  const {
    note,
    user,
    me,
    actionType,
    blur = false,
    childrenNotes = [],
    highlighted
  } = props;

  return (
    <div className={`merge-container ${highlighted ? 'highlighted' : ''}`}>
      <NoteCard
        note={note}
        user={user}
        me={me}
        actionType={actionType}
        blur={blur}
        roundTop={true}
        roundBottom={!childrenNotes || childrenNotes.length < 1}
      />

      {childrenNotes && childrenNotes.length > 0 && childrenNotes.map((child, i) => (
        <NoteCard
          key={child._id}
          note={child}
          user={user}
          me={me}
          actionType={actionType}
          blur={blur}
          roundTop={false}
          roundBottom={i === childrenNotes.length - 1}
        />
      ))}
    </div>
  );
}
