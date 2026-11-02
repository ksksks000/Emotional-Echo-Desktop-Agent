'use client';

import { create } from 'zustand';
import type { Song } from '@/types';

interface PlayerStore {
  currentSong: Song | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  audioRef: HTMLAudioElement | null;

  setAudioRef: (ref: HTMLAudioElement) => void;
  play: (song: Song) => void;
  pause: () => void;
  resume: () => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  seek: (time: number) => void;
}

export const usePlayerStore = create<PlayerStore>((set, get) => ({
  currentSong: null,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  audioRef: null,

  setAudioRef: (ref) => set({ audioRef: ref }),

  play: (song) => {
    const { audioRef, currentSong } = get();

    // 如果点击的是同一首歌，切换播放/暂停
    if (currentSong?.id === song.id && audioRef) {
      if (get().isPlaying) {
        audioRef.pause();
        set({ isPlaying: false });
      } else {
        audioRef.play();
        set({ isPlaying: true });
      }
      return;
    }

    // 切换到新歌
    if (audioRef) {
      audioRef.src = song.previewUrl;
      audioRef.play().catch(() => {});
    }

    set({
      currentSong: song,
      isPlaying: true,
      currentTime: 0,
      duration: 0,
    });
  },

  pause: () => {
    const { audioRef } = get();
    if (audioRef) {
      audioRef.pause();
    }
    set({ isPlaying: false });
  },

  resume: () => {
    const { audioRef } = get();
    if (audioRef) {
      audioRef.play().catch(() => {});
    }
    set({ isPlaying: true });
  },

  setCurrentTime: (time) => set({ currentTime: time }),

  setDuration: (duration) => set({ duration }),

  seek: (time) => {
    const { audioRef } = get();
    if (audioRef) {
      audioRef.currentTime = time;
    }
    set({ currentTime: time });
  },
}));
