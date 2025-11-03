import { NextResponse } from "next/server";
import { StreamClient } from "@stream-io/node-sdk";

export async function POST(req) {
  const { user_id } = await req.json();

  const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY;
  const apiSecret = process.env.STREAM_API_SECRET;

  if (!apiKey || !apiSecret) {
    return NextResponse.json(
      { error: "Missing Stream credentials" },
      { status: 500 }
    );
  }

  const serverClient = new StreamClient(apiKey, apiSecret);
  const token = serverClient.createToken(user_id);

  return NextResponse.json({ token });
}
