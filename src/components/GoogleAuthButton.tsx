"use client";

import { Button } from "@/components/ui/button";
import { useTransition } from "react";

export default function GoogleLoginButton() {
  const [isPending, startTransition] = useTransition();

  const handleGoogleSignIn = () => {
    startTransition(() => {
      // 🔥 Redirect the browser to your API route that starts OAuth
      window.location.href = "/api/auth/google";
    });
  };

  return (
    <Button
      type="button"
      onClick={handleGoogleSignIn}
      disabled={isPending}
      className="w-full flex items-center justify-center gap-2 border border-amber-300 bg-white hover:bg-amber-50 text-amber-800 font-medium shadow-sm rounded-lg transition-all duration-200"
    >
      {isPending ? "Signing in..." : "Sign in with Google"}
    </Button>
  );
}
