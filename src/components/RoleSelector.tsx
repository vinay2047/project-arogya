"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CheckCircle2 } from "lucide-react";

export default function RoleSelector() {
  const [selected, setSelected] = useState("");

  return (
    <RadioGroup
      name="role"
      required
      onValueChange={setSelected}
      className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2"
    >
      {/* Patient Option */}
      <div
        onClick={() => setSelected("PATIENT")}
        className={`relative cursor-pointer flex flex-col items-center justify-center rounded-xl p-4 font-medium text-amber-800 border transition-all ${
          selected === "PATIENT"
            ? "border-amber-500 bg-amber-50 shadow-md"
            : "border-amber-200 hover:bg-amber-50 hover:border-amber-400"
        }`}
      >
        <RadioGroupItem
          value="PATIENT"
          id="patient"
          checked={selected === "PATIENT"}
          className="hidden"
        />
        <Label htmlFor="patient" className="cursor-pointer text-center">
          I’m a Patient
        </Label>
        {selected === "PATIENT" && (
          <CheckCircle2 className="absolute top-2 right-2 h-5 w-5 text-amber-500" />
        )}
      </div>

      {/* Doctor Option */}
      <div
        onClick={() => setSelected("DOCTOR")}
        className={`relative cursor-pointer flex flex-col items-center justify-center rounded-xl p-4 font-medium text-amber-800 border transition-all ${
          selected === "DOCTOR"
            ? "border-amber-500 bg-amber-50 shadow-md"
            : "border-amber-200 hover:bg-amber-50 hover:border-amber-400"
        }`}
      >
        <RadioGroupItem
          value="DOCTOR"
          id="doctor"
          checked={selected === "DOCTOR"}
          className="hidden"
        />
        <Label htmlFor="doctor" className="cursor-pointer text-center">
          I’m a Professional
        </Label>
        {selected === "DOCTOR" && (
          <CheckCircle2 className="absolute top-2 right-2 h-5 w-5 text-amber-500" />
        )}
      </div>
    </RadioGroup>
  );
}
