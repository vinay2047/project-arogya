"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function DoctorOnboardingForm() {
  const [hprId, setHprId] = useState("");
  const [aadhaar, setAadhaar] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/verify-doctor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hprId: hprId.trim() || undefined,
          aadhaar: aadhaar.trim() || undefined,
          licenseNumber: licenseNumber.trim() || undefined,
        }),
      });

      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error(err);
      setResult({ error: "Something went wrong. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleVerify} className="flex flex-col gap-4 w-full max-w-md">
      <h2 className="text-xl font-semibold text-center">Doctor Verification</h2>

      <Input
        placeholder="Enter your HPR ID (e.g., HPR-1234-5678-9012)"
        value={hprId}
        onChange={(e) => setHprId(e.target.value)}
      />

      <Input
        placeholder="Aadhaar Number (optional)"
        value={aadhaar}
        onChange={(e) => setAadhaar(e.target.value)}
      />

      <Input
        placeholder="Medical License Number (optional)"
        value={licenseNumber}
        onChange={(e) => setLicenseNumber(e.target.value)}
      />

      <Button type="submit" disabled={loading}>
        {loading ? "Verifying..." : "Verify Doctor"}
      </Button>

      {result && (
        <div className="mt-4 text-center">
          {result.verified ? (
            <p className="text-green-600">
              ✅ Verified! HPR ID: {result.hprId}
            </p>
          ) : (
            <p className="text-red-600">
              ❌ {result.error || "Verification failed"}
            </p>
          )}
        </div>
      )}
    </form>
  );
}
