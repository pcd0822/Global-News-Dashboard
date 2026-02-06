"use client";

import { safeText } from "@/lib/safeRender";

export interface CorpusItem {
  keyword: string;
  count: number;
}

interface KeywordCorpusVizProps {
  data: CorpusItem[];
  maxItems?: number;
}

const BAR_COLORS = [
  "#b8e0d2",
  "#d4c5f9",
  "#ffdab9",
  "#a8d4f0",
  "#f5c6d6",
  "#c5d1c7",
  "#e2d4f0",
  "#8b9dc3",
];

export default function KeywordCorpusViz({
  data,
  maxItems = 24,
}: KeywordCorpusVizProps) {
  const items = data.slice(0, maxItems);
  const maxCount = Math.max(...items.map((i) => i.count), 1);

  if (items.length === 0) {
    return (
      <p className="text-sm text-gray-500 py-6 text-center">
        시트에 쌓인 키워드 코퍼스가 없습니다.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-xs text-gray-500 mb-2">
        해당 주제 아카이브 전체 키워드 빈도 (상위 {items.length}개)
      </p>
      <div className="flex flex-wrap gap-2 word-cloud-wrap min-h-[80px]">
        {items.map((item, i) => {
          const scale = 0.6 + (item.count / maxCount) * 0.9;
          const color = BAR_COLORS[i % BAR_COLORS.length];
          return (
            <span
              key={item.keyword}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md"
              style={{
                fontSize: `${Math.max(11, Math.min(18, 11 * scale))}px`,
                backgroundColor: `${color}80`,
                color: "#4a4a5a",
              }}
              title={`${safeText(item.keyword)}: ${item.count}회`}
            >
              {safeText(item.keyword.replace(/_/g, " "))}
              <span className="opacity-70 text-[10px]">{item.count}</span>
            </span>
          );
        })}
      </div>
    </div>
  );
}
