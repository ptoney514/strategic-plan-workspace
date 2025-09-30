'use client';

import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Goal, Metric } from '@/lib/types';
import { SurveyMetricCard } from './SurveyMetricCard';
import { PercentageMetricCard } from './PercentageMetricCard';
import { ClassificationMetricCard } from './ClassificationMetricCard';

interface GoalWithDropZoneProps {
  goal: Goal;
  onAddMetric?: (goalId: string, metricType: string) => void;
  onRemoveMetric?: (goalId: string, metricId: string) => void;
  onEditMetric?: (goalId: string, metricId: string) => void;
  isEditable?: boolean;
}

export function GoalWithDropZone({
  goal,
  onAddMetric,
  onRemoveMetric,
  onEditMetric,
  isEditable = false
}: GoalWithDropZoneProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: `goal-${goal.id}`,
    data: {
      isDropZone: true,
      goalId: goal.id
    }
  });

  // Render metric based on type
  const renderMetric = (metric: Metric) => {
    // For demo purposes, we'll render based on metric type
    // In real implementation, you'd check metric.metric_type
    
    // Example survey metric
    if (metric.name?.toLowerCase().includes('survey') || metric.name?.toLowerCase().includes('rating')) {
      return (
        <SurveyMetricCard
          key={metric.id}
          title={metric.name}
          value={metric.current_value || 0}
          maxValue={5}
          description={`Overall average of responses (1-5 rating) on ${metric.name}`}
          status={getMetricStatus(metric)}
          onEdit={() => onEditMetric?.(goal.id, metric.id)}
          onDelete={() => onRemoveMetric?.(goal.id, metric.id)}
          isEditable={isEditable}
        />
      );
    }
    
    // Example percentage metric
    if (metric.metric_type === 'percent' || metric.name?.toLowerCase().includes('percent')) {
      return (
        <PercentageMetricCard
          key={metric.id}
          title={metric.name}
          value={metric.current_value || 0}
          target={metric.target_value}
          description={metric.name}
          status={getMetricStatus(metric)}
          onEdit={() => onEditMetric?.(goal.id, metric.id)}
          onDelete={() => onRemoveMetric?.(goal.id, metric.id)}
          isEditable={isEditable}
        />
      );
    }

    // Example classification metric
    if (metric.name?.toLowerCase().includes('classification')) {
      return (
        <ClassificationMetricCard
          key={metric.id}
          title={metric.name}
          mainValue={metric.current_value}
          categories={[
            { label: 'Excellent', value: 100 },
            { label: 'Great', value: 90 },
            { label: 'Good', value: 80 },
            { label: 'Needs Improvement', value: 70 }
          ]}
          status={getMetricStatus(metric)}
          onEdit={() => onEditMetric?.(goal.id, metric.id)}
          onDelete={() => onRemoveMetric?.(goal.id, metric.id)}
          isEditable={isEditable}
        />
      );
    }

    // Default percentage card
    return (
      <PercentageMetricCard
        key={metric.id}
        title={metric.name}
        value={metric.current_value || 0}
        target={metric.target_value}
        description={metric.name}
        status={getMetricStatus(metric)}
        onEdit={() => onEditMetric?.(goal.id, metric.id)}
        onDelete={() => onRemoveMetric?.(goal.id, metric.id)}
        isEditable={isEditable}
      />
    );
  };

  // Calculate metric status
  const getMetricStatus = (metric: Metric): 'on-target' | 'near-target' | 'off-target' | 'at-risk' => {
    if (!metric.current_value || !metric.target_value) return 'at-risk';
    
    const ratio = metric.current_value / metric.target_value;
    if (ratio >= 0.95) return 'on-target';
    if (ratio >= 0.80) return 'near-target';
    if (ratio >= 0.60) return 'off-target';
    return 'at-risk';
  };

  // Calculate goal status from metrics
  const getGoalStatus = () => {
    if (!goal.metrics || goal.metrics.length === 0) return 'not-started';
    
    const statuses = goal.metrics.map(getMetricStatus);
    if (statuses.every(s => s === 'on-target')) return 'on-target';
    if (statuses.some(s => s === 'at-risk')) return 'at-risk';
    if (statuses.some(s => s === 'off-target')) return 'off-target';
    return 'near-target';
  };

  const goalStatus = getGoalStatus();

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "space-y-3 transition-all",
        isOver && "ring-2 ring-blue-500 ring-offset-2 rounded-lg"
      )}
    >
      {/* Goal Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold text-white">{goal.goal_number}</span>
          <Badge 
            className={cn(
              'border',
              goalStatus === 'on-target' ? 'bg-green-100 text-green-800 border-green-200' :
              goalStatus === 'near-target' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
              goalStatus === 'off-target' ? 'bg-orange-100 text-orange-800 border-orange-200' :
              goalStatus === 'at-risk' ? 'bg-red-100 text-red-800 border-red-200' :
              'bg-gray-100 text-gray-800 border-gray-200'
            )}
          >
            {goalStatus === 'on-target' ? 'On Target' :
             goalStatus === 'near-target' ? 'Near Target' :
             goalStatus === 'off-target' ? 'Off Target' :
             goalStatus === 'at-risk' ? 'At Risk' :
             'Not Started'}
          </Badge>
        </div>
      </div>

      {/* Goal Title */}
      <h3 className="text-sm font-medium text-gray-300 mb-3">{goal.title}</h3>

      {/* Metrics */}
      {goal.metrics && goal.metrics.length > 0 ? (
        <div className="space-y-3">
          {goal.metrics.map(renderMetric)}
        </div>
      ) : (
        <Card 
          className={cn(
            "border-2 border-dashed bg-slate-800/50 p-8 flex flex-col items-center justify-center min-h-[150px]",
            isOver ? "border-blue-500 bg-blue-500/10" : "border-slate-600"
          )}
        >
          <Plus className="h-8 w-8 text-gray-500 mb-2" />
          <p className="text-sm text-gray-500 text-center">
            {isOver ? "Drop metric here" : "Drag a metric here"}
          </p>
        </Card>
      )}

      {/* Add more metrics zone when already has metrics */}
      {isEditable && goal.metrics && goal.metrics.length > 0 && (
        <Card 
          className={cn(
            "border-2 border-dashed bg-slate-800/30 p-4 flex items-center justify-center",
            isOver ? "border-blue-500 bg-blue-500/10" : "border-slate-700"
          )}
        >
          <Plus className="h-5 w-5 text-gray-500 mr-2" />
          <p className="text-xs text-gray-500">
            {isOver ? "Drop to add another metric" : "Add another metric"}
          </p>
        </Card>
      )}
    </div>
  );
}