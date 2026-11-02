'use client';

import { useState, useEffect } from 'react';
import { X, Play, Pause, Plus, Loader2, Sparkles, Music } from 'lucide-react';
import { useUIStore } from '@/stores/ui-store';
import { usePlayerStore } from '@/stores/player-store';
import { analyzeText } from '@/services/ai-service';
import { searchSongs } from '@/services/music-service';
import type { Song, AnalyzeResponse } from '@/types';

export default function RecommendModal() {
  const { isRecommendOpen, recommendParagraphText, closeRecommend, setAnalyzing, isAnalyzing, onInsertSong } =
    useUIStore();
  const { currentSong, isPlaying, play, pause } = usePlayerStore();

  const [analysis, setAnalysis] = useState<AnalyzeResponse | null>(null);
  const [songs, setSongs] = useState<Song[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [previewingId, setPreviewingId] = useState<number | null>(null);

  // 当弹窗打开时，触发 AI 分析
  useEffect(() => {
    if (isRecommendOpen && recommendParagraphText) {
      handleAnalyze();
    }
    if (!isRecommendOpen) {
      setAnalysis(null);
      setSongs([]);
      setError(null);
      setPreviewingId(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRecommendOpen]);

  const handleAnalyze = async () => {
    setAnalyzing(true);
    setError(null);

    try {
      // 1. AI 分析
      const result = await analyzeText(recommendParagraphText);
      setAnalysis(result);

      // 2. 用 music_tags 搜索歌曲
      const searchKeywords = result.music_tags.join(' ');
      const songList = await searchSongs(searchKeywords);
      setSongs(songList);
    } catch (err) {
      setError('分析失败，请重试');
      console.error(err);
    } finally {
      setAnalyzing(false);
    }
  };

  const handlePreview = (song: Song) => {
    if (currentSong?.id === song.id && isPlaying) {
      pause();
      setPreviewingId(null);
    } else {
      play(song);
      setPreviewingId(song.id);
    }
  };

  if (!isRecommendOpen) return null;

  return (
    <>
      {/* 遮罩层 */}
      <div
        className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
        onClick={closeRecommend}
      />

      {/* 弹窗主体 */}
      <div className="fixed bottom-0 left-0 right-0 md:bottom-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:max-w-lg md:rounded-2xl z-50 animate-slide-up">
        <div className="glass-strong rounded-t-2xl md:rounded-2xl p-6 max-h-[80dvh] overflow-y-auto">
          {/* 头部 */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-accent" />
              <h3 className="text-lg font-semibold text-foreground font-serif">
                AI 为你寻曲
              </h3>
            </div>
            <button
              onClick={closeRecommend}
              className="p-1.5 rounded-lg hover:bg-card transition-colors text-muted-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* 分析结果 */}
          {isAnalyzing && (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="w-6 h-6 text-accent animate-spin" />
              <span className="ml-3 text-muted-foreground">正在分析情绪...</span>
            </div>
          )}

          {analysis && !isAnalyzing && (
            <div className="mb-5 p-3 rounded-xl bg-accent/5 border border-accent/10">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-0.5 rounded-full bg-accent/20 text-accent text-xs font-medium animate-bounce-in">
                  {analysis.emotion}
                </span>
                <span className="text-xs text-muted-foreground">{analysis.scene}</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {analysis.music_tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 rounded-full bg-lavender/10 text-lavender text-xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {error && !isAnalyzing && (
            <div className="mb-5 p-3 rounded-xl bg-destructive/10 text-destructive text-sm">
              {error}
            </div>
          )}

          {/* 候选歌曲列表 */}
          {songs.length > 0 && !isAnalyzing && (
            <div className="space-y-3">
              {songs.map((song, index) => {
                const isCurrentlyPlaying = currentSong?.id === song.id && isPlaying;
                return (
                  <div
                    key={song.id}
                    className="flex items-center gap-3 p-3 rounded-xl bg-card/50 border border-border/30 hover:border-accent/20 transition-all group"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    {/* 封面 */}
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-border/30">
                      {song.coverUrl ? (
                        <img
                          src={song.coverUrl}
                          alt={song.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Music className="w-5 h-5 text-muted" />
                        </div>
                      )}
                    </div>

                    {/* 歌曲信息 */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {song.name}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">{song.artist}</p>
                    </div>

                    {/* 试听按钮 */}
                    <button
                      onClick={() => handlePreview(song)}
                      className="flex items-center justify-center w-9 h-9 rounded-full bg-accent/10 hover:bg-accent/20 text-accent transition-all flex-shrink-0"
                    >
                      {isCurrentlyPlaying ? (
                        <Pause className="w-3.5 h-3.5" />
                      ) : (
                        <Play className="w-3.5 h-3.5 ml-0.5" />
                      )}
                    </button>

                    {/* 插入按钮 */}
                    <button
                      onClick={() => {
                        if (onInsertSong) onInsertSong(song);
                        closeRecommend();
                      }}
                      className="flex items-center justify-center w-9 h-9 rounded-full bg-accent/20 hover:bg-accent text-accent hover:text-accent-foreground transition-all flex-shrink-0"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* 无结果 */}
          {songs.length === 0 && !isAnalyzing && analysis && (
            <div className="text-center py-8 text-muted-foreground text-sm">
              未找到匹配歌曲，请尝试修改文本后重试
            </div>
          )}
        </div>
      </div>
    </>
  );
}
