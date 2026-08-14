import { SignUp } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { CLERK_AUTH_ENABLED } from "@/config/features";

export default function Page() {
  // Clerk sign-up is deprecated; the app is anonymous. Preserved for revival.
  if (!CLERK_AUTH_ENABLED) redirect("/");

  return (
    <div className="flex justify-center py-24">
      <SignUp />
    </div>
  );
}
