'use client';

import { useState, useMemo, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import type { PhotoManagementItem } from '@/types';

interface PhotoGridProps {
  items: PhotoManagementItem[];
  selectedItem: PhotoManagementItem | null;
  onItemSelect: (item: PhotoManagementItem) => void;
}

export default function PhotoGrid({ items, selectedItem, onItemSelect }: PhotoGridProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'configured' | 'unconfigured'>('all');

  // 使用useMemo缓存过滤结果，避免重复计算
  const filteredItems = useMemo(() => {
    return items.filter(item => {
            // 搜索过滤
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = searchTerm === '' ||
        item.filename.toLowerCase().includes(searchLower) ||
        (item.config?.location && item.config.location.toLowerCase().includes(searchLower));

      // 状态过滤
      const matchesFilter =
        filter === 'all' ||
        (filter === 'configured' && item.configured) ||
        (filter === 'unconfigured' && !item.configured);

      return matchesSearch && matchesFilter;
    });
  }, [items, searchTerm, filter]);

  // 使用useCallback缓存事件处理函数
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  }, []);

  const handleFilterChange = useCallback((newFilter: string) => {
    setFilter(newFilter as 'all' | 'configured' | 'unconfigured');
  }, []);

  return (
    <Card>
      <CardContent className="p-4">
        {/* 搜索和过滤栏 */}
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="flex-1">
            <Input
              placeholder="搜索文件名或地点..."
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleFilterChange('all')}
            >
              全部
            </Button>
            <Button
              variant={filter === 'configured' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleFilterChange('configured')}
            >
              已配置
            </Button>
            <Button
              variant={filter === 'unconfigured' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleFilterChange('unconfigured')}
            >
              未配置
            </Button>
          </div>
        </div>

        {/* 结果统计 */}
        <div className="mb-4 text-sm text-muted-foreground">
          显示 {filteredItems.length} / {items.length} 张图片
        </div>

        {/* 图片网格 */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-[600px] overflow-y-auto">
          {filteredItems.map((item) => (
            <div
              key={item.filename}
              className={`
                relative group cursor-pointer border-2 rounded-lg overflow-hidden
                transition-all duration-200 hover:shadow-lg
                ${selectedItem?.filename === item.filename
                  ? 'border-primary ring-2 ring-primary/20'
                  : 'border-border hover:border-primary/50'
                }
              `}
              onClick={() => onItemSelect(item)}
            >
              {/* 图片缩略图 */}
              <div className="aspect-square bg-muted relative">
                <img
                  src={`/images/${item.filename}`}
                  alt={item.filename}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />

                {/* 配置状态徽章 */}
                <div className="absolute top-2 right-2">
                  <Badge
                    variant={item.configured ? "default" : "secondary"}
                    className="text-xs"
                  >
                    {item.configured ? "已配置" : "未配置"}
                  </Badge>
                </div>

                {/* 悬停覆盖层 */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                  <div className="text-white text-center p-2">
                    <p className="text-sm font-medium truncate">
                      {item.filename.replace(/\.[^/.]+$/, '')}
                    </p>
                    {item.config?.location && (
                      <p className="text-xs text-white/80 mt-1">
                        📍 {item.config.location}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* 图片信息 */}
              <div className="p-2 bg-card">
                <p className="text-xs font-medium truncate" title={item.filename}>
                  {item.filename}
                </p>
                {item.config?.location && (
                  <p className="text-xs text-muted-foreground truncate mt-1">
                    📍 {item.config.location}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* 空状态 */}
        {filteredItems.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <p>没有找到匹配的图片</p>
            {searchTerm || filter !== 'all' ? (
              <p className="text-sm mt-2">
                尝试调整搜索条件或过滤设置
              </p>
            ) : null}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
