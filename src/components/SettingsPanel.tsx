"use client";

import { useState } from "react";
import { IconSettings } from "@/components/Icons";
import { KEYWORD_OPTIONS } from "@/constants/keywords";
import { useSettingsStore } from "@/store/settingsStore";

interface SettingsPanelProps {
  onClose?: () => void;
  inline?: boolean;
}

export default function SettingsPanel({ onClose, inline }: SettingsPanelProps) {
  const { selectedKeywordIds, newsCount, searchPeriod, setSelectedKeywordIds, setNewsCount, setSearchPeriod } = useSettingsStore();
  const [localIds, setLocalIds] = useState<string[]>(selectedKeywordIds);
  const [localCount, setLocalCount] = useState(newsCount);
  const [localPeriod, setLocalPeriod] = useState(searchPeriod);

  const handleToggle = (id: string) => {
    setLocalIds((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      return next.length ? next : [KEYWORD_OPTIONS[0].id];
    });
  };

  const handleSave = () => {
    setSelectedKeywordIds(localIds.length ? localIds : [KEYWORD_OPTIONS[0].id]);
    setNewsCount(Math.max(1, Math.min(50, localCount)));
    setSearchPeriod(localPeriod);
    onClose?.();
  };

  const form = (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          관심 주제 (키워드 목록에서 선택)
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto rounded-lg border border-pastel-sage/50 bg-pastel-cream/50 p-3">
          {KEYWORD_OPTIONS.map((opt) => (
            <label
              key={opt.id}
              className="flex items-center gap-2 cursor-pointer text-sm text-gray-800"
            >
              <input
                type="checkbox"
                checked={localIds.includes(opt.id)}
                onChange={() => handleToggle(opt.id)}
                className="rounded border-pastel-sage text-pastel-lavender focus:ring-pastel-lavender"
              />
              <span>{opt.label}</span>
            </label>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          기사 검색 기간
        </label>
        <select
          value={localPeriod}
          onChange={(e) => setLocalPeriod(e.target.value as "1d" | "1w" | "1m" | "2m")}
          className="w-full rounded-lg border border-gray-200 bg-white text-gray-900 px-3 py-2"
        >
          <option value="1d">지난 1일</option>
          <option value="1w">지난 1주</option>
          <option value="1m">지난 1개월</option>
          <option value="2m">지난 2개월</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          수집 뉴스 개수 (N)
        </label>
        <input
          type="number"
          min={1}
          max={50}
          value={localCount}
          onChange={(e) => setLocalCount(Number(e.target.value) || 10)}
          className="w-full rounded-lg border border-gray-200 bg-white text-gray-900 px-3 py-2"
        />
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleSave}
          className="px-4 py-2 rounded-lg bg-pastel-lavender/80 text-gray-700 hover:bg-pastel-lavender"
        >
          저장
        </button>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-pastel-sage/50 text-gray-700 hover:bg-pastel-sage/70"
          >
            취소
          </button>
        )}
      </div>
    </div>
  );

  if (inline) {
    return (
      <div className="rounded-xl bg-white border border-pastel-lavender/30 shadow-sm p-4">
        <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <IconSettings className="w-5 h-5 text-muted" /> 설정
        </h3>
        {form}
      </div>
    );
  }

  return form;
}
