import type { NewsItem } from "@/types";

const SERP_API = "https://serpapi.com/search";

export interface SerpNewsResult {
  position: number;
  title: string;
  link: string;
  snippet?: string;
  source?: string;
  date?: string;
}

/** 검색 기간 → SerpApi as_qdr 값 (d1, w1, m1, m2) */
export const PERIOD_TO_AS_QDR: Record<string, string> = {
  "1d": "d1",
  "1w": "w1",
  "1m": "m1",
  "2m": "m2",
};

/**
 * SerpApi Google News 검색.
 * as_qdr로 기간 제한 가능 (지난 1일/1주/1개월/2개월).
 */
export async function fetchNewsFromSerp(
  query: string,
  num: number,
  period?: string
): Promise<NewsItem[]> {
  const apiKey = process.env.SERPAPI_API_KEY;
  if (!apiKey) throw new Error("SERPAPI_API_KEY is not set");

  const params = new URLSearchParams({
    engine: "google_news",
    q: query,
    api_key: apiKey,
    num: String(Math.min(num, 100)),
  });

  const asQdr = period && PERIOD_TO_AS_QDR[period];
  if (asQdr) params.set("as_qdr", asQdr);

  const res = await fetch(`${SERP_API}?${params.toString()}`);
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`SerpApi error: ${res.status} ${err}`);
  }

  const data = (await res.json()) as {
    news_results?: SerpNewsResult[];
    error?: string;
  };

  if (data.error) throw new Error(data.error);

  const results = data.news_results ?? [];
  return results.slice(0, num).map((r, i) => ({
    id: `news-${Date.now()}-${i}-${r.link.length}`,
    title: r.title,
    link: r.link,
    snippet: r.snippet ?? "",
    source: r.source,
    date: r.date,
  }));
}
