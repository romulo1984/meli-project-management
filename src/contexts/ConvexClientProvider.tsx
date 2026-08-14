"use client";
import { GoogleOneTap, ClerkProvider, useAuth } from "@clerk/nextjs";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { CLERK_AUTH_ENABLED } from "@/config/features";
import { IdentityProvider } from "./IdentityProvider";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!;

interface ProviderProps {
  children: React.ReactNode;
}

export default function ConvexClientProvider({ children }: ProviderProps) {
  // Active path: anonymous, local identity. Nothing goes through Clerk.
  if (!CLERK_AUTH_ENABLED) {
    return (
      <ConvexProvider client={convex}>
        <IdentityProvider>{children}</IdentityProvider>
      </ConvexProvider>
    );
  }

  // Legacy Clerk path — preserved for when CLERK_AUTH_ENABLED is restored.
  return (
    <ClerkProvider publishableKey={clerkPublishableKey}>
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        <GoogleOneTap />
        {children}
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}
