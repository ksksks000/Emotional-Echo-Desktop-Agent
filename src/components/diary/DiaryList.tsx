'use client';

import { useEffect, useState } from 'react';
import { Plus, Search, Download, Upload } from 'lucide-react';
import Link from 'next/link';
import { getAllDiaries } from '@/lib/db';
import { useBackup } from '@/services/backup-service';
import DiaryCard from './DiaryCard';
import type { Diary } from '@/types';

export default function DiaryList() {
  const [diaries, setDiaries] = useState<Diary[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const { exportBackup, importBackup, isExporting, isImporting } = useBackup();

  const loadDiaries = async () => {
    const list = await getAllDiaries();
    setDiaries(list);
  };

  useEffect(() => {
    loadDiaries();
  }, []);

  const filteredDiaries = diaries.filter((d) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      d.title?.toLowerCase().includes(q) ||
      d.emotion?.toLowerCase().includes(q)
    );
  });

  const handleImport = async () => {
    await importBackup();
    await loadDiaries();
  };

  return (
    <div className="min-h-dvh flex flex-col">
      {/* 顶部导航栏 */}
      <header className="sticky top-0 z-20 glass">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-serif font-semibold text-accent">MoodSync</h1>
            <div className="flex items-center gap-2">
              <button
                onClick={exportBackup}
                disabled={isExporting}
                className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-card transition-all"
                title="导出备份"
              >
                <Download className="w-4 h-4" />
              </button>
              <button
                onClick={handleImport}
                disabled={isImporting}
                className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-card transition-all"
                title="导入恢复"
              >
                <Upload className="w-4 h-4" />
              </button>
              <Link
                href="/diary/new"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-accent text-accent-foreground text-sm font-medium hover:opacity-90 transition-all glow-accent"
              >
                <Plus className="w-4 h-4" />
                写日记
              </Link>
            </div>
          </div>

          {/* 搜索框 */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              type="text"
              placeholder="搜索日记..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-card border border-border/30 text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-accent/40 transition-colors"
            />
          </div>
        </div>
      </header>

      {/* 日记列表 */}
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-4">
        {filteredDiaries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-card flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-muted"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/><line x1="10" x2="8" y1="9" y2="9"/></svg>
            </div>
            <p className="text-muted-foreground text-sm mb-1">
              {searchQuery ? '没有找到匹配的日记' : '还没有日记'}
            </p>
            <p className="text-muted text-xs">
              {searchQuery ? '试试其他关键词' : '点击右上角「写日记」开始记录'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredDiaries.map((diary) => (
              <DiaryCard key={diary.id} diary={diary} onDelete={loadDiaries} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
