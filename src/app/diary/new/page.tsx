'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { generateId } from '@/lib/utils';
import { createDiary } from '@/lib/db';

export default function NewDiaryPage() {
  const router = useRouter();

  useEffect(() => {
    const createAndRedirect = async () => {
      const id = generateId();
      const now = new Date().toISOString();

      await createDiary({
        id,
        title: '',
        content: '',
        createdAt: now,
        updatedAt: now,
      });

      router.replace(`/diary/${id}`);
    };

    createAndRedirect();
  }, [router]);

  return (
    <div className="min-h-dvh flex items-center justify-center">
      <div className="text-muted-foreground text-sm">创建日记中...</div>
    </div>
  );
}
