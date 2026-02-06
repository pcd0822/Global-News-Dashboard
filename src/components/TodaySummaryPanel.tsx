"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { IconX } from "@/components/Icons";
import type { NewsItem } from "@/types";

const SUMMARY_IMAGE = "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&h=300&fit=crop";

interface TodaySummaryPanelProps {
  open: boolean;
  onClose: () => void;
  items: NewsItem[];
}

function slugify(s: string): string {
  return s.replace(/[^\p{L}\p{N}\s-]/gu, "").trim().slice(0, 40).replace(/\s+/g, "-");
}

export default function TodaySummaryPanel({ open, onClose, items }: TodaySummaryPanelProps) {
  const [report, setReport] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const loadReport = useCallback(() => {
    if (items.length === 0) return;
    setLoading(true);
    setReport(null);
    fetch("/api/news/today-summary", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.report) setReport(data.report);
      })
      .catch(() => setReport(null))
      .finally(() => setLoading(false));
  }, [items]);

  useEffect(() => {
    if (open && items.length > 0) loadReport();
  }, [open, items.length, loadReport]);

  const handleDownload = useCallback(() => {
    if (!report) return;
    const blob = new Blob([report], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `today-issues-summary-${slugify(new Date().toISOString().slice(0, 10))}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [report]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="summary-panel"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-40 flex justify-end"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/20"
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 200 }}
            className="relative z-50 h-full w-full max-w-xl bg-white border-l border-pastel-lavender/30 shadow-2xl flex flex-col"
          >
            <div className="shrink-0 p-4 border-b border-pastel-cream flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">Today Issues Summary</h3>
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-pastel-sage/50 text-gray-600"
                aria-label="닫기"
              >
                <IconX className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="p-6 text-center text-gray-500">리포트 생성 중...</div>
              ) : report ? (
                <>
                  <div className="w-full h-40 bg-pastel-sky/30 shrink-0">
                    <img
                      src={SUMMARY_IMAGE}
                      alt="Today Summary"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-6 prose prose-sm max-w-none prose-headings:text-gray-800 prose-p:text-gray-700 prose-li:text-gray-700 prose-blockquote:border-l-pastel-lavender prose-blockquote:bg-pastel-cream/30 prose-img:rounded-lg">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{report}</ReactMarkdown>
                  </div>
                </>
              ) : (
                <div className="p-6 text-center text-gray-500">리포트를 불러올 수 없습니다.</div>
              )}
            </div>
            <div className="shrink-0 p-4 border-t border-pastel-cream flex justify-end">
              <button
                type="button"
                onClick={handleDownload}
                disabled={!report}
                className="px-4 py-2 rounded-lg bg-pastel-lavender/80 text-gray-700 hover:bg-pastel-lavender disabled:opacity-50"
              >
                마크다운 다운로드
              </button>
            </div>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
