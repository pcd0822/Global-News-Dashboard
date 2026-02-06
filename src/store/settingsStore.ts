import { create } from "zustand";
import { persist } from "zustand/middleware";
import { KEYWORD_OPTIONS } from "@/constants/keywords";
import type { UserSettings } from "@/types";

const DEFAULT_SETTINGS: UserSettings = {
  selectedKeywordIds: ["ai"],
  newsCount: 10,
};

interface SettingsState extends UserSettings {
  setSelectedKeywordIds: (ids: string[]) => void;
  toggleKeyword: (id: string) => void;
  setNewsCount: (newsCount: number) => void;
  setSettings: (settings: Partial<UserSettings>) => void;
  reset: () => void;
  /** API용 검색 쿼리 (선택된 키워드의 query 결합) */
  getQuery: () => string;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      ...DEFAULT_SETTINGS,
      setSelectedKeywordIds: (selectedKeywordIds) => set({ selectedKeywordIds }),
      toggleKeyword: (id: string) =>
        set((s) => {
          const has = s.selectedKeywordIds.includes(id);
          const next = has
            ? s.selectedKeywordIds.filter((x) => x !== id)
            : [...s.selectedKeywordIds, id];
          return { selectedKeywordIds: next.length ? next : [KEYWORD_OPTIONS[0].id] };
        }),
      setNewsCount: (newsCount) => set({ newsCount: Math.max(1, Math.min(50, newsCount)) }),
      setSettings: (settings) => set((s) => ({ ...s, ...settings })),
      reset: () => set(DEFAULT_SETTINGS),
      getQuery: () => {
        const ids = get().selectedKeywordIds;
        const queries = KEYWORD_OPTIONS.filter((k) => ids.includes(k.id)).map((k) => k.query);
        return queries.length ? queries.join(" OR ") : "world news";
      },
    }),
    { name: "global-news-settings-v2" }
  )
);
