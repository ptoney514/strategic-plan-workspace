'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PerformanceTrendConfig } from '@/lib/metric-visualizations';

interface PerformanceTrendChartProps {
  config: PerformanceTrendConfig;
  className?: string;
}

export function PerformanceTrendChart({ config, className }: PerformanceTrendChartProps) {
  const [frequency, setFrequency] = React.useState<'quarterly' | 'monthly' | 'annual'>(
    config.frequency || 'annual'
  );

  // Calculate chart dimensions
  const chartHeight = 400;
  const yAxisMin = config.yAxisMin || 0;
  const yAxisMax = config.yAxisMax || 5;
  const yRange = yAxisMax - yAxisMin;
  
  // Calculate bar dimensions
  const barGroupWidth = 100;
  const barWidth = 35;
  const barGap = 10;
  const chartWidth = (config.years?.length || 0) * barGroupWidth + 50;

  // Calculate Y-axis ticks
  const yTicks = [];
  const tickCount = 5;
  for (let i = 0; i <= tickCount; i++) {
    yTicks.push(yAxisMin + (yRange / tickCount) * i);
  }

  // Function to convert value to Y position
  const valueToY = (value: number) => {
    const percentage = (value - yAxisMin) / yRange;
    return chartHeight - (percentage * chartHeight);
  };

  if (!config.years || config.years.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="p-8">
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Performance Trend</h3>
            <p className="text-sm text-gray-500">No data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`bg-slate-800 text-white ${className}`}>
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-medium">Performance trend</h3>
            <p className="text-sm text-gray-400">Actual vs target over time</p>
          </div>
          {/* Frequency toggle */}
          <div className="flex gap-2">
            <Button
              variant={frequency === 'quarterly' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setFrequency('quarterly')}
              className="text-xs"
            >
              QUARTERLY
            </Button>
            <Button
              variant={frequency === 'monthly' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setFrequency('monthly')}
              className="text-xs"
            >
              MONTHLY
            </Button>
            <Button
              variant={frequency === 'annual' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setFrequency('annual')}
              className="text-xs"
            >
              ANNUAL
            </Button>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-6 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-500"></div>
            <span className="text-sm">TARGET</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-teal-400"></div>
            <span className="text-sm">ACTUAL</span>
          </div>
        </div>

        {/* Chart Container */}
        <div className="relative" style={{ height: chartHeight + 50 }}>
          {/* Y-Axis labels */}
          <div className="absolute left-0 top-0" style={{ height: chartHeight }}>
            {yTicks.reverse().map((tick, index) => (
              <div
                key={index}
                className="absolute left-0 text-xs text-gray-400"
                style={{
                  top: `${(index / (yTicks.length - 1)) * chartHeight - 8}px`,
                }}
              >
                {tick.toFixed(2)}
              </div>
            ))}
          </div>

          {/* Chart */}
          <svg
            width={chartWidth}
            height={chartHeight + 50}
            className="ml-12"
            viewBox={`0 0 ${chartWidth} ${chartHeight + 50}`}
            preserveAspectRatio="xMidYMid meet"
          >
            {/* Grid lines */}
            {yTicks.map((tick, index) => (
              <line
                key={index}
                x1="0"
                y1={valueToY(tick)}
                x2={chartWidth}
                y2={valueToY(tick)}
                stroke="rgba(255, 255, 255, 0.1)"
                strokeWidth="1"
              />
            ))}

            {/* Bars */}
            {config.years.map((yearData, index) => {
              const x = index * barGroupWidth + 25;
              const targetHeight = chartHeight - valueToY(yearData.target);
              const actualHeight = chartHeight - valueToY(yearData.actual);
              const targetY = valueToY(yearData.target);
              const actualY = valueToY(yearData.actual);

              return (
                <g key={yearData.year}>
                  {/* Target bar */}
                  <rect
                    x={x}
                    y={targetY}
                    width={barWidth}
                    height={targetHeight}
                    fill="#6B7280"
                    rx="2"
                  />
                  {/* Actual bar */}
                  <rect
                    x={x + barWidth + barGap}
                    y={actualY}
                    width={barWidth}
                    height={actualHeight}
                    fill="#5EEAD4"
                    rx="2"
                  />
                  {/* Year label */}
                  <text
                    x={x + barWidth}
                    y={chartHeight + 25}
                    textAnchor="middle"
                    className="fill-gray-400 text-sm"
                  >
                    {yearData.year}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Unit label if provided */}
        {config.unit && (
          <div className="text-center mt-2">
            <span className="text-xs text-gray-400">Values in {config.unit}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}