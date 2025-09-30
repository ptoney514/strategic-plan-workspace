'use client';

import React from 'react';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  ReferenceLine,
  Area,
  AreaChart
} from 'recharts';

export interface ChartDataPoint {
  name: string;
  value: number;
  target?: number;
  label?: string;
}

interface ProgressChartProps {
  data: ChartDataPoint[];
  type?: 'line' | 'bar' | 'area';
  height?: number;
  color?: string;
  targetColor?: string;
  showTarget?: boolean;
  showGrid?: boolean;
  showLegend?: boolean;
  title?: string;
  yAxisDomain?: [number, number];
  xAxisKey?: string;
  yAxisKey?: string;
  targetKey?: string;
  className?: string;
}

export default function ProgressChart({
  data,
  type = 'line',
  height = 300,
  color = '#3b82f6',
  targetColor = '#ef4444',
  showTarget = true,
  showGrid = true,
  showLegend = false,
  title,
  yAxisDomain,
  xAxisKey = 'name',
  yAxisKey = 'value',
  targetKey = 'target',
  className = ''
}: ProgressChartProps) {
  
  // Custom tooltip formatter
  const customTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 mb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {`${entry.name}: ${entry.value}${entry.payload.unit || ''}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Calculate average target for reference line
  const averageTarget = data.length > 0 && showTarget
    ? data.reduce((sum, item) => sum + (item.target || 0), 0) / data.filter(item => item.target).length
    : null;

  const renderChart = () => {
    switch (type) {
      case 'bar':
        return (
          <BarChart data={data}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />}
            <XAxis 
              dataKey={xAxisKey} 
              stroke="#6b7280"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              stroke="#6b7280"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              domain={yAxisDomain}
            />
            <Tooltip content={customTooltip} />
            {showLegend && <Legend />}
            
            <Bar 
              dataKey={yAxisKey} 
              fill={color} 
              radius={[4, 4, 0, 0]}
              name="Current"
            />
            
            {showTarget && (
              <Bar 
                dataKey={targetKey} 
                fill={targetColor} 
                radius={[4, 4, 0, 0]}
                name="Target"
                opacity={0.7}
              />
            )}
            
            {averageTarget && (
              <ReferenceLine 
                y={averageTarget} 
                stroke={targetColor} 
                strokeDasharray="5 5"
                label="Avg Target"
              />
            )}
          </BarChart>
        );

      case 'area':
        return (
          <AreaChart data={data}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />}
            <XAxis 
              dataKey={xAxisKey} 
              stroke="#6b7280"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              stroke="#6b7280"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              domain={yAxisDomain}
            />
            <Tooltip content={customTooltip} />
            {showLegend && <Legend />}
            
            <Area
              type="monotone"
              dataKey={yAxisKey}
              stroke={color}
              fill={color}
              fillOpacity={0.3}
              strokeWidth={2}
              name="Progress"
            />
            
            {showTarget && (
              <Area
                type="monotone"
                dataKey={targetKey}
                stroke={targetColor}
                fill={targetColor}
                fillOpacity={0.1}
                strokeWidth={2}
                strokeDasharray="5 5"
                name="Target"
              />
            )}
          </AreaChart>
        );

      default: // line
        return (
          <LineChart data={data}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />}
            <XAxis 
              dataKey={xAxisKey} 
              stroke="#6b7280"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              stroke="#6b7280"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              domain={yAxisDomain}
            />
            <Tooltip content={customTooltip} />
            {showLegend && <Legend />}
            
            <Line 
              type="monotone" 
              dataKey={yAxisKey} 
              stroke={color}
              strokeWidth={3}
              dot={{ fill: color, strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: color, strokeWidth: 2 }}
              name="Current"
            />
            
            {showTarget && (
              <Line 
                type="monotone" 
                dataKey={targetKey} 
                stroke={targetColor}
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ fill: targetColor, strokeWidth: 2, r: 3 }}
                name="Target"
              />
            )}
            
            {averageTarget && (
              <ReferenceLine 
                y={averageTarget} 
                stroke={targetColor} 
                strokeDasharray="5 5"
                label={{ value: "Target", position: "top" }}
              />
            )}
          </LineChart>
        );
    }
  };

  return (
    <div className={`w-full ${className}`}>
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      )}
      <div style={{ height: `${height}px` }}>
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// Utility function to generate mock trend data
export const generateMockTrendData = (
  currentValue: number, 
  targetValue: number, 
  months: string[] = ['Aug', 'Sep', 'Oct', 'Nov', 'Dec']
): ChartDataPoint[] => {
  return months.map((month, index) => {
    // Generate a trend that moves towards current value
    const progress = (index + 1) / months.length;
    const startValue = Math.max(0, currentValue - (currentValue * 0.3));
    const value = startValue + ((currentValue - startValue) * progress) + (Math.random() * 5 - 2.5);
    
    return {
      name: month,
      value: Math.round(Math.max(0, value)),
      target: targetValue
    };
  });
};

// Utility function to generate performance area data
export const generatePerformanceData = (
  areas: string[], 
  baseValue: number = 75
): ChartDataPoint[] => {
  return areas.map(area => ({
    name: area.length > 12 ? area.substring(0, 12) + '...' : area,
    value: Math.round(baseValue + (Math.random() * 30 - 15))
  }));
};