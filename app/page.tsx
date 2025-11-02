"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/utils";

type Message = {
  id: number;
  content: string;
  created_at: string;
};

export default function HomePage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");

  // Fetch old messages + subscribe for new ones
  useEffect(() => {
    const fetchMessages = async () => {
      const { data } = await supabase
        .from("messages")
        .select("*")
        .order("created_at", { ascending: true });
      setMessages(data || []);
    };
    fetchMessages();

    // Realtime subscription
    const channel = supabase
      .channel("public:messages")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Send message
  const sendMessage = async () => {
    if (input.trim() === "") return;
    await supabase.from("messages").insert([{ content: input }]);
    setInput("");
  };

  return (
    <main className="max-w-md mx-auto mt-16 p-6 bg-white rounded-2xl shadow-md">
      <h1 className="text-2xl font-semibold text-center mb-6 text-blue-600">
        Supabase Chat
      </h1>

      <div className="h-72 overflow-y-auto border border-gray-200 rounded-lg p-4 mb-4 bg-gray-50">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className="bg-blue-100 text-gray-800 rounded-lg px-3 py-2 mb-2 w-fit max-w-xs"
          >
            {msg.content}
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button
          onClick={sendMessage}
          className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Send
        </button>
      </div>
    </main>
  );
}
