import { NextResponse } from 'next/server';
import { StreamChat } from 'stream-chat';

export async function POST(req) {
  const { user_id } = await req.json();

  const serverClient = StreamChat.getInstance(
    process.env.NEXT_PUBLIC_STREAM_API_KEY!,
    process.env.STREAM_API_SECRET
  );

  const token = serverClient.createToken(user_id);
  return NextResponse.json({ token });
}
