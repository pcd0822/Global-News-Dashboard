import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { UserSettings } from "@/types";

const DEFAULT_SETTINGS: UserSettings = {
  keyword: "global news",
  newsCount: 10,
};

interface SettingsState extends UserSettings {
  setKeyword: (keyword: string) => void;
  setNewsCount: (newsCount: number) => void;
  setSettings: (settings: Partial<UserSettings>) => void;
  reset: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...DEFAULT_SETTINGS,
      setKeyword: (keyword) => set({ keyword }),
      setNewsCount: (newsCount) => set({ newsCount: Math.max(1, Math.min(50, newsCount)) }),
      setSettings: (settings) => set((s) => ({ ...s, ...settings })),
      reset: () => set(DEFAULT_SETTINGS),
    }),
    { name: "global-news-settings" }
  )
);
