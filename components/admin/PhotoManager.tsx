'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import PhotoGrid from './PhotoGrid';
import PhotoEditor from './PhotoEditor';
import type { PhotoManagementItem, PhotoContentConfig } from '@/types';

interface PhotoManagerState {
  items: PhotoManagementItem[];
  selectedItem: PhotoManagementItem | null;
  isLoading: boolean;
  error: string | null;
  hasUnsavedChanges: boolean;
}

export default function PhotoManager() {
  const [state, setState] = useState<PhotoManagerState>({
    items: [],
    selectedItem: null,
    isLoading: true,
    error: null,
    hasUnsavedChanges: false
  });

  // 加载图片数据
  const loadPhotos = async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const response = await fetch('/api/admin/photos');
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || '加载失败');
      }

      setState(prev => ({
        ...prev,
        items: result.data.items,
        isLoading: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : '未知错误',
        isLoading: false
      }));
    }
  };

  // 保存单个配置
  const saveConfig = async (filename: string, config: PhotoContentConfig) => {
    try {
      const response = await fetch('/api/admin/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename, config })
      });

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || '保存失败');
      }

      // 更新本地状态
      setState(prev => ({
        ...prev,
        items: prev.items.map(item =>
          item.filename === filename
            ? { ...item, configured: true, config }
            : item
        ),
        selectedItem: prev.selectedItem?.filename === filename
          ? { ...prev.selectedItem, configured: true, config }
          : prev.selectedItem,
        hasUnsavedChanges: false
      }));

      return true;
    } catch (error) {
      console.error('保存失败:', error);
      return false;
    }
  };

  // 批量导入未配置的图片
  const batchImportUnconfigured = async () => {
    const unconfiguredItems = state.items.filter(item => !item.configured);

    if (unconfiguredItems.length === 0) {
      alert('没有未配置的图片');
      return;
    }

    const confirm = window.confirm(
      `将为 ${unconfiguredItems.length} 张未配置的图片创建默认配置，是否继续？`
    );

    if (!confirm) return;

    try {
      const configs: Record<string, PhotoContentConfig> = {};

      // 读取现有配置
      state.items.forEach(item => {
        if (item.configured && item.config) {
          configs[item.filename] = item.config;
        }
      });

      // 为未配置的图片添加默认配置
      unconfiguredItems.forEach(item => {
        configs[item.filename] = {
          description: '',
          location: '京都'
        };
      });

      const response = await fetch('/api/admin/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ configs })
      });

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || '批量导入失败');
      }

      // 重新加载数据
      await loadPhotos();
      alert('批量导入成功！');
    } catch (error) {
      alert(`批量导入失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  };

  useEffect(() => {
    loadPhotos();
  }, []);

  const configuredCount = state.items.filter(item => item.configured).length;
  const totalCount = state.items.length;

  if (state.isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">加载图片数据中...</p>
        </div>
      </div>
    );
  }

  if (state.error) {
    return (
      <Alert>
        <AlertDescription>
          加载失败: {state.error}
          <Button
            variant="outline"
            size="sm"
            className="ml-2"
            onClick={loadPhotos}
          >
            重试
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* 统计和操作栏 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>管理概览</span>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary">
                {configuredCount}/{totalCount} 已配置
              </Badge>
              {state.hasUnsavedChanges && (
                <Badge variant="destructive">有未保存更改</Badge>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">
                总计 {totalCount} 张图片，已配置 {configuredCount} 张
              </p>
              <div className="w-full bg-secondary rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all"
                  style={{ width: `${totalCount > 0 ? (configuredCount / totalCount) * 100 : 0}%` }}
                />
              </div>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={batchImportUnconfigured}
                disabled={state.items.filter(item => !item.configured).length === 0}
              >
                批量导入未配置图片
              </Button>
              <Button
                variant="outline"
                onClick={loadPhotos}
              >
                刷新
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 主要内容区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* 左侧：图片网格 (2/3 宽度) */}
        <div className="lg:col-span-2">
          <PhotoGrid
            items={state.items}
            selectedItem={state.selectedItem}
                        onItemSelect={(item: PhotoManagementItem) => setState(prev => ({ ...prev, selectedItem: item }))}
          />
        </div>

        {/* 右侧：编辑器 (1/3 宽度) */}
        <div>
          <PhotoEditor
            selectedItem={state.selectedItem}
            onSave={saveConfig}
            onUnsavedChange={(hasChanges: boolean) =>
              setState(prev => ({ ...prev, hasUnsavedChanges: hasChanges }))
            }
          />
        </div>
      </div>
    </div>
  );
}
