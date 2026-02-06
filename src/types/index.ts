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
}

export interface UserSettings {
  /** 선택된 키워드 ID 목록 */
  selectedKeywordIds: string[];
  newsCount: number;
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
}
