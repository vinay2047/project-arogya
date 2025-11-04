import DoctorOnboardingForm from "@/components/onboarding/DoctorOnboardingForm";
import PatientOnboardingForm from "@/components/onboarding/PatientOnboardingForm";
import { createClient } from "../../supabase/server";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

export default async function OnboardingPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-100 px-4">
        <Card className="w-full max-w-md shadow-xl border border-amber-200/60 bg-white/90 backdrop-blur-md rounded-2xl p-6 text-center">
          <CardHeader>
            <CardTitle className="text-3xl font-semibold text-amber-900">
              Please Log In
            </CardTitle>
            <CardDescription className="text-amber-700 mt-2">
              You must be logged in to continue onboarding.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role, name")
    .eq("id", user.id)
    .single();

  if (error || !profile)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-100 px-4">
        <Card className="w-full max-w-md shadow-xl border border-amber-200/60 bg-white/90 backdrop-blur-md rounded-2xl p-6 text-center">
          <CardHeader>
            <CardTitle className="text-3xl font-semibold text-amber-900">
              Profile Not Found
            </CardTitle>
            <CardDescription className="text-amber-700 mt-2">
              We couldn’t locate your profile. Please try again later.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-100 px-4">
      <Card className="w-full max-w-lg shadow-xl border border-amber-200/60 bg-white/90 backdrop-blur-md rounded-2xl p-8 transition-all duration-300 hover:shadow-2xl">
        <CardHeader className="text-center mb-4">
          <CardTitle className="text-3xl font-semibold text-amber-900">
            Welcome, {profile.name}
          </CardTitle>
          <CardDescription className="text-amber-700">
            Let’s get you set up to begin your journey
          </CardDescription>
        </CardHeader>

        <CardContent>
          {profile.role === "DOCTOR" ? (
            <DoctorOnboardingForm userId={user.id} name={profile.name} />
          ) : (
            <PatientOnboardingForm userId={user.id} name={profile.name} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
