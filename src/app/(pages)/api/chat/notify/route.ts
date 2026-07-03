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
    const { tripId, tripTitle, messageText } = await req.json();
    if (!tripId) {
      return NextResponse.json({ error: "Missing tripId" }, { status: 400 });
    }
    const { data: trip, error: tripError } = await supabase
      .from("trips")
      .select("user_id, title")
      .eq("id", tripId)
      .single();
    if (tripError || !trip) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }
    const { data: shares, error: shareError } = await supabase
      .from("trip_shares")
      .select("shared_with_id")
      .eq("trip_id", tripId);
    if (shareError) throw shareError;
    const recipients = new Set<string>();
    if (trip.user_id !== user.id) recipients.add(trip.user_id);
    shares?.forEach((share) => {
      if (share.shared_with_id !== user.id) recipients.add(share.shared_with_id);
    });
    if (recipients.size === 0) {
      return NextResponse.json({ success: true, message: "No recipients to notify" });
    }
    const ably = new Ably.Rest(apiKey);
    const publishPromises = Array.from(recipients).map(async (recipientId) => {
      const channel = ably.channels.get(`user-notifications:${recipientId}`);
      return channel.publish("notification", {
        type: "new_message",
        actor_id: user.id,
        trip_id: tripId,
        trip_title: tripTitle || trip.title,
        message_snippet: messageText?.substring(0, 50) + (messageText?.length > 50 ? "..." : ""),
      });
    });
    await Promise.all(publishPromises);
    return NextResponse.json({ success: true, recipientCount: recipients.size });
  } catch (err: any) {
    console.error("Error broadcasting chat notification:", err);
    return NextResponse.json(
      {
        error: "Failed to broadcast notification",
        details: err?.message || String(err),
      },
      { status: 500 }
    );
  }
}
