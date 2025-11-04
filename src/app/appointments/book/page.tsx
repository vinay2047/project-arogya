"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/supabase/client";
import DoctorCard from "@/components/DoctorCard";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";

export default function BookAppointmentPage() {
  const supabase = createClient();
  const router = useRouter();

  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
  const [selectedTime, setSelectedTime] = useState("");
  const [showModal, setShowModal] = useState(false);

  // ✅ Fetch doctors
  useEffect(() => {
    const fetchDoctors = async () => {
      const { data, error } = await supabase
        .from("doctor_profiles")
        .select("user_id, doctor_code, specialization, experience_years, profiles(name)")
        .eq("verified_by_admin", true);

      if (error) {
        console.error("Error fetching doctors:", error);
      } else {
        const doctorList = data.map((doc: any) => ({
          ...doc,
          name: doc.profiles?.name || "Dr. Unknown",
        }));
        setDoctors(doctorList);
      }
      setLoading(false);
    };

    fetchDoctors();
  }, []);

  // ✅ When user clicks "Book Appointment"
  const handleBookClick = (doctor: any) => {
    setSelectedDoctor(doctor);
    setShowModal(true);
    setMessage("");
  };

  // ✅ Confirm booking
  const handleConfirmBooking = async () => {
    if (!selectedDoctor || !selectedTime) {
      setMessage("⚠️ Please select a valid time before confirming.");
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setMessage("You must be logged in to book an appointment.");
      return;
    }

    // Convert to UTC
    const localDate = new Date(selectedTime);
    const utcDate = new Date(localDate.getTime() - localDate.getTimezoneOffset() * 60000);

    // Check for conflicts
    const { data: conflicts, error: conflictError } = await supabase
      .from("appointments")
      .select("*")
      .eq("doctor_id", selectedDoctor.user_id)
      .eq("scheduled_at", utcDate.toISOString());

    if (conflictError) {
      console.error("Error checking conflicts:", conflictError);
      setMessage("Error checking existing appointments.");
      return;
    }

    if (conflicts && conflicts.length > 0) {
      setMessage("⚠️ This time slot is already booked. Please choose another.");
      return;
    }

    // Insert appointment
    const { error: insertError } = await supabase.from("appointments").insert([
      {
        patient_id: user.id,
        doctor_id: selectedDoctor.user_id,
        scheduled_at: utcDate.toISOString(),
        duration_minutes: 30,
        status: "PENDING",
      },
    ]);

    if (insertError) {
      console.error("Error booking appointment:", insertError);
      setMessage("❌ Failed to book appointment. Please try again.");
    } else {
      setMessage("✅ Appointment booked successfully! Redirecting...");
      setTimeout(() => {
        setShowModal(false);
        router.push("/dashboard");
      }, 1500);
    }
  };

  // ✅ UI
  if (loading)
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-lg text-gray-700 font-medium">Loading doctors...</p>
      </div>
    );

  if (doctors.length === 0)
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-lg text-gray-700 font-medium">No doctors available.</p>
      </div>
    );

  return (
    <>
      <Navbar />
      <div className="max-w-6xl mx-auto mt-24 px-4">
        <h2 className="text-3xl font-bold mb-8 text-center text-orange-800">
          Book an Appointment
        </h2>

        {message && (
          <div
            className={`text-center mb-6 font-medium ${
              message.includes("✅") ? "text-green-600" : "text-red-600"
            }`}
          >
            {message}
          </div>
        )}

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {doctors.map((doctor) => (
            <DoctorCard
              key={doctor.user_id}
              doctor_code={doctor.doctor_code}
              name={doctor.name}
              specialization={doctor.specialization}
              experience_years={doctor.experience_years}
              onBook={() => handleBookClick(doctor)}
            />
          ))}
        </div>

        {/* ✅ Time Picker Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-lg p-8 w-[90%] sm:w-[400px] text-center">
              <h3 className="text-xl font-semibold mb-4 text-gray-800">
                Select Time for {selectedDoctor?.name}
              </h3>

              <input
                type="datetime-local"
                className="border border-gray-300 rounded-md w-full p-2 mb-6"
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
              />

              <div className="flex justify-center gap-4">
                <button
                  onClick={handleConfirmBooking}
                  className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg font-medium"
                >
                  Confirm
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-5 py-2 rounded-lg font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
