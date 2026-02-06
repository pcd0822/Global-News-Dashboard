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

/**
 * SerpApi Google News 검색.
 * sort=pd (published date) 대신 기본 정렬(관련도/인기) 사용으로 화제성 높은 뉴스 우선.
 * tbm=nws 뉴스 탭 + num으로 개수 제한.
 */
export async function fetchNewsFromSerp(
  query: string,
  num: number
): Promise<NewsItem[]> {
  const apiKey = process.env.SERPAPI_API_KEY;
  if (!apiKey) throw new Error("SERPAPI_API_KEY is not set");

  const params = new URLSearchParams({
    engine: "google_news",
    q: query,
    api_key: apiKey,
    num: String(Math.min(num, 100)),
    // 정렬: 관련도/인기 우선 (기본값이 이미 그렇고, sort 지정 안 하면 됨)
    // gl=us, hl=en 등으로 지역/언어 조절 가능
  });

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
