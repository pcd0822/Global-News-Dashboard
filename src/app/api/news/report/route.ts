import { NextRequest, NextResponse } from "next/server";

const OPENAI_API = "https://api.openai.com/v1/chat/completions";

/**
 * 상세 리포트(Intelligence Report) - 구조화된 마크다운 생성 (한국어)
 * 프롬프트: Executive Summary, Key Details, Insight & Implication, Keywords, Sentiment
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      title: string;
      snippet: string;
      link?: string;
      source?: string;
      date?: string;
    };
    const { title, snippet, link = "", source = "", date = "" } = body;
    if (!title && !snippet) {
      return NextResponse.json({ error: "title or snippet required" }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "OPENAI_API_KEY not set" }, { status: 500 });

    const dateStr = date ? date.slice(0, 10) : new Date().toISOString().slice(0, 10);
    const sourceStr = source || "Unknown";

    const systemPrompt = `You are an analyst writing Intelligence Reports. Output ONLY valid markdown in Korean, no code fences.
Structure your response exactly as follows (Korean language for all content):

# [뉴스 제목](기사_URL)
**Date:** YYYY-MM-DD | **Source:** 언론사명

## 1. Executive Summary (핵심 요약)
> 기사의 핵심 내용을 2~3문장으로 요약한 개요입니다.

## 2. Key Details (주요 내용)
- 기사의 주요 팩트 1
- 기사의 주요 팩트 2
- 기사의 주요 팩트 3

## 3. Insight & Implication (시사점)
- 이 뉴스가 해당 산업이나 사회에 미치는 영향 및 전망 분석

---
**Keywords:** #태그1 #태그2 #태그3
**Sentiment:** 긍정/중립/부정

Rules:
- Replace "뉴스 제목" with the actual article title (Korean if you translate, or keep original).
- Replace 기사_URL with the actual link provided.
- Replace YYYY-MM-DD and 언론사명 with the provided date and source.
- Write Executive Summary, Key Details, and Insight in Korean based on the given title and snippet.
- Extract 3-5 keywords and output as #태그 form. Sentiment: one of 긍정, 중립, 부정.
- Output only the markdown document, no explanation.`;

    const userContent = `Title: ${title}
Snippet: ${snippet}
Link: ${link}
Source: ${sourceStr}
Date: ${dateStr}

Generate the full markdown report in Korean.`;

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
        max_tokens: 1200,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json({ error: `OpenAI: ${res.status} ${err}` }, { status: 502 });
    }

    const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    let report = (data.choices?.[0]?.message?.content ?? "").trim();
    report = report.replace(/^```\w*\n?/i, "").replace(/\n?```$/i, "");

    // 첫 줄 제목에 원문 링크가 포함되도록 보정
    if (link) {
      const safeTitle = title.replace(/\]/g, "").replace(/\[/g, "").slice(0, 200);
      report = report.replace(/^#\s+\[.*?\]\(.*?\)/m, `# [${safeTitle}](${link})`);
    }
    report = report.replace(
      /\*\*Date:\*\*[^\n]+\|\s*\*\*Source:\*\*[^\n]+/,
      `**Date:** ${dateStr} | **Source:** ${sourceStr}`
    );

    return NextResponse.json({ report });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Report failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
