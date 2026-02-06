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
}

export interface UserSettings {
  keyword: string;
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
