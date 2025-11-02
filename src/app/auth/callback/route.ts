import { createClient } from "@/supabase/server";
import { NextResponse } from "next/server";


export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(new URL("/auth/signup", request.url));
  }

  const supabase = await createClient();

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.session) {
    console.error("Session exchange failed:", error);
    return NextResponse.redirect(new URL("/auth/signup", request.url));
  }

  const user = data.session.user;

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    console.log("🆕 No profile found - redirecting to onboarding");
    return NextResponse.redirect(new URL("/onboarding/details", request.url));
  }

  // ✅ 2. If profile exists, check role and redirect accordingly
  if (profile.role === "DOCTOR") {
    const { data: doctorProfile } = await supabase
      .from("doctor_profiles")
      .select("user_id")
      .eq("user_id", user.id)
      .single();

    if (!doctorProfile) {
      // Has base profile but not doctor details yet
      return NextResponse.redirect(new URL("/onboarding", request.url));
    }

    return NextResponse.redirect(new URL("/dashboard/doctor", request.url));
  }

  if (profile.role === "PATIENT") {
    const { data: patientProfile } = await supabase
      .from("patient_profiles")
      .select("user_id")
      .eq("user_id", user.id)
      .single();

    if (!patientProfile) {
      return NextResponse.redirect(new URL("/onboarding", request.url));
    }

    return NextResponse.redirect(new URL("/dashboard/patient", request.url));
  }

  // Default fallback
  return NextResponse.redirect(new URL("/dashboard", request.url));
}
