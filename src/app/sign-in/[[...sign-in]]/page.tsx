"use client";

import { dark } from "@clerk/themes";
import { SignIn } from "@clerk/nextjs";

import { useCurrentTheme } from "@/hooks/use-current-theme";

const SignInPage = () => {
  const currentTheme = useCurrentTheme();

  return (
    <div className="flex flex-col max-w-3xl mx-auto w-full min-h-screen items-center justify-center p-4">
      <SignIn
        appearance={{
          baseTheme: currentTheme === "dark" ? dark : undefined,
          elements: {
            cardBox: "border shadow-none rounded-lg",
          },
        }}
      />
    </div>
  );
};

export default SignInPage;
