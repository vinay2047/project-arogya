"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import { signInWithGoogle } from "@/actions/auth.actions";
import { useTransition } from "react";

/**
 * Google Login Button
 * - Displays the Google icon and text.
 * - Works with your existing `signInWithGoogle` server action.
 * - Can accept className & iconClassName props for flexible styling.
 */
export default function GoogleLoginButton({
  className = "",
  iconClassName = "w-5 h-5",
}: {
  className?: string;
  iconClassName?: string;
}) {
  const [isPending, startTransition] = useTransition();

  const handleGoogleLogin = () => {
    startTransition(async () => {
      await signInWithGoogle();
    });
  };

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleGoogleLogin}
      disabled={isPending}
      className={`flex items-center justify-center gap-2 border border-amber-300 hover:bg-amber-50 text-amber-900 font-medium py-2.5 transition-all duration-150 ${className}`}
    >
      <Image
        src="https://www.svgrepo.com/show/475656/google-color.svg"
        alt="Google Icon"
        width={20}
        height={20}
        className={iconClassName}
      />
      {isPending ? "Signing in..." : "Sign in with Google"}
    </Button>
  );
}
