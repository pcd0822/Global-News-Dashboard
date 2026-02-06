import { NextRequest, NextResponse } from "next/server";

const OPENAI_API = "https://api.openai.com/v1/chat/completions";

/**
 * 제목·스니펫 기반으로 AI가 500자 내외 요약 생성
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { title: string; snippet: string; link?: string };
    const { title, snippet } = body;
    if (!title && !snippet) {
      return NextResponse.json({ error: "title or snippet required" }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "OPENAI_API_KEY not set" }, { status: 500 });

    const res = await fetch(OPENAI_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are a news summarizer. Summarize the given news in about 500 characters (Korean). Write in a clear, neutral tone. Output only the summary text, no preamble.",
          },
          {
            role: "user",
            content: `Title: ${title}\n\nSnippet/Excerpt: ${snippet}`,
          },
        ],
        temperature: 0.3,
        max_tokens: 400,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json({ error: `OpenAI: ${res.status} ${err}` }, { status: 502 });
    }

    const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    const summary = (data.choices?.[0]?.message?.content ?? "").trim();
    return NextResponse.json({ summary: summary || snippet });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Summarize failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
