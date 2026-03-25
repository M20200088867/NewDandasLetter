import { NextResponse } from "next/server";
import { generateAndSendNewsletter } from "@/lib/pipeline/generate";

export const maxDuration = 60;

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await generateAndSendNewsletter();
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error("[Cron] Pipeline failed:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
