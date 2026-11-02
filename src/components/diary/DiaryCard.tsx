'use client';

import Link from 'next/link';
import { Calendar, Music, Trash2 } from 'lucide-react';
import { formatDate, truncateText } from '@/lib/utils';
import { deleteDiary } from '@/lib/db';
import type { Diary } from '@/types';

interface DiaryCardProps {
  diary: Diary;
  onDelete: () => void;
}

export default function DiaryCard({ diary, onDelete }: DiaryCardProps) {
  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm('确定要删除这篇日记吗？')) {
      await deleteDiary(diary.id);
      onDelete();
    }
  };

  // 从内容中提取纯文本作为预览
  const getPreviewText = (): string => {
    try {
      const content = JSON.parse(diary.content);
      return extractTextFromTiptapJSON(content);
    } catch {
      return diary.content || '';
    }
  };

  return (
    <Link href={`/diary/${diary.id}`} className="block group">
      <div className="relative p-5 rounded-xl bg-card border border-border/30 hover:border-accent/30 transition-all duration-300 group-hover:glow-accent">
        {/* 左侧装饰线 */}
        <div className="absolute left-0 top-3 bottom-3 w-0.5 bg-accent/30 rounded-full group-hover:bg-accent/60 transition-colors" />

        <div className="pl-3">
          {/* 标题 */}
          <h3 className="text-base font-semibold text-foreground font-serif mb-1.5 group-hover:text-accent transition-colors">
            {diary.title || '无标题'}
          </h3>

          {/* 预览文本 */}
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
            {truncateText(getPreviewText(), 80)}
          </p>

          {/* 底部信息 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* 日期 */}
              <span className="flex items-center gap-1 text-xs text-muted">
                <Calendar className="w-3 h-3" />
                {formatDate(diary.updatedAt)}
              </span>

              {/* 情绪标签 */}
              {diary.emotion && (
                <span className="px-2 py-0.5 rounded-full bg-lavender/10 text-lavender text-xs font-medium">
                  {diary.emotion}
                </span>
              )}
            </div>

            {/* 删除按钮 */}
            <button
              onClick={handleDelete}
              className="p-1.5 rounded-lg text-muted hover:text-destructive hover:bg-destructive/10 transition-all opacity-0 group-hover:opacity-100"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}

// 从 Tiptap JSON 中提取纯文本
function extractTextFromTiptapJSON(doc: Record<string, unknown>): string {
  let text = '';
  if (doc.type === 'text' && typeof doc.text === 'string') {
    return doc.text;
  }
  if (Array.isArray(doc.content)) {
    for (const node of doc.content) {
      text += extractTextFromTiptapJSON(node as Record<string, unknown>);
    }
  }
  return text;
}
