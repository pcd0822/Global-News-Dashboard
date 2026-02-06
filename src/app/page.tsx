"use client";

import { useState, useEffect, useCallback } from "react";
import { safeText } from "@/lib/safeRender";
import { motion, AnimatePresence } from "framer-motion";
import { IconSettings, IconRefreshCw, IconArchive } from "@/components/Icons";
import { useSettingsStore } from "@/store/settingsStore";
import { useNewsStore } from "@/store/newsStore";
import NewsCard from "@/components/NewsCard";
import NewsModal from "@/components/NewsModal";
import TrendAnalysis from "@/components/TrendAnalysis";
import ReviewSection from "@/components/ReviewSection";
import SettingsPanel from "@/components/SettingsPanel";

export default function DashboardPage() {
  const { newsCount, getQuery } = useSettingsStore();
  const keyword = getQuery();
  const { items, loading, error, setItems, setLoading, setError, updateItem } = useNewsStore();

  const [selectedNews, setSelectedNews] = useState<typeof items[0] | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [archiving, setArchiving] = useState(false);

  const fetchNews = useCallback(() => {
    setLoading(true);
    setError(null);
    fetch(`/api/news/fetch?keyword=${encodeURIComponent(keyword)}&num=${newsCount}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else setItems(data.items ?? []);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [keyword, newsCount, setItems, setLoading, setError]);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  const handleProcessAndArchive = () => {
    if (items.length === 0) return;
    setArchiving(true);
    fetch("/api/news/process", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items, topic: keyword }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else if (data.processed) {
          data.processed.forEach((p: { id: string; titleTranslated?: string; summary?: string; summaryTranslated?: string; sentiment?: string; keywords?: string[] }) => {
            updateItem(p.id, {
              titleTranslated: p.titleTranslated,
              summary: p.summary,
              summaryTranslated: p.summaryTranslated,
              sentiment: p.sentiment as "Positive" | "Negative" | "Neutral",
              keywords: p.keywords,
            });
          });
        }
      })
      .catch((e) => setError(e.message))
      .finally(() => setArchiving(false));
  };

  return (
    <div className="min-h-screen bg-surface">
      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Global News Dashboard</h1>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={fetchNews}
              disabled={loading}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50"
            >
              <IconRefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              새로고침
            </button>
            <button
              type="button"
              onClick={handleProcessAndArchive}
              disabled={items.length === 0 || archiving}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-accent text-white hover:opacity-90 disabled:opacity-50"
            >
              <IconArchive className="w-4 h-4" />
              {archiving ? "처리 중..." : "처리 및 아카이빙"}
            </button>
            <button
              type="button"
              onClick={() => setSettingsOpen(true)}
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 hover:text-gray-900"
              aria-label="설정"
            >
              <IconSettings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {error && (
          <div className="mb-4 p-4 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-sm">
            {safeText(error)}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Section A: Today's Headlines (main) */}
          <section className="lg:col-span-3">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Today&apos;s Headlines
            </h2>
            {loading ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="h-[160px] rounded-xl bg-white border border-gray-200 animate-pulse"
                  />
                ))}
              </div>
            ) : items.length === 0 ? (
              <p className="text-gray-500">뉴스가 없습니다. 설정에서 키워드를 선택하거나 새로고침하세요.</p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {items.map((item, i) => (
                  <NewsCard
                    key={item.id}
                    item={item}
                    index={i}
                    onClick={() => setSelectedNews(item)}
                  />
                ))}
              </div>
            )}
          </section>

          {/* Section B & C: Sidebar */}
          <aside className="space-y-6">
            <TrendAnalysis items={items} />
            <ReviewSection topic={keyword} />
          </aside>
        </div>
      </main>

      <AnimatePresence>
        {selectedNews && (
          <NewsModal
            item={selectedNews}
            onClose={() => setSelectedNews(null)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {settingsOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            onClick={() => setSettingsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-2xl bg-white border border-gray-200 shadow-xl p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">설정</h3>
              <SettingsPanel onClose={() => setSettingsOpen(false)} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
