import { NextRequest, NextResponse } from "next/server";
import { processNewsItem } from "@/lib/openai";
import { appendNewsToSheet } from "@/lib/sheets";
import type { NewsItem, ProcessedNewsRow } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { items: NewsItem[]; topic: string };
    const { items, topic } = body;
    if (!Array.isArray(items) || items.length === 0 || !topic) {
      return NextResponse.json(
        { error: "items (array) and topic are required" },
        { status: 400 }
      );
    }

    const dateStr = new Date().toISOString().slice(0, 10);

    const processed: (NewsItem & { summary: string; summaryTranslated: string })[] = [];

    for (const item of items) {
      const result = await processNewsItem(item);
      processed.push({
        ...item,
        titleTranslated: result.titleTranslated,
        summary: result.summary,
        summaryTranslated: result.summaryTranslated,
        sentiment: result.sentiment,
        keywords: result.keywords,
      });
    }

    const rows: ProcessedNewsRow[] = processed.map((p) => ({
      date: dateStr,
      topic,
      titleOriginal: p.title,
      titleTranslated: p.titleTranslated ?? p.title,
      link: p.link,
      summaryOriginal: p.summary ?? p.snippet,
      summaryTranslated: p.summaryTranslated ?? p.snippet ?? "",
      sentiment: p.sentiment ?? "Neutral",
      keywords: (p.keywords ?? []).join(", "),
    }));

    await appendNewsToSheet(rows);

    return NextResponse.json({
      success: true,
      processed: processed.map((p) => ({
        id: p.id,
        title: p.title,
        summary: p.summary,
        summaryTranslated: p.summaryTranslated,
        sentiment: p.sentiment,
        keywords: p.keywords,
      })),
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Process failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
