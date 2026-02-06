import type { NewsItem, Sentiment } from "@/types";

const OPENAI_API = "https://api.openai.com/v1/chat/completions";

export interface ProcessedNews {
  titleTranslated: string;
  summary: string;
  summaryTranslated: string;
  sentiment: Sentiment;
  keywords: string[];
}

async function chat(
  system: string,
  user: string,
  jsonMode = false
): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is not set");

  const res = await fetch(OPENAI_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      response_format: jsonMode ? { type: "json_object" } : undefined,
      temperature: 0.3,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenAI error: ${res.status} ${err}`);
  }

  const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  const content = data.choices?.[0]?.message?.content ?? "";
  return content.trim();
}

export async function processNewsItem(item: NewsItem): Promise<ProcessedNews> {
  const system = `You are a news analyst. Respond only with valid JSON, no markdown.
For sentiment use exactly one of: "Positive", "Negative", "Neutral".
For summary use 3 short lines, markdown-friendly.`;

  const user = `Analyze this news and respond with a single JSON object with keys:
- titleTranslated: title translated to Korean.
- summary: 3-line summary in the article's original language (same as title).
- summaryTranslated: same summary translated to Korean.
- sentiment: one of "Positive", "Negative", "Neutral".
- keywords: array of 3-5 key phrases (in English or original language).

Title: ${item.title}
Snippet: ${item.snippet}`;

  const raw = await chat(system, user, true);
  const cleaned = raw.replace(/^```json\s*/i, "").replace(/\s*```$/i, "");
  const parsed = JSON.parse(cleaned) as {
    titleTranslated?: string;
    summary?: string;
    summaryTranslated?: string;
    sentiment?: string;
    keywords?: string[];
  };

  const sentiment = (["Positive", "Negative", "Neutral"].includes(parsed.sentiment ?? "")
    ? (parsed.sentiment as Sentiment)
    : "Neutral") as Sentiment;

  return {
    titleTranslated: parsed.titleTranslated ?? item.title,
    summary: parsed.summary ?? item.snippet,
    summaryTranslated: parsed.summaryTranslated ?? parsed.summary ?? item.snippet,
    sentiment,
    keywords: Array.isArray(parsed.keywords) ? parsed.keywords : [],
  };
}

export async function translateToKorean(text: string): Promise<string> {
  if (!text.trim()) return "";
  const system = "You translate news text to Korean. Reply with only the translation, no explanation.";
  return chat(system, text, false);
}
