"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { safeText } from "@/lib/safeRender";
import { formatRelativeDate } from "@/lib/relativeDate";
import type { NewsItem } from "@/types";

interface NewsCardProps {
  item: NewsItem;
  index: number;
  onClick: () => void;
  onUpdateItem?: (id: string, updates: Partial<NewsItem>) => void;
}

export default function NewsCard({ item, index, onClick, onUpdateItem }: NewsCardProps) {
  const [showTranslated, setShowTranslated] = useState(false);
  const [localTranslated, setLocalTranslated] = useState<string | null>(null);
  const [translating, setTranslating] = useState(false);

  const viewCount = item.viewCount != null && typeof item.viewCount === "number" ? item.viewCount : null;
  const keywords = item.keywords ?? [];
  const position = index + 1;
  const cohesion = item.cohesion != null && typeof item.cohesion === "number" ? Math.max(0, Math.min(1, item.cohesion)) : null;
  const relativeDate = formatRelativeDate(item.date);

  const displayTitle = showTranslated
    ? (item.titleTranslated ?? localTranslated ?? item.title)
    : item.title;

  const handleTranslationToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (showTranslated) {
      setShowTranslated(false);
      return;
    }
    if (item.titleTranslated) {
      setShowTranslated(true);
      return;
    }
    if (localTranslated) {
      setShowTranslated(true);
      return;
    }
    setTranslating(true);
    fetch("/api/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: item.title }),
    })
      .then((res) => res.json())
      .then((data) => {
        const translated = data.translated ?? "";
        setLocalTranslated(translated);
        setShowTranslated(true);
        onUpdateItem?.(item.id, { titleTranslated: translated });
      })
      .catch(() => setTranslating(false))
      .finally(() => setTranslating(false));
  };

  return (
    <motion.article
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => e.key === "Enter" && onClick()}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{
        scale: 1.02,
        boxShadow: "0 20px 40px -12px rgba(139,157,195,0.15)",
      }}
      whileTap={{ scale: 0.98 }}
      className="relative rounded-xl overflow-hidden cursor-pointer border border-pastel-lavender/40 bg-white shadow-sm hover:border-pastel-sky/50"
    >
      <div className="p-5 flex flex-col h-full min-h-[180px]">
        <h3 className="font-semibold text-lg line-clamp-2 text-gray-700 mb-2">
          {safeText(displayTitle)}
        </h3>
        <p className="text-sm text-muted line-clamp-2 flex-1">{safeText(item.snippet)}</p>
        <button
          type="button"
          onClick={handleTranslationToggle}
          disabled={translating}
          className="self-start mt-2 px-3 py-1.5 rounded-lg text-xs font-medium bg-pastel-lavender/60 text-gray-700 hover:bg-pastel-lavender/80 disabled:opacity-60"
        >
          {translating ? "번역 중…" : showTranslated ? "원문 보기" : "번역본 보기"}
        </button>
        <div className="mt-3 pt-3 border-t border-pastel-cream space-y-2">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <span className="text-xs text-muted">{relativeDate}</span>
            {safeText(item.source) && (
              <span className="text-xs text-muted">{safeText(item.source)}</span>
            )}
            {viewCount !== null ? (
              <span className="text-xs text-muted">
                조회수: {viewCount >= 1000000 ? `${(viewCount / 1000000).toFixed(1)}M` : viewCount >= 1000 ? `${(viewCount / 1000).toFixed(1)}K` : viewCount}
              </span>
            ) : (
              <span className="text-xs text-muted">노출 순위: {position}</span>
            )}
          </div>
          {cohesion != null && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted shrink-0">Cohesion</span>
              <div className="flex-1 h-2 rounded-full bg-pastel-lavender/30 overflow-hidden" title={`Cohesion ${Math.round(cohesion * 100)}%`}>
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${cohesion * 100}%`,
                    backgroundColor: cohesion >= 0.8 ? "rgb(88 28 135)" : cohesion >= 0.5 ? "rgb(126 34 206)" : cohesion >= 0.3 ? "rgb(147 51 234)" : "rgb(192 132 252)",
                  }}
                />
              </div>
            </div>
          )}
          <div className="flex flex-wrap gap-1.5">
            {keywords.slice(0, 5).map((k, i) => (
              <span
                key={i}
                className="text-xs px-2 py-0.5 rounded-md bg-pastel-sage/50 text-gray-600"
              >
                #{safeText(k).replace(/\s/g, "_")}
              </span>
            ))}
          </div>
          {safeText(item.sentiment) && (
            <span
              className={`inline-block text-xs px-2 py-0.5 rounded-full ${
                item.sentiment === "Positive"
                  ? "bg-pastel-mint/70 text-gray-700"
                  : item.sentiment === "Negative"
                    ? "bg-pastel-pink/60 text-gray-700"
                    : "bg-pastel-sky/50 text-gray-700"
              }`}
            >
              {safeText(item.sentiment)}
            </span>
          )}
        </div>
      </div>
    </motion.article>
  );
}
