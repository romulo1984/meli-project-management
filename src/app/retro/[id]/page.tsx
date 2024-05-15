"use client";
import Dropdown, { DropdownItem } from "@/components/dropdown";
import InlineEditName from "@/components/inline-edit-name";
import Loading from "@/components/loading";
import NotLoggedAlert from "@/components/not-logged-alert";
import Note from "@/components/note";
import NoteForm from "@/components/note-form";
import Participants from "@/components/participants";
import { Sortable } from "@/components/sortable";
import Timer from "@/components/timer";
import { useJoinRetro } from "@/helpers/hooks/useJoinRetro";
import useRetro from "@/helpers/hooks/useRetro";
import useSettings from "@/helpers/hooks/useSettings";
import { useUser } from "@clerk/clerk-react";
import { api } from "@convex/_generated/api";
import { Doc, Id } from "@convex/_generated/dataModel";
import {
  DndContext,
  DragEndEvent,
  UniqueIdentifier,
  closestCenter,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useMutation } from "convex/react";
import { useState } from "react";

interface RetroProps {
  params: {
    id: Id<"retros">;
  };
}

interface NoteItem extends Doc<"notes"> {
  id: UniqueIdentifier;
}

export default function Retro(props: RetroProps) {
  const retroId = props.params.id;
  const [note, setNote] = useState({ body: "", anonymous: false });
  const [pipeline, setPipeline] = useState<"good" | "bad" | "action">("good");
  const [opened, setOpened] = useState({
    bad: false,
    good: false,
    action: false,
  });
  const {
    isLoading,
    retro,
    notes,
    users,
    me,
    setTimer,
    startTimer,
    resetTimer,
    settings
  } = useRetro({ retroId });
  const CreateNote = useMutation(api.notes.store);
  const RemoveNote = useMutation(api.notes.remove);
  const LikeNote = useMutation(api.notes.likeToggle);
  const UpdatePositions = useMutation(api.notes.updatePositions);
  const { isSignedIn } = useUser();
  useJoinRetro({ retroId });
  const { handleSettingChange } = useSettings({
    retroId: retroId,
    default: settings
  })
  const getUser = (id: string) => users?.find((user) => user?._id === id);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    if (retro && me) {
      CreateNote({
        body: note.body,
        pipeline,
        retroId: retro._id ?? retroId,
        userId: me._id,
        anonymous: note.anonymous,
      });
      setOpened({ good: false, bad: false, action: false });
    }
    setNote({ body: "", anonymous: false });
  };

  const toggleOpened = (pipeline: "good" | "bad" | "action") => {
    setPipeline(pipeline);
    setOpened({
      good: false,
      bad: false,
      action: false,
      [pipeline]: !opened[pipeline],
    });
  };

  const badNotes = notes
    ?.filter((note) => note.pipeline === "bad")
    .map((note): NoteItem => ({ ...note, id: note._id }))
    .sort((a: any, b: any) => a.position - b.position);
  const goodNotes = notes
    ?.filter((note) => note.pipeline === "good")
    .map((note): NoteItem => ({ ...note, id: note._id }))
    .sort((a: any, b: any) => a.position - b.position);
  const actionNotes = notes
    ?.filter((note) => note.pipeline === "action")
    .map((note): NoteItem => ({ ...note, id: note._id }))
    .sort((a: any, b: any) => a.position - b.position);

  const formatDate = (date: any) =>
    new Date(date).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  const handleLike = ({ id }: { id: Id<"notes"> }) => {
    if (me) LikeNote({ noteId: id, userId: me?._id });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { over, active } = event;

    if (over && over?.id !== active?.id) {
      const items = [...active?.data?.current?.sortable?.items];
      const oldIndex = items.indexOf(active.id);
      const newIndex = items.indexOf(over.id);

      const newItems = arrayMove(items, oldIndex, newIndex).map(
        (id, index) => ({ id, position: index })
      );

      UpdatePositions({ notes: newItems });
    }
  };

  const settingsDropdownItems = () : DropdownItem[] => {
    const items : DropdownItem[] = []

    items.push({
      label: settings.notesShowingStatus.label,
      name: settings.notesShowingStatus.key,
      selected: settings.notesShowingStatus.value === 'hidden'
    })

    return items
  }

  return (
    <DndContext onDragEnd={handleDragEnd} collisionDetection={closestCenter}>
      <main className="container mx-auto min-h-screen max-w-screen-xl py-6 px-6 flex flex-col">
        {isLoading ? (
          <Loading />
        ) : (
          <>
            <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-6">
              <div className="flex flex-col md:w-1/2">
                <InlineEditName
                  disabled={retro?.ownerId !== me?._id}
                  retroId={retro?._id}
                  value={retro?.name}
                />
                <p className="text-sm text-zinc-400">
                  Created in {formatDate(retro?._creationTime)}
                </p>
              </div>
              <div className="flex gap-4 flex-row-reverse md:flex-row justify-between content-end items-center">
                <Dropdown
                  color="zinc-400"
                  background="slate-50"
                  items={settingsDropdownItems()}
                  onItemPressed={(name: string) => {
                    handleSettingChange(name)
                  }}
                />
                <Timer
                  timer={retro?.timer || 0}
                  start={retro?.startTimer || 0}
                  status={retro?.timerStatus || "not_started"}
                  setTimer={setTimer}
                  startTimer={startTimer}
                  resetTimer={resetTimer}
                />
                <Participants users={users} />
              </div>
            </div>
            {!isSignedIn && <NotLoggedAlert />}
            <div className="grid md:grid-cols-3 gap-6">
              <div className="w-full bg-zinc-100 rounded-lg p-4">
                <div className="flex justify-between">
                  <h3 className="text-lg text-zinc-500 mb-4">Good</h3>
                  <p className="text-zinc-400">{goodNotes?.length}</p>
                </div>
                {isSignedIn && (
                  <NoteForm
                    opened={opened.good}
                    toggleOpened={() => toggleOpened("good")}
                    newNote={note}
                    setNewNote={setNote}
                    saveHandler={handleSubmit}
                    users={users}
                  />
                )}
                {goodNotes && (
                  <SortableContext
                    items={goodNotes}
                    strategy={verticalListSortingStrategy}
                  >
                    {goodNotes?.map((note) => (
                      <Sortable key={note._id} id={note._id}>
                        <Note
                          key={note._id}
                          note={note}
                          user={getUser(note.userId)}
                          me={me}
                          removeHandler={() => RemoveNote({ id: note._id })}
                          likeHandler={() => handleLike({ id: note._id })}
                          blur={settings.notesShowingStatus.value === 'hidden'}
                        />
                      </Sortable>
                    ))}
                  </SortableContext>
                )}
              </div>
              <div className="w-full bg-zinc-100 rounded-lg p-4">
                <div className="flex justify-between">
                  <h3 className="text-lg text-zinc-500 mb-4">Bad</h3>
                  <p className="text-zinc-400">{badNotes?.length}</p>
                </div>
                {isSignedIn && (
                  <NoteForm
                    opened={opened.bad}
                    toggleOpened={() => toggleOpened("bad")}
                    newNote={note}
                    setNewNote={setNote}
                    saveHandler={handleSubmit}
                    users={users}
                  />
                )}
                {badNotes && (
                  <SortableContext
                    items={badNotes}
                    strategy={verticalListSortingStrategy}
                  >
                    {badNotes?.map((note) => (
                      <Sortable key={note._id} id={note._id}>
                        <Note
                          key={note._id}
                          note={note}
                          user={getUser(note.userId)}
                          me={me}
                          blur={settings.notesShowingStatus.value === 'hidden'}
                          removeHandler={() => RemoveNote({ id: note._id })}
                          likeHandler={() => handleLike({ id: note._id })}
                        />
                      </Sortable>
                    ))}
                  </SortableContext>
                )}
              </div>
              <div className="w-full bg-zinc-100 rounded-lg p-4">
                <div className="flex justify-between">
                  <h3 className="text-lg text-zinc-500 mb-4">Actions</h3>
                  <p className="text-zinc-400">{actionNotes?.length}</p>
                </div>
                {isSignedIn && (
                  <NoteForm
                    opened={opened.action}
                    toggleOpened={() => toggleOpened("action")}
                    newNote={note}
                    setNewNote={setNote}
                    saveHandler={handleSubmit}
                    users={users}
                  />
                )}
                {actionNotes && (
                  <SortableContext
                    items={actionNotes}
                    strategy={verticalListSortingStrategy}
                  >
                    {actionNotes?.map((note) => (
                      <Sortable key={note._id} id={note._id}>
                        <Note
                          key={note._id}
                          note={note}
                          user={getUser(note.userId)}
                          me={me}
                          actionType={isSignedIn}
                          blur={settings.notesShowingStatus.value === 'hidden'}
                          removeHandler={() => RemoveNote({ id: note._id })}
                          likeHandler={() => handleLike({ id: note._id })}
                        />
                      </Sortable>
                    ))}
                  </SortableContext>
                )}
              </div>
            </div>
          </>
        )}
      </main>
    </DndContext>
  );
}
