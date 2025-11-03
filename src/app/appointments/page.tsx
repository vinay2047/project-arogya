"use client";

import { createClient } from "@/supabase/client";
import { useEffect, useState } from "react";


export default function UserAppointmentsPage() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        // Get the logged-in 
        const supabase =createClient();
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
          setMessage("You must be logged in to view appointments.");
          setLoading(false);
          return;
        }

        // Get user role from profiles table
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

        // Determine filter based on role
        const column = profile.role === "DOCTOR" ? "doctor_id" : "patient_id";

        // Fetch appointments
        const { data: appointmentsData, error: appointmentsError } = await supabase
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

  if (loading) return <p className="text-center mt-8">Loading appointments...</p>;
  if (message) return <p className="text-center mt-8">{message}</p>;
  if (appointments.length === 0)
    return <p className="text-center mt-8">No appointments found.</p>;

  return (
    <div className="max-w-4xl mx-auto mt-12 px-4">
      <h2 className="text-2xl font-bold mb-6 text-center">My Appointments</h2>
      <div className="space-y-4">
        {appointments.map((appt) => (
          <div key={appt.id} className="border p-4 rounded shadow-md bg-white">
            <p><strong>ID:</strong> {appt.id}</p>
            <p><strong>Patient ID:</strong> {appt.patient_id}</p>
            <p><strong>Doctor ID:</strong> {appt.doctor_id}</p>
            <p><strong>Scheduled At:</strong> {new Date(appt.scheduled_at).toLocaleString()}</p>
            <p><strong>Duration:</strong> {appt.duration_minutes || 30} mins</p>
            <p>
              <strong>Status:</strong>{" "}
              <span
                className={
                  appt.status === "CONFIRMED"
                    ? "text-green-600 font-semibold"
                    : appt.status === "PENDING"
                    ? "text-yellow-600 font-semibold"
                    : "text-red-600 font-semibold"
                }
              >
                {appt.status}
              </span>
            </p>
            {appt.notes && <p><strong>Notes:</strong> {appt.notes}</p>}
            <p><strong>Created At:</strong> {new Date(appt.created_at).toLocaleString()}</p>
            <p><strong>Updated At:</strong> {new Date(appt.updated_at).toLocaleString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
