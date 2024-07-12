"use client";
import { GoogleOneTap, ClerkProvider, useAuth } from "@clerk/nextjs";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ConvexReactClient } from "convex/react";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!;

interface ProviderProps {
  children: React.ReactNode;
}

export default function ConvexClientProvider({ children }: ProviderProps) {
  return (
    <ClerkProvider publishableKey={clerkPublishableKey}>
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        <GoogleOneTap />
        {children}
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}
