import VideoCall from "@/components/VideoCall";
import { createClient } from "@/supabase/server";

export default async function AppointmentPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return <div>Please log in to join the call.</div>;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-2xl font-semibold mb-4">
        Appointment Call Room #{params.id}
      </h1>

      <div className="w-full max-w-5xl aspect-video bg-black rounded-2xl overflow-hidden shadow-lg">
        <VideoCall
          user={{ id: user.id, name: user.user_metadata.full_name }}
          appointmentId={params.id}
        />
      </div>
    </div>
  );
}
