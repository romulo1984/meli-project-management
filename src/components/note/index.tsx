"use client";
import { Doc, Id } from "@convex/_generated/dataModel";
import NoteCard from "./card";

interface NoteProps {
  note: Doc<"notes">;
  users: Doc<"users">[] | any;
  me?: Doc<"users"> | undefined | null;
  actionType?: boolean;
  blur?: boolean
  highlighted?: boolean,
  childrenNotes?: Doc<"notes">[]
}


export default function Note(props: NoteProps) {
  const {
    note,
    me,
    actionType,
    blur = false,
    childrenNotes = [],
    highlighted,
    users = []
  } = props;

  const getUser = (id: string) => users ? users?.find((u: Doc<"users">) => u._id === id) : null

  return (
    <div className={`merge-container ${highlighted ? 'highlighted' : ''}`}>
      <NoteCard
        note={note}
        user={getUser(note.userId)}
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
          user={getUser(child.userId)}
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
