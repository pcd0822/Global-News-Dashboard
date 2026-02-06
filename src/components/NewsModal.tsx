"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { IconX, IconExternalLink } from "@/components/Icons";
import { safeText } from "@/lib/safeRender";
import type { NewsItem } from "@/types";

interface NewsModalProps {
  item: NewsItem | null;
  onClose: () => void;
}

function slugify(s: string): string {
  return s
    .replace(/[^A-Za-z0-9\u3131-\uD79D\s-]/g, "")
    .trim()
    .slice(0, 50)
    .replace(/\s+/g, "-");
}

export default function NewsModal({ item, onClose }: NewsModalProps) {
  const [useTranslation, setUseTranslation] = useState(false);
  const [reportMarkdown, setReportMarkdown] = useState<string | null>(null);
  const [reportLoading, setReportLoading] = useState(false);

  useEffect(() => {
    if (!item) {
      setReportMarkdown(null);
      return;
    }
    setReportMarkdown(null);
    setReportLoading(true);
    fetch("/api/news/report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: item.title,
        snippet: item.snippet,
        link: item.link,
        source: item.source ?? "",
        date: item.date ?? new Date().toISOString().slice(0, 10),
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.report) setReportMarkdown(data.report);
        else setReportMarkdown(null);
      })
      .catch(() => setReportMarkdown(null))
      .finally(() => setReportLoading(false));
  }, [item?.id, item?.title, item?.snippet, item?.link, item?.source, item?.date]);

  const handleDownload = useCallback(() => {
    if (!item || !reportMarkdown) return;
    const blob = new Blob([reportMarkdown], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `report-${slugify(item.title)}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [item, reportMarkdown]);

  if (!item) return null;

  const title = useTranslation && item.titleTranslated ? item.titleTranslated : item.title;

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
          className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-2xl bg-white border border-pastel-lavender/30 shadow-2xl flex flex-col"
        >
          <div className="p-6 overflow-y-auto flex-1">
            <div className="flex items-start justify-between gap-4 mb-4">
              <h2 className="text-xl font-bold text-gray-800 pr-8">{safeText(title)}</h2>
              <button
                type="button"
                onClick={onClose}
                className="shrink-0 p-2 rounded-lg hover:bg-pastel-sage/50 text-muted hover:text-gray-700"
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
                  useTranslation ? "bg-pastel-lavender/80 text-gray-700" : "bg-pastel-sage/50 text-gray-700 hover:bg-pastel-sage/70"
                }`}
              >
                번역 보기
              </button>
              <a
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-pastel-sky/50 text-gray-700 hover:bg-pastel-sky/70 text-sm"
              >
                원문 보기 <IconExternalLink className="w-4 h-4" />
              </a>
            </div>

            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-600 mb-2">상세 리포트 (Intelligence Report)</h4>
              {reportLoading ? (
                <p className="text-gray-500 text-sm">리포트 생성 중...</p>
              ) : reportMarkdown ? (
                <div className="prose prose-sm max-w-none prose-headings:text-gray-800 prose-p:text-gray-700 prose-li:text-gray-700 prose-blockquote:border-l-pastel-lavender prose-blockquote:bg-pastel-cream/30 prose-blockquote:py-1 prose-blockquote:px-3 prose-a:text-accent prose-strong:text-gray-800">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{reportMarkdown}</ReactMarkdown>
                </div>
              ) : (
                <p className="text-gray-500 text-sm">리포트를 불러올 수 없습니다.</p>
              )}
            </div>
          </div>

          <div className="p-4 border-t border-pastel-cream flex justify-end gap-2">
            <button
              type="button"
              onClick={handleDownload}
              disabled={!reportMarkdown}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-pastel-sage/50 text-gray-700 hover:bg-pastel-sage/70 disabled:opacity-50"
            >
              마크다운 다운로드
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
