"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { createClient } from "@/supabase/client";
import { signOut } from "@/actions/auth.actions";
import { Loader2 } from "lucide-react";

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const supabase = createClient();

  // Fetch user on mount and listen for auth changes
  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) setUser(data.user);
      setLoading(false);
    };
    fetchUser();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => setUser(session?.user ?? null)
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, [supabase]);

  if (loading) return null;

  return (
    <nav className="w-full bg-white/80 backdrop-blur-md shadow-md fixed top-0 left-0 z-50">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-3">
        {/* Brand */}
        <Link href="/" className="text-xl font-bold text-orange-700">
          Arogya
        </Link>

        {/* Right Side */}
        <div className="flex items-center space-x-6">
          <Link
            href="/about"
            className="text-orange-800 font-medium hover:text-orange-600 transition"
          >
            About
          </Link>

          {!user ? (
            <>
              <Link
                href="/auth/login"
                className="text-orange-800 font-medium hover:text-orange-600 transition"
              >
                Login
              </Link>
              <Link
                href="/auth/signup"
                className="bg-orange-600 text-white px-4 py-2 rounded-full font-medium hover:bg-orange-700 transition"
              >
                Signup
              </Link>
            </>
          ) : (
            <div className="flex items-center space-x-4">
              {/* Signed-in links */}
              <Link
                href="/appointments"
                className="text-orange-800 font-medium hover:text-orange-600 transition"
              >
                Appointments
              </Link>
              <Link
                href="/bills"
                className="text-orange-800 font-medium hover:text-orange-600 transition"
              >
                Bills
              </Link>

              <span className="text-orange-800 font-medium">
                Hi, {user.user_metadata?.name || "User"}
              </span>

              {/* ✅ Server action logout (form-based trigger with loading) */}
              <form
                action={() => {
                  startTransition(() => signOut());
                }}
              >
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-full font-medium hover:bg-orange-700 transition disabled:opacity-70"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Logging out...
                    </>
                  ) : (
                    "Logout"
                  )}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
