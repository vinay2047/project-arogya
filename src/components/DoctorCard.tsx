"use client";

import React from "react";

interface DoctorCardProps {
  doctor_code: string;
  name: string;
  specialization: string;
  experience_years?: number;
  onBook: () => void;
}

export default function DoctorCard({
  doctor_code,
  name,
  specialization,
  experience_years,
  onBook,
}: DoctorCardProps) {
  // Highlight any '7' character in yellow and slightly bigger
  const highlightSevens = (text: string | number) => {
    if (!text) return "";
    return String(text)
      .split("")
      .map((char, i) =>
        char === "7" ? (
          <span key={i} className="text-yellow-500 text-lg font-semibold">
            {char}
          </span>
        ) : (
          <span key={i}>{char}</span>
        )
      );
  };

  return (
    <div className="p-5 rounded-xl shadow-lg border border-orange-100 bg-white hover:shadow-xl transition-all space-y-3">
      {/* Doctor Name */}
      <h3 className="text-xl font-bold text-gray-900">
        {highlightSevens(name || "Dr. Unknown")}
      </h3>

      {/* Doctor Code */}
      <p className="text-gray-600 text-sm">
        <strong>Doctor Code:</strong> {highlightSevens(doctor_code)}
      </p>

      {/* Specialization */}
      <p className="text-gray-700">
        <strong>Specialization:</strong>{" "}
        {highlightSevens(specialization || "General")}
      </p>

      {/* Experience (optional) */}
      {experience_years !== undefined && (
        <p className="text-gray-700">
          <strong>Experience:</strong>{" "}
          {highlightSevens(`${experience_years} years`)}
        </p>
      )}

      {/* Book Button */}
      <button
        onClick={onBook}
        className="mt-4 w-full bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-lg font-medium transition-all"
      >
        Book Appointment
      </button>
    </div>
  );
}
