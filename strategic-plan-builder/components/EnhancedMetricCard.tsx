'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Metric, calculateMetricStatus, getMetricStatusConfig, MetricStatus } from '@/lib/types';
import { TrendingUp, TrendingDown, Target, Clock } from 'lucide-react';

interface EnhancedMetricCardProps {
  metric: Metric;
  goalNumber?: string;
  compact?: boolean;
  onClick?: () => void;
}

export default function EnhancedMetricCard({ 
  metric, 
  goalNumber,
  compact = false,
  onClick 
}: EnhancedMetricCardProps) {
  const status = calculateMetricStatus(metric);
  const statusConfig = getMetricStatusConfig(status);
  
  const hasValidData = metric.current_value !== undefined && 
                      metric.target_value !== undefined;

  // Format large numbers for display
  const formatValue = (value: number | undefined): string => {
    if (value === undefined) return 'N/A';
    
    // For decimal numbers, show appropriate precision
    if (value % 1 !== 0) {
      return value.toFixed(2);
    }
    
    // For large whole numbers, add commas
    return value.toLocaleString();
  };

  // Get appropriate icon for trend
  const getTrendIcon = () => {
    switch (status) {
      case 'on-target':
        return <Target className="w-4 h-4 text-green-600" />;
      case 'off-target':
        return <TrendingDown className="w-4 h-4 text-orange-600" />;
      case 'critical':
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  // Calculate percentage for risk ratios
  const getPercentageDisplay = () => {
    if (!hasValidData) return null;
    
    // For ratio metrics (like in the image), we might want special formatting
    if (metric.metric_type === 'number' && metric.unit === 'ratio') {
      return null; // Don't show percentage for ratios
    }
    
    if (metric.target_value && metric.current_value) {
      const percentage = (metric.current_value / metric.target_value) * 100;
      return percentage.toFixed(1) + '%';
    }
    
    return null;
  };

  if (compact) {
    return (
      <div 
        className={`bg-gray-800 text-white rounded-lg p-4 ${onClick ? 'cursor-pointer hover:bg-gray-700' : ''} transition-colors`}
        onClick={onClick}
      >
        <div className="flex items-start justify-between mb-2">
          <div className="text-xs font-medium opacity-90">
            {goalNumber && `${goalNumber} `}
          </div>
          <Badge 
            className={statusConfig.bgColor.replace('100', '900') + ' ' + statusConfig.textColor.replace('800', '100')}
          >
            {statusConfig.label}
          </Badge>
        </div>
        
        <h3 className="text-sm font-medium mb-3 leading-tight">
          {metric.name}
        </h3>
        
        <div className="space-y-2">
          <div className="text-3xl font-bold">
            {formatValue(metric.current_value)}
          </div>
          
          <div className="text-xs opacity-75">
            {metric.description || `Target: ${formatValue(metric.target_value)}`}
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card 
      className={`${onClick ? 'cursor-pointer hover:shadow-lg' : ''} transition-all duration-200 bg-gray-800 text-white border-gray-700`}
      onClick={onClick}
    >
      <CardContent className="p-6">
        {/* Header with goal number and status */}
        <div className="flex items-start justify-between mb-4">
          <div className="text-sm font-medium text-gray-300">
            {goalNumber && goalNumber}
          </div>
          <Badge 
            className={`${statusConfig.bgColor.replace('100', '800')} ${statusConfig.textColor.replace('800', '100')} border-transparent`}
          >
            {statusConfig.label}
          </Badge>
        </div>

        {/* Metric title */}
        <h2 className="text-lg font-semibold mb-2 leading-tight text-white">
          {metric.name}
        </h2>

        {/* Large value display */}
        <div className="mb-4">
          <div className="text-4xl font-bold text-white mb-2">
            {formatValue(metric.current_value)}
          </div>
          
          {metric.description && (
            <p className="text-sm text-gray-300 leading-relaxed">
              {metric.description}
            </p>
          )}
        </div>

        {/* Metric details */}
        <div className="space-y-3">
          {/* YTD and EOY data */}
          {hasValidData && (
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                {getTrendIcon()}
                <span className="text-gray-300">
                  YTD: {formatValue(metric.current_value)} 
                  {getPercentageDisplay() && ` (${getPercentageDisplay()})`}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-gray-400" />
                <span className="text-gray-300">
                  EOY: {formatValue(metric.target_value)}
                </span>
              </div>
            </div>
          )}

          {/* Additional metric info */}
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Clock className="w-3 h-3" />
            <span>Last updated: {metric.last_collected || 'Unknown'}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}