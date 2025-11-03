import { NextResponse } from "next/server";
import { StreamChat } from "stream-chat";

export async function POST(req: Request) {
  try {
    const { user_id, name, otherUsers = [] } = await req.json();

    const serverClient = StreamChat.getInstance(
      process.env.NEXT_PUBLIC_STREAM_API_KEY!,
      process.env.STREAM_API_SECRET!
    );

    // ✅ Upsert current user
    const users = [
      { id: user_id, name: name || "Anonymous User" },
      ...otherUsers.map((u: any) => ({
        id: u.id,
        name: u.name || "Anonymous User",
      })),
    ];

    await serverClient.upsertUsers(users);

    const token = serverClient.createToken(user_id);
    return NextResponse.json({ token });
  } catch (err) {
    console.error("Stream token error:", err);
    return NextResponse.json(
      { error: "Failed to create Stream token" },
      { status: 500 }
    );
  }
}
