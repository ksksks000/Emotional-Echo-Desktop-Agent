'use client';

import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer, type NodeViewProps } from '@tiptap/react';
import MusicCardBlock from '@/components/editor/MusicCardBlock';

export interface MusicCardOptions {
  HTMLAttributes: Record<string, string>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    musicCard: {
      insertMusicCard: (attrs: {
        songId: number;
        songName: string;
        artist: string;
        coverUrl: string;
        previewUrl: string;
      }) => ReturnType;
    };
  }
}

export const MusicCard = Node.create<MusicCardOptions>({
  name: 'musicCard',
  group: 'block',
  atom: true,
  draggable: true,

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  addAttributes() {
    return {
      songId: { default: null },
      songName: { default: '' },
      artist: { default: '' },
      coverUrl: { default: '' },
      previewUrl: { default: '' },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="music-card"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        'data-type': 'music-card',
      }),
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(MusicCardBlock);
  },

  addCommands() {
    return {
      insertMusicCard:
        (attrs) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs,
          });
        },
    };
  },
});
