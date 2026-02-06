import { create } from "zustand";
import type { NewsItem } from "@/types";

interface NewsState {
  items: NewsItem[];
  loading: boolean;
  error: string | null;
  setItems: (items: NewsItem[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  updateItem: (id: string, updates: Partial<NewsItem>) => void;
}

export const useNewsStore = create<NewsState>((set) => ({
  items: [],
  loading: false,
  error: null,
  setItems: (items) => set({ items, error: null }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error, loading: false }),
  updateItem: (id, updates) =>
    set((state) => ({
      items: state.items.map((item) => (item.id === id ? { ...item, ...updates } : item)),
    })),
}));
