import { SignIn } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { CLERK_AUTH_ENABLED } from "@/config/features";

export default function Page() {
  // Clerk login is deprecated; the app is anonymous. Preserved for revival.
  if (!CLERK_AUTH_ENABLED) redirect("/");

  return (
    <div className="flex justify-center py-24">
      <SignIn />
    </div>
  );
}
