"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import verifyDoctorAction from "@/actions/doctor.actions";

export default function DoctorOnboardingForm() {
  const [result, setResult] = useState<any>(null);
  const [isPending, startTransition] = useTransition();

  const handleAction = async (formData: FormData) => {
    startTransition(async () => {
      const res = await verifyDoctorAction(formData);
      setResult(res);
    });
  };

  return (
    <form
      action={handleAction}
      className="flex flex-col gap-4 w-full max-w-md p-6 border rounded-xl shadow-sm"
    >
      <h2 className="text-2xl font-semibold text-center mb-2">
        Doctor Onboarding
      </h2>

      {/* Official Verification Info */}
      <Input name="hprId" placeholder="HPR ID (e.g., 71-XXXX-XXXX-XXXX)" required />
      <Input name="aadhaar" placeholder="Aadhaar Number (Optional)" />
      <Input name="licenseNumber" placeholder="Medical License Number (Optional)" />

      {/* Profile Details */}
      <Input name="specialization" placeholder="Specialization (e.g., Cardiology)" required />
      <Input name="experienceYears" placeholder="Experience (in years)" type="number" min="0" />
      <Input name="hospitalId" placeholder="Hospital ID (optional)" />
      <Textarea
        name="tags"
        placeholder="Tags (comma separated, e.g., cardiology, diabetes, surgery)"
      />

      <Button type="submit" disabled={isPending}>
        {isPending ? "Verifying & Saving..." : "Verify and Create Profile"}
      </Button>

      {result && (
        <div
          className={`mt-4 text-center ${
            result.verified ? "text-green-600" : "text-red-600"
          }`}
        >
          {result.message || result.error}
        </div>
      )}
    </form>
  );
}
