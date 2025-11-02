// src/middleware.ts
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { createClient } from "./supabase/middleware";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const { supabase } = createClient(req, res);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const url = req.nextUrl.pathname;

  const protectedRoutes = ["/dashboard", "/onboarding", "/onboarding/details"];
  if (!user && protectedRoutes.some((r) => url.startsWith(r))) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  // 2️⃣ Logged in, but no profile yet → only allow /onboarding/details
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    if (!profile && !url.startsWith("/onboarding/details")) {
      return NextResponse.redirect(new URL("/onboarding/details", req.url));
    }

    // 3️⃣ Has profile but not completed role onboarding
    if (profile?.role === "PATIENT") {
      const { data: patient } = await supabase
        .from("patient_profiles")
        .select("user_id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!patient && !url.startsWith("/onboarding")) {
        return NextResponse.redirect(new URL("/onboarding", req.url));
      }
    }

    if (profile?.role === "DOCTOR") {
      const { data: doctor } = await supabase
        .from("doctor_profiles")
        .select("user_id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!doctor && !url.startsWith("/onboarding")) {
        return NextResponse.redirect(new URL("/onboarding", req.url));
      }
    }
  }

  return res;
}

export const config = {
  matcher: ["/dashboard/:path*", "/onboarding/:path*", "/auth/:path*"],
};
