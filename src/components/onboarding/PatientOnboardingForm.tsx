"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function PatientOnboardingForm({ userId, name }: { userId: string; name: string }) {
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({ dob, gender });
    
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-md">
      <h2 className="text-xl font-semibold">Welcome, {name}</h2>
      <Input type="date" value={dob} onChange={(e) => setDob(e.target.value)} />
      <select
        className="border p-2 rounded-md"
        value={gender}
        onChange={(e) => setGender(e.target.value)}
      >
        <option value="">Select gender</option>
        <option value="male">Male</option>
        <option value="female">Female</option>
        <option value="other">Other</option>
      </select>
      <Button type="submit">Finish Setup</Button>
    </form>
  );
}
