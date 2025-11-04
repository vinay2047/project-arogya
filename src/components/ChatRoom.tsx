"use client";

import "stream-chat-react/dist/css/v2/index.css";
import { useEffect, useState } from "react";
import { StreamChat } from "stream-chat";
import {
  Chat,
  Channel,
  ChannelHeader,
  MessageList,
  MessageInput,
  Window,
} from "stream-chat-react";

type ChatRoomProps = {
  user: { id: string; name: string };
  doctorId: string;
  patientId: string;
  appointmentId: string;
};

export default function ChatRoom({
  user,
  doctorId,
  patientId,
  appointmentId,
}: ChatRoomProps) {
  const [client, setClient] = useState<StreamChat | null>(null);
  const [channel, setChannel] = useState<any>(null);

  useEffect(() => {
    const initChat = async () => {
      try {
        // ✅ Fetch Stream token and ensure both users exist
        const res = await fetch("/api/stream-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: user.id,
            name: user.name,
            otherUsers: [
              { id: doctorId },
              { id: patientId },
            ],
          }),
        });

        const data = await res.json();

        if (!data.token) {
          console.error("❌ Failed to fetch Stream token:", data);
          return;
        }

        // ✅ Initialize Stream client
        const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY!;
        const streamClient = StreamChat.getInstance(apiKey);

        await streamClient.connectUser(
          { id: user.id, name: user.name },
          data.token
        );

        // ✅ Create or get the appointment channel
        const channel = streamClient.channel("messaging", `appointment-${appointmentId}`, {
          members: [doctorId, patientId],
          custom: { appointmentId },
        });

        await channel.watch();

        setClient(streamClient);
        setChannel(channel);

        return () => {
          streamClient.disconnectUser();
        };
      } catch (error) {
        console.error("💥 Error initializing chat:", error);
      }
    };

    initChat();

    // Cleanup when component unmounts
    return () => {
      if (client) client.disconnectUser();
    };
  }, [user.id, user.name, doctorId, patientId, appointmentId]);

  if (!client || !channel) return <div>Loading chat...</div>;

  return (
    <Chat client={client} theme="str-chat__theme-light">
      <Channel channel={channel}>
        <Window>
          <ChannelHeader title={`Appointment #${appointmentId}`} />
          <MessageList />
          <MessageInput focus />
        </Window>
      </Channel>
    </Chat>
  );
}
