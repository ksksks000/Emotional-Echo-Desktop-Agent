'use client';

import { useState, useCallback } from 'react';
import { exportAllData, importData } from '@/lib/db';

// 检测浏览器是否支持 File System Access API
function isFileSystemAccessSupported(): boolean {
  return typeof window !== 'undefined' && 'showSaveFilePicker' in window;
}

// 导出备份
async function exportWithFSA() {
  const jsonData = await exportAllData();

  const handle = await (window as unknown as { showSaveFilePicker: (options: unknown) => Promise<FileSystemFileHandle> }).showSaveFilePicker({
    suggestedName: `moodsync-backup-${new Date().toISOString().slice(0, 10)}.json`,
    types: [
      {
        description: 'JSON 备份文件',
        accept: { 'application/json': ['.json'] },
      },
    ],
  });

  const writable = await handle.createWritable();
  await writable.write(jsonData);
  await writable.close();
}

async function exportWithDownload() {
  const jsonData = await exportAllData();
  const blob = new Blob([jsonData], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `moodsync-backup-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// 导入恢复
async function importWithFSA() {
  const [handle] = await (window as unknown as { showOpenFilePicker: (options: unknown) => Promise<FileSystemFileHandle[]> }).showOpenFilePicker({
    types: [
      {
        description: 'JSON 备份文件',
        accept: { 'application/json': ['.json'] },
      },
    ],
    multiple: false,
  });

  const file = await handle.getFile();
  const text = await file.text();
  await importData(text);
}

async function importWithUpload() {
  return new Promise<void>((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';

    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) {
        reject(new Error('未选择文件'));
        return;
      }
      try {
        const text = await file.text();
        await importData(text);
        resolve();
      } catch (err) {
        reject(err);
      }
    };

    input.click();
  });
}

// Hook: 备份与恢复
export function useBackup() {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const exportBackup = useCallback(async () => {
    setIsExporting(true);
    try {
      if (isFileSystemAccessSupported()) {
        await exportWithFSA();
      } else {
        await exportWithDownload();
      }
    } catch (err: unknown) {
      // 用户取消选择器不视为错误
      if (err instanceof Error && err.name !== 'AbortError') {
        alert('导出失败: ' + err.message);
      }
    } finally {
      setIsExporting(false);
    }
  }, []);

  const importBackup = useCallback(async () => {
    setIsImporting(true);
    try {
      if (isFileSystemAccessSupported()) {
        await importWithFSA();
      } else {
        await importWithUpload();
      }
      alert('数据恢复成功！');
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== 'AbortError') {
        alert('导入失败: ' + err.message);
      }
    } finally {
      setIsImporting(false);
    }
  }, []);

  return { exportBackup, importBackup, isExporting, isImporting };
}
