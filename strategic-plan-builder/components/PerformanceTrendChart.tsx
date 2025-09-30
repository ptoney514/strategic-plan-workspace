'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AreaChart, Area, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts';
import { Metric, MetricTimeSeries } from '@/lib/types';
import { cn } from '@/lib/utils';

interface PerformanceTrendChartProps {
  metric: Metric;
  timeSeries?: MetricTimeSeries[];
  height?: number;
  showControls?: boolean;
  className?: string;
}

type TimeView = 'M' | 'Q' | 'Y';

export default function PerformanceTrendChart({ 
  metric, 
  timeSeries = [], 
  height = 300,
  showControls = true,
  className 
}: PerformanceTrendChartProps) {
  const [timeView, setTimeView] = useState<TimeView>('M');

  // Generate sample data if no time series provided
  const generateSampleData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const baseValue = metric.target_value || 50;
    
    return months.map((month, index) => {
      const progress = (index + 1) / 12;
      const actualValue = baseValue * (0.3 + progress * 0.7) + (Math.random() * 10 - 5);
      const targetValue = baseValue * (0.95 + progress * 0.05);
      
      return {
        period: month,
        actual: Math.round(actualValue * 100) / 100,
        target: Math.round(targetValue * 100) / 100,
        status: actualValue >= targetValue * 0.9 ? 'on-target' : 'off-target'
      };
    });
  };

  // Process time series data or use sample
  const chartData = timeSeries.length > 0 
    ? timeSeries.map(ts => ({
        period: ts.period,
        actual: ts.actual_value,
        target: ts.target_value,
        status: ts.status
      }))
    : generateSampleData();

  // Filter data based on time view
  const getFilteredData = () => {
    if (timeView === 'Q') {
      // Show quarterly data
      return chartData.filter((_, index) => index % 3 === 2).map(item => ({
        ...item,
        period: `Q${Math.floor(chartData.indexOf(item) / 3) + 1}`
      }));
    } else if (timeView === 'Y') {
      // Show annual data
      return [{
        period: '2024',
        actual: chartData.reduce((sum, item) => sum + (item.actual || 0), 0) / chartData.length,
        target: chartData.reduce((sum, item) => sum + (item.target || 0), 0) / chartData.length
      }];
    }
    return chartData;
  };

  const filteredData = getFilteredData();

  // Custom colors
  const colors = {
    actual: '#6366f1', // Indigo
    target: '#94a3b8', // Gray
    area: '#6366f1'
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border">
          <p className="font-medium text-sm">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value}{metric.measure_unit || ''}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const renderChart = () => {
    const chartType = metric.chart_type || 'area';

    switch (chartType) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <BarChart data={filteredData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="period" tick={{ fontSize: 12 }} stroke="#9ca3af" />
              <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="actual" fill={colors.actual} name="Actual" radius={[4, 4, 0, 0]} />
              <Bar dataKey="target" fill={colors.target} name="Target" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'line':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <LineChart data={filteredData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="period" tick={{ fontSize: 12 }} stroke="#9ca3af" />
              <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="actual" 
                stroke={colors.actual} 
                strokeWidth={2}
                dot={{ r: 4 }}
                name="Actual"
              />
              <Line 
                type="monotone" 
                dataKey="target" 
                stroke={colors.target} 
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ r: 3 }}
                name="Target"
              />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'donut':
        const pieData = [
          { name: 'Achieved', value: metric.current_value || 0, color: '#10b981' },
          { name: 'Remaining', value: Math.max(0, (metric.target_value || 100) - (metric.current_value || 0)), color: '#e5e7eb' }
        ];
        
        return (
          <ResponsiveContainer width="100%" height={height}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        );

      case 'area':
      default:
        return (
          <ResponsiveContainer width="100%" height={height}>
            <AreaChart data={filteredData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={colors.area} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={colors.area} stopOpacity={0.05}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="period" tick={{ fontSize: 12 }} stroke="#9ca3af" />
              <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
              <Tooltip content={<CustomTooltip />} />
              <Area 
                type="monotone" 
                dataKey="actual" 
                stroke={colors.actual}
                strokeWidth={2}
                fill="url(#colorActual)"
                name="Actual"
              />
              <Line 
                type="monotone" 
                dataKey="target" 
                stroke={colors.target}
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
                name="Target"
              />
            </AreaChart>
          </ResponsiveContainer>
        );
    }
  };

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Performance Trend</CardTitle>
            <CardDescription>Actual vs target over time</CardDescription>
          </div>
          {showControls && (
            <div className="flex gap-1">
              <Button
                variant={timeView === 'M' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTimeView('M')}
                className="h-8 px-3"
              >
                M
              </Button>
              <Button
                variant={timeView === 'Q' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTimeView('Q')}
                className="h-8 px-3"
              >
                Q
              </Button>
              <Button
                variant={timeView === 'Y' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTimeView('Y')}
                className="h-8 px-3"
              >
                Y
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {renderChart()}
      </CardContent>
    </Card>
  );
}