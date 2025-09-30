'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Goal, Metric, calculateMetricStatus, getMetricStatusConfig, formatMetricValue, aggregateChildMetricStatus, getAggregatedMetricValue } from '@/lib/types';

interface MetricStatusCardProps {
  goal: Goal;
  metrics: Metric[];
  childMetrics?: Metric[];
  className?: string;
}

export function MetricStatusCard({ goal, metrics, childMetrics, className }: MetricStatusCardProps) {
  // Determine if this is a parent goal that should show aggregated metrics
  const isParentGoal = goal.level < 2 && childMetrics && childMetrics.length > 0;
  
  // Get the primary metric or first metric
  const primaryMetric = metrics.find(m => m.is_primary) || metrics[0];
  
  // Calculate status
  let status = 'no-data' as any;
  let displayValue = '--';
  let displayDescription = '';
  
  if (isParentGoal && childMetrics) {
    // For parent goals, aggregate child metrics
    status = aggregateChildMetricStatus(childMetrics);
    const aggregatedValue = getAggregatedMetricValue(childMetrics, primaryMetric?.aggregation_method);
    if (aggregatedValue !== undefined && primaryMetric) {
      displayValue = formatMetricValue(aggregatedValue, primaryMetric);
    }
    displayDescription = primaryMetric?.description || `Aggregated from ${childMetrics.length} sub-goals`;
  } else if (primaryMetric) {
    // For leaf goals, use the metric's own value
    status = calculateMetricStatus(primaryMetric);
    const value = primaryMetric.current_value ?? primaryMetric.actual_value;
    displayValue = formatMetricValue(value, primaryMetric);
    displayDescription = primaryMetric.description || '';
  }
  
  const statusConfig = getMetricStatusConfig(status);
  
  return (
    <Card className={`relative overflow-hidden ${className || ''}`}>
      <div className="p-6">
        {/* Goal Number and Status Badge */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold text-gray-700 dark:text-gray-300">
              {goal.goal_number}
            </span>
            <Badge 
              className={`${statusConfig.bgColor} ${statusConfig.textColor} ${statusConfig.borderColor} border`}
              variant="outline"
            >
              {statusConfig.label}
            </Badge>
          </div>
        </div>
        
        {/* Goal Title */}
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 line-clamp-2">
          {goal.title}
        </h3>
        
        {/* Metric Display */}
        {primaryMetric && (
          <div className="space-y-2">
            {/* Large Value Display */}
            <div className="text-center py-4">
              <div className="text-4xl font-bold text-gray-900 dark:text-gray-100">
                {displayValue}
              </div>
              {primaryMetric.measure_title && (
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {primaryMetric.measure_title}
                </div>
              )}
            </div>
            
            {/* Description */}
            {displayDescription && (
              <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                {displayDescription}
              </p>
            )}
            
            {/* Target Value if available */}
            {primaryMetric.target_value && (
              <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Target:</span>
                  <span className="font-medium">
                    {formatMetricValue(primaryMetric.target_value, primaryMetric)}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* No metrics message */}
        {(!metrics || metrics.length === 0) && !isParentGoal && (
          <div className="text-center py-4 text-gray-500">
            No metrics defined
          </div>
        )}
      </div>
    </Card>
  );
}

export function MetricStatusGrid({ goals, metrics }: { goals: Goal[], metrics: Metric[] }) {
  // Group metrics by goal
  const metricsByGoal = new Map<string, Metric[]>();
  metrics.forEach(metric => {
    const goalMetrics = metricsByGoal.get(metric.goal_id) || [];
    goalMetrics.push(metric);
    metricsByGoal.set(metric.goal_id, goalMetrics);
  });
  
  // For parent goals, collect child metrics
  const childMetricsByParent = new Map<string, Metric[]>();
  goals.forEach(goal => {
    if (goal.parent_id) {
      const childGoalMetrics = metricsByGoal.get(goal.id) || [];
      const parentMetrics = childMetricsByParent.get(goal.parent_id) || [];
      parentMetrics.push(...childGoalMetrics);
      childMetricsByParent.set(goal.parent_id, parentMetrics);
    }
  });
  
  return (
    <div className="space-y-4">
      {goals.map(goal => (
        <MetricStatusCard
          key={goal.id}
          goal={goal}
          metrics={metricsByGoal.get(goal.id) || []}
          childMetrics={childMetricsByParent.get(goal.id)}
        />
      ))}
    </div>
  );
}