import React from 'react';

interface ExifItemProps {
  label: string;
  value?: string | number;
  renderValue?: () => React.ReactNode;
  className?: string;
}

/**
 * ExifItem组件 - 用于展示EXIF信息的单个项目
 *
 * 遵循SOLID原则：
 * - 单一职责：只负责渲染一个EXIF信息项
 * - 开放封闭：通过renderValue支持扩展，无需修改组件
 * - 里氏替换：可以替换任何EXIF信息项的渲染
 * - 接口隔离：只暴露必要的props
 * - 依赖倒置：依赖抽象的renderValue函数而非具体实现
 */
const ExifItem: React.FC<ExifItemProps> = ({
  label,
  value,
  renderValue,
  className = '',
}) => {
  const renderValueContent = () => {
    if (renderValue) {
      return renderValue();
    }

    return (
      <span className="text-stone-600 dark:text-stone-300">
        {value || '—'}
      </span>
    );
  };

  return (
    <div className={`flex justify-between items-center ${className}`}>
      <span className="text-stone-500 dark:text-stone-400">
        {label}
      </span>
      {renderValueContent()}
    </div>
  );
};

export default ExifItem;
