import { NextRequest } from 'next/server';

const NETEASE_API_BASE = process.env.NETEASE_API_URL || 'http://localhost:3001';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return Response.json({ error: '请提供歌曲 ID' }, { status: 400 });
    }

    // 获取歌曲详情
    const detailRes = await fetch(`${NETEASE_API_BASE}/song/detail?ids=${id}`);
    const detailData = await detailRes.json();

    const song = detailData.songs?.[0];
    if (!song) {
      return Response.json({ error: '歌曲不存在' }, { status: 404 });
    }

    // 获取歌曲 URL（试听）
    const urlRes = await fetch(`${NETEASE_API_BASE}/song/url?id=${id}`);
    const urlData = await urlRes.json();
    const songUrl = urlData.data?.[0]?.url || '';

    return Response.json({
      id: song.id,
      name: song.name || '未知歌曲',
      artist: song.ar?.map((a: { name: string }) => a.name).join(' / ') || '未知歌手',
      album: song.al?.name || '未知专辑',
      coverUrl: song.al?.picUrl || '/music-placeholder.png',
      previewUrl: songUrl,
    });
  } catch (error) {
    console.error('Music detail error:', error);
    return Response.json({ error: '获取歌曲详情失败' }, { status: 500 });
  }
}
