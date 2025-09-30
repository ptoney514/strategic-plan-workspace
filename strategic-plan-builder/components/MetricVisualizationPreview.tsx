'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Metric } from '@/lib/types';
import { Progress } from '@/components/ui/progress';

interface MetricVisualizationPreviewProps {
  metrics: Metric[];
}

export function MetricVisualizationPreview({ metrics }: MetricVisualizationPreviewProps) {
  if (!metrics || metrics.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="text-6xl mb-4">📊</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No metrics to visualize</h3>
        <p className="text-gray-500">Add metrics in the Metrics & KPIs tab to see visualizations here</p>
      </div>
    );
  }

  const renderMetricVisualization = (metric: Metric) => {
    const currentValue = metric.current_value || 0;
    const targetValue = metric.target_value || 100;
    const percentage = Math.round((currentValue / targetValue) * 100);

    // Determine status color
    const getStatusColor = () => {
      if (percentage >= 90) return 'text-green-600 bg-green-50 border-green-200';
      if (percentage >= 70) return 'text-blue-600 bg-blue-50 border-blue-200';
      if (percentage >= 50) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      return 'text-red-600 bg-red-50 border-red-200';
    };

    const getProgressColor = () => {
      if (percentage >= 90) return 'bg-green-500';
      if (percentage >= 70) return 'bg-blue-500';
      if (percentage >= 50) return 'bg-yellow-500';
      return 'bg-red-500';
    };

    const getStatusBadge = () => {
      if (percentage >= 90) return { text: 'On Target', color: 'bg-green-100 text-green-800' };
      if (percentage >= 70) return { text: 'Progressing', color: 'bg-blue-100 text-blue-800' };
      if (percentage >= 50) return { text: 'Needs Attention', color: 'bg-yellow-100 text-yellow-800' };
      return { text: 'Critical', color: 'bg-red-100 text-red-800' };
    };

    const status = getStatusBadge();

    // Percentage visualization (like your example)
    if (metric.metric_type === 'percent') {
      return (
        <Card key={metric.id} className={`border-2 ${getStatusColor()}`}>
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${status.color}`}>
                  {status.text}
                </span>
              </div>
            </div>
            
            <h3 className="text-lg font-medium text-gray-900 mb-6">
              {metric.name}
            </h3>
            
            {/* Large percentage display */}
            <div className="text-center mb-6">
              <div className="text-6xl font-bold">{percentage}%</div>
              <p className="text-sm text-gray-600 mt-2">
                {metric.description || 'Progress toward target'}
              </p>
            </div>
            
            {/* Progress bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Current: {currentValue}{metric.unit || ''}</span>
                <span>Target: {targetValue}{metric.unit || ''}</span>
              </div>
              <Progress value={percentage} className={`h-3 ${getProgressColor()}`} />
            </div>

            {/* Trend indicator - removed until previous_value is added to Metric type */}
          </CardContent>
        </Card>
      );
    }

    // Number metric visualization
    if (metric.metric_type === 'number') {
      return (
        <Card key={metric.id} className="border">
          <CardContent className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {metric.name}
            </h3>
            <div className="text-4xl font-bold mb-2">
              {currentValue.toLocaleString()}{metric.unit || ''}
            </div>
            {targetValue && (
              <p className="text-sm text-gray-600">
                Target: {targetValue.toLocaleString()}{metric.unit || ''}
              </p>
            )}
          </CardContent>
        </Card>
      );
    }

    // Default visualization
    return (
      <Card key={metric.id} className="border">
        <CardContent className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {metric.name}
          </h3>
          <p className="text-gray-600">{metric.description}</p>
          <div className="mt-4">
            <span className="text-2xl font-bold">{currentValue}</span>
            {metric.unit && <span className="text-gray-600 ml-1">{metric.unit}</span>}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Visualization Preview</h3>
        <p className="text-sm text-gray-600 mb-6">
          This is how your metrics will appear on the dashboard
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {metrics.map(metric => renderMetricVisualization(metric))}
      </div>
    </div>
  );
}