"use server";

import { redirect } from "next/navigation";
import { createClient } from "../../utils/supabase/server";

export async function setUserDetails(formData: FormData) {
  const supabase = await createClient();

  const name = formData.get("name") as string;
  const role = formData.get("role") as "DOCTOR" | "PATIENT";

  if (!name || !role) {
    return { error: "Both name and role are required." };
  }

  
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { error: "Not authenticated. Please log in again." };
  }


  const { data: existing } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (existing) {
    return { error: "Profile already exists." };
  }

  const { error } = await supabase
    .from("profiles")
    .insert([{ id: user.id, name, role }]);

  if (error) {
    return { error: error.message };
  }

 
 redirect("/onboarding");
}
