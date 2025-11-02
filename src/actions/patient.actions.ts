"use server";

import { redirect } from "next/navigation";
import { createClient } from "../supabase/server";

export async function createPatientProfile(formData: FormData) {
  const supabase = await createClient();

  const dob = formData.get("dob") as string;
  const gender = formData.get("gender") as string;
  const blood_group = formData.get("blood_group") as string;
  const address = formData.get("address") as string;


  if (!dob || !gender || !blood_group || !address) {
    throw new Error("All fields are required");
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/auth/signup");
  }

 
  const { data: existing } = await supabase
    .from("patient_profiles")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) {
    throw new Error("Profile already exists");
  }

  const { error } = await supabase.from("patient_profiles").insert([
    {
      user_id: user.id,
      dob,
      gender,
      blood_group,
      address,
    },
  ]);

  if (error) {
    console.error("Insert error:", error.message);
    throw new Error(error.message);
  }

  redirect("/dashboard/patient");
}
