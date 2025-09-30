'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, Minus, Edit, Trash2, GripVertical } from 'lucide-react';
import { Metric, calculateMetricStatus, getMetricStatusConfig } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface MetricCardCompactProps {
  metric: Metric;
  onEdit: () => void;
  onDelete: () => void;
  isDragging?: boolean;
  dragHandle?: React.ReactNode;
}

export function MetricCardCompact({ 
  metric, 
  onEdit, 
  onDelete,
  isDragging 
}: MetricCardCompactProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging
  } = useSortable({ id: metric.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const status = calculateMetricStatus(metric);
  const statusConfig = getMetricStatusConfig(status);
  
  // Calculate percentage for percentage metrics
  const isPercentage = metric.metric_type === 'percent' || metric.visualization_type === 'percentage';
  const currentValue = metric.current_value || 0;
  const targetValue = metric.target_value || 100;
  const percentage = isPercentage ? currentValue : (currentValue / targetValue) * 100;
  
  // Determine trend
  const showTrend = metric.visualization_config?.showTrend !== false;
  const trend = currentValue > (metric.baseline_value || 0) ? 'up' : 
                currentValue < (metric.baseline_value || 0) ? 'down' : 'neutral';

  return (
    <div 
      ref={setNodeRef} 
      style={style}
      className={cn(
        "relative group",
        isSortableDragging && "opacity-50 z-50"
      )}
    >
      <Card className={cn(
        "h-32 transition-all flex flex-col",
        isDragging && "shadow-lg scale-105",
        "hover:shadow-md"
      )}>
        <CardContent className="p-3 flex-1 flex flex-col justify-between">
          {/* Drag Handle */}
          <div 
            className="absolute -left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity cursor-move"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="w-4 h-4 text-gray-400" />
          </div>

          {/* Action Buttons */}
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={onEdit}
            >
              <Edit className="w-3 h-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={onDelete}
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>

          {/* Main Content */}
          <div className="flex flex-col h-full">
            {/* Top Section: Value and Trend */}
            <div>
              <div className="flex items-baseline justify-between mb-1">
                <span className="text-2xl font-bold">
                  {isPercentage ? `${Math.round(currentValue)}%` : currentValue}
                </span>
                {showTrend && (
                  <span className="flex items-center">
                    {trend === 'up' && <TrendingUp className="w-4 h-4 text-green-500" />}
                    {trend === 'down' && <TrendingDown className="w-4 h-4 text-red-500" />}
                    {trend === 'neutral' && <Minus className="w-4 h-4 text-gray-400" />}
                  </span>
                )}
              </div>

              {/* Metric Name */}
              <p className="text-xs font-medium text-gray-700 line-clamp-1">
                {metric.name}
              </p>
            </div>

            {/* Bottom Section: Progress Bar and Context */}
            <div className="mt-auto space-y-1">
              {/* Progress Bar (for percentage metrics) */}
              {isPercentage && metric.visualization_config?.showProgressBar !== false && (
                <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className={cn(
                      "h-full transition-all",
                      status === 'on-target' && "bg-green-500",
                      status === 'off-target' && "bg-yellow-500",
                      status === 'critical' && "bg-red-500",
                      !status && "bg-blue-500"
                    )}
                    style={{ width: `${Math.min(100, percentage)}%` }}
                  />
                </div>
              )}

              {/* Additional Context */}
              {metric.visualization_config?.suffix && (
                <p className="text-xs text-gray-500 line-clamp-1">
                  {metric.visualization_config.suffix}
                </p>
              )}

              {/* Target (if not percentage) */}
              {!isPercentage && targetValue && (
                <p className="text-xs text-gray-500">
                  Target: {targetValue}{metric.measure_unit}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}