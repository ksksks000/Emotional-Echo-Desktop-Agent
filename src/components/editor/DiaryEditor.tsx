'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { useEffect, useCallback } from 'react';
import { MusicCard } from '@/extensions/music-card';
import FindBGMButton from './FindBGMButton';
import { useUIStore } from '@/stores/ui-store';

interface DiaryEditorProps {
  content: string;
  onUpdate: (content: string) => void;
}

export default function DiaryEditor({ content, onUpdate }: DiaryEditorProps) {
  const { openRecommend } = useUIStore();

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Placeholder.configure({
        placeholder: '写下此刻的心情...',
      }),
      MusicCard,
    ],
    content: content ? JSON.parse(content) : '',
    onUpdate: ({ editor }) => {
      onUpdate(JSON.stringify(editor.getJSON()));
    },
    editorProps: {
      attributes: {
        class: 'focus:outline-none',
      },
    },
  });

  useEffect(() => {
    if (editor && content) {
      const currentContent = JSON.stringify(editor.getJSON());
      if (currentContent !== content) {
        editor.commands.setContent(JSON.parse(content));
      }
    }
  }, [content, editor]);

  const handleFindBGM = useCallback(() => {
    if (!editor) return;
    const { from } = editor.state.selection;
    const $pos = editor.state.doc.resolve(from);
    const parent = $pos.parent;
    const text = parent.textContent || '';

    if (text.trim()) {
      // 传入 onInsert 回调，让推荐弹窗选中歌曲后能插入音乐卡片
      const onInsert = (song: import('@/types').Song) => {
        editor.chain().focus().insertMusicCard({
          songId: song.id,
          songName: song.name,
          artist: song.artist,
          coverUrl: song.coverUrl,
          previewUrl: song.previewUrl,
        }).run();
      };
      openRecommend(text.trim(), undefined, onInsert);
    }
  }, [editor, openRecommend]);

  if (!editor) return null;

  return (
    <div className="relative">
      {/* 编辑器工具栏 */}
      <div className="flex items-center gap-1 mb-6 pb-3 border-b border-border/30">
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
            editor.isActive('heading', { level: 1 })
              ? 'bg-accent/20 text-accent'
              : 'text-muted-foreground hover:text-foreground hover:bg-card'
          }`}
        >
          H1
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
            editor.isActive('heading', { level: 2 })
              ? 'bg-accent/20 text-accent'
              : 'text-muted-foreground hover:text-foreground hover:bg-card'
          }`}
        >
          H2
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
            editor.isActive('heading', { level: 3 })
              ? 'bg-accent/20 text-accent'
              : 'text-muted-foreground hover:text-foreground hover:bg-card'
          }`}
        >
          H3
        </button>
        <div className="w-px h-4 bg-border/50 mx-1" />
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
            editor.isActive('bold')
              ? 'bg-accent/20 text-accent'
              : 'text-muted-foreground hover:text-foreground hover:bg-card'
          }`}
        >
          B
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`px-2.5 py-1 rounded-md text-xs font-medium italic transition-colors ${
            editor.isActive('italic')
              ? 'bg-accent/20 text-accent'
              : 'text-muted-foreground hover:text-foreground hover:bg-card'
          }`}
        >
          I
        </button>
        <button
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
            editor.isActive('blockquote')
              ? 'bg-accent/20 text-accent'
              : 'text-muted-foreground hover:text-foreground hover:bg-card'
          }`}
        >
          &ldquo;
        </button>
        <div className="w-px h-4 bg-border/50 mx-1" />
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
            editor.isActive('bulletList')
              ? 'bg-accent/20 text-accent'
              : 'text-muted-foreground hover:text-foreground hover:bg-card'
          }`}
        >
          ul
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
            editor.isActive('orderedList')
              ? 'bg-accent/20 text-accent'
              : 'text-muted-foreground hover:text-foreground hover:bg-card'
          }`}
        >
          ol
        </button>

        <div className="flex-1" />

        {/* 寻找 BGM 按钮 */}
        <button
          onClick={handleFindBGM}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-accent/10 text-accent hover:bg-accent/20 border border-accent/20 transition-all duration-200"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
          寻找 BGM
        </button>
      </div>

      {/* 编辑区域 */}
      <EditorContent editor={editor} />
    </div>
  );
}
