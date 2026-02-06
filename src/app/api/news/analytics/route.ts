import { NextRequest, NextResponse } from "next/server";
import { getRowsForAnalytics } from "@/lib/sheets";
import {
  buildSentimentTrend,
  buildKeywordCorpus,
  buildKeywordHeatmap,
  buildRisingKeywords,
} from "@/lib/analytics";

export async function GET(request: NextRequest) {
  try {
    const topic = request.nextUrl.searchParams.get("topic") ?? "";
    if (!topic.trim()) {
      return NextResponse.json(
        { error: "topic query is required" },
        { status: 400 }
      );
    }

    const rows = await getRowsForAnalytics(topic);
    const sentimentTrend = buildSentimentTrend(rows);
    const keywordCorpus = buildKeywordCorpus(rows);
    const keywordHeatmap = buildKeywordHeatmap(rows, 20);
    const risingKeywords = buildRisingKeywords(rows, 7);

    return NextResponse.json({
      sentimentTrend,
      keywordCorpus,
      keywordHeatmap,
      risingKeywords,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Analytics failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
