import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { z } from "zod";

const schema = z.object({
  email: z.string().email(),
  name: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, name } = schema.parse(body);

    const supabase = createAdminClient();

    // Check if already subscribed
    const { data: existing } = await supabase
      .from("subscribers")
      .select("id, is_active")
      .eq("email", email)
      .single();

    if (existing) {
      if (existing.is_active) {
        return NextResponse.json({ message: "Already subscribed!" });
      }
      // Reactivate
      await supabase
        .from("subscribers")
        .update({ is_active: true, unsubscribed_at: null })
        .eq("id", existing.id);
      return NextResponse.json({ message: "Welcome back! You've been re-subscribed." });
    }

    const { error } = await supabase
      .from("subscribers")
      .insert({ email, name: name || null });

    if (error) throw error;

    return NextResponse.json({ message: "Successfully subscribed!" });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }
    console.error("Subscribe error:", error);
    return NextResponse.json({ error: "Failed to subscribe" }, { status: 500 });
  }
}
