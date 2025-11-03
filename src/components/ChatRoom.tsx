"use client";

import { useEffect, useState } from "react";
import {
  Chat,
  Channel,
  ChannelHeader,
  MessageList,
  MessageInput,
  Window,
} from "stream-chat-react";
import { StreamChat } from "stream-chat";
import "@getstream/chat-react/dist/css/v2/index.css";

type ChatRoomProps = {
  user: { id: string; name: string };
  doctorId: string;
  appointmentId: string;
};

export default function ChatRoom({
  user,
  doctorId,
  appointmentId,
}: ChatRoomProps) {
  const [client, setClient] = useState<StreamChat | null>(null);
  const [channel, setChannel] = useState<any>(null);

  useEffect(() => {
    const init = async () => {
      const res = await fetch("/api/chat-token", { method: "POST" });
      const data = await res.json();

      const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY!;
      const streamClient = StreamChat.getInstance(apiKey);

      await streamClient.connectUser(
        { id: user.id, name: user.name },
        data.token
      );

      // Create/Join 1-to-1 chat channel
      const ch = streamClient.channel("messaging", `appointment-${appointmentId}`, {
        members: [user.id, doctorId],
      });

      await ch.watch();

      setClient(streamClient);
      setChannel(ch);
    };

    init();

    return () => {
      client?.disconnectUser();
    };
  }, [appointmentId, doctorId, user.id, user.name]);

  if (!client || !channel) return <div>Loading chat...</div>;

  return (
    <Chat client={client}>
      <Channel channel={channel}>
        <Window>
          <ChannelHeader />
          <MessageList />
          <MessageInput focus />
        </Window>
      </Channel>
    </Chat>
  );
}
