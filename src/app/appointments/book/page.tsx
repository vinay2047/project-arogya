"use client";

import DoctorCard from "@/components/DoctorCard";
import { createClient } from "@/supabase/client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function BookAppointmentPage() {
  const router = useRouter();
  const [doctors, setDoctors] = useState<any[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Fetch all doctors
  useEffect(() => {
    const fetchDoctors = async () => {
      const supabase =createClient();
      const { data, error } = await supabase
        .from("doctor_profiles")
        .select("*");
      if (error) console.error("Error fetching doctors:", error);
      else setDoctors(data || []);
    };
    fetchDoctors();
  }, []);

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    if (!selectedDoctor) {
      setMessage("Please select a doctor.");
      setLoading(false);
      return;
    }

    // Get logged-in patient
    const supabase =createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setMessage("You must be logged in as a patient.");
      setLoading(false);
      return;
    }

    try {
      // 1️⃣ Convert local date + time to UTC Date object
      const [year, month, day] = date.split("-").map(Number);
      const [hours, minutes] = time.split(":").map(Number);
      const scheduledAtUTC = new Date(
        Date.UTC(year, month - 1, day, hours, minutes, 0)
      );
      const duration = selectedDoctor.duration_minutes || 30;

      const newStart = scheduledAtUTC;
      const newEnd = new Date(scheduledAtUTC.getTime() + duration * 60000);

      // 2️⃣ Fetch existing appointments
      const { data: existingAppointments, error: fetchError } = await supabase
        .from("appointments")
        .select("scheduled_at, duration_minutes")
        .eq("doctor_id", selectedDoctor.user_id)
        .in("status", ["PENDING", "CONFIRMED"]);

      if (fetchError) {
        console.error("Error fetching appointments:", fetchError);
        setMessage("Error checking availability.");
        setLoading(false);
        return;
      }

      // 3️⃣ Check for overlap
      const hasOverlap = existingAppointments?.some((appt: any) => {
        const apptStart = new Date(appt.scheduled_at);
        const apptDuration = appt.duration_minutes || 30;
        const apptEnd = new Date(apptStart.getTime() + apptDuration * 60000);
        return newStart < apptEnd && newEnd > apptStart;
      });

      if (hasOverlap) {
        setMessage(
          "⚠️ This time slot is already booked. Please choose another time."
        );
        setLoading(false);
        return;
      }

      // 4️⃣ Insert appointment
      const { error: insertError } = await supabase
        .from("appointments")
        .insert([
          {
            patient_id: user.id,
            doctor_id: selectedDoctor.user_id,
            scheduled_at: scheduledAtUTC.toISOString(), // UTC ISO string ✅
            duration_minutes: duration,
            status: "PENDING",
            notes: "New appointment request",
          },
        ]);

      if (insertError) {
        console.error("Error inserting appointment:", insertError);
        setMessage("Error booking appointment.");
      } else {
        setMessage(
          "✅ Appointment booked successfully! Waiting for doctor confirmation."
        );
        setTimeout(() => router.push("/dashboard/patient/appointments"), 1500);
      }
    } catch (err) {
      console.error("Error processing date/time:", err);
      setMessage("Invalid date or time.");
    }

    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto mt-12 px-4">
      <h2 className="text-2xl font-bold mb-6 text-center">Book Appointment</h2>

      {/* Doctor Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {doctors.map((doc) => (
          <DoctorCard
            key={doc.user_id}
            doctor={doc}
            onSelect={() => setSelectedDoctor(doc)}
          />
        ))}
      </div>

      {/* Appointment Form */}
      {selectedDoctor && (
        <form
          onSubmit={handleBook}
          className="bg-white p-6 rounded-xl shadow-md space-y-4"
        >
          <h3 className="font-semibold text-lg mb-2">Booking with:</h3>
          <div className="bg-gray-50 p-3 rounded mb-4">
            <p>
              <strong>Doctor Code:</strong> {selectedDoctor.doctor_code}
            </p>
            <p>
              <strong>Specialization:</strong> {selectedDoctor.specialization}
            </p>
            {selectedDoctor.experience_years != null && (
              <p>
                <strong>Experience:</strong> {selectedDoctor.experience_years}{" "}
                years
              </p>
            )}
            {selectedDoctor.license_number && (
              <p>
                <strong>License:</strong> {selectedDoctor.license_number}
              </p>
            )}
            {selectedDoctor.verified_by_admin && (
              <p className="text-green-600 font-semibold">Verified</p>
            )}
            {!selectedDoctor.verified_by_admin && (
              <p className="text-yellow-600 font-semibold">
                Pending Verification
              </p>
            )}
          </div>

          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="border p-2 rounded w-full"
            required
          />

          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="border p-2 rounded w-full"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
          >
            {loading ? "Booking..." : "Confirm Appointment"}
          </button>
        </form>
      )}

      {/* Feedback message */}
      {message && <p className="text-center mt-4 text-green-700">{message}</p>}
    </div>
  );
}
