import { redirect } from "next/navigation";
import { createClient } from "../../../../supabase/server";

export async function GET() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/callback`,
    },
  });

  if (error) {
    console.error("Google OAuth error:", error);
    return new Response(error.message, { status: 400 });
  }

  return redirect(data.url);
}
