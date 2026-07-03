import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function DELETE(req: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { tripId } = await req.json();
    if (!tripId) {
      return NextResponse.json({ error: "Missing tripId" }, { status: 400 });
    }

    const { error } = await supabase.from("trips").delete().eq("id", tripId).eq("user_id", user.id); // safety: only own trips

    if (error) {
      console.error("[/api/trips/delete]", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("[/api/trips/delete] Unexpected:", err);
    return NextResponse.json({ error: err.message || "Unknown error" }, { status: 500 });
  }
}
