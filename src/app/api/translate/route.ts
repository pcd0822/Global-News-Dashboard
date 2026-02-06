import { NextRequest, NextResponse } from "next/server";
import { translateToKorean } from "@/lib/openai";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { text: string };
    const text = body?.text ?? "";
    const translated = await translateToKorean(text);
    return NextResponse.json({ translated });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Translation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
