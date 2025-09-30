'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { GoalWithMetrics, Metric, calculateMetricStatus, getMetricStatusConfig, aggregateChildMetricStatus } from '@/lib/types';
import EnhancedMetricCard from './EnhancedMetricCard';
import EnhancedPerformanceTrendChart from './EnhancedPerformanceTrendChart';
import { Target, TrendingUp, Users, BarChart3 } from 'lucide-react';

interface ParentGoalMetricsViewProps {
  goal: GoalWithMetrics;
  showTrendChart?: boolean;
  compact?: boolean;
}

export default function ParentGoalMetricsView({ 
  goal, 
  showTrendChart = true,
  compact = false 
}: ParentGoalMetricsViewProps) {
  
  // Collect all metrics from child goals
  const allChildMetrics: Metric[] = [];
  if (goal.children) {
    goal.children.forEach(child => {
      if (child.metrics) {
        allChildMetrics.push(...child.metrics);
      }
    });
  }

  // Add the parent goal's own metrics
  const allMetrics = [...(goal.metrics || []), ...allChildMetrics];
  
  // Calculate aggregated status
  const aggregatedStatus = aggregateChildMetricStatus(allMetrics);
  const statusConfig = getMetricStatusConfig(aggregatedStatus);

  // Calculate overall progress
  const calculateOverallProgress = () => {
    const validMetrics = allMetrics.filter(m => 
      m.current_value !== undefined && m.target_value !== undefined
    );
    
    if (validMetrics.length === 0) return 0;
    
    const totalProgress = validMetrics.reduce((sum, m) => {
      const status = calculateMetricStatus(m);
      if (status === 'on-target') return sum + 100;
      if (status === 'off-target') return sum + 70;
      if (status === 'critical') return sum + 30;
      return sum + 0;
    }, 0);
    
    return Math.round(totalProgress / validMetrics.length);
  };

  const overallProgress = calculateOverallProgress();

  // Group metrics by child goal for display
  const metricsByChild = goal.children?.map(child => ({
    goal: child,
    metrics: child.metrics || []
  })) || [];

  if (compact) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="w-5 h-5" />
              {goal.goal_number} {goal.title}
            </CardTitle>
            <Badge className={`${statusConfig.bgColor} ${statusConfig.textColor} ${statusConfig.borderColor}`}>
              {statusConfig.label}
            </Badge>
          </div>
          {goal.description && (
            <p className="text-sm text-gray-600">{goal.description}</p>
          )}
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Progress Summary */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Overall Progress</span>
            <span className="text-sm text-gray-600">{overallProgress}%</span>
          </div>
          <Progress value={overallProgress} className="w-full" />
          
          {/* Metrics Count */}
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <BarChart3 className="w-4 h-4" />
              <span>{allMetrics.length} total metrics</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{goal.children?.length || 0} sub-goals</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with goal info and overall status */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-xl flex items-center gap-2 mb-2">
                <Target className="w-6 h-6" />
                {goal.goal_number} {goal.title}
              </CardTitle>
              {goal.description && (
                <p className="text-gray-600">{goal.description}</p>
              )}
            </div>
            <Badge className={`${statusConfig.bgColor} ${statusConfig.textColor} ${statusConfig.borderColor} text-sm px-3 py-1`}>
              {statusConfig.label}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Overall Progress */}
            <div>
              <div className="text-3xl font-bold text-gray-900 mb-1">{overallProgress}%</div>
              <div className="text-sm text-gray-600 mb-2">Overall Progress</div>
              <Progress value={overallProgress} className="w-full h-2" />
            </div>
            
            {/* Metrics Summary */}
            <div>
              <div className="text-3xl font-bold text-gray-900 mb-1">{allMetrics.length}</div>
              <div className="text-sm text-gray-600 mb-2">Total Metrics</div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <BarChart3 className="w-4 h-4" />
                <span>Across {goal.children?.length || 0} sub-goals</span>
              </div>
            </div>
            
            {/* Status Breakdown */}
            <div>
              <div className="text-lg font-semibold text-gray-900 mb-2">Status Breakdown</div>
              <div className="space-y-1 text-sm">
                {['on-target', 'off-target', 'critical'].map(status => {
                  const count = allMetrics.filter(m => calculateMetricStatus(m) === status).length;
                  const config = getMetricStatusConfig(status as any);
                  return (
                    <div key={status} className="flex items-center justify-between">
                      <span className={config.textColor}>{config.label}</span>
                      <span className="font-medium">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Trend Chart */}
      {showTrendChart && goal.metrics && goal.metrics.length > 0 && (
        <EnhancedPerformanceTrendChart 
          metric={goal.metrics[0]} 
          height={300}
          chartType="bar"
        />
      )}

      {/* Child Goal Metrics Grid */}
      {metricsByChild.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Sub-Goal Metrics</CardTitle>
            <p className="text-sm text-gray-600">
              Detailed metrics for each objective under this goal
            </p>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-6">
              {metricsByChild.map(({ goal: childGoal, metrics }) => (
                <div key={childGoal.id}>
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <span className="text-sm bg-gray-100 px-2 py-1 rounded">
                      {childGoal.goal_number}
                    </span>
                    {childGoal.title}
                  </h3>
                  
                  {metrics.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {metrics.map(metric => (
                        <EnhancedMetricCard
                          key={metric.id}
                          metric={metric}
                          goalNumber={childGoal.goal_number}
                          compact={true}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500 italic">
                      No metrics defined for this sub-goal
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Parent Goal's Own Metrics */}
      {goal.metrics && goal.metrics.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Direct Metrics</CardTitle>
            <p className="text-sm text-gray-600">
              Metrics directly associated with this goal
            </p>
          </CardHeader>
          
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {goal.metrics.map(metric => (
                <EnhancedMetricCard
                  key={metric.id}
                  metric={metric}
                  goalNumber={goal.goal_number}
                  compact={false}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}