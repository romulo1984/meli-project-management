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
  DragCancelEvent,
  DragEndEvent,
  DragOverEvent,
  Over,
  UniqueIdentifier,
  closestCenter,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useMutation, useQuery } from "convex/react";
import { useRef, useState } from "react";
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';

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
  const UpdateNote = useMutation(api.notes.update);
  const UpdateHighlightNoteId = useMutation(api.retros.updateHighlightNoteId);
  const RemoveHighlightNoteId = useMutation(api.retros.removeHighlightNoteId);
  const { isSignedIn } = useUser();
  useJoinRetro({ retroId });
  const { handleSettingChange } = useSettings({
    retroId: retroId,
  })
  const mergeOverRef = useRef(null)
  const [mergeTarget, setMergeTarget] = useState<Over>()

  const getUser = (id: string) => users?.find((user) => user?._id === id);

  const mergeBodies = (source: string, target: string, userName: string) => {
    const merged = `
      ${target}
      <div class="merged-content">
        ${source}

        <div class="merged-author">
          By
          <span>${userName}<span>
        </div>
      </div>
    `
    
    return merged
  }

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

  const handleDragCancel = (event: DragCancelEvent) => {
    mergeOverRef.current && clearTimeout(mergeOverRef.current)
    setMergeTarget(undefined)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { over, active } = event;
    mergeOverRef.current && clearTimeout(mergeOverRef.current)
    setMergeTarget(undefined)

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

  const handleDragOver = (event: DragOverEvent) => {
    const { over, active } = event;

    if (!over || !active) {
      return
    }

    if (over.id === active.id) {
      return
    }

    mergeOverRef.current && clearTimeout(mergeOverRef.current)
    mergeOverRef.current = setTimeout(() => {
      setMergeTarget(over)
      clearTimeout(mergeOverRef.current!)

      confirmAlert({
        title: 'Merge contents',
        message: 'Do you want to merge the contents of both cards? This action is unreversible',
        buttons: [
          {
            label: 'No',
            onClick: () => null
          },
          {
            label: 'Yes, merge',
            onClick: () => {
              const overNote = notes?.find(n => n._id === over.id)!
              const activeNote = notes?.find(n => n._id === active.id)!
              const user = users?.find(u => u?._id === activeNote?.userId)!

              const mergedBody = mergeBodies(activeNote?.body, overNote?.body, user?.name)

              UpdateNote({
                body: mergedBody,
                noteId: over.id as Id<"notes">,
                merged: true,
                anonymous: Boolean(overNote?.anonymous)
              })
              RemoveNote({ id: active.id as Id<"notes"> })
              setMergeTarget(undefined)
            }
          }
        ]
      })
    }, 600)
  }

  const settingsDropdownItems = () : DropdownItem[] => {
    const items : DropdownItem[] = []

    items.push({
      label: settings.notesShowingStatus.label,
      name: settings.notesShowingStatus.key,
      selected: settings.notesShowingStatus.value === 'hidden',
      disabled: !isSignedIn,
    })

    items.push({
      label: settings.highlightMode.label,
      name: settings.highlightMode.key,
      selected: settings.highlightMode.value === 'enabled',
      disabled: !isSignedIn,
    })

    return items
  }

  const noteHoverHandler = (note: NoteItem) => {
    if (!retro?.highlightMode || retro.highlightMode === 'disabled') return

    console.log('Hover: ', { note })
    UpdateHighlightNoteId({  id: retroId, highlightNoteId: note._id })
  }

  const noteBlurHandler = (note: NoteItem) => {
if (!retro?.highlightMode || retro.highlightMode === 'disabled') return

    RemoveHighlightNoteId({  id: retroId }) 
  }

  const shouldBlur = (note: NoteItem) => {
    const should = settings.notesShowingStatus.value === 'hidden' ||
      (retro?.highlightMode === 'enabled' && retro.highlightNoteId && retro.highlightNoteId !== note._id)

    return should
  }

  return (
    <DndContext
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDragCancel={handleDragCancel}
      collisionDetection={closestCenter}
    >
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
                    if (!isSignedIn) return
                    handleSettingChange(name, settings)
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
                          highlighted={mergeTarget?.id === note._id}
                          superHighlighted={retro?.highlightNoteId === note._id}
                          key={note._id}
                          note={note}
                          user={getUser(note.userId)}
                          me={me}
                          removeHandler={() => RemoveNote({ id: note._id })}
                          likeHandler={() => handleLike({ id: note._id })}
                          forceBlur={retro?.highlightMode === 'enabled'}
                          blur={shouldBlur(note)}
                          hoverHandler={() => noteHoverHandler(note)}
                          blurHandler={() => noteBlurHandler(note)}
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
                          highlighted={mergeTarget?.id === note._id}
                          superHighlighted={retro?.highlightNoteId === note._id}
                          key={note._id}
                          note={note}
                          user={getUser(note.userId)}
                          me={me}
                          forceBlur={retro?.highlightMode === 'enabled'}
                          blur={shouldBlur(note)}
                          removeHandler={() => RemoveNote({ id: note._id })}
                          likeHandler={() => handleLike({ id: note._id })}
                          hoverHandler={() => noteHoverHandler(note)}
                          blurHandler={() => noteBlurHandler(note)}
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
                          highlighted={mergeTarget?.id === note._id}
                          superHighlighted={retro?.highlightNoteId === note._id}
                          key={note._id}
                          note={note}
                          user={getUser(note.userId)}
                          me={me}
                          actionType={isSignedIn}
                          forceBlur={retro?.highlightMode === 'enabled'}
                          blur={shouldBlur(note)}
                          removeHandler={() => RemoveNote({ id: note._id })}
                          likeHandler={() => handleLike({ id: note._id })}
                          hoverHandler={() => noteHoverHandler(note)}
                          blurHandler={() => noteBlurHandler(note)}
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
