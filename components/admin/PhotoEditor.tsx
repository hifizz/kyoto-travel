'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { PhotoManagementItem, PhotoContentConfig } from '@/types';

interface PhotoEditorProps {
  selectedItem: PhotoManagementItem | null;
  onSave: (filename: string, config: PhotoContentConfig) => Promise<boolean>;
  onUnsavedChange: (hasChanges: boolean) => void;
}

// 常用地点建议
const LOCATION_SUGGESTIONS = [
  '贵船神社',
  '清水寺',
  '永观堂',
  '南禅寺',
  '天授庵',
  '三千院',
];

export default function PhotoEditor({ selectedItem, onSave, onUnsavedChange }: PhotoEditorProps) {
  const [formData, setFormData] = useState<PhotoContentConfig>({
    description: '',
    location: ''
  });
  const [originalData, setOriginalData] = useState<PhotoContentConfig>({
    description: '',
    location: ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // 当选中项改变时，更新表单数据
  useEffect(() => {
    if (selectedItem) {
      const config = selectedItem.config || {
        description: '',
        location: ''
      };
      setFormData(config);
      setOriginalData(config);
      setSaveMessage(null);
    } else {
      setFormData({ description: '', location: '' });
      setOriginalData({ description: '', location: '' });
    }
  }, [selectedItem]);

  // 检测是否有未保存的更改
  useEffect(() => {
    const hasChanges = selectedItem && (
      formData.description !== originalData.description ||
      formData.location !== originalData.location
    );
    onUnsavedChange(!!hasChanges);
  }, [formData, originalData, selectedItem]);

  // 更新表单字段
  const updateField = (field: keyof PhotoContentConfig, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setSaveMessage(null);
  };

  // 保存配置
  const handleSave = async () => {
    if (!selectedItem) return;

    setIsSaving(true);
    setSaveMessage(null);

    try {
      const success = await onSave(selectedItem.filename, formData);
      if (success) {
        setOriginalData(formData);
        setSaveMessage({ type: 'success', text: '保存成功！' });

        // 3秒后清除成功消息
        setTimeout(() => setSaveMessage(null), 3000);
      } else {
        setSaveMessage({ type: 'error', text: '保存失败，请重试' });
      }
    } catch (error) {
      setSaveMessage({ type: 'error', text: '保存失败：' + (error instanceof Error ? error.message : '未知错误') });
    } finally {
      setIsSaving(false);
    }
  };

  // 重置表单
  const handleReset = () => {
    setFormData(originalData);
    setSaveMessage(null);
  };

  if (!selectedItem) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            <p className="text-lg mb-2">🖼️</p>
            <p>请选择一张图片开始编辑</p>
            <p className="text-sm mt-2">
              在左侧网格中点击任意图片即可开始编辑其信息
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const hasUnsavedChanges =
    formData.description !== originalData.description ||
    formData.location !== originalData.location;

  // 生成显示标题（基于文件名）
  const displayTitle = selectedItem.filename.replace(/\.[^/.]+$/, '');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>编辑图片信息</span>
          <Badge variant={selectedItem.configured ? "default" : "secondary"}>
            {selectedItem.configured ? "已配置" : "未配置"}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 图片预览 */}
        <div className="bg-muted rounded-lg overflow-hidden flex items-center justify-center" style={{ height: '60vh', maxHeight: '600px', minHeight: '300px' }}>
          <img
            src={`/images/${selectedItem.filename}`}
            alt={displayTitle}
            className="max-w-full max-h-full object-contain"
          />
        </div>

        {/* 文件信息 */}
        <div className="text-sm text-muted-foreground">
          <p>文件名: {selectedItem.filename}</p>
          <p>标题: {displayTitle}</p>
        </div>

        {/* 编辑表单 */}
        <div className="space-y-4">
          {/* 地点字段 */}
          <div className="space-y-2">
            <Label htmlFor="location">地点</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => updateField('location', e.target.value)}
              placeholder="输入拍摄地点..."
              className="w-full"
              list="location-suggestions"
            />
            <datalist id="location-suggestions">
              {LOCATION_SUGGESTIONS.map(location => (
                <option key={location} value={location} />
              ))}
            </datalist>
            <div className="flex flex-wrap gap-1 mt-2">
              {LOCATION_SUGGESTIONS.slice(0, 6).map(location => (
                <Button
                  key={location}
                  variant="outline"
                  size="sm"
                  className="text-xs h-6"
                  onClick={() => updateField('location', location)}
                >
                  {location}
                </Button>
              ))}
            </div>
          </div>

          {/* 描述字段 */}
          <div className="space-y-2">
            <Label htmlFor="description">描述</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => updateField('description', e.target.value)}
              placeholder="输入图片描述（可选）..."
              className="w-full min-h-24 resize-none"
            />
            <p className="text-xs text-muted-foreground">
              {formData.description.length} 字符
            </p>
          </div>
        </div>

        {/* 保存消息 */}
        {saveMessage && (
          <Alert>
            <AlertDescription className={
              saveMessage.type === 'success' ? 'text-green-700' : 'text-red-700'
            }>
              {saveMessage.text}
            </AlertDescription>
          </Alert>
        )}

        {/* 操作按钮 */}
        <div className="flex gap-2">
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1"
          >
            {isSaving ? '保存中...' : '保存'}
          </Button>
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={isSaving || !hasUnsavedChanges}
          >
            重置
          </Button>
        </div>

        {/* 提示信息 */}
        {hasUnsavedChanges && (
          <p className="text-xs text-orange-600">
            ⚠️ 有未保存的更改
          </p>
        )}
      </CardContent>
    </Card>
  );
}
