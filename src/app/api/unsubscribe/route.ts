import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.json({ error: "Missing token" }, { status: 400 });
  }

  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("subscribers")
    .update({ is_active: false, unsubscribed_at: new Date().toISOString() })
    .eq("unsubscribe_token", token)
    .eq("is_active", true)
    .select()
    .single();

  if (error || !data) {
    return NextResponse.redirect(new URL("/unsubscribe?status=not-found", request.url));
  }

  return NextResponse.redirect(new URL("/unsubscribe?status=success", request.url));
}
