"use client";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import Loading from "@/components/loading";
import { useIdentity } from "@/contexts/IdentityProvider";

/**
 * Creates a new retro for the current (anonymous) identity, prompting for a
 * display name first if needed, then redirects to the board.
 */
export default function New() {
  const router = useRouter();
  const { ready, anonId, ensureIdentity } = useIdentity();
  const StoreRetro = useMutation(api.retros.store);
  const startedRef = useRef(false);

  useEffect(() => {
    if (!ready || startedRef.current) return;
    startedRef.current = true;

    (async () => {
      const userId = await ensureIdentity();
      if (!userId || !anonId) {
        router.replace("/"); // name prompt dismissed
        return;
      }
      const retroId = await StoreRetro({ ownerId: anonId });
      router.replace(`/retro/${retroId}`);
    })();
  }, [ready, anonId, ensureIdentity, StoreRetro, router]);

  return (
    <div className="container mx-auto min-h-screen max-w-screen-xl py-6 px-6 flex flex-col">
      <Loading />
    </div>
  );
}

/*
 * Legacy Clerk implementation — preserved for when CLERK_AUTH_ENABLED is restored.
 * This was a Server Component that used the authenticated Clerk user to create
 * the retro server-side:
 *
 * import { currentUser } from "@clerk/nextjs/server";
 * import { ConvexHttpClient } from "convex/browser";
 * import { api } from "@convex/_generated/api";
 * import { redirect } from "next/navigation";
 *
 * export default async function New() {
 *   const user = await currentUser();
 *   if (!user) {
 *     console.error("No user found. Is this route still protected?", { user });
 *     redirect("/");
 *     return;
 *   }
 *   if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
 *     console.error("Invalid NEXT_PUBLIC_CONVEX_URL var");
 *     redirect("/");
 *     return;
 *   }
 *   const client = new ConvexHttpClient(String(process.env.NEXT_PUBLIC_CONVEX_URL));
 *   const retroId = await client.mutation(api.retros.store, { ownerId: user.id });
 *   redirect(`/retro/${retroId}`);
 * }
 */
