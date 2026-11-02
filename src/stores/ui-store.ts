'use client';

import { create } from 'zustand';
import type { Song } from '@/types';

interface UIStore {
  isRecommendOpen: boolean;
  recommendParagraphText: string;
  recommendPosition: number | null;
  isAnalyzing: boolean;
  onInsertSong: ((song: Song) => void) | null;

  openRecommend: (text: string, position?: number, onInsert?: (song: Song) => void) => void;
  closeRecommend: () => void;
  setAnalyzing: (val: boolean) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  isRecommendOpen: false,
  recommendParagraphText: '',
  recommendPosition: null,
  isAnalyzing: false,
  onInsertSong: null,

  openRecommend: (text, position, onInsert) =>
    set({
      isRecommendOpen: true,
      recommendParagraphText: text,
      recommendPosition: position ?? null,
      onInsertSong: onInsert ?? null,
    }),

  closeRecommend: () =>
    set({
      isRecommendOpen: false,
      recommendParagraphText: '',
      recommendPosition: null,
      onInsertSong: null,
    }),

  setAnalyzing: (val) => set({ isAnalyzing: val }),
}));
