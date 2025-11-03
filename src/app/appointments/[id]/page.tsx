import AppointmentClient from "@/components/AppointmentClient";
import { createClient } from "@/supabase/server";


export default async function AppointmentPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Please log in to join the appointment.</p>
      </div>
    );

  // Fetch appointment and doctor name
  const { data: appointment } = await supabase
    .from("appointments")
    .select("id, doctor_id, patient_id, scheduled_at")
    .eq("id", params.id)
    .single();

  if (!appointment)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Appointment not found.</p>
      </div>
    );

  const { data: doctorProfile } = await supabase
    .from("profiles")
    .select("name")
    .eq("id", appointment.doctor_id)
    .single();

  const doctorName = doctorProfile?.name || "Doctor";

  return (
    <AppointmentClient
      user={user}
      appointment={appointment}
      doctorName={doctorName}
    />
  );
}
