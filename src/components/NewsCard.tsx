"use client";

import { motion } from "framer-motion";
import { safeText } from "@/lib/safeRender";
import type { NewsItem } from "@/types";

interface NewsCardProps {
  item: NewsItem;
  index: number;
  onClick: () => void;
}

export default function NewsCard({ item, index, onClick }: NewsCardProps) {
  const viewCount = item.viewCount != null && typeof item.viewCount === "number" ? item.viewCount : null;
  const keywords = item.keywords ?? [];

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
        boxShadow: "0 20px 40px -12px rgba(0,0,0,0.12)",
      }}
      whileTap={{ scale: 0.98 }}
      className="relative rounded-xl bg-white border border-gray-200 overflow-hidden cursor-pointer shadow-md hover:border-gray-300"
    >
      <div className="p-5 flex flex-col h-full min-h-[160px]">
        <h3 className="font-semibold text-lg line-clamp-2 text-gray-900 mb-2">
          {safeText(item.title)}
        </h3>
        <p className="text-sm text-gray-600 line-clamp-2 flex-1">{safeText(item.snippet)}</p>
        <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            {safeText(item.source) && (
              <span className="text-xs text-gray-500">{safeText(item.source)}</span>
            )}
            {viewCount !== null ? (
              <span className="text-xs text-gray-500">조회수: {viewCount >= 1000000 ? `${(viewCount / 1000000).toFixed(1)}M` : viewCount >= 1000 ? `${(viewCount / 1000).toFixed(1)}K` : viewCount}</span>
            ) : (
              <span className="text-xs text-gray-400">조회수: —</span>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {keywords.slice(0, 5).map((k, i) => (
              <span
                key={i}
                className="text-xs px-2 py-0.5 rounded-md bg-gray-100 text-gray-600"
              >
                #{safeText(k).replace(/\s/g, "_")}
              </span>
            ))}
          </div>
          {safeText(item.sentiment) && (
            <span
              className={`inline-block text-xs px-2 py-0.5 rounded-full ${
                item.sentiment === "Positive"
                  ? "bg-emerald-100 text-emerald-700"
                  : item.sentiment === "Negative"
                    ? "bg-rose-100 text-rose-700"
                    : "bg-gray-100 text-gray-600"
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
