import type { Song, SearchResponse, SongDetail } from '@/types';

export async function searchSongs(keywords: string, limit = 3): Promise<Song[]> {
  const response = await fetch(
    `/api/music/search?keywords=${encodeURIComponent(keywords)}&limit=${limit}`
  );

  if (!response.ok) {
    throw new Error('歌曲搜索失败');
  }

  const data: SearchResponse = await response.json();
  return data.songs;
}

export async function getSongDetail(id: number): Promise<SongDetail> {
  const response = await fetch(`/api/music/detail?id=${id}`);

  if (!response.ok) {
    throw new Error('获取歌曲详情失败');
  }

  return response.json();
}
