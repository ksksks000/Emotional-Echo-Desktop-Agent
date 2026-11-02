import Dexie, { type Table } from 'dexie';
import type { Diary, MusicCardData } from '@/types';

// 扩展 Diary 类型以支持音乐卡片提取
export interface DiaryWithMusic extends Diary {
  musicCards?: MusicCardData[];
}

class MoodSyncDB extends Dexie {
  diaries!: Table<Diary, string>;

  constructor() {
    super('moodsync');
    this.version(1).stores({
      diaries: 'id, createdAt, updatedAt, emotion',
    });
  }
}

export const db = new MoodSyncDB();

// 获取所有日记（按更新时间倒序）
export async function getAllDiaries(): Promise<Diary[]> {
  return db.diaries.orderBy('updatedAt').reverse().toArray();
}

// 获取单个日记
export async function getDiary(id: string): Promise<Diary | undefined> {
  return db.diaries.get(id);
}

// 创建日记
export async function createDiary(diary: Diary): Promise<void> {
  await db.diaries.add(diary);
}

// 更新日记
export async function updateDiary(id: string, changes: Partial<Diary>): Promise<void> {
  await db.diaries.update(id, { ...changes, updatedAt: new Date().toISOString() });
}

// 删除日记
export async function deleteDiary(id: string): Promise<void> {
  await db.diaries.delete(id);
}

// 导出所有数据为 JSON
export async function exportAllData(): Promise<string> {
  const diaries = await db.diaries.toArray();
  return JSON.stringify({ diaries, version: 1, exportedAt: new Date().toISOString() }, null, 2);
}

// 从 JSON 导入数据
export async function importData(jsonString: string): Promise<void> {
  const data = JSON.parse(jsonString);
  if (!data.diaries || !Array.isArray(data.diaries)) {
    throw new Error('无效的备份文件格式');
  }
  await db.diaries.bulkPut(data.diaries);
}
