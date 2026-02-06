"use client";

import { useState, useEffect } from "react";
import { safeText } from "@/lib/safeRender";
import SentimentTrendChart from "@/components/SentimentTrendChart";
import type { SentimentTrendPoint } from "@/components/SentimentTrendChart";
import KeywordHeatmap from "@/components/KeywordHeatmap";
import type { KeywordHeatmapData } from "@/components/KeywordHeatmap";
import KeywordCorpusViz from "@/components/KeywordCorpusViz";
import type { CorpusItem } from "@/components/KeywordCorpusViz";
import RisingKeywordsList from "@/components/RisingKeywordsList";
import type { RisingKeyword } from "@/components/RisingKeywordsList";

interface AnalyticsSectionProps {
  topic: string;
}

interface AnalyticsData {
  sentimentTrend: SentimentTrendPoint[];
  keywordCorpus: CorpusItem[];
  keywordHeatmap: KeywordHeatmapData;
  risingKeywords: RisingKeyword[];
}

export default function AnalyticsSection({ topic }: AnalyticsSectionProps) {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!topic.trim()) {
      setData(null);
      return;
    }
    setLoading(true);
    setError(null);
    fetch(`/api/news/analytics?topic=${encodeURIComponent(topic)}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.error) setError(json.error);
        else
          setData({
            sentimentTrend: json.sentimentTrend ?? [],
            keywordCorpus: json.keywordCorpus ?? [],
            keywordHeatmap: json.keywordHeatmap ?? {
              dates: [],
              keywords: [],
              matrix: [],
            },
            risingKeywords: json.risingKeywords ?? [],
          });
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [topic]);

  if (!topic.trim()) return null;

  return (
    <section className="rounded-xl bg-white border border-pastel-lavender/30 shadow-sm p-4 space-y-6">
      <h2 className="text-lg font-semibold text-gray-700">
        주제별 통계 · {safeText(topic)}
      </h2>

      {loading && (
        <p className="text-sm text-gray-500">통계 불러오는 중...</p>
      )}
      {error && (
        <p className="text-sm text-rose-600">{safeText(error)}</p>
      )}

      {!loading && !error && data && (
        <>
          {/* 1. 감정 온도계 (Sentiment Index Trend) */}
          <div>
            <h3 className="text-sm font-medium text-gray-600 mb-2">
              감정 온도계 (Sentiment Index Trend)
            </h3>
            <p className="text-xs text-gray-500 mb-2">
              (긍정 기사 수 - 부정 기사 수) / 전체. 0 위는 긍정, 아래는 부정
            </p>
            <SentimentTrendChart data={data.sentimentTrend} />
          </div>

          {/* 2. 키워드 코퍼스 (시트 누적) */}
          <div>
            <h3 className="text-sm font-medium text-gray-600 mb-2">
              키워드 코퍼스 (해당 주제 아카이브)
            </h3>
            <KeywordCorpusViz data={data.keywordCorpus} />
          </div>

          {/* 3. 키워드 히트맵 */}
          <div>
            <h3 className="text-sm font-medium text-gray-600 mb-2">
              키워드 생명주기 · 히트맵
            </h3>
            <p className="text-xs text-gray-500 mb-2">
              날짜(X) × 키워드(Y) 빈도
            </p>
            <KeywordHeatmap data={data.keywordHeatmap} />
          </div>

          {/* 4. 급상승 키워드 */}
          <div>
            <h3 className="text-sm font-medium text-gray-600 mb-2">
              급상승 키워드 (최근 7일 vs 이전 7일)
            </h3>
            <RisingKeywordsList data={data.risingKeywords} />
          </div>
        </>
      )}

      {!loading && !error && data && data.sentimentTrend.length === 0 && data.keywordCorpus.length === 0 && (
        <p className="text-sm text-gray-500">
          이 주제로 아카이브된 기사가 없습니다. &apos;처리 및 아카이빙&apos;을 실행한 뒤 다시 확인하세요.
        </p>
      )}
    </section>
  );
}
