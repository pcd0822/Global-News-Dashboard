"use client";

import { useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import type { NewsItem, Sentiment } from "@/types";

function CustomTooltip({ active, payload }: { active?: boolean; payload?: { name: string; value: number }[] }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg bg-card border border-white/20 px-3 py-2 shadow-lg">
      {payload.map((p, i) => (
        <div key={i} className="text-sm text-gray-200">
          {String(p.name)}: {Number(p.value)}
        </div>
      ))}
    </div>
  );
}

function CustomLegend({ payload }: { payload?: Array<Record<string, unknown>> }) {
  if (!payload?.length) return null;
  return (
    <ul className="flex flex-wrap justify-center gap-3 text-sm">
      {payload.map((entry, i) => {
        const label = typeof entry.value === "string" ? entry.value : typeof entry.name === "string" ? entry.name : "";
        const color = typeof entry.color === "string" ? entry.color : "#94a3b8";
        return (
          <li key={i} className="flex items-center gap-2">
            <span
              className="inline-block w-3 h-3 rounded-full"
              style={{ backgroundColor: color }}
            />
            <span className="text-gray-300">{label}</span>
          </li>
        );
      })}
    </ul>
  );
}

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
    <div className="rounded-xl bg-card border border-white/10 p-4 space-y-6">
      <h3 className="font-semibold text-gray-100">트렌드 분석</h3>

      {sentimentCounts.length > 0 ? (
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={sentimentCounts}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
                label={({ name, value }: { name?: string; value?: number }) => `${String(name ?? "")} ${Number(value ?? 0)}`}
              >
                {sentimentCounts.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend content={<CustomLegend />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <p className="text-sm text-muted">뉴스를 불러온 뒤 ‘처리 및 아카이빙’을 실행하면 감정 분석이 표시됩니다.</p>
      )}

      <div>
        <h4 className="text-sm font-medium text-gray-300 mb-2">키워드 워드클라우드</h4>
        <div className="word-cloud-wrap min-h-[120px]">
          {wordFreq.length > 0 ? (
            wordFreq.map((w, i) => {
              const scale = 0.7 + (w.value / maxFreq) * 0.8;
              return (
                <span
                  key={i}
                  className="text-gray-300 hover:text-accent"
                  style={{
                    fontSize: `${Math.max(12, Math.min(24, 12 * scale))}px`,
                  }}
                >
                  {w.text}
                </span>
              );
            })
          ) : (
            <span className="text-muted text-sm">키워드 없음</span>
          )}
        </div>
      </div>
    </div>
  );
}
