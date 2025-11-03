"use client";

import {
  CallControls,
  SpeakerLayout,
  StreamCall,
  StreamVideo,
  StreamVideoClient,
  Call,
} from "@stream-io/video-react-sdk";
import "@stream-io/video-react-sdk/dist/css/styles.css";
import { useEffect, useState } from "react";

export default function VideoCall({
  user,
  appointmentId,
}: {
  user: { id: string; name: string; avatar?: string };
  appointmentId: string;
}) {
  const [client, setClient] = useState<StreamVideoClient | null>(null);
  const [call, setCall] = useState<Call | null>(null);

  useEffect(() => {
    let activeClient: StreamVideoClient | null = null;

    async function init() {
      try {
        // 1️⃣ Fetch a token from your backend route
        const res = await fetch("/api/video-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: user.id }),
        });

        if (!res.ok) throw new Error("Failed to get token");
        const { token } = await res.json();

        // 2️⃣ Get Stream API key from env
        const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY;
        if (!apiKey) throw new Error("Missing NEXT_PUBLIC_STREAM_API_KEY");

        // 3️⃣ Create client instance
        const videoClient = new StreamVideoClient({
          apiKey,
          user: {
            id: user.id,
            name: user.name,
            image: user.avatar || "https://placekitten.com/100/100",
          },
          token,
        });

        activeClient = videoClient;
        setClient(videoClient);

        // 4️⃣ Create or join the call room using appointment ID
        const activeCall = videoClient.call("default", `appointment-${appointmentId}`);
        await activeCall.join({ create: true });
        setCall(activeCall);
      } catch (error) {
        console.error("Stream video init failed:", error);
      }
    }

    init();

    // 5️⃣ Cleanup function — disconnects client safely
    return () => {
      if (activeClient) {
        activeClient.disconnectUser();
      }
    };
  }, [user, appointmentId]);

  if (!client || !call) return <div>Loading call...</div>;

  return (
    <StreamVideo client={client}>
      <StreamCall call={call}>
        <SpeakerLayout />
        <CallControls />
      </StreamCall>
    </StreamVideo>
  );
}
