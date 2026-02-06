"use client";

import { useMemo } from "react";

export interface KeywordHeatmapData {
  dates: string[];
  keywords: string[];
  matrix: number[][]; // matrix[keywordIdx][dateIdx]
}

interface KeywordHeatmapProps {
  data: KeywordHeatmapData;
  maxKeywords?: number;
}

export default function KeywordHeatmap({
  data,
  maxKeywords = 12,
}: KeywordHeatmapProps) {
  const { dates, keywords, matrix } = data;
  const displayKeywords = keywords.slice(0, maxKeywords);
  const displayMatrix = useMemo(
    () => matrix.slice(0, maxKeywords),
    [matrix, maxKeywords]
  );

  const maxVal = useMemo(() => {
    let m = 0;
    displayMatrix.forEach((row) =>
      row.forEach((v) => {
        if (v > m) m = v;
      })
    );
    return Math.max(m, 1);
  }, [displayMatrix]);

  if (dates.length === 0 || displayKeywords.length === 0) {
    return (
      <p className="text-sm text-gray-500 py-6 text-center">
        기간별 키워드 데이터가 없습니다.
      </p>
    );
  }

  const formatDate = (s: string) => s.slice(5).replace("-", "/");

  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-[320px] inline-block">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr>
              <th className="text-left py-1 pr-2 text-gray-600 font-medium w-24">
                키워드
              </th>
              {dates.map((d) => (
                <th
                  key={d}
                  className="text-center py-1 text-gray-500 font-normal w-10"
                >
                  {formatDate(d)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayKeywords.map((kw, ki) => (
              <tr key={ki}>
                <td className="py-0.5 pr-2 text-gray-600 truncate max-w-[96px]">
                  {kw.replace(/_/g, " ")}
                </td>
                {dates.map((date, di) => {
                  const v = displayMatrix[ki]?.[di] ?? 0;
                  const opacity = maxVal > 0 ? 0.15 + (v / maxVal) * 0.85 : 0.2;
                  return (
                    <td key={date} className="p-0.5">
                      <div
                        className="h-5 rounded min-w-[24px]"
                        style={{
                          backgroundColor: `rgba(139, 157, 195, ${opacity})`,
                        }}
                        title={`${kw}: ${v}`}
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
