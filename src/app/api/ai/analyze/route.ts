import { NextRequest } from 'next/server';
import { EMOTION_ANALYSIS_PROMPT } from '@/lib/prompt';

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();

    if (!text || typeof text !== 'string') {
      return Response.json({ error: '请提供有效的文本内容' }, { status: 400 });
    }

    const apiKey = process.env.AI_API_KEY;
    const apiUrl = process.env.AI_API_URL || 'https://api.openai.com/v1/chat/completions';
    const model = process.env.AI_MODEL || 'gpt-4o-mini';

    if (!apiKey) {
      // 没有配置 API Key 时返回模拟数据
      return Response.json(getMockResponse(text));
    }

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: EMOTION_ANALYSIS_PROMPT },
          { role: 'user', content: text },
        ],
        temperature: 0.7,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', errorText);
      return Response.json(getMockResponse(text));
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';

    try {
      // 尝试直接解析 JSON
      const parsed = JSON.parse(content);
      return Response.json({
        emotion: parsed.emotion || '平静',
        scene: parsed.scene || '日常',
        music_tags: parsed.music_tags || ['轻音乐', '钢琴', '慢节奏'],
      });
    } catch {
      // 如果返回的内容包含 ```json 包裹，尝试提取
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[1]);
        return Response.json({
          emotion: parsed.emotion || '平静',
          scene: parsed.scene || '日常',
          music_tags: parsed.music_tags || ['轻音乐', '钢琴', '慢节奏'],
        });
      }
      return Response.json(getMockResponse(text));
    }
  } catch (error) {
    console.error('Analyze error:', error);
    return Response.json({ error: '情绪分析失败' }, { status: 500 });
  }
}

function getMockResponse(text: string) {
  // 简单的关键词匹配模拟
  const keywords: Record<string, { emotion: string; scene: string; music_tags: string[] }> = {
    '孤独|一个人|寂寞|落寞': {
      emotion: '孤独',
      scene: '深夜独处',
      music_tags: ['Lo-fi', '钢琴', '慢节奏', '纯音乐'],
    },
    '开心|快乐|高兴|兴奋|喜悦': {
      emotion: '欢快',
      scene: '午后阳光',
      music_tags: ['Pop', '吉他', '轻快', '女声'],
    },
    '忧伤|难过|伤心|失落|哭': {
      emotion: '忧伤',
      scene: '雨后漫步',
      music_tags: ['民谣', '吉他', '慢节奏', '男声'],
    },
    '思念|想念|回忆|怀念|曾经': {
      emotion: '思念',
      scene: '海边黄昏',
      music_tags: ['R&B', '钢琴', '慢节奏', '女声'],
    },
    '平静|安静|放松|惬意|舒适': {
      emotion: '平静',
      scene: '清晨微风',
      music_tags: ['古典', '弦乐', '慢节奏', '纯音乐'],
    },
    '焦虑|烦躁|紧张|不安|焦躁': {
      emotion: '焦躁',
      scene: '深夜城市',
      music_tags: ['电子', '合成器', '快节奏', '纯音乐'],
    },
    '希望|期待|向往|憧憬': {
      emotion: '希望',
      scene: '清晨微风',
      music_tags: ['民谣', '吉他', '轻快', '男声'],
    },
    '感动|温暖|感谢|感恩': {
      emotion: '感动',
      scene: '午后阳光',
      music_tags: ['爵士', '萨克斯', '慢节奏', '纯音乐'],
    },
  };

  for (const [pattern, result] of Object.entries(keywords)) {
    const regex = new RegExp(pattern);
    if (regex.test(text)) {
      return result;
    }
  }

  return {
    emotion: '平静',
    scene: '日常',
    music_tags: ['轻音乐', '钢琴', '慢节奏'],
  };
}
