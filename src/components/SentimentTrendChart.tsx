"use client";

export interface SentimentTrendPoint {
  date: string;
  score: number;
  positive: number;
  negative: number;
  neutral: number;
  total: number;
}

interface SentimentTrendChartProps {
  data: SentimentTrendPoint[];
  width?: number;
  height?: number;
}

export default function SentimentTrendChart({
  data,
  width = 400,
  height = 220,
}: SentimentTrendChartProps) {
  if (data.length === 0) {
    return (
      <p className="text-sm text-gray-500 py-8 text-center">
        날짜별 아카이브가 없습니다.
      </p>
    );
  }

  const padding = { top: 16, right: 12, bottom: 28, left: 36 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const minScore = -1;
  const maxScore = 1;
  const zeroY =
    padding.top +
    chartHeight * (1 - (0 - minScore) / (maxScore - minScore));

  const scaleX = (i: number) =>
    padding.left + (i / Math.max(1, data.length - 1)) * chartWidth;
  const scaleY = (score: number) =>
    padding.top +
    chartHeight * (1 - (score - minScore) / (maxScore - minScore));

  const points = data
    .map((d, i) => `${scaleX(i)},${scaleY(d.score)}`)
    .join(" ");
  const linePath = data.length >= 2 ? `M ${points.replace(/ /g, " L ")}` : "";

  const formatDate = (s: string) => {
    const d = s.slice(5);
    return d ? d.replace("-", "/") : s;
  };

  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="min-w-[280px] max-w-full"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* 0 기준선 */}
        <line
          x1={padding.left}
          y1={zeroY}
          x2={width - padding.right}
          y2={zeroY}
          stroke="var(--muted)"
          strokeWidth="1"
          strokeDasharray="4 2"
        />
        {/* 영역: 0 위 (긍정) */}
        <polygon
          points={`${padding.left},${padding.top} ${width - padding.right},${padding.top} ${width - padding.right},${zeroY} ${padding.left},${zeroY}`}
          fill="rgba(184,224,210,0.2)"
        />
        {/* 영역: 0 아래 (부정) */}
        <polygon
          points={`${padding.left},${zeroY} ${width - padding.right},${zeroY} ${width - padding.right},${height - padding.bottom} ${padding.left},${height - padding.bottom}`}
          fill="rgba(245,198,214,0.2)"
        />
        {/* 꺾은선 */}
        {data.length >= 2 && (
          <path
            d={linePath}
            fill="none"
            stroke="var(--accent)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
        {/* 데이터 점 */}
        {data.map((d, i) => (
          <circle
            key={d.date}
            cx={scaleX(i)}
            cy={scaleY(d.score)}
            r="4"
            fill={d.score >= 0 ? "var(--pastel-mint)" : "var(--pastel-pink)"}
            stroke="var(--accent)"
            strokeWidth="1"
          />
        ))}
        {/* X축 라벨 */}
        {data.map((d, i) => (
          <text
            key={d.date}
            x={scaleX(i)}
            y={height - 6}
            textAnchor="middle"
            className="fill-gray-500 text-[10px]"
          >
            {formatDate(d.date)}
          </text>
        ))}
      </svg>
    </div>
  );
}
