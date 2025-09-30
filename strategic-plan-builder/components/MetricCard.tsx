'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown,
  Target,
  AlertCircle,
  CheckCircle,
  Minus
} from 'lucide-react';
import { Metric, calculateMetricStatus, getMetricStatusConfig, MetricStatus } from '@/lib/types';
import PerformanceTrendChart from './PerformanceTrendChart';

interface MetricCardProps {
  metric: Metric;
  showDetails?: boolean;
  compact?: boolean;
  onClick?: () => void;
}

export default function MetricCard({ 
  metric, 
  showDetails = true, 
  compact = false,
  onClick 
}: MetricCardProps) {
  // Calculate progress
  const hasValidData = metric.current_value !== undefined && 
                      metric.target_value !== undefined;

  // For rating metrics, don't show a percentage progress
  const progress = hasValidData && metric.metric_type !== 'rating'
    ? (metric.current_value! / metric.target_value!) * 100 
    : 0;

  // Use enhanced status calculation
  const status = calculateMetricStatus(metric);
  const statusConfig = getMetricStatusConfig(status);

  // Get status styling from config
  const getStatusColor = () => statusConfig.textColor;
  const getProgressColor = () => {
    switch (status) {
      case 'on-target': return 'bg-green-500';
      case 'off-target': return 'bg-orange-500';
      case 'critical': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'on-target':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'off-target':
        return <Target className="w-4 h-4 text-orange-500" />;
      case 'critical':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Minus className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusBadge = () => {
    return (
      <Badge className={`${statusConfig.bgColor} ${statusConfig.textColor} ${statusConfig.borderColor}`}>
        {statusConfig.label}
      </Badge>
    );
  };

  const getTrendIcon = () => {
    if (status === 'on-target') {
      return <TrendingUp className="w-4 h-4 text-green-500" />;
    } else if (status === 'off-target') {
      return <TrendingDown className="w-4 h-4 text-orange-500" />;
    } else if (status === 'critical') {
      return <TrendingDown className="w-4 h-4 text-red-500" />;
    }
    return null;
  };

  // Format data source label
  const formatDataSource = (dataSource?: string) => {
    const sourceMap: Record<string, string> = {
      'survey': 'Survey Results',
      'map_data': 'MAP Data',
      'state_testing': 'State Testing',
      'total_number': 'Total Number',
      'percent': 'Percentage',
      'narrative': 'Narrative',
      'link': 'External Link'
    };
    return dataSource ? sourceMap[dataSource] || dataSource : 'Unknown Source';
  };

  if (compact) {
    return (
      <div 
        className={`p-3 bg-white border rounded-lg ${onClick ? 'cursor-pointer hover:shadow-md' : ''} transition-shadow`}
        onClick={onClick}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <span className="font-medium text-sm">{metric.name}</span>
          </div>
          <div className="text-right">
            <div className={`font-semibold text-lg ${getStatusColor()}`}>
              {hasValidData ? `${metric.current_value}${metric.unit || ''}` : 'N/A'}
            </div>
            {hasValidData && (
              <div className="text-xs text-gray-500">
                Target: {metric.target_value}{metric.unit || ''}
              </div>
            )}
          </div>
        </div>
        {hasValidData && (
          <div className="mt-2">
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div
                className={`h-1.5 rounded-full transition-all ${getProgressColor()}`}
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <Card 
      className={`${onClick ? 'cursor-pointer hover:shadow-md' : ''} transition-shadow`}
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              {getStatusIcon()}
              {metric.name}
            </CardTitle>
            {metric.description && (
              <p className="text-sm text-gray-600 mt-1">{metric.description}</p>
            )}
            {metric.is_primary && (
              <Badge variant="secondary" className="mt-1 text-xs">Primary Metric</Badge>
            )}
          </div>
          {showDetails && getStatusBadge()}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Current vs Target */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold">
              {hasValidData ? `${metric.current_value}${metric.unit || ''}` : 'No Data'}
            </span>
            {hasValidData && (
              <div className="text-right">
                <div className="flex items-center gap-1">
                  {getTrendIcon()}
                  <span className="text-sm text-gray-600">
                    Target: {metric.target_value}{metric.unit || ''}
                  </span>
                </div>
                <div className="text-xs text-gray-500">
                  {Math.round(progress)}% of target
                </div>
              </div>
            )}
          </div>

          {/* Progress Bar */}
          {hasValidData && (
            <div className="space-y-1">
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className={`h-2.5 rounded-full transition-all ${getProgressColor()}`}
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
              {progress > 100 && (
                <div className="text-xs text-gray-600">
                  Exceeds target by {Math.round(progress - 100)}%
                </div>
              )}
            </div>
          )}
        </div>

        {/* Details */}
        {showDetails && (
          <div className="space-y-2 pt-3 border-t">
            {/* Data Source */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Data Source:</span>
              <span className="font-medium">{formatDataSource(metric.data_source)}</span>
            </div>

            {/* Timeframe */}
            {(metric.timeframe_start || metric.timeframe_end) && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Timeframe:</span>
                <span className="font-medium">
                  {metric.timeframe_start && metric.timeframe_end 
                    ? `${metric.timeframe_start}-${metric.timeframe_end}`
                    : metric.timeframe_start 
                      ? `${metric.timeframe_start}+`
                      : `Until ${metric.timeframe_end}`
                  }
                </span>
              </div>
            )}

            {/* Metric Type */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Type:</span>
              <span className="font-medium capitalize">{metric.metric_type.replace('_', ' ')}</span>
            </div>
          </div>
        )}

        {/* Performance Trend Chart */}
        {showDetails && metric.data_points && metric.data_points.length > 0 && (
          <div className="pt-3 border-t">
            <PerformanceTrendChart metric={metric} height={250} />
          </div>
        )}

        {/* No Data State */}
        {!hasValidData && (
          <div className="text-center py-4">
            <AlertCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500">
              {!metric.current_value && !metric.target_value 
                ? 'No data available'
                : 'Incomplete data'
              }
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}