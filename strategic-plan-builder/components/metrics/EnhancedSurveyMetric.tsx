'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit2, Trash2, TrendingUp, TrendingDown, Minus, ChevronUp, ChevronDown, Calendar } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { cn } from '@/lib/utils';
import { Metric, SurveyDataPoint, getMetricStatusConfig, calculateMetricStatus } from '@/lib/types';

interface EnhancedSurveyMetricProps {
  metric: Metric;
  onEdit?: (metric: Metric) => void;
  onDelete?: (metricId: string) => void;
  isEditable?: boolean;
  className?: string;
}

export function EnhancedSurveyMetric({
  metric,
  onEdit,
  onDelete,
  isEditable = false,
  className
}: EnhancedSurveyMetricProps) {
  // Calculate trend based on survey data
  const getTrend = () => {
    if (!metric.survey_data || metric.survey_data.length < 2) return null;
    
    const sortedData = [...metric.survey_data].sort((a, b) => a.year - b.year);
    const lastTwo = sortedData.slice(-2);
    
    const lastValue = lastTwo[1].primary_value || lastTwo[1].survey_value || 0;
    const prevValue = lastTwo[0].primary_value || lastTwo[0].survey_value || 0;
    
    if (lastValue > prevValue) return 'up';
    if (lastValue < prevValue) return 'down';
    return 'stable';
  };

  const trend = getTrend();
  const status = calculateMetricStatus(metric);
  const statusConfig = getMetricStatusConfig(status);

  // Prepare chart data
  const prepareChartData = () => {
    if (!metric.survey_data) return [];
    
    return metric.survey_data
      .sort((a, b) => a.year - b.year)
      .map(point => ({
        year: point.year.toString(),
        'Primary': point.primary_value || 0,
        'Data Source': point.data_value || 0,
        'Survey': point.survey_value || 0
      }));
  };

  const chartData = prepareChartData();
  
  // Get current values
  const currentYear = new Date().getFullYear();
  const currentData = metric.survey_data?.find(d => d.year === currentYear) || 
                      metric.survey_data?.sort((a, b) => b.year - a.year)[0];

  const primaryValue = currentData?.primary_value || metric.survey_primary_source || metric.current_value || 0;
  const dataValue = currentData?.data_value || metric.survey_data_source || 0;
  const surveyValue = currentData?.survey_value || metric.actual_value || 0;

  const getTrendIcon = () => {
    if (!trend) return null;
    switch (trend) {
      case 'up': 
        return metric.is_higher_better ? 
          <ChevronUp className="h-5 w-5 text-green-500" /> : 
          <ChevronDown className="h-5 w-5 text-red-500" />;
      case 'down': 
        return metric.is_higher_better ? 
          <ChevronDown className="h-5 w-5 text-red-500" /> : 
          <ChevronUp className="h-5 w-5 text-green-500" />;
      case 'stable': 
        return <Minus className="h-5 w-5 text-gray-500" />;
    }
  };

  // Chart colors
  const COLORS = {
    'Primary': '#3b82f6',
    'Data Source': '#10b981',
    'Survey': '#f59e0b'
  };

  return (
    <Card className={cn("bg-slate-800 text-white border-slate-700", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg font-medium text-gray-100">
              {metric.name}
            </CardTitle>
            {metric.description && (
              <p className="text-sm text-gray-400">{metric.description}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Badge className={cn(
              "border",
              statusConfig.bgColor,
              statusConfig.textColor,
              statusConfig.borderColor
            )}>
              {statusConfig.label}
            </Badge>
            {isEditable && (
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onEdit?.(metric)}
                  className="h-8 w-8 p-0 text-gray-400 hover:text-white"
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onDelete?.(metric.id)}
                  className="h-8 w-8 p-0 text-gray-400 hover:text-red-400"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Current Values Display */}
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1">
            <p className="text-xs text-gray-500 uppercase tracking-wider">Primary</p>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-blue-400">
                {primaryValue.toFixed(2)}
              </span>
              <span className="text-sm text-gray-500">/ {metric.survey_scale_max || 5}</span>
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-gray-500 uppercase tracking-wider">Data</p>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-green-400">
                {dataValue.toFixed(2)}
              </span>
              <span className="text-sm text-gray-500">/ {metric.survey_scale_max || 5}</span>
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-gray-500 uppercase tracking-wider">Survey</p>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-amber-400">
                {surveyValue.toFixed(2)}
              </span>
              <span className="text-sm text-gray-500">/ {metric.survey_scale_max || 5}</span>
              {getTrendIcon()}
            </div>
          </div>
        </div>

        {/* Bar Chart */}
        {chartData.length > 0 && (
          <div className="mt-6">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-400">
                {metric.chart_start_year || chartData[0].year} - {metric.chart_end_year || chartData[chartData.length - 1].year}
              </span>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="year" 
                  tick={{ fill: '#9ca3af', fontSize: 12 }}
                  stroke="#4b5563"
                />
                <YAxis 
                  domain={[metric.survey_scale_min || 1, metric.survey_scale_max || 5]}
                  tick={{ fill: '#9ca3af', fontSize: 12 }}
                  stroke="#4b5563"
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1f2937', 
                    border: '1px solid #374151',
                    borderRadius: '6px'
                  }}
                  labelStyle={{ color: '#e5e7eb' }}
                  itemStyle={{ color: '#e5e7eb' }}
                />
                <Legend 
                  wrapperStyle={{ paddingTop: '10px' }}
                  iconType="rect"
                />
                <Bar dataKey="Primary" fill={COLORS['Primary']} radius={[4, 4, 0, 0]} />
                <Bar dataKey="Data Source" fill={COLORS['Data Source']} radius={[4, 4, 0, 0]} />
                <Bar dataKey="Survey" fill={COLORS['Survey']} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Narrative Text */}
        {metric.narrative_text && (
          <div className="mt-4 p-3 bg-slate-700 rounded-lg">
            <p className="text-sm text-gray-300 leading-relaxed">
              {metric.narrative_text}
            </p>
          </div>
        )}

        {/* Additional Metadata */}
        <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-slate-700">
          <span>Collection: {metric.collection_frequency || 'Annually'}</span>
          {metric.last_collected && (
            <span>Last Updated: {new Date(metric.last_collected).toLocaleDateString()}</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}