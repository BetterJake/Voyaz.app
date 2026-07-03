import * as Ably from "ably";
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
export async function POST(req: Request) {
  const apiKey = process.env.ABLY_API_KEY;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!apiKey) {
    return NextResponse.json({ error: "Ably API key not configured" }, { status: 500 });
  }
  try {
    const { recipientId, type, isSilent, metadata } = await req.json();
    if (!recipientId || !type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    if (!isSilent) {
      // Check for existing pending friend request to avoid duplicates
      if (type === "friend_request") {
        const { data: existing } = await supabase
          .from("notifications")
          .select("id")
          .eq("actor_id", user.id)
          .eq("recipient_id", recipientId)
          .eq("type", "friend_request")
          .eq("is_read", false)
          .maybeSingle();

        if (existing) {
          const ably = new Ably.Rest(apiKey);
          const channel = ably.channels.get(`user-notifications:${recipientId}`);
          await channel.publish("notification", { type, actor_id: user.id });
          return NextResponse.json({
            success: true,
            message: "Notification already exists, bumped via Ably",
          });
        }
      }

      const { error: dbError } = await supabase.from("notifications").insert({
        recipient_id: recipientId,
        actor_id: user.id,
        type: type,
        metadata: metadata || {},
      });
      if (dbError) throw dbError;
    }

    const ably = new Ably.Rest(apiKey);
    const channel = ably.channels.get(`user-notifications:${recipientId}`);
    await channel.publish(isSilent ? "sync" : "notification", {
      type,
      actor_id: user.id,
    });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Error triggering notification:", err);
    return NextResponse.json(
      {
        error: "Failed to trigger notification",
        details: err?.message || String(err),
      },
      { status: 500 }
    );
  }
}
