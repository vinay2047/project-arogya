"use client";

import { useEffect, useState } from "react";
import { Channel as StreamChannel, StreamChat } from "stream-chat";
import {
  Channel,
  ChannelHeader,
  Chat,
  LoadingIndicator,
  MessageInput,
  MessageList,
  Window,
} from "stream-chat-react";
import "stream-chat-react/dist/css/v2/index.css";

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
  const [channel, setChannel] = useState<StreamChannel | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        const res = await fetch("/api/stream-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: user.id,
            name: user.name,
          }),
        });

        const data = await res.json();

        if (!data.token) {
          console.error("Chat token fetch failed:", data);
          return;
        }

        const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY!;
        const streamClient = StreamChat.getInstance(apiKey);

        await streamClient.connectUser(
          { id: user.id, name: user.name },
          data.token
        );

        const members = [doctorId, patientId];

        const ch = streamClient.channel(
          "messaging",
          `appointment-${appointmentId}`,
          {
            members,
            appointmentId,
          } as any
        );

        await ch.watch();

        setClient(streamClient);
        setChannel(ch);

        return () => streamClient.disconnectUser();
      } catch (err) {
        console.error("Error initializing chat:", err);
      }
    };

    init();
  }, [appointmentId, doctorId, patientId, user.id, user.name]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <LoadingIndicator />
        <span className="ml-2 text-gray-600">Loading chat...</span>
      </div>
    );
  }

  if (!client || !channel) {
    return (
      <div className="text-center py-8 text-gray-500">
        Unable to load chat. Please try again later.
      </div>
    );
  }

  return (
    <Chat client={client} theme="str-chat__theme-light">
      <Channel channel={channel}>
        <Window>
          <ChannelHeader title={`Appointment #${appointmentId}`} />
          <MessageList />
          <MessageInput focus placeholder="Type your message..." />
        </Window>
      </Channel>
    </Chat>
  );
}
