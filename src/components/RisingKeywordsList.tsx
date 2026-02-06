"use client";

import { safeText } from "@/lib/safeRender";

export interface RisingKeyword {
  keyword: string;
  recentCount: number;
  previousCount: number;
  change: number;
}

interface RisingKeywordsListProps {
  data: RisingKeyword[];
}

export default function RisingKeywordsList({ data }: RisingKeywordsListProps) {
  if (data.length === 0) {
    return (
      <p className="text-sm text-gray-500 py-4">
        최근 7일 대비 급상승 키워드가 없습니다.
      </p>
    );
  }

  return (
    <ul className="space-y-1.5">
      {data.map((r, i) => (
        <li
          key={r.keyword}
          className="flex items-center justify-between gap-2 text-sm"
        >
          <span className="text-gray-700 truncate">
            {safeText(r.keyword.replace(/_/g, " "))}
          </span>
          <span className="shrink-0 text-xs text-gray-500">
            {r.previousCount} → {r.recentCount}
            <span className="text-pastel-mint font-medium ml-1">
              ({r.previousCount === 0 ? "NEW" : `+${Math.round(r.change * 100)}%`})
            </span>
          </span>
        </li>
      ))}
    </ul>
  );
}
