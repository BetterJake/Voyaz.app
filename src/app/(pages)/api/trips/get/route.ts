import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Missing ?id=" }, { status: 400 });
    }

    const { data: trip, error } = await supabase
      .from("trips")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (error || !trip) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }

    return NextResponse.json({ trip });
  } catch (err: any) {
    console.error("[/api/trips/get]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
