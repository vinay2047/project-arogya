"use client";

import { Button } from "@/components/ui/button";
import { FcGoogle } from "react-icons/fc"; // Google logo
import { useTransition } from "react";
import { signInWithGoogle } from "@/actions/auth.actions"; // Your existing action

export default function GoogleLoginButton() {
  const [isPending, startTransition] = useTransition();

  const handleGoogleSignIn = () => {
    startTransition(() => {
      // ✅ We explicitly ignore returned value to satisfy React types
      void signInWithGoogle();
    });
  };

  return (
    <Button
      type="button"
      onClick={handleGoogleSignIn}
      disabled={isPending}
      className="w-full flex items-center justify-center gap-2 border border-amber-300 bg-white hover:bg-amber-50 text-amber-800 font-medium shadow-sm rounded-lg transition-all duration-200"
    >
      <FcGoogle className="w-5 h-5" />
      {isPending ? "Signing in..." : "Sign in with Google"}
    </Button>
  );
}

