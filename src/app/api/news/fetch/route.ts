import { NextRequest, NextResponse } from "next/server";
import { fetchNewsFromSerp } from "@/lib/serp";

export async function GET(request: NextRequest) {
  try {
    const keyword = request.nextUrl.searchParams.get("keyword") ?? "global news";
    const num = Math.min(50, Math.max(1, Number(request.nextUrl.searchParams.get("num")) || 10));
    const period = request.nextUrl.searchParams.get("period") ?? "";

    const items = await fetchNewsFromSerp(keyword, num, period || undefined);
    return NextResponse.json({ items });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to fetch news";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
