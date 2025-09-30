'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PerformanceTrendProps {
  name: string;
  description?: string;
  data: {
    years: Array<{
      year: number;
      target: number;
      actual: number | null;
      projected?: number;
    }>;
    unit?: string;
    frequency?: 'annual' | 'quarterly' | 'monthly';
    yAxisMin?: number;
    yAxisMax?: number;
  };
  displayWidth?: 'quarter' | 'third' | 'half' | 'full';
}

export function PerformanceTrend({ name, description, data, displayWidth = 'full' }: PerformanceTrendProps) {
  // Calculate trend
  const actualValues = data.years.filter(y => y.actual !== null);
  const trend = actualValues.length >= 2
    ? actualValues[actualValues.length - 1].actual! - actualValues[actualValues.length - 2].actual!
    : 0;

  // Get current performance
  const currentYear = actualValues[actualValues.length - 1];
  const performance = currentYear?.actual && currentYear?.target
    ? ((currentYear.actual / currentYear.target) * 100).toFixed(1)
    : 0;

  const widthClasses = {
    quarter: 'col-span-3',
    third: 'col-span-4',
    half: 'col-span-6',
    full: 'col-span-12'
  };

  const formatValue = (value: number) => {
    if (data.unit === '%') return `${value}%`;
    if (data.unit === '$') return `$${value.toLocaleString()}`;
    return `${value.toLocaleString()}${data.unit ? ` ${data.unit}` : ''}`;
  };

  return (
    <Card className={cn(widthClasses[displayWidth], "shadow-lg")}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-semibold">{name}</CardTitle>
            {description && <CardDescription className="mt-1">{description}</CardDescription>}
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1">
              {trend > 0 ? (
                <TrendingUp className="h-4 w-4 text-green-500" />
              ) : trend < 0 ? (
                <TrendingDown className="h-4 w-4 text-red-500" />
              ) : (
                <Minus className="h-4 w-4 text-gray-500" />
              )}
              <span className={cn(
                "text-sm font-medium",
                trend > 0 ? "text-green-600" : trend < 0 ? "text-red-600" : "text-gray-600"
              )}>
                {trend > 0 ? '+' : ''}{formatValue(Math.abs(trend))}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {performance}% of target
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data.years} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey="year" 
              className="text-xs"
              tick={{ fill: 'currentColor' }}
            />
            <YAxis 
              domain={[data.yAxisMin ?? 'dataMin', data.yAxisMax ?? 'dataMax']}
              className="text-xs"
              tick={{ fill: 'currentColor' }}
              tickFormatter={(value) => formatValue(value)}
            />
            <Tooltip 
              formatter={(value: any) => formatValue(value)}
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px'
              }}
            />
            <Legend 
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="line"
            />
            
            {/* Target line */}
            <Line
              type="monotone"
              dataKey="target"
              stroke="hsl(var(--muted-foreground))"
              strokeWidth={2}
              strokeDasharray="5 5"
              name="Target"
              dot={{ r: 3 }}
            />
            
            {/* Actual line */}
            <Line
              type="monotone"
              dataKey="actual"
              stroke="hsl(var(--primary))"
              strokeWidth={3}
              name="Actual"
              dot={{ r: 4, fill: 'hsl(var(--primary))' }}
              connectNulls
            />
            
            {/* Projected line if exists */}
            {data.years.some(y => y.projected) && (
              <Line
                type="monotone"
                dataKey="projected"
                stroke="hsl(var(--destructive))"
                strokeWidth={2}
                strokeDasharray="3 3"
                name="Projected"
                dot={{ r: 3 }}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
        
        {/* Summary Stats */}
        <div className="mt-4 grid grid-cols-3 gap-4 pt-4 border-t">
          <div>
            <p className="text-xs text-muted-foreground">Current</p>
            <p className="text-lg font-semibold">
              {currentYear?.actual ? formatValue(currentYear.actual) : 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Target</p>
            <p className="text-lg font-semibold">
              {currentYear?.target ? formatValue(currentYear.target) : 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Frequency</p>
            <p className="text-lg font-semibold capitalize">
              {data.frequency || 'Annual'}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}