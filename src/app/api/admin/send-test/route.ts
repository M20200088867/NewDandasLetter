import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateAndSendNewsletter } from "@/lib/pipeline/generate";

export const maxDuration = 60;

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const result = await generateAndSendNewsletter();
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error("[SendTest] Pipeline failed:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
