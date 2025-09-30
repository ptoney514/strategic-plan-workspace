'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, GripVertical, CheckCircle, AlertTriangle, XCircle, Activity } from 'lucide-react';
import { Metric, calculateMetricStatus, getMetricStatusConfig } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { MetricPreview } from './MetricPreview';
import { PerformanceTrendChart } from './visualizations/PerformanceTrendChart';

interface MetricCardStandardProps {
  metric: Metric;
  onEdit: () => void;
  onDelete: () => void;
  width?: 'quarter' | 'third' | 'half' | 'full';
}

export function MetricCardStandard({ 
  metric, 
  onEdit, 
  onDelete,
  width = 'half'
}: MetricCardStandardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: metric.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const status = calculateMetricStatus(metric);
  const statusConfig = getMetricStatusConfig(status);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'on-target':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'off-target':
        return <AlertTriangle className="w-4 h-4 text-orange-600" />;
      case 'critical':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Activity className="w-4 h-4 text-gray-400" />;
    }
  };

  // Determine card size class based on width
  const sizeClass = width === 'quarter' ? 'col-span-3' :
                    width === 'third' ? 'col-span-4' :
                    width === 'half' ? 'col-span-6' :
                    'col-span-12'; // full width

  return (
    <div 
      ref={setNodeRef}
      style={style}
      className={cn(
        "relative group",
        sizeClass,
        isDragging && "opacity-50 z-50"
      )}
    >
      <Card className={cn(
        "transition-all flex flex-col",
        // Dynamic height based on visualization type
        metric.visualization_type === 'performance-trend' && "h-auto min-h-[300px]",
        metric.visualization_type === 'bar-chart' && "h-48",
        metric.visualization_type === 'line-chart' && "h-48",
        metric.visualization_type === 'donut-chart' && "h-48",
        !metric.visualization_type && "h-32",
        metric.visualization_type === 'percentage' && "h-32",
        metric.visualization_type === 'number' && "h-32",
        metric.visualization_type === 'status' && "h-32",
        isDragging && "shadow-lg scale-105",
        "hover:shadow-md"
      )}>
        <CardContent className="p-4 flex-1 flex flex-col">
          {/* Drag Handle */}
          <div 
            className="absolute -left-2 top-4 opacity-0 group-hover:opacity-100 transition-opacity cursor-move"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="w-4 h-4 text-gray-400" />
          </div>

          {/* Action Buttons */}
          <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={onEdit}
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={onDelete}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>

          {/* Content based on visualization type */}
          {metric.visualization_type ? (
            // Custom visualization
            <div>
              {metric.visualization_type === 'performance-trend' ? (
                <PerformanceTrendChart 
                  config={metric.visualization_config || {}} 
                  className="w-full"
                />
              ) : (
                <MetricPreview 
                  type={metric.visualization_type as any}
                  data={metric.visualization_config || {}}
                />
              )}
            </div>
          ) : (
            // Default metric display
            <div className="space-y-3">
              {/* Header with status */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {getStatusIcon(status)}
                  <h4 className="font-medium text-sm">{metric.name}</h4>
                </div>
                {metric.is_primary && (
                  <Badge variant="secondary" className="text-xs">
                    Primary
                  </Badge>
                )}
              </div>

              {/* Description */}
              {metric.description && (
                <p className="text-xs text-gray-600 line-clamp-2">
                  {metric.description}
                </p>
              )}

              {/* Values */}
              <div className="flex items-center gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Current: </span>
                  <strong className="text-gray-900">
                    {metric.current_value || 0}{metric.measure_unit}
                  </strong>
                </div>
                <div>
                  <span className="text-gray-500">Target: </span>
                  <strong className="text-gray-900">
                    {metric.target_value || 0}{metric.measure_unit}
                  </strong>
                </div>
              </div>

              {/* Progress Bar */}
              {metric.target_value && (
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className={cn(
                      "h-full transition-all",
                      status === 'on-target' && "bg-green-500",
                      status === 'off-target' && "bg-yellow-500",
                      status === 'critical' && "bg-red-500",
                      !status && "bg-blue-500"
                    )}
                    style={{ 
                      width: `${Math.min(100, ((metric.current_value || 0) / metric.target_value) * 100)}%` 
                    }}
                  />
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}