import type { AnalyzeRequest, AnalyzeResponse } from '@/types';

export async function analyzeText(text: string): Promise<AnalyzeResponse> {
  const response = await fetch('/api/ai/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text } as AnalyzeRequest),
  });

  if (!response.ok) {
    throw new Error('情绪分析失败');
  }

  return response.json();
}
