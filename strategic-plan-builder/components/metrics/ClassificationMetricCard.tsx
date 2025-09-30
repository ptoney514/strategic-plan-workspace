'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Edit2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ClassificationCategory {
  label: string;
  value: number;
  color?: string;
}

interface ClassificationMetricCardProps {
  title: string;
  mainValue?: number | string;
  categories: ClassificationCategory[];
  description?: string;
  status: 'on-target' | 'near-target' | 'off-target' | 'at-risk';
  onEdit?: () => void;
  onDelete?: () => void;
  isEditable?: boolean;
}

export function ClassificationMetricCard({
  title,
  mainValue,
  categories,
  description,
  status,
  onEdit,
  onDelete,
  isEditable = false
}: ClassificationMetricCardProps) {
  const getStatusColor = () => {
    switch (status) {
      case 'on-target': return 'bg-green-100 text-green-800 border-green-200';
      case 'near-target': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'off-target': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'at-risk': return 'bg-red-100 text-red-800 border-red-200';
    }
  };

  const getStatusLabel = () => {
    switch (status) {
      case 'on-target': return 'On Target';
      case 'near-target': return 'Near Target';
      case 'off-target': return 'Off Target';
      case 'at-risk': return 'At Risk';
    }
  };

  const getCategoryColor = (index: number, customColor?: string) => {
    if (customColor) return customColor;
    const colors = [
      'bg-blue-500',
      'bg-green-500',
      'bg-yellow-500',
      'bg-red-500',
      'bg-purple-500',
      'bg-indigo-500'
    ];
    return colors[index % colors.length];
  };

  return (
    <Card className="relative bg-slate-800 text-white border-slate-700 p-6 hover:bg-slate-750 transition-colors">
      {/* Status Badge */}
      <div className="absolute top-4 right-4">
        <Badge className={cn('border', getStatusColor())}>
          {getStatusLabel()}
        </Badge>
      </div>

      {/* Edit/Delete Buttons */}
      {isEditable && (
        <div className="absolute bottom-4 right-4 flex gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={onEdit}
            className="h-8 w-8 p-0 text-gray-400 hover:text-white"
          >
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={onDelete}
            className="h-8 w-8 p-0 text-gray-400 hover:text-red-400"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Content */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-300">{title}</h3>
        
        {/* Main Value Display if provided */}
        {mainValue !== undefined && (
          <div className="text-5xl font-bold">{mainValue}</div>
        )}

        {/* Categories Display */}
        <div className="space-y-3">
          {categories.map((category, index) => (
            <div key={index} className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">{category.label}</span>
                <span className="text-sm font-semibold">{category.value}%</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div 
                  className={cn(
                    "h-2 rounded-full transition-all",
                    getCategoryColor(index, category.color)
                  )}
                  style={{ width: `${category.value}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Description */}
        {description && (
          <p className="text-xs text-gray-500 leading-relaxed pt-2">
            {description}
          </p>
        )}
      </div>
    </Card>
  );
}