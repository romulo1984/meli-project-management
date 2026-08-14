import { useEffect, useState } from "react";
import useRetro from "@/helpers/hooks/useRetro";
import { Id } from "@convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { useIdentity } from "@/contexts/IdentityProvider";

interface JoinRetroProps {
  retroId: Id<"retros">;
}

const useJoinRetro = (props: JoinRetroProps) => {
  const { retroId } = props;
  const [joined, setJoined] = useState(false);
  const { userId, anonId } = useIdentity();
  const { users, retro, me } = useRetro({ retroId });
  const Join = useMutation(api.users_retro.join);

  useEffect(() => {
    // Join once we have an identity (userId) and we're not already a member.
    if (retro && users && userId && anonId && !me && !joined) {
      Join({ retroId, userId: anonId });
      setJoined(true);
    }
  }, [me, userId, anonId, retroId, Join, retro, users, joined]);

  return joined;
};

export { useJoinRetro };
