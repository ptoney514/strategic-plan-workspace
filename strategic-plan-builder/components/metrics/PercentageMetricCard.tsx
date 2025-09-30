'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Edit2, Trash2, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PercentageMetricCardProps {
  title: string;
  value: number;
  target?: number;
  description: string;
  status: 'on-target' | 'near-target' | 'off-target' | 'at-risk';
  trend?: 'up' | 'down' | 'stable';
  suffix?: string;
  onEdit?: () => void;
  onDelete?: () => void;
  isEditable?: boolean;
}

export function PercentageMetricCard({
  title,
  value,
  target,
  description,
  status,
  trend,
  suffix = '% meeting expectations',
  onEdit,
  onDelete,
  isEditable = false
}: PercentageMetricCardProps) {
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

  const getTrendIcon = () => {
    if (!trend) return null;
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-red-600" />;
      case 'stable': return <Minus className="h-4 w-4 text-gray-600" />;
    }
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
        
        {/* Big Percentage Display */}
        <div className="flex items-baseline gap-3">
          <span className="text-5xl font-bold">{value}</span>
          {value !== Math.floor(value) && (
            <span className="text-3xl font-bold">.{Math.round((value % 1) * 100)}</span>
          )}
          <span className="text-2xl text-gray-400">%</span>
          {getTrendIcon()}
        </div>

        {/* Description */}
        <p className="text-sm text-gray-400">
          {suffix}
        </p>

        {target && (
          <p className="text-xs text-gray-500">
            Target: {target}%
          </p>
        )}

        {/* Visual Progress Arc or Bar */}
        <div className="relative pt-1">
          <div className="flex mb-2 items-center justify-between">
            <div className="text-xs text-gray-400">Progress</div>
            {target && (
              <div className="text-xs text-gray-400">
                {Math.round((value / target) * 100)}% of target
              </div>
            )}
          </div>
          <div className="overflow-hidden h-2 text-xs flex rounded bg-slate-700">
            <div 
              style={{ width: target ? `${Math.min(100, (value / target) * 100)}%` : `${value}%` }}
              className={cn(
                "shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center transition-all",
                status === 'on-target' ? 'bg-green-500' :
                status === 'near-target' ? 'bg-yellow-500' :
                status === 'off-target' ? 'bg-orange-500' :
                'bg-red-500'
              )}
            />
          </div>
        </div>
      </div>
    </Card>
  );
}