"use server";


import { createClient } from "@/supabase/server";
import { redirect } from "next/navigation";


export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}



export const signUp = async (formData: FormData) => {
  try {
    const supabase = await createClient();
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !password) {
      return { error: "Email and password are required." };
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/callback`,
      },
    });

    // 1️⃣ Handle specific errors
    if (error) {
      if (error.message.includes("User already registered")) {
        return {
          error:
            "You’ve already signed up but haven’t verified your email. Please check your inbox or spam folder for the verification link.",
        };
      }
      return { error: error.message };
    }

    // 🧠 Supabase returns empty identities if user already exists
    if (data?.user?.identities?.length === 0) {
      return {
        error:
          "An account with this email already exists. Please log in instead.",
      };
    }

    // 3️⃣ Handle successful signup
    if (data?.user) {
      return {
        success: true,
        message:
          "Signup successful! Please check your email to verify your account.",
      };
    }

    return { error: "Something went wrong during signup." };
  } catch (error) {
    console.error(error);
    return { error: (error as Error).message };
  }
};

export async function loginWithPassword(formData: FormData) {
  const supabase = await createClient();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  // 1️⃣ Attempt login
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user) {
    // Return the error instead of redirecting
    return { error: error?.message || "Invalid credentials" };
  }

  // 2️⃣ Fetch role from profiles
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .maybeSingle();

  // 3️⃣ Redirect based on role
  if (!profile?.role) {
    redirect("/onboarding/details");
  } else if (profile.role === "PATIENT") {
    redirect("/dashboard/patient");
  } else if (profile.role === "DOCTOR") {
    redirect("/dashboard/doctor");
  } else {
    redirect("/onboarding/details");
  }
}

export const updatePassword = async (formData: FormData) => {
  try {
    const supabase = await createClient();
    const password = formData.get("password") as string;
    const { error } = await supabase.auth.updateUser({ password });
    if (error) return { error: error.message };
    return { success: true };
  } catch (error) {
    return { error: (error as Error).message };
  }
};

export const signInWithGoogle = async () => {
  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/`,
      },
    });
    if (error) return { error: error.message };
    return { success: true };
  } catch (error) {
    return { error: (error as Error).message };
  }
};

export async function sendResetPasswordEmail(email: string) {
  const supabase = await createClient();

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: "http://localhost:3000/auth/reset-password",
  });

  if (error) {
    return { success: false, message: error.message };
  }

  return {
    success: true,
    message: "Password reset link sent! Check your email.",
  };
}
