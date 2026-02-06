import type { AnalyticsRow } from "@/lib/sheets";

const SENTIMENT_POSITIVE = "Positive";
const SENTIMENT_NEGATIVE = "Negative";

/** 날짜별 감정 지수: (긍정 - 부정) / 전체. -1 ~ +1 */
export function buildSentimentTrend(rows: AnalyticsRow[]): {
  date: string;
  score: number;
  positive: number;
  negative: number;
  neutral: number;
  total: number;
}[] {
  const byDate = new Map<
    string,
    { positive: number; negative: number; neutral: number }
  >();
  for (const r of rows) {
    const d = r.date.slice(0, 10);
    if (!byDate.has(d)) byDate.set(d, { positive: 0, negative: 0, neutral: 0 });
    const row = byDate.get(d)!;
    if (r.sentiment === SENTIMENT_POSITIVE) row.positive++;
    else if (r.sentiment === SENTIMENT_NEGATIVE) row.negative++;
    else row.neutral++;
  }
  return Array.from(byDate.entries())
    .map(([date, counts]) => {
      const total =
        counts.positive + counts.negative + counts.neutral;
      const score =
        total === 0
          ? 0
          : (counts.positive - counts.negative) / total;
      return {
        date,
        score: Math.round(score * 100) / 100,
        positive: counts.positive,
        negative: counts.negative,
        neutral: counts.neutral,
        total,
      };
    })
    .sort((a, b) => a.date.localeCompare(b.date));
}

function normalizeKw(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, "_");
}

function splitKeywords(keywordsStr: string): string[] {
  return (keywordsStr || "")
    .split(/[,،、]/)
    .map((s) => normalizeKw(s))
    .filter(Boolean);
}

/** 전체 기간 키워드 빈도 (코퍼스) */
export function buildKeywordCorpus(
  rows: AnalyticsRow[]
): { keyword: string; count: number }[] {
  const count = new Map<string, number>();
  for (const r of rows) {
    for (const k of splitKeywords(r.keywords)) {
      count.set(k, (count.get(k) ?? 0) + 1);
    }
  }
  return Array.from(count.entries())
    .map(([keyword, count]) => ({ keyword, count }))
    .sort((a, b) => b.count - a.count);
}

/** 날짜(X) × 키워드(Y) 빈도 행렬. 상위 N개 키워드만 */
export function buildKeywordHeatmap(
  rows: AnalyticsRow[],
  topKeywordCount: number = 20
): {
  dates: string[];
  keywords: string[];
  matrix: number[][]; // matrix[keywordIdx][dateIdx]
} {
  const corpus = buildKeywordCorpus(rows);
  const topKeywords = corpus.slice(0, topKeywordCount).map((c) => c.keyword);
  const dateSet = new Set<string>();
  rows.forEach((r) => dateSet.add(r.date.slice(0, 10)));
  const dates = Array.from(dateSet).sort();

  const byDateKw = new Map<string, number>();
  for (const r of rows) {
    const d = r.date.slice(0, 10);
    for (const k of splitKeywords(r.keywords)) {
      if (!topKeywords.includes(k)) continue;
      const key = `${d}\t${k}`;
      byDateKw.set(key, (byDateKw.get(key) ?? 0) + 1);
    }
  }

  const matrix = topKeywords.map((kw) =>
    dates.map((d) => byDateKw.get(`${d}\t${kw}`) ?? 0)
  );

  return { dates, keywords: topKeywords, matrix };
}

/** 급상승 키워드: 최근 periodDays vs 그 이전 periodDays */
export function buildRisingKeywords(
  rows: AnalyticsRow[],
  periodDays: number = 7
): { keyword: string; recentCount: number; previousCount: number; change: number }[] {
  const now = new Date();
  const recentStart = new Date(now);
  recentStart.setDate(now.getDate() - periodDays);
  const previousStart = new Date(recentStart);
  previousStart.setDate(previousStart.getDate() - periodDays);

  const recentCount = new Map<string, number>();
  const previousCount = new Map<string, number>();

  for (const r of rows) {
    const d = r.date.slice(0, 10);
    const t = new Date(d);
    for (const k of splitKeywords(r.keywords)) {
      if (t >= recentStart) {
        recentCount.set(k, (recentCount.get(k) ?? 0) + 1);
      } else if (t >= previousStart && t < recentStart) {
        previousCount.set(k, (previousCount.get(k) ?? 0) + 1);
      }
    }
  }

  const allKw = new Set([
    ...recentCount.keys(),
    ...previousCount.keys(),
  ]);
  return Array.from(allKw)
    .map((keyword) => {
      const recent = recentCount.get(keyword) ?? 0;
      const previous = previousCount.get(keyword) ?? 0;
      const change = previous === 0 ? (recent > 0 ? 1 : 0) : (recent - previous) / previous;
      return { keyword, recentCount: recent, previousCount: previous, change };
    })
    .filter((r) => r.recentCount > 0 && r.change > 0)
    .sort((a, b) => b.change - a.change)
    .slice(0, 15);
}
