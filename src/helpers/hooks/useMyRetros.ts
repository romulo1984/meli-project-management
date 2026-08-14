import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { useIdentity } from "@/contexts/IdentityProvider";

const useMyRetros = () => {
  const [isLoading, setIsLoading] = useState(true);
  const { userId, ready } = useIdentity();

  // myRetros returns undefined when no userId is provided, so passing
  // `undefined` is a safe no-op until the local identity is ready.
  const retros = useQuery(api.retros.myRetros, {
    userId: userId ?? undefined,
  });

  // We already know the current user's Convex id from the local identity;
  // no extra query needed for ownership checks.
  const me = userId ? { _id: userId } : undefined;

  useEffect(() => {
    // Stop loading once retros arrive, or once we know there's no identity yet
    // (ready but nameless → nothing to show).
    if (retros || (ready && !userId)) {
      setIsLoading(false);
    }
  }, [retros, ready, userId]);

  return {
    isLoading,
    retros:
      retros?.sort(
        (a, b) => (b?._creationTime || 0) - (a?._creationTime || 0)
      ) || [],
    me,
  };
};

export default useMyRetros;
