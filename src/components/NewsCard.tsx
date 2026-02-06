"use client";

import { motion } from "framer-motion";
import type { NewsItem } from "@/types";

interface NewsCardProps {
  item: NewsItem;
  index: number;
  onClick: () => void;
}

export default function NewsCard({ item, index, onClick }: NewsCardProps) {
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
        rotateY: 5,
        z: 8,
        boxShadow: "0 20px 40px -12px rgba(0,0,0,0.5)",
      }}
      whileTap={{ scale: 0.98 }}
      className="relative rounded-xl bg-card border border-white/10 overflow-hidden cursor-pointer
                 shadow-lg perspective-1000 transform-gpu"
      style={{ transformStyle: "preserve-3d" }}
    >
      <div className="p-5 flex flex-col h-full min-h-[140px]">
        <h3 className="font-semibold text-lg line-clamp-2 text-gray-100 mb-2">
          {item.title}
        </h3>
        <p className="text-sm text-muted line-clamp-2 flex-1">{item.snippet}</p>
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/10">
          {item.source && (
            <span className="text-xs text-muted">{item.source}</span>
          )}
          {item.sentiment && (
            <span
              className={`text-xs px-2 py-0.5 rounded-full ${
                item.sentiment === "Positive"
                  ? "bg-emerald-500/20 text-emerald-400"
                  : item.sentiment === "Negative"
                    ? "bg-rose-500/20 text-rose-400"
                    : "bg-slate-500/20 text-slate-400"
              }`}
            >
              {item.sentiment}
            </span>
          )}
        </div>
      </div>
    </motion.article>
  );
}
