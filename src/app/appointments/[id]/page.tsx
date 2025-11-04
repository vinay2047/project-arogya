import AppointmentClient from "@/components/AppointmentClient";
import { createClient } from "@/supabase/server";

export default async function AppointmentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // ✅ Await the params promise first
  const { id } = await params;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user)
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-br from-orange-50 via-amber-100 to-amber-50 px-6">
        <div className="bg-white shadow-lg rounded-2xl p-8 max-w-md text-center border border-amber-200">
          <h2 className="text-2xl font-bold text-amber-800 mb-3">
            Access Required
          </h2>
          <p className="text-gray-700 mb-4">
            Please log in to join the appointment.
          </p>
          <a
            href="/signin"
            className="inline-block bg-amber-600 hover:bg-amber-700 text-white px-5 py-2 rounded-lg font-semibold transition-all duration-200"
          >
            Go to Login
          </a>
        </div>
      </div>
    );

  // ✅ Use id normally now
  const { data: appointment } = await supabase
    .from("appointments")
    .select("id, doctor_id, patient_id, scheduled_at")
    .eq("id", id)
    .single();

  if (!appointment)
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-br from-orange-50 via-amber-100 to-amber-50 px-6">
        <div className="bg-white shadow-lg rounded-2xl p-8 max-w-md text-center border border-amber-200">
          <h2 className="text-2xl font-bold text-red-600 mb-3">
            Appointment Not Found
          </h2>
          <p className="text-gray-700">
            We couldn’t find the appointment you’re looking for. Please check
            the link or contact support.
          </p>
        </div>
      </div>
    );

  const { data: doctorProfile } = await supabase
    .from("profiles")
    .select("name")
    .eq("id", appointment.doctor_id)
    .single();

  const doctorName = doctorProfile?.name || "Doctor";

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-100 to-amber-50 flex flex-col items-center justify-center px-6 py-10">
      <div className="w-full max-w-5xl bg-white border border-amber-200 shadow-xl rounded-2xl p-6 md:p-10">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-extrabold text-amber-800 mb-2">
            Appointment Room
          </h1>
          <p className="text-gray-600">
            You are joining a session with{" "}
            <span className="font-semibold text-amber-700">{doctorName}</span>.
          </p>
          <p className="text-gray-500 text-sm mt-1">
            Scheduled at:{" "}
            <span className="font-medium text-gray-700">
              {new Date(appointment.scheduled_at).toLocaleString()}
            </span>
          </p>
        </div>

        {/* ✅ The client-side appointment component */}
        <AppointmentClient
          user={user}
          appointment={appointment}
          doctorName={doctorName}
        />
      </div>
    </div>
  );
}
