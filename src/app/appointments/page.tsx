"use client";

import { createClient } from "@/supabase/client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function UserAppointmentsPage() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const supabase = createClient();
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          setMessage("You must be logged in to view appointments.");
          setLoading(false);
          return;
        }

        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        if (profileError || !profile) {
          setMessage("Failed to fetch user profile.");
          setLoading(false);
          return;
        }

        const column = profile.role === "DOCTOR" ? "doctor_id" : "patient_id";

        const { data: appointmentsData, error: appointmentsError } =
          await supabase
            .from("appointments")
            .select("*")
            .eq(column, user.id)
            .order("scheduled_at", { ascending: true });

        if (appointmentsError) {
          console.error("Error fetching appointments:", appointmentsError);
          setMessage("Failed to fetch appointments.");
        } else {
          setAppointments(appointmentsData || []);
        }
      } catch (err) {
        console.error("Unexpected error:", err);
        setMessage("Something went wrong.");
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  if (loading)
    return <p className="text-center mt-8">Loading appointments...</p>;
  if (message) return <p className="text-center mt-8">{message}</p>;
  if (appointments.length === 0)
    return <p className="text-center mt-8">No appointments found.</p>;

  return (
    <div className="max-w-5xl mx-auto mt-12 px-4">
      <h2 className="text-3xl font-bold mb-8 text-center text-amber-800">
        My Appointments
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {appointments.map((appt) => (
          <div
            key={appt.id}
            onClick={() => router.push(`/appointments/${appt.id}`)}
            className="cursor-pointer border border-amber-200 p-5 rounded-2xl bg-white shadow-md hover:shadow-lg transition-all hover:scale-[1.02]"
          >
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-500">
                  <strong>ID:</strong> {appt.id.slice(0, 8)}...
                </p>
                <span
                  className={`text-xs px-3 py-1 rounded-full font-semibold ${
                    appt.status === "CONFIRMED"
                      ? "bg-green-100 text-green-700"
                      : appt.status === "PENDING"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {appt.status}
                </span>
              </div>

              <p className="text-gray-700">
                <strong>Patient:</strong> {appt.patient_id.slice(0, 6)}...
              </p>
              <p className="text-gray-700">
                <strong>Doctor:</strong> {appt.doctor_id.slice(0, 6)}...
              </p>
              <p className="text-gray-600">
                <strong>Scheduled At:</strong>{" "}
                {new Date(appt.scheduled_at).toLocaleString()}
              </p>
              <p className="text-gray-600">
                <strong>Duration:</strong> {appt.duration_minutes || 30} mins
              </p>
              {appt.notes && (
                <p className="text-gray-500 text-sm italic">
                  “{appt.notes.length > 50
                    ? appt.notes.slice(0, 50) + "..."
                    : appt.notes}”
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
