import { NextRequest, NextResponse } from "next/server";
import { getPastNewsFromSheet } from "@/lib/sheets";

export async function GET(request: NextRequest) {
  try {
    const topic = request.nextUrl.searchParams.get("topic") ?? "";
    const dateStr = request.nextUrl.searchParams.get("date") ?? "";

    if (!topic || !dateStr) {
      return NextResponse.json(
        { error: "topic and date (YYYY-MM-DD) are required" },
        { status: 400 }
      );
    }

    const rows = await getPastNewsFromSheet(topic, dateStr);
    return NextResponse.json({ items: rows });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to get past news";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
