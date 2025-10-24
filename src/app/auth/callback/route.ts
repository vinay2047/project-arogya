import { NextResponse } from "next/server";
import { createClient } from "../../../../utils/supabase/server";


export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(new URL("/auth/signup", request.url));
  }

  const supabase = await createClient();

  // Exchange the code for a session
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.session) {
    console.error("Session exchange failed:", error);
    return NextResponse.redirect(new URL("/auth/signup", request.url));
  }

  // ✅ Redirect to onboarding now that the session is active
  return NextResponse.redirect(new URL("/onboarding/details", request.url));
}
