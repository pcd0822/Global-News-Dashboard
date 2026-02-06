"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IconX, IconCopy, IconExternalLink } from "@/components/Icons";
import type { NewsItem } from "@/types";

interface NewsModalProps {
  item: NewsItem | null;
  onClose: () => void;
}

function buildMarkdown(item: NewsItem, useTranslation: boolean): string {
  const title = useTranslation && item.titleTranslated ? item.titleTranslated : item.title;
  const summary = useTranslation && item.summaryTranslated ? item.summaryTranslated : (item.summary ?? item.snippet);
  const sentiment = item.sentiment ?? "Neutral";
  const tags = (item.keywords ?? []).map((k) => `#${k.replace(/\s/g, "_")}`).join(" ");

  return `## [${title}](${item.link})
> ${summary.replace(/\n/g, " ")}
- 키워드: ${tags || "-"}
- 감정분석: ${sentiment}
`;
}

export default function NewsModal({ item, onClose }: NewsModalProps) {
  const [useTranslation, setUseTranslation] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    if (!item) return;
    const text = buildMarkdown(item, useTranslation);
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [item, useTranslation]);

  if (!item) return null;

  const title = useTranslation && item.titleTranslated ? item.titleTranslated : item.title;
  const summary = useTranslation && item.summaryTranslated ? item.summaryTranslated : (item.summary ?? item.snippet);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ type: "spring", damping: 25 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-2xl bg-card border border-white/10 shadow-2xl flex flex-col"
        >
          <div className="p-6 overflow-y-auto flex-1">
            <div className="flex items-start justify-between gap-4 mb-4">
              <h2 className="text-xl font-bold text-gray-100 pr-8">{title}</h2>
              <button
                type="button"
                onClick={onClose}
                className="shrink-0 p-2 rounded-lg hover:bg-white/10 text-muted hover:text-white"
                aria-label="닫기"
              >
                <IconX className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-3 mb-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <span className="text-sm text-muted">한국어 번역</span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={useTranslation}
                  onClick={() => setUseTranslation((v) => !v)}
                  className={`relative w-11 h-6 rounded-full transition-colors ${
                    useTranslation ? "bg-accent" : "bg-white/20"
                  }`}
                >
                  <motion.span
                    layout
                    className="absolute top-1 w-4 h-4 rounded-full bg-white shadow"
                    style={{ left: useTranslation ? "22px" : "4px" }}
                  />
                </button>
              </label>
              <a
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-accent hover:underline"
              >
                원문 보기 <IconExternalLink className="w-4 h-4" />
              </a>
            </div>

            <div className="prose prose-invert prose-sm max-w-none mb-4">
              <p className="text-gray-300 whitespace-pre-wrap">{summary}</p>
            </div>

            {item.keywords && item.keywords.length > 0 && (
              <p className="text-sm text-muted mb-2">
                키워드: {item.keywords.join(", ")}
              </p>
            )}
            {item.sentiment && (
              <p className="text-sm text-muted">감정: {item.sentiment}</p>
            )}
          </div>

          <div className="p-4 border-t border-white/10 flex justify-end">
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-white hover:opacity-90"
            >
              <IconCopy className="w-4 h-4" />
              {copied ? "복사됨" : "옵시디언/노션 복사"}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
