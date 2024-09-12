import { currentUser } from "@clerk/nextjs/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@convex/_generated/api";
import { redirect } from "next/navigation";

export default async function New() {
  const user = await currentUser();

  if (!user) {
    console.error("No user found. Is this route still protected?", { user });
    redirect("/");
    return;
  }

  if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
    console.error("Invalid NEXT_PUBLIC_CONVEX_URL var");
    redirect("/");
    return;
  }

  const client = new ConvexHttpClient(
    String(process.env.NEXT_PUBLIC_CONVEX_URL),
  );
  const retroId = await client.mutation(api.retros.store, { ownerId: user.id });

  redirect(`/retro/${retroId}`);
}
