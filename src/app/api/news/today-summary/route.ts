import { NextRequest, NextResponse } from "next/server";
import type { NewsItem } from "@/types";

const OPENAI_API = "https://api.openai.com/v1/chat/completions";

/**
 * 오늘 수집한 기사들의 특징을 리포트 형식(마크다운)으로 생성
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { items: NewsItem[] };
    const { items } = body;
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "items array required" }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "OPENAI_API_KEY not set" }, { status: 500 });

    const today = new Date().toISOString().slice(0, 10);
    const input = items
      .slice(0, 30)
      .map((a, i) => `[${i + 1}] ${a.title}\n${a.snippet || ""}\n출처: ${a.source || "-"}\n링크: ${a.link}`)
      .join("\n\n---\n\n");

    const systemPrompt = `You are an analyst writing a "Today Issues Summary" report in Korean. Output ONLY valid markdown, no code fences.
Structure the report as follows:

# 오늘 이슈 요약 (Today Issues Summary)

![Summary](https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&h=300&fit=crop)
*오늘 수집된 뉴스의 핵심 이슈를 한눈에 파악할 수 있는 요약입니다.*

**작성일:** YYYY-MM-DD | **분석 기사 수:** N건

---

## 1. 오늘의 핵심 테마
- 수집된 기사들이 공통으로 다루는 주제나 키워드를 3~5개 정리

## 2. 주요 이슈 요약
- 가장 자주 등장하거나 중요도가 높은 이슈 3~5개를 불릿 포인트로 요약
- 각 이슈에 대해 1~2문장 설명

## 3. 언론사·출처 분포
- 어떤 매체에서 많이 보도되었는지 간단히 정리 (가능한 경우)

## 4. 시사점 및 전망
- 오늘 뉴스 흐름이 시사하는 바와 향후 전망을 2~4문장으로 서술

---
*본 요약은 AI가 수집된 기사 제목·요약을 바탕으로 생성한 리포트입니다.*`;

    const userContent = `작성일: ${today}\n분석 기사 수: ${items.length}건\n\n아래 기사 목록을 분석하여 위 구조의 마크다운 리포트를 작성해 주세요. 한국어로 작성.\n\n${input}`;

    const res = await fetch(OPENAI_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userContent },
        ],
        temperature: 0.3,
        max_tokens: 1500,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json({ error: `OpenAI: ${res.status} ${err}` }, { status: 502 });
    }

    const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    let report = (data.choices?.[0]?.message?.content ?? "").trim();
    report = report.replace(/^```\w*\n?/i, "").replace(/\n?```$/i, "");

    report = report.replace(/\*\*작성일:\*\*[^\n]+/, `**작성일:** ${today} | **분석 기사 수:** ${items.length}건`);

    return NextResponse.json({ report });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Today summary failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
