'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Target, 
  TrendingUp, 
  TrendingDown,
  AlertCircle,
  CheckCircle,
  ChevronRight
} from 'lucide-react';
import { Goal, Metric } from '@/lib/types';

interface GoalCardProps {
  goal: Goal & { metrics?: Metric[] };
  onClick?: () => void;
  className?: string;
}

export default function GoalCard({ goal, onClick, className = '' }: GoalCardProps) {
  const metrics = goal.metrics || [];
  
  // Calculate overall progress
  const validMetrics = metrics.filter(m => 
    m.current_value !== undefined && 
    m.target_value !== undefined && 
    m.target_value > 0
  );

  const overallProgress = validMetrics.length > 0 
    ? validMetrics.reduce((sum, m) => sum + (m.current_value! / m.target_value! * 100), 0) / validMetrics.length
    : 0;

  // Determine status
  const getStatus = (): 'on-target' | 'needs-attention' | 'at-risk' => {
    if (validMetrics.length === 0) return 'at-risk';
    
    const onTargetCount = validMetrics.filter(m => 
      (m.current_value! / m.target_value!) >= 0.95
    ).length;
    
    const nearTargetCount = validMetrics.filter(m => 
      (m.current_value! / m.target_value!) >= 0.8 && 
      (m.current_value! / m.target_value!) < 0.95
    ).length;

    const onTargetRatio = onTargetCount / validMetrics.length;
    if (onTargetRatio >= 0.7) return 'on-target';
    if ((onTargetCount + nearTargetCount) / validMetrics.length >= 0.5) return 'needs-attention';
    return 'at-risk';
  };

  const status = getStatus();

  const getStatusBadge = () => {
    switch (status) {
      case 'on-target':
        return <Badge className="bg-green-100 text-green-800 border-green-200">On Target</Badge>;
      case 'needs-attention':
        return <Badge className="bg-orange-100 text-orange-800 border-orange-200">Needs Attention</Badge>;
      case 'at-risk':
        return <Badge className="bg-red-100 text-red-800 border-red-200">At Risk</Badge>;
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'on-target':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'needs-attention':
        return <AlertCircle className="w-4 h-4 text-orange-500" />;
      case 'at-risk':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
    }
  };

  const getProgressColor = () => {
    switch (status) {
      case 'on-target':
        return 'bg-green-500';
      case 'needs-attention':
        return 'bg-orange-500';
      case 'at-risk':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <Card 
      className={`cursor-pointer hover:shadow-md transition-all duration-200 hover:scale-[1.02] ${className}`}
      onClick={onClick}
    >
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Target className="w-5 h-5 text-gray-500" />
              <h3 className="font-semibold text-gray-900 text-lg">{goal.title}</h3>
            </div>
            {getStatusBadge()}
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0 ml-2" />
        </div>

        {/* Description */}
        {goal.description && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
            {goal.description}
          </p>
        )}

        {/* Overall Progress */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-gray-600 font-medium">Overall Progress</span>
            <span className="font-semibold text-gray-900">{Math.round(overallProgress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className={`h-2.5 rounded-full transition-all duration-300 ${getProgressColor()}`}
              style={{ width: `${Math.min(overallProgress, 100)}%` }}
            />
          </div>
        </div>

        {/* Key Metrics */}
        {validMetrics.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900 text-sm">Key Metrics</h4>
            <div className="space-y-2">
              {validMetrics.slice(0, 2).map((metric, idx) => {
                const metricProgress = (metric.current_value! / metric.target_value!) * 100;
                const metricStatus = metricProgress >= 95 ? 'on-target' : 
                                   metricProgress >= 80 ? 'needs-attention' : 'at-risk';
                
                return (
                  <div key={idx} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      {metricStatus === 'on-target' ? 
                        <TrendingUp className="w-3 h-3 text-green-500" /> :
                        metricStatus === 'needs-attention' ?
                        <Target className="w-3 h-3 text-orange-500" /> :
                        <TrendingDown className="w-3 h-3 text-red-500" />
                      }
                      <span className="text-gray-600">{metric.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-gray-900">
                        {metric.current_value}{metric.unit || ''}
                      </div>
                      <div className="text-xs text-gray-500">
                        Target: {metric.target_value}{metric.unit || ''}
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {validMetrics.length > 2 && (
                <div className="text-xs text-gray-500 text-center pt-1">
                  +{validMetrics.length - 2} more metrics
                </div>
              )}
            </div>
          </div>
        )}

        {/* No Metrics State */}
        {validMetrics.length === 0 && (
          <div className="text-center py-4">
            <AlertCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500">No metrics configured</p>
          </div>
        )}

        {/* Sub-goals count */}
        {goal.children && goal.children.length > 0 && (
          <div className="mt-4 pt-3 border-t border-gray-100">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>Sub-goals</span>
              <span className="font-medium">{goal.children.length}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}