export type Sentiment = "Positive" | "Negative" | "Neutral";

export interface NewsItem {
  id: string;
  title: string;
  titleTranslated?: string;
  link: string;
  snippet: string;
  snippetTranslated?: string;
  source?: string;
  date?: string;
  sentiment?: Sentiment;
  summary?: string;
  summaryTranslated?: string;
  keywords?: string[];
  /** 조회수 (API에서 제공 시) */
  viewCount?: number | null;
  /** 키워드 밀집도 0~1 (누적 키워드 대비) */
  cohesion?: number | null;
}

/** 검색 기간: 1일 / 1주 / 1개월 / 2개월 */
export type SearchPeriod = "1d" | "1w" | "1m" | "2m";

export interface UserSettings {
  selectedKeywordIds: string[];
  newsCount: number;
  /** 기사 검색 기간 */
  searchPeriod: SearchPeriod;
}

export interface ProcessedNewsRow {
  date: string;
  topic: string;
  titleOriginal: string;
  titleTranslated: string;
  link: string;
  summaryOriginal: string;
  summaryTranslated: string;
  sentiment: Sentiment;
  keywords: string;
  cohesion?: number;
}
