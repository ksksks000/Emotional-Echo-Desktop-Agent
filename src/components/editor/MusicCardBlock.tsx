'use client';

import { type NodeViewProps, NodeViewWrapper } from '@tiptap/react';
import { Play, Pause, Music } from 'lucide-react';
import { usePlayerStore } from '@/stores/player-store';

export default function MusicCardBlock({ node }: NodeViewProps) {
  const { songId, songName, artist, coverUrl, previewUrl } = node.attrs;
  const { currentSong, isPlaying, play } = usePlayerStore();
  const isCurrentPlaying = currentSong?.id === songId && isPlaying;

  const handlePlay = () => {
    play({
      id: songId,
      name: songName,
      artist,
      coverUrl,
      previewUrl,
    });
  };

  return (
    <NodeViewWrapper>
      <div className="animate-fade-in-up my-4">
        <div className="relative flex items-center gap-4 p-4 rounded-xl bg-card border border-border/50 group hover:border-accent/30 transition-all duration-300">
          {/* 封面 */}
          <div className="relative w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-border/30">
            {coverUrl ? (
              <img
                src={coverUrl}
                alt={songName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Music className="w-6 h-6 text-muted" />
              </div>
            )}
          </div>

          {/* 歌曲信息 */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {songName || '未知歌曲'}
            </p>
            <p className="text-xs text-muted-foreground truncate mt-0.5">
              {artist || '未知歌手'}
            </p>
          </div>

          {/* 播放按钮 */}
          <button
            onClick={handlePlay}
            className="relative flex items-center justify-center w-10 h-10 rounded-full bg-accent/10 hover:bg-accent/20 text-accent transition-all duration-200 flex-shrink-0"
          >
            {isCurrentPlaying ? (
              <Pause className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4 ml-0.5" />
            )}
            {isCurrentPlaying && <span className="playing-pulse absolute inset-0 rounded-full" />}
          </button>

          {/* 左侧装饰线 */}
          <div className="absolute left-0 top-2 bottom-2 w-0.5 bg-accent/40 rounded-full" />
        </div>
      </div>
    </NodeViewWrapper>
  );
}
