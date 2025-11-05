"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Plus, X } from "lucide-react";
import verifyDoctorAction from "@/actions/doctor.actions";

const SPECIALIZATION_OPTIONS = [
  { value: "general_physician", label: "General Physician" },
  { value: "cardiologist", label: "Cardiologist" },
  { value: "dermatologist", label: "Dermatologist" },
  { value: "orthopedic", label: "Orthopedic" },
  { value: "pediatrician", label: "Pediatrician" },
  { value: "psychiatrist", label: "Psychiatrist" },
  { value: "neurologist", label: "Neurologist" },
  { value: "gynecologist", label: "Gynecologist" },
  { value: "urologist", label: "Urologist" },
  { value: "endocrinologist", label: "Endocrinologist" },
  { value: "oncologist", label: "Oncologist" },
  { value: "radiologist", label: "Radiologist" },
  { value: "ent_specialist", label: "ENT Specialist" },
  { value: "dentist", label: "Dentist" },
  { value: "ophthalmologist", label: "Ophthalmologist" },
  { value: "pulmonologist", label: "Pulmonologist" },
  { value: "gastroenterologist", label: "Gastroenterologist" },
  { value: "nephrologist", label: "Nephrologist" },
  { value: "surgeon", label: "Surgeon" },
];

export default function DoctorOnboardingForm() {
  const [result, setResult] = useState<any>(null);
  const [isPending, startTransition] = useTransition();

  const [coords, setCoords] = useState<{ lat: number | null; lng: number | null }>({
    lat: null,
    lng: null,
  });
  const [locStatus, setLocStatus] = useState<string>("");

  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [specialization, setSpecialization] = useState("");

  const handleEnableLocation = () => {
    if (!navigator.geolocation) {
      setLocStatus("Geolocation not supported in your browser.");
      return;
    }

    setLocStatus("Requesting permission...");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocStatus("✅ Location enabled successfully!");
      },
      (err) => {
        console.warn("Location access denied:", err.message);
        setLocStatus("⚠️ Could not access location. You can continue without it.");
      }
    );
  };

  const handleAddTag = () => {
    const trimmed = newTag.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setNewTag("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleAction = async (formData: FormData) => {
    formData.append("latitude", String(coords.lat ?? ""));
    formData.append("longitude", String(coords.lng ?? ""));
    formData.append("specialization", specialization);
    formData.append("tags", JSON.stringify(tags));

    startTransition(async () => {
      const res = await verifyDoctorAction(formData);
      setResult(res);
    });
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-semibold">
            Doctor Onboarding
          </CardTitle>
        </CardHeader>

        <CardContent>
          <form action={handleAction} className="flex flex-col gap-6">
            {/* Location Access */}
            <div className="flex flex-col gap-2">
              <Label>Location Access (Optional)</Label>
              <p className="text-sm text-gray-600">
                Help patients find you easily by sharing your clinic or practice location.
              </p>
              <Button type="button" variant="outline" onClick={handleEnableLocation}>
                📍 Enable Location
              </Button>
              {locStatus && (
                <p
                  className={`text-sm ${
                    locStatus.startsWith("✅")
                      ? "text-green-600"
                      : locStatus.startsWith("⚠️")
                      ? "text-yellow-600"
                      : "text-gray-500"
                  }`}
                >
                  {locStatus}
                </p>
              )}
            </div>

            {/* Official Info */}
            <Input name="hprId" placeholder="HPR ID (e.g., 71-XXXX-XXXX-XXXX)" required />
            <Input name="aadhaar" placeholder="Aadhaar Number (Optional)" />
            <Input name="licenseNumber" placeholder="Medical License Number (Optional)" />

            {/* Specialization */}
            <div className="grid gap-2">
              <Label>Specialization</Label>
              <Select onValueChange={setSpecialization} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select specialization" />
                </SelectTrigger>
                <SelectContent>
                  {SPECIALIZATION_OPTIONS.map((spec) => (
                    <SelectItem key={spec.value} value={spec.value}>
                      {spec.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Experience */}
            <Input
              name="experienceYears"
              placeholder="Experience (in years)"
              type="number"
              min="0"
            />
            <Input name="hospitalId" placeholder="Hospital ID (Optional)" />

            {/* Tags */}
            <div className="flex flex-col gap-2">
              <Label>Tags</Label>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {tag}
                    <X
                      className="w-3 h-3 cursor-pointer"
                      onClick={() => handleRemoveTag(tag)}
                    />
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2 mt-1">
                <Input
                  placeholder="Add tag (e.g., diabetes)"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddTag}
                  disabled={!newTag.trim()}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

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
        </CardContent>
      </Card>
    </div>
  );
}
