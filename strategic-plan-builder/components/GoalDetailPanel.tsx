'use client';

import { useState, useEffect } from 'react';
import { 
  X, 
  ArrowLeft, 
  Target, 
  TrendingUp, 
  Calendar,
  Activity,
  Users,
  BarChart2,
  CheckCircle,
  AlertCircle,
  Clock
} from 'lucide-react';
import { GoalWithMetrics } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
// import { PercentageMetricCard } from '@/components/metrics/PercentageMetricCard';
// import { SurveyMetricCard } from '@/components/metrics/SurveyMetricCard';
import { PerformanceTrend } from '@/components/metrics/visualizations/PerformanceTrend';

interface GoalDetailPanelProps {
  goal: GoalWithMetrics | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function GoalDetailPanel({ goal, isOpen, onClose }: GoalDetailPanelProps) {
  if (!goal) return null;

  // Calculate overall progress based on metrics
  const calculateOverallProgress = () => {
    if (!goal.metrics || goal.metrics.length === 0) return 0;
    
    const validMetrics = goal.metrics.filter(m => 
      m.target_value !== undefined && 
      (m.current_value !== undefined || m.actual_value !== undefined)
    );
    
    if (validMetrics.length === 0) return 0;
    
    const totalProgress = validMetrics.reduce((sum, metric) => {
      const current = metric.current_value ?? metric.actual_value ?? 0;
      const progress = Math.min((current / metric.target_value!) * 100, 100);
      return sum + progress;
    }, 0);
    
    return Math.round(totalProgress / validMetrics.length);
  };

  const getMetricStatusIcon = (metric: any) => {
    if (!metric.target_value) return <Clock className="w-4 h-4 text-gray-400" />;
    
    const current = metric.current_value ?? metric.actual_value ?? 0;
    const percentage = (current / metric.target_value) * 100;
    
    if (percentage >= 90) {
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    } else if (percentage >= 70) {
      return <Activity className="w-4 h-4 text-yellow-500" />;
    } else {
      return <AlertCircle className="w-4 h-4 text-red-500" />;
    }
  };

  const getMetricStatusBadge = (metric: any) => {
    if (!metric.target_value) {
      return (
        <Badge variant="outline" className="text-xs">
          No Target
        </Badge>
      );
    }
    
    const current = metric.current_value ?? metric.actual_value ?? 0;
    const percentage = (current / metric.target_value) * 100;
    
    if (percentage >= 90) {
      return (
        <Badge className="bg-green-50 text-green-700 border-green-200 text-xs">
          On Track
        </Badge>
      );
    } else if (percentage >= 70) {
      return (
        <Badge className="bg-yellow-50 text-yellow-700 border-yellow-200 text-xs">
          Near Target
        </Badge>
      );
    } else {
      return (
        <Badge className="bg-red-50 text-red-700 border-red-200 text-xs">
          Below Target
        </Badge>
      );
    }
  };

  const overallProgress = calculateOverallProgress();

  // Use status indicator from database if available
  let statusText = goal.indicator_text || 'In Progress';
  let statusColor = goal.indicator_color || '#6b7280';
  
  // Map preset color names to hex values if needed
  const colorMap: { [key: string]: string } = {
    'green': '#10b981',
    'yellow': '#eab308', 
    'orange': '#f97316',
    'red': '#ef4444',
    'blue': '#3b82f6',
    'purple': '#9333ea',
    'gray': '#6b7280'
  };
  
  // Convert color name to hex if it's not already a hex value
  if (statusColor && !statusColor.startsWith('#')) {
    statusColor = colorMap[statusColor.toLowerCase()] || statusColor;
  }

  return (
    <div className={`fixed top-0 right-0 h-full w-full sm:w-[480px] bg-white shadow-2xl transform transition-transform duration-300 z-[60] ${
      isOpen ? 'translate-x-0' : 'translate-x-full'
    }`}>
      <div className="h-full flex flex-col">
        {/* Panel Header */}
        <div className="px-6 py-4 border-b bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <p className="text-xs text-gray-500">Goal {goal.goal_number}</p>
                <h2 className="text-lg font-semibold text-gray-900">{goal.title}</h2>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Panel Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            {/* Goal Description */}
            <div className="mb-6">
              <p className="text-gray-600">
                {goal.description || `Strategic goal focused on measurable outcomes and continuous improvement.`}
              </p>
            </div>

            {/* Status Card */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-700">Overall Status</h3>
                <div
                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold border"
                  style={{
                    backgroundColor: statusText === 'On Track' ? '#dcfce7' :
                                    statusText === 'At Risk' ? '#fee2e2' :
                                    statusText === 'Needs Attention' ? '#fed7aa' :
                                    '#f3f4f6',
                    color: statusColor,
                    borderColor: statusColor
                  }}
                >
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: statusColor }}
                  />
                  <span>{statusText}</span>
                </div>
              </div>
              
              {/* Progress Bar */}
              {goal.metrics && goal.metrics.length > 0 && (
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Progress</span>
                    <span className="font-medium text-gray-900">{overallProgress}%</span>
                  </div>
                  <Progress value={overallProgress} className="h-2" />
                </div>
              )}

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-4 mt-4">
                <div>
                  <p className="text-xs text-gray-500">Metrics</p>
                  <p className="text-lg font-semibold text-gray-900">{goal.metrics?.length || 0}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">On Track</p>
                  <p className="text-lg font-semibold text-green-600">
                    {goal.metrics?.filter(m => {
                      if (!m.target_value) return false;
                      const current = m.current_value ?? m.actual_value ?? 0;
                      return (current / m.target_value) * 100 >= 90;
                    }).length || 0}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Needs Work</p>
                  <p className="text-lg font-semibold text-red-600">
                    {goal.metrics?.filter(m => {
                      if (!m.target_value) return false;
                      const current = m.current_value ?? m.actual_value ?? 0;
                      return (current / m.target_value) * 100 < 70;
                    }).length || 0}
                  </p>
                </div>
              </div>
            </div>

            {/* Metrics Section */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <BarChart2 className="w-5 h-5 text-gray-700" />
                <h3 className="font-semibold text-gray-900">Performance Metrics</h3>
              </div>

              {goal.metrics && goal.metrics.length > 0 ? (
                <div className="space-y-4">
                  {goal.metrics.map((metric) => {
                    // Determine which visualization component to use based on metric type and visualization config
                    const visualizationType = metric.visualization_type || metric.chart_type || 'default';
                    const visualizationConfig = metric.visualization_config || {};
                    
                    // // For survey metrics
                    // if (metric.metric_type === 'survey' || visualizationType === 'survey') {
                    //   const current = metric.current_value ?? metric.actual_value ?? 0;
                    //   const progress = metric.target_value ? 
                    //     Math.min((current / metric.target_value) * 100, 100) : 0;
                      
                    //   return (
                    //     <SurveyMetricCard 
                    //       key={metric.id}
                    //       title={metric.name}
                    //       value={current}
                    //       maxValue={metric.survey_scale_max || 5}
                    //       description={metric.description || ''}
                    //       status={
                    //         progress >= 90 ? 'on-target' :
                    //         progress >= 70 ? 'near-target' :
                    //         progress >= 50 ? 'off-target' :
                    //         'at-risk'
                    //       }
                    //       trend={metric.trend_direction === 'up' ? 'up' : 
                    //              metric.trend_direction === 'down' ? 'down' : 'stable'}
                    //     />
                    //   );
                    // }
                    
                    // // For percentage metrics
                    // if (metric.metric_type === 'percentage' || metric.unit === '%') {
                    //   const current = metric.current_value ?? metric.actual_value ?? 0;
                    //   const progress = metric.target_value ? 
                    //     Math.min((current / metric.target_value) * 100, 100) : 0;
                      
                    //   return (
                    //     <PercentageMetricCard 
                    //       key={metric.id}
                    //       title={metric.name}
                    //       value={current}
                    //       target={metric.target_value}
                    //       description={metric.description || ''}
                    //       status={
                    //         progress >= 90 ? 'on-target' :
                    //         progress >= 70 ? 'near-target' :
                    //         progress >= 50 ? 'off-target' :
                    //         'at-risk'
                    //       }
                    //       trend={metric.trend_direction === 'up' ? 'up' : 
                    //              metric.trend_direction === 'down' ? 'down' : 'stable'}
                    //     />
                    //   );
                    // }
                    
                    // For performance trend visualization
                    if (visualizationType === 'performance_trend' || visualizationType === 'trend' || visualizationType === 'performance-trend') {
                      // Parse visualization_config if it's a string
                      const config = typeof metric.visualization_config === 'string' 
                        ? JSON.parse(metric.visualization_config) 
                        : metric.visualization_config || {};
                      
                      const trendData = {
                        years: config.years || [
                          { year: 2022, target: metric.baseline_value || 3.66, actual: metric.baseline_value || 3.66 },
                          { year: 2023, target: 3.75, actual: 3.75 },
                          { year: 2024, target: 3.74, actual: 3.74 },
                          { year: 2025, target: metric.target_value || 4, actual: metric.current_value || 3.79 },
                        ],
                        unit: config.unit || metric.unit || '',
                        frequency: config.frequency || 'annual',
                        yAxisMin: config.yAxisMin,
                        yAxisMax: config.yAxisMax
                      };
                      
                      return (
                        <PerformanceTrend 
                          key={metric.id}
                          name={metric.name}
                          description={metric.description}
                          data={trendData}
                          displayWidth={metric.display_width as 'quarter' | 'third' | 'half' | 'full' || 'full'}
                        />
                      );
                    }
                    
                    // For comparative analysis
                    if (visualizationType === 'comparative' || visualizationType === 'comparison') {
                      // Skip for now as we need to check the component structure
                      // return (
                      //   <ComparativeChart 
                      //     key={metric.id}
                      //     metric={metric}
                      //     comparisonData={visualizationConfig.comparisonData || []}
                      //   />
                      // );
                    }
                    
                    // For milestone tracker
                    if (visualizationType === 'milestone' || visualizationType === 'milestones') {
                      // Skip for now as we need to check the component structure
                      // return (
                      //   <MilestoneTracker 
                      //     key={metric.id}
                      //     metric={metric}
                      //     milestones={visualizationConfig.milestones || []}
                      //   />
                      // );
                    }
                    
                    // Default card for basic metrics
                    const current = metric.current_value ?? metric.actual_value ?? 0;
                    const progress = metric.target_value ? 
                      Math.min((current / metric.target_value) * 100, 100) : 0;
                    
                    return (
                      <div
                        key={metric.id}
                        className="bg-gray-800 text-white rounded-lg p-6"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h4 className="text-lg font-medium text-white">
                              {metric.name}
                            </h4>
                            {metric.description && (
                              <p className="text-sm text-gray-400 mt-1">
                                {metric.description}
                              </p>
                            )}
                          </div>
                          <Badge 
                            className={`text-xs ${
                              progress >= 90 ? 'bg-green-900 text-green-100' :
                              progress >= 70 ? 'bg-yellow-900 text-yellow-100' :
                              'bg-red-900 text-red-100'
                            }`}
                          >
                            {progress >= 90 ? 'On Track' : progress >= 70 ? 'Near Target' : 'Needs Attention'}
                          </Badge>
                        </div>

                        <div className="text-4xl font-bold text-white mb-2">
                          {current.toLocaleString()}{metric.unit || ''}
                        </div>
                        
                        {metric.target_value && (
                          <div className="text-sm text-gray-400 mb-4">
                            Target: {metric.target_value.toLocaleString()}{metric.unit || ''}
                          </div>
                        )}

                        {metric.target_value && (
                          <div>
                            <div className="flex justify-between text-xs mb-2">
                              <span className="text-gray-400">Progress</span>
                              <span className="text-gray-300 font-medium">{progress.toFixed(1)}%</span>
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-2">
                              <div 
                                className={`h-full rounded-full transition-all ${
                                  progress >= 90 ? 'bg-green-500' :
                                  progress >= 70 ? 'bg-yellow-500' :
                                  'bg-red-500'
                                }`}
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <BarChart2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">No metrics defined yet</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Metrics will appear here once they are added to this goal
                  </p>
                </div>
              )}
            </div>

            {/* Sub-goals Section (if any) */}
            {goal.children && goal.children.length > 0 && (
              <div className="mt-8 pt-8 border-t">
                <div className="flex items-center gap-2 mb-4">
                  <Target className="w-5 h-5 text-gray-700" />
                  <h3 className="font-semibold text-gray-900">Sub-goals</h3>
                  <Badge variant="outline" className="ml-auto">
                    {goal.children.length}
                  </Badge>
                </div>
                <div className="space-y-3">
                  {goal.children.map((subGoal) => (
                    <div
                      key={subGoal.id}
                      className="border border-gray-200 rounded-lg p-3 bg-gray-50"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {subGoal.goal_number} {subGoal.title}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {subGoal.metrics?.length || 0} metrics
                          </p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {subGoal.indicator_text || 'Not Started'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}