import { NextRequest } from 'next/server';

const NETEASE_API_BASE = process.env.NETEASE_API_URL || 'http://localhost:3001';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const keywords = searchParams.get('keywords');
    const limit = searchParams.get('limit') || '3';

    if (!keywords) {
      return Response.json({ error: '请提供搜索关键词' }, { status: 400 });
    }

    const response = await fetch(
      `${NETEASE_API_BASE}/search?keywords=${encodeURIComponent(keywords)}&limit=${limit}`,
      { next: { revalidate: 300 } }
    );

    if (!response.ok) {
      return Response.json(getMockSearchResult(keywords));
    }

    const data = await response.json();
    const songs = data.result?.songs || [];

    const formattedSongs = songs.slice(0, Number(limit)).map((song: Record<string, unknown>) => {
      const album = song.album as Record<string, unknown> | undefined;
      return {
        id: song.id as number,
        name: (song.name as string) || '未知歌曲',
        artist: Array.isArray(song.artists)
          ? (song.artists as Array<{ name: string }>).map((a) => a.name).join(' / ')
          : (song.artists as string) || '未知歌手',
        coverUrl: (album?.picUrl as string) || '/music-placeholder.png',
        previewUrl: `/api/music/detail?id=${song.id}`,
      };
    });

    return Response.json({ songs: formattedSongs });
  } catch (error) {
    console.error('Music search error:', error);
    const keywords = new URL(request.url).searchParams.get('keywords') || '';
    return Response.json(getMockSearchResult(keywords));
  }
}

function getMockSearchResult(keywords: string) {
  const mockSongs = [
    {
      id: 1,
      name: '夜的钢琴曲',
      artist: '石进',
      coverUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=piano%20keys%20in%20moonlight%20dark%20moody&image_size=square',
      previewUrl: '',
    },
    {
      id: 2,
      name: '安静',
      artist: '周杰伦',
      coverUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=rainy%20window%20melancholy%20dark&image_size=square',
      previewUrl: '',
    },
    {
      id: 3,
      name: 'River Flows in You',
      artist: 'Yiruma',
      coverUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=gentle%20river%20piano%20peaceful&image_size=square',
      previewUrl: '',
    },
  ];

  // 根据关键词返回不同的模拟歌曲
  if (keywords.includes('快') || keywords.includes('Pop') || keywords.includes('欢快')) {
    return {
      songs: [
        { id: 4, name: '好日子', artist: '宋祖英', coverUrl: mockSongs[0].coverUrl, previewUrl: '' },
        { id: 5, name: '小幸运', artist: '田馥甄', coverUrl: mockSongs[1].coverUrl, previewUrl: '' },
        { id: 6, name: '晴天', artist: '周杰伦', coverUrl: mockSongs[2].coverUrl, previewUrl: '' },
      ],
    };
  }

  return { songs: mockSongs };
}
