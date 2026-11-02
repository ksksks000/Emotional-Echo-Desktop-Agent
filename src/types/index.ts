// 日记
export interface Diary {
  id: string;
  title: string;
  content: string; // Tiptap JSON 序列化的完整编辑器内容
  emotion?: string;
  createdAt: string;
  updatedAt: string;
}

// 音乐卡片数据
export interface MusicCardData {
  songId: number;
  songName: string;
  artist: string;
  coverUrl: string;
  previewUrl: string;
}

// AI 情绪分析请求
export interface AnalyzeRequest {
  text: string;
}

// AI 情绪分析响应
export interface AnalyzeResponse {
  emotion: string;
  scene: string;
  music_tags: string[];
}

// 歌曲信息
export interface Song {
  id: number;
  name: string;
  artist: string;
  coverUrl: string;
  previewUrl: string;
}

// 音乐搜索响应
export interface SearchResponse {
  songs: Song[];
}

// 歌曲详情
export interface SongDetail {
  id: number;
  name: string;
  artist: string;
  album: string;
  coverUrl: string;
  previewUrl: string;
}

// 播放器状态
export interface PlayerState {
  currentSong: Song | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
}

// 情绪标签定义
export const EMOTIONS = [
  '孤独', '释然', '忧伤', '欢快', '平静',
  '焦躁', '思念', '希望', '迷茫', '感动',
  '愤怒', '甜蜜', '惆怅', '惬意', '热血',
] as const;

export type Emotion = typeof EMOTIONS[number];
