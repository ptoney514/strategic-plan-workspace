import React from 'react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { Metric } from '../lib/types';

interface MetricsChartProps {
  metrics: Metric[];
  variant?: 'line' | 'area';
}

export function MetricsChart({ metrics, variant = 'line' }: MetricsChartProps) {
  // Transform metrics data for the chart
  // Group metrics by date and create data points
  const chartData = metrics.reduce((acc, metric) => {
    // For demo purposes, we'll create synthetic historical data
    // In production, this would come from actual historical data
    const baseValue = metric.baseline_value || 0;
    const currentValue = metric.current_value || 0;
    const targetValue = metric.target_value || 100;
    
    // Create 6 data points showing progression
    const dataPoints = [
      { month: 'Jan', value: baseValue, target: targetValue, metric: metric.metric_name },
      { month: 'Feb', value: baseValue + (currentValue - baseValue) * 0.2, target: targetValue, metric: metric.metric_name },
      { month: 'Mar', value: baseValue + (currentValue - baseValue) * 0.4, target: targetValue, metric: metric.metric_name },
      { month: 'Apr', value: baseValue + (currentValue - baseValue) * 0.6, target: targetValue, metric: metric.metric_name },
      { month: 'May', value: baseValue + (currentValue - baseValue) * 0.8, target: targetValue, metric: metric.metric_name },
      { month: 'Jun', value: currentValue, target: targetValue, metric: metric.metric_name },
    ];
    
    return dataPoints;
  }, [] as any[]);

  // If we have multiple metrics, we need to restructure the data
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  const restructuredData = months.map(month => {
    const monthData: any = { month };
    metrics.forEach(metric => {
      const baseValue = metric.baseline_value || 0;
      const currentValue = metric.current_value || 0;
      const monthIndex = months.indexOf(month);
      const progress = monthIndex / (months.length - 1);
      monthData[metric.metric_name] = Math.round(baseValue + (currentValue - baseValue) * progress);
      monthData[`${metric.metric_name}_target`] = metric.target_value;
    });
    return monthData;
  });

  const colors = [
    'hsl(var(--primary))',
    '#10b981',
    '#f59e0b',
    '#3b82f6',
    '#8b5cf6',
    '#ec4899'
  ];

  if (metrics.length === 0) {
    return (
      <div className="w-full h-64 flex items-center justify-center bg-card border border-border rounded-lg">
        <p className="text-muted-foreground">No metrics data available</p>
      </div>
    );
  }

  const Chart = variant === 'area' ? AreaChart : LineChart;
  const DataComponent = variant === 'area' ? Area : Line;

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <Chart data={restructuredData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis 
            dataKey="month" 
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
          />
          <YAxis 
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '0.5rem'
            }}
            labelStyle={{ color: 'hsl(var(--card-foreground))' }}
          />
          <Legend 
            wrapperStyle={{ paddingTop: '1rem' }}
            iconType={variant === 'area' ? 'rect' : 'line'}
          />
          {metrics.slice(0, 6).map((metric, index) => (
            <DataComponent
              key={metric.id}
              type="monotone"
              dataKey={metric.metric_name}
              stroke={colors[index % colors.length]}
              fill={colors[index % colors.length]}
              fillOpacity={variant === 'area' ? 0.3 : 0}
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
          ))}
        </Chart>
      </ResponsiveContainer>
    </div>
  );
}