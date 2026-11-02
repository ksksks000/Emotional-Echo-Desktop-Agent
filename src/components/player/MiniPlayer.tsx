'use client';

import { useEffect, useRef } from 'react';
import { Play, Pause, SkipBack, Music } from 'lucide-react';
import { usePlayerStore } from '@/stores/player-store';
import { formatTime } from '@/lib/utils';

export default function MiniPlayer() {
  const { currentSong, isPlaying, currentTime, duration, play, pause, seek, setAudioRef, setCurrentTime, setDuration } =
    usePlayerStore();
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (audioRef.current) {
      setAudioRef(audioRef.current);
    }
  }, [setAudioRef]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleEnded = () => {
    usePlayerStore.setState({ isPlaying: false });
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    seek(percent * duration);
  };

  if (!currentSong) return null;

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <>
      <audio
        ref={audioRef}
        src={currentSong.previewUrl}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
      />

      {/* 底部 Mini Player */}
      <div className="fixed bottom-0 left-0 right-0 z-30 md:bottom-4 md:left-auto md:right-4 md:w-80 md:rounded-xl animate-slide-up">
        <div className="glass-strong md:rounded-xl">
          {/* 进度条 */}
          <div
            className="h-1 cursor-pointer hover:h-1.5 transition-all group"
            onClick={handleProgressClick}
          >
            <div className="h-full bg-border/30 relative">
              <div
                className="h-full bg-accent transition-all duration-150"
                style={{ width: `${progress}%` }}
              />
              <div
                className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-accent opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ left: `${progress}%`, transform: `translate(-50%, -50%)` }}
              />
            </div>
          </div>

          {/* 内容区域 */}
          <div className="flex items-center gap-3 px-4 py-3">
            {/* 封面 */}
            <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-border/30">
              {currentSong.coverUrl ? (
                <img
                  src={currentSong.coverUrl}
                  alt={currentSong.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Music className="w-4 h-4 text-muted" />
                </div>
              )}
            </div>

            {/* 歌曲信息 */}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-foreground truncate">
                {currentSong.name}
              </p>
              <p className="text-[10px] text-muted-foreground truncate">
                {currentSong.artist} · {formatTime(currentTime)} / {formatTime(duration)}
              </p>
            </div>

            {/* 控制按钮 */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  if (isPlaying) pause();
                  else usePlayerStore.getState().resume();
                }}
                className="flex items-center justify-center w-8 h-8 rounded-full bg-accent text-accent-foreground hover:opacity-90 transition-opacity"
              >
                {isPlaying ? (
                  <Pause className="w-3.5 h-3.5" />
                ) : (
                  <Play className="w-3.5 h-3.5 ml-0.5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 底部留白（防止内容被播放器遮挡） */}
      <div className="h-16 md:h-0" />
    </>
  );
}
