"use client";
import { useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";

import lootieAnimation from "../animations/animation.json";
import Button from "@/components/button";
import { useIdentity } from "@/contexts/IdentityProvider";

// Client-only: lottie-web touches `document` at load, so keep it out of SSR.
const Lottie = dynamic(() => import("react-lottie-player"), { ssr: false });

export default function Home() {
  const [creatingRetro, setCreatingRetro] = useState(false);
  const router = useRouter();
  const { ready, anonId, ensureIdentity } = useIdentity();
  const StoreRetro = useMutation(api.retros.store);

  const CreateRetro = async () => {
    if (creatingRetro) return;
    setCreatingRetro(true);
    try {
      // Prompt for a display name on first use, then create the retro.
      const userId = await ensureIdentity();
      if (!userId || !anonId) return; // user dismissed the name prompt
      const retroId = await StoreRetro({ ownerId: anonId });
      router.push(`/retro/${retroId}`);
    } finally {
      setCreatingRetro(false);
    }
  };

  return (
    <main className="relative overflow-hidden">
      {/* Soft background accents for depth. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-indigo-200/40 blur-3xl" />
        <div className="absolute top-1/3 -right-16 h-80 w-80 rounded-full bg-pink-200/40 blur-3xl" />
      </div>

      <div className="container mx-auto max-w-screen-xl px-6 py-10 md:py-16 flex flex-col-reverse items-center gap-8 md:flex-row md:gap-6">
        <div className="w-full md:w-1/2">
          <span className="mb-5 inline-flex items-center gap-2 rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-500">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            Real-time · no sign-up
          </span>
          <h1 className="mb-4 text-4xl font-bold leading-tight text-slate-700 md:text-5xl lg:text-6xl">
            Run retros your team{" "}
            <span className="bg-gradient-to-r from-indigo-500 to-pink-400 bg-clip-text text-transparent">
              actually enjoys
            </span>
          </h1>
          <p className="mb-8 max-w-md text-lg text-slate-500">
            Spin up a board, share the link, and collaborate live — what went
            well, what to improve, and the action items, together in real time.
          </p>
          <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-4">
            <Button disabled={!ready || creatingRetro} handleClick={CreateRetro}>
              Create a new Retro
            </Button>
            <span className="text-sm text-zinc-400">
              Free · nothing to install
            </span>
          </div>
          <div className="mt-10 flex flex-wrap gap-x-6 gap-y-2 text-sm text-zinc-400">
            <span className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" /> Went
              well
            </span>
            <span className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-400" /> To
              improve
            </span>
            <span className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-indigo-400" /> Action
              items
            </span>
          </div>
        </div>
        <div className="flex w-full justify-center md:w-1/2">
          <Lottie
            loop
            animationData={lootieAnimation}
            play
            style={{ width: "100%", maxWidth: 520 }}
          />
        </div>
      </div>
    </main>
  );
}
