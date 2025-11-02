import DoctorOnboardingForm from "@/components/onboarding/DoctorOnboardingForm";
import PatientOnboardingForm from "@/components/onboarding/PatientOnboardingForm";
import { createClient } from "../../supabase/server";

export default async function OnboardingPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user)
    return <div className="text-center mt-10">Please log in first.</div>;

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role, name")
    .eq("id", user.id)
    .single();

  if (error || !profile)
    return <div className="text-center mt-10">Profile not found.</div>;

  return (
    <div className="flex items-center justify-center min-h-screen">
      {profile.role === "DOCTOR" ? (
        <DoctorOnboardingForm userId={user.id} name={profile.name} />
      ) : (
        <PatientOnboardingForm userId={user.id} name={profile.name} />
      )}
    </div>
  );
}
