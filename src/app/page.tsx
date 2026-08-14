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
    <main className="container max-w-screen-xl mx-auto columns-2 flex items-center px-6">
      <div className="w-2/4">
        <h2 className="text-5xl font-semibold mb-3 text-slate-600">
          For a truly one hundred percent boss...
        </h2>
        <h2 className="text-3xl font-medium text-slate-500 mb-6">
          it&rsquo;s just an <span className="font-semibold">if</span>
        </h2>
        <Button disabled={!ready || creatingRetro} handleClick={CreateRetro}>
          Create a new Retro
        </Button>
      </div>
      <div className="w-full">
        <Lottie
          loop
          animationData={lootieAnimation}
          play
          style={{ height: 800 }}
        />
      </div>
    </main>
  );
}
