"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/supabase/client";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const router = useRouter();

  // Fetch user on mount
  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) setUser(data.user);
      setLoading(false);
    };
    fetchUser();

    // Subscribe to auth state changes
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, [supabase]);

  // ✅ Proper Supabase sign-out
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Error signing out:", error.message);
    } else {
      setUser(null);
      router.push("/home");
    }
  };

  if (loading) return null;

  return (
    <nav className="w-full bg-white/80 backdrop-blur-md shadow-md fixed top-0 left-0 z-50">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-3">
        {/* Brand */}
        <Link href="/home" className="text-xl font-bold text-orange-700">
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
              <span className="text-orange-800 font-medium">
                Hi, {user.user_metadata?.name || "User"} 👋
              </span>
              <button
                onClick={handleLogout}
                className="bg-orange-600 text-white px-4 py-2 rounded-full font-medium hover:bg-orange-700 transition"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
