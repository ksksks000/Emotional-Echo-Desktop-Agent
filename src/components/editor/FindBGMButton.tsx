'use client';

import { Music, Loader2 } from 'lucide-react';
import { useUIStore } from '@/stores/ui-store';

interface FindBGMButtonProps {
  text: string;
}

export default function FindBGMButton({ text }: FindBGMButtonProps) {
  const { openRecommend, isAnalyzing } = useUIStore();

  const handleClick = () => {
    if (!text.trim()) return;
    openRecommend(text.trim());
  };

  return (
    <button
      onClick={handleClick}
      disabled={!text.trim() || isAnalyzing}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-accent/10 text-accent hover:bg-accent/20 border border-accent/20 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
    >
      {isAnalyzing ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : (
        <Music className="w-3.5 h-3.5" />
      )}
      寻找 BGM
    </button>
  );
}
