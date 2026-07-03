import * as Ably from "ably";
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
export async function GET() {
  const apiKey = process.env.ABLY_API_KEY;
  const supabase = await createClient();
  if (!apiKey) {
    return NextResponse.json({ error: "Ably API key not configured" }, { status: 500 });
  }
  const {
    data: { user },
  } = await supabase.auth.getUser();
  try {
    const client = new Ably.Rest(apiKey);
    const capability = user
      ? { "*": ["subscribe", "publish", "presence", "history"] }
      : { "public:*": ["subscribe"] };
    const tokenRequestData = await client.auth.createTokenRequest({
      capability: JSON.stringify(capability),
    });
    return NextResponse.json(tokenRequestData);
  } catch (err) {
    console.error("Error creating Ably token request:", err);
    return NextResponse.json({ error: "Failed to create token request" }, { status: 500 });
  }
}
