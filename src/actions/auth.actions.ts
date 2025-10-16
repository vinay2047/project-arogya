"use server";



import { createClient } from "../../utils/supabase/server";
import { redirect } from "next/navigation";



export async function signOut() {
    
  const supabase =await createClient();
  await supabase.auth.signOut();
}

export const signUp = async (formData: FormData) => {
  try {
    const supabase = await createClient();
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const { error } = await supabase.auth.signUp({ email, password, options: {
    emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
  }, });
    if (error) return { error: error.message };
    return { success: true };
  } catch (error) {
    return { error: (error as Error).message };
  }
};


export const loginWithPassword = async (formData: FormData) => {
  try {
    const supabase = await createClient();
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    return { success: true };
  } catch (error) {
    return { error: (error as Error).message };
  }finally{
    redirect('/')
  }
};

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
  const supabase = await createClient()

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: 'http://localhost:3000/auth/reset-password',
  })

  if (error) {
    return { success: false, message: error.message }
  }

  return { success: true, message: 'Password reset link sent! Check your email.' }
}