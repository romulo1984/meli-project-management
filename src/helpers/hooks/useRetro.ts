import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { useEffect, useState } from "react";
import { useIdentity } from "@/contexts/IdentityProvider";
import { NotesShowingStatus, Settings } from "./useSettings";

interface useRetroProps {
  retroId: Id<"retros">;
}

const useRetro = (props: useRetroProps) => {
  const { retroId } = props;
  const [isLoading, setIsLoading] = useState(true);
  const { userId } = useIdentity();

  const UpdateTimer = useMutation(api.retros.updateTimer);
  const retro = useQuery(api.retros.get, { id: retroId });
  const notes = retro?.notes;
  const users = retro?.users;

  // Match the current user by their Convex id (the local token is never
  // exposed to clients — see IdentityProvider / localIdentity security notes).
  const me = users?.find((u) => u?._id === userId);
  const settings: Settings = {
    notesShowingStatus: {
      key: "notes_showing_status",
      label: "Hide notes",
      value: <NotesShowingStatus>(retro?.notesShowingStatus || "showing"),
    },
  };

  const setTimer = (timer: number) => UpdateTimer({ id: retroId, timer });
  const startTimer = () =>
    UpdateTimer({
      id: retroId,
      timerStatus: "started",
      startTimer: new Date().getTime(),
    });
  const resetTimer = () =>
    UpdateTimer({ id: retroId, timerStatus: "not_started", startTimer: 0 });

  useEffect(() => {
    if (retro && notes && users && settings) {
      setIsLoading(false);
    }
  }, [retro, notes, users, settings]);

  return {
    isLoading,
    retro,
    notes,
    users,
    me,
    settings,
    setTimer,
    startTimer,
    resetTimer,
  };
};

export default useRetro;
