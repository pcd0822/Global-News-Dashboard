"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IconX, IconCopy, IconExternalLink } from "@/components/Icons";
import { safeText } from "@/lib/safeRender";
import type { NewsItem } from "@/types";

interface NewsModalProps {
  item: NewsItem | null;
  onClose: () => void;
}

function buildMarkdown(item: NewsItem, useTranslation: boolean, summaryText: string): string {
  const title = useTranslation && item.titleTranslated ? item.titleTranslated : item.title;
  const summary = summaryText || (useTranslation && item.summaryTranslated ? item.summaryTranslated : item.summary ?? item.snippet);
  const sentiment = item.sentiment ?? "Neutral";
  const tags = (item.keywords ?? []).map((k) => `#${String(k).replace(/\s/g, "_")}`).join(" ");

  return `## [${title}](${item.link})
> ${String(summary).replace(/\n/g, " ")}
- 키워드: ${tags || "-"}
- 감정분석: ${sentiment}
`;
}

export default function NewsModal({ item, onClose }: NewsModalProps) {
  const [useTranslation, setUseTranslation] = useState(false);
  const [copied, setCopied] = useState(false);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);

  useEffect(() => {
    if (!item) {
      setAiSummary(null);
      return;
    }
    setAiSummary(null);
    setSummaryLoading(true);
    fetch("/api/news/summarize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: item.title, snippet: item.snippet, link: item.link }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.summary) setAiSummary(data.summary);
        else setAiSummary(item.snippet || "");
      })
      .catch(() => setAiSummary(item.snippet || ""))
      .finally(() => setSummaryLoading(false));
  }, [item?.id, item?.title, item?.snippet, item?.link, item?.snippet]);

  const handleCopy = useCallback(() => {
    if (!item) return;
    const summaryText = aiSummary ?? item.snippet ?? "";
    const text = buildMarkdown(item, useTranslation, summaryText);
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [item, useTranslation, aiSummary]);

  if (!item) return null;

  const title = useTranslation && item.titleTranslated ? item.titleTranslated : item.title;
  const displaySummary = aiSummary ?? (useTranslation && item.summaryTranslated ? item.summaryTranslated : item.summary ?? item.snippet);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
        role="presentation"
        aria-modal="true"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ type: "spring", damping: 25 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-2xl bg-white border border-gray-200 shadow-2xl flex flex-col"
        >
          <div className="p-6 overflow-y-auto flex-1">
            <div className="flex items-start justify-between gap-4 mb-4">
              <h2 className="text-xl font-bold text-gray-900 pr-8">{safeText(title)}</h2>
              <button
                type="button"
                onClick={onClose}
                className="shrink-0 p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-900"
                aria-label="닫기"
              >
                <IconX className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2 mb-4">
              <button
                type="button"
                onClick={() => setUseTranslation((v) => !v)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                  useTranslation ? "bg-accent text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                번역 보기
              </button>
              <a
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 text-sm"
              >
                원문 보기 <IconExternalLink className="w-4 h-4" />
              </a>
            </div>

            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-500 mb-2">AI 요약 (500자 내외)</h4>
              {summaryLoading ? (
                <p className="text-gray-400 text-sm">요약 생성 중...</p>
              ) : (
                <p className="text-gray-700 whitespace-pre-wrap text-sm leading-relaxed">{safeText(displaySummary)}</p>
              )}
            </div>

            {item.keywords && item.keywords.length > 0 && (
              <p className="text-sm text-gray-500 mb-1">
                키워드: {Array.isArray(item.keywords) ? item.keywords.map((k) => safeText(k)).join(", ") : ""}
              </p>
            )}
            {item.sentiment && (
              <p className="text-sm text-gray-500">감정: {safeText(item.sentiment)}</p>
            )}
          </div>

          <div className="p-4 border-t border-gray-200 flex justify-end gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200"
            >
              <IconCopy className="w-4 h-4" />
              옵시디언/노션 복사
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
