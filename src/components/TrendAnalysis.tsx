"use client";

import { useMemo } from "react";
import { safeText } from "@/lib/safeRender";
import type { NewsItem, Sentiment } from "@/types";

interface TrendAnalysisProps {
  items: NewsItem[];
}

const SENTIMENT_COLORS: Record<Sentiment, string> = {
  Positive: "#34d399",
  Negative: "#f87171",
  Neutral: "#94a3b8",
};

export default function TrendAnalysis({ items }: TrendAnalysisProps) {
  const sentimentCounts = useMemo(() => {
    const map: Record<Sentiment, number> = {
      Positive: 0,
      Negative: 0,
      Neutral: 0,
    };
    items.forEach((item) => {
      const s = item.sentiment ?? "Neutral";
      if (s in map) map[s as Sentiment]++;
    });
    return Object.entries(map)
      .filter(([, v]) => v > 0)
      .map(([name, value]) => ({ name, value, fill: SENTIMENT_COLORS[name as Sentiment] }));
  }, [items]);

  const total = sentimentCounts.reduce((acc, s) => acc + s.value, 0);
  const pieSegments = useMemo(() => {
    let acc = 0;
    return sentimentCounts.map((s) => {
      const start = acc;
      acc += s.value / total;
      return { ...s, start: start * 100, end: acc * 100 };
    });
  }, [sentimentCounts, total]);

  const wordFreq = useMemo(() => {
    const count: Record<string, number> = {};
    items.forEach((item) => {
      (item.keywords ?? []).forEach((k) => {
        const w = k.trim().toLowerCase();
        if (w) count[w] = (count[w] ?? 0) + 1;
      });
    });
    return Object.entries(count)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 24)
      .map(([text, value]) => ({ text, value }));
  }, [items]);

  const maxFreq = Math.max(...wordFreq.map((w) => w.value), 1);

  return (
    <div className="rounded-xl bg-white border border-gray-200 shadow-sm p-4 space-y-6">
      <h3 className="font-semibold text-gray-900">트렌드 분석</h3>

      {sentimentCounts.length > 0 ? (
        <div className="space-y-4">
          <div
            className="w-40 h-40 mx-auto rounded-full"
            style={{
              background: `conic-gradient(${pieSegments.map((s) => `${s.fill} ${s.start}% ${s.end}%`).join(", ")})`,
            }}
          />
          <ul className="flex flex-wrap justify-center gap-3 text-sm">
            {sentimentCounts.map((s, i) => (
              <li key={i} className="flex items-center gap-2">
                <span
                  className="inline-block w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: s.fill }}
                />
                <span className="text-gray-600">
                  {safeText(s.name)} {safeText(s.value)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="text-sm text-gray-500">뉴스를 불러온 뒤 ‘처리 및 아카이빙’을 실행하면 감정 분석이 표시됩니다.</p>
      )}

      <div>
        <h4 className="text-sm font-medium text-gray-600 mb-2">키워드 워드클라우드</h4>
        <div className="word-cloud-wrap min-h-[120px]">
          {wordFreq.length > 0 ? (
            wordFreq.map((w, i) => {
              const scale = 0.7 + (w.value / maxFreq) * 0.8;
              return (
                <span
                  key={i}
                  className="text-gray-600 hover:text-accent"
                  style={{
                    fontSize: `${Math.max(12, Math.min(24, 12 * scale))}px`,
                  }}
                >
                  {safeText(w.text)}
                </span>
              );
            })
          ) : (
            <span className="text-gray-500 text-sm">키워드 없음</span>
          )}
        </div>
      </div>
    </div>
  );
}
