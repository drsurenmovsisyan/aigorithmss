"use client";

import { 
    Authenticated,
    AuthLoading, 
    Unauthenticated,
    ConvexReactClient,
    } from "convex/react";
import { ClerkProvider, useAuth, UserButton } from "@clerk/nextjs";
import { ConvexProviderWithClerk } from "convex/react-clerk";

import { UnauthenticatedView } from "@/features/auth/components/unauthenticated-view";

import { ThemeProvider } from "./theme-provider";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <ClerkProvider>
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        <ThemeProvider
         attribute="class"
         defaultTheme="dark"
         enableSystem
         disableTransitionOnChange
        >
            <Authenticated>
            <UserButton/>
            {children}
            </Authenticated>
        <Unauthenticated>
        <UnauthenticatedView />
        </Unauthenticated>
        <AuthLoading>
            Auth loading...
        </AuthLoading>
        </ThemeProvider>
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
};