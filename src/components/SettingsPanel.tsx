"use client";

import { useState } from "react";
import { Settings } from "lucide-react";
import { useSettingsStore } from "@/store/settingsStore";

interface SettingsPanelProps {
  onClose?: () => void;
  inline?: boolean;
}

export default function SettingsPanel({ onClose, inline }: SettingsPanelProps) {
  const { keyword, newsCount, setKeyword, setNewsCount } = useSettingsStore();
  const [localKeyword, setLocalKeyword] = useState(keyword);
  const [localCount, setLocalCount] = useState(newsCount);

  const handleSave = () => {
    setKeyword(localKeyword.trim() || "global news");
    setNewsCount(Math.max(1, Math.min(50, localCount)));
    onClose?.();
  };

  const form = (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          관심 주제 (Keyword)
        </label>
        <input
          type="text"
          value={localKeyword}
          onChange={(e) => setLocalKeyword(e.target.value)}
          placeholder="예: AI, climate change"
          className="w-full rounded-lg bg-white/10 border border-white/20 text-gray-100 px-3 py-2 placeholder:text-muted"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          매일 수집할 뉴스 개수 (N)
        </label>
        <input
          type="number"
          min={1}
          max={50}
          value={localCount}
          onChange={(e) => setLocalCount(Number(e.target.value) || 10)}
          className="w-full rounded-lg bg-white/10 border border-white/20 text-gray-100 px-3 py-2"
        />
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleSave}
          className="px-4 py-2 rounded-lg bg-accent text-white hover:opacity-90"
        >
          저장
        </button>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-white/10 text-gray-300 hover:bg-white/20"
          >
            취소
          </button>
        )}
      </div>
    </div>
  );

  if (inline) {
    return (
      <div className="rounded-xl bg-card border border-white/10 p-4">
        <h3 className="font-semibold text-gray-100 mb-3 flex items-center gap-2">
          <Settings className="w-5 h-5" /> 설정
        </h3>
        {form}
      </div>
    );
  }

  return form;
}
