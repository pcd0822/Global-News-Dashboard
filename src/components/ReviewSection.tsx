"use client";

import { useState, useEffect } from "react";
import type { ProcessedNewsRow } from "@/types";

interface ReviewSectionProps {
  topic: string;
}

export default function ReviewSection({ topic }: ReviewSectionProps) {
  const [items, setItems] = useState<ProcessedNewsRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dateOffset, setDateOffset] = useState(365);

  const targetDate = (() => {
    const d = new Date();
    d.setDate(d.getDate() - dateOffset);
    return d.toISOString().slice(0, 10);
  })();

  useEffect(() => {
    if (!topic.trim()) return;
    setLoading(true);
    setError(null);
    fetch(`/api/news/past?topic=${encodeURIComponent(topic)}&date=${targetDate}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else setItems(data.items ?? []);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [topic, targetDate]);

  return (
    <div className="rounded-xl bg-card border border-white/10 p-4">
      <h3 className="font-semibold text-gray-100 mb-3">과거의 오늘 (Review)</h3>
      <div className="flex gap-2 mb-3">
        <select
          value={dateOffset}
          onChange={(e) => setDateOffset(Number(e.target.value))}
          className="rounded-lg bg-white/10 border border-white/20 text-gray-200 text-sm px-3 py-2"
        >
          <option value={365}>1년 전</option>
          <option value={730}>2년 전</option>
          <option value={1095}>3년 전</option>
        </select>
        <span className="text-sm text-muted self-center">{targetDate}</span>
      </div>
      {loading && <p className="text-sm text-muted">불러오는 중...</p>}
      {error && <p className="text-sm text-rose-400">{error}</p>}
      {!loading && !error && items.length === 0 && (
        <p className="text-sm text-muted">해당 날짜의 아카이브가 없습니다.</p>
      )}
      <ul className="space-y-2 max-h-[280px] overflow-y-auto">
        {items.map((row, i) => (
          <li key={i} className="text-sm">
            <a
              href={row.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline line-clamp-2"
            >
              {row.titleTranslated || row.titleOriginal}
            </a>
            <p className="text-muted text-xs mt-0.5">{row.sentiment}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
