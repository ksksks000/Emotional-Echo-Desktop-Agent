'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { getDiary, updateDiary } from '@/lib/db';
import { analyzeText } from '@/services/ai-service';
import DiaryEditor from '@/components/editor/DiaryEditor';
import RecommendModal from '@/components/recommend/RecommendModal';
import MiniPlayer from '@/components/player/MiniPlayer';
import { useUIStore } from '@/stores/ui-store';
import type { Diary } from '@/types';

export default function DiaryPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [diary, setDiary] = useState<Diary | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editorKey, setEditorKey] = useState(0);

  useEffect(() => {
    loadDiary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadDiary = async () => {
    const data = await getDiary(id);
    if (!data) {
      router.push('/');
      return;
    }
    setDiary(data);
    setEditorKey((k) => k + 1);
    setLoading(false);
  };

  const handleUpdate = useCallback(
    async (content: string) => {
      if (!diary) return;
      setSaving(true);
      try {
        await updateDiary(id, { content });
        setDiary({ ...diary, content, updatedAt: new Date().toISOString() });
      } finally {
        setSaving(false);
      }
    },
    [diary, id]
  );

  const handleTitleChange = async (title: string) => {
    if (!diary) return;
    await updateDiary(id, { title });
    setDiary({ ...diary, title });
  };

  // 自动检测情绪标签（在日记首次插入音乐卡片时触发）
  useEffect(() => {
    if (diary && !diary.emotion && diary.content) {
      const textContent = extractTextFromContent(diary.content);
      if (textContent.length > 10) {
        analyzeText(textContent).then((result) => {
          updateDiary(id, { emotion: result.emotion });
          setDiary((prev) => prev ? { ...prev, emotion: result.emotion } : prev);
        }).catch(() => {});
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [diary?.content, diary?.emotion, id]);

  if (loading) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <div className="text-muted-foreground text-sm">加载中...</div>
      </div>
    );
  }

  if (!diary) return null;

  return (
    <div className="min-h-dvh flex flex-col">
      {/* 顶部导航 */}
      <header className="sticky top-0 z-20 glass">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/')}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-card transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            {/* 标题输入 */}
            <input
              type="text"
              value={diary.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="日记标题"
              className="flex-1 bg-transparent text-lg font-serif font-semibold text-foreground placeholder:text-muted focus:outline-none"
            />

            {/* 情绪标签 */}
            {diary.emotion && (
              <span className="px-2.5 py-1 rounded-full bg-lavender/10 text-lavender text-xs font-medium animate-bounce-in">
                {diary.emotion}
              </span>
            )}

            {/* 保存指示 */}
            {saving && (
              <span className="text-xs text-muted">保存中...</span>
            )}
          </div>
        </div>
      </header>

      {/* 编辑区域 */}
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-6">
        <DiaryEditor
          key={editorKey}
          content={diary.content}
          onUpdate={handleUpdate}
        />
      </main>

      {/* 推荐弹窗 */}
      <RecommendModal />

      {/* 全局播放器 */}
      <MiniPlayer />
    </div>
  );
}

// 从 Tiptap JSON 内容中提取纯文本
function extractTextFromContent(content: string): string {
  try {
    const doc = JSON.parse(content);
    return extractText(doc);
  } catch {
    return content;
  }
}

function extractText(node: Record<string, unknown>): string {
  let text = '';
  if (node.type === 'text' && typeof node.text === 'string') {
    return node.text;
  }
  if (Array.isArray(node.content)) {
    for (const child of node.content) {
      text += extractText(child as Record<string, unknown>);
    }
  }
  return text;
}
