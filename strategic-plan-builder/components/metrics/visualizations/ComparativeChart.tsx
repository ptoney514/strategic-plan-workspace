'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { ComparativeConfig } from '@/lib/metric-visualizations';
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ComparativeChartProps {
  config: ComparativeConfig;
  className?: string;
}

export function ComparativeChart({ config, className }: ComparativeChartProps) {
  const {
    entities,
    metricName,
    showDifference = true,
    sortOrder = 'none',
    comparisonType = 'value'
  } = config;

  const sortedEntities = React.useMemo(() => {
    if (sortOrder === 'none') return entities;
    
    return [...entities].sort((a, b) => {
      if (sortOrder === 'asc') return a.value - b.value;
      return b.value - a.value;
    });
  }, [entities, sortOrder]);

  const maxValue = Math.max(...entities.map(e => Math.max(e.value, e.target || 0)));

  const getDifferenceIndicator = (value: number, target?: number) => {
    if (!target || !showDifference) return null;
    
    const diff = value - target;
    const percentDiff = ((diff / target) * 100).toFixed(1);
    
    if (diff > 0) {
      return (
        <span className="flex items-center text-green-600 text-sm">
          <ArrowUp className="w-3 h-3 mr-1" />
          +{percentDiff}%
        </span>
      );
    } else if (diff < 0) {
      return (
        <span className="flex items-center text-red-600 text-sm">
          <ArrowDown className="w-3 h-3 mr-1" />
          {percentDiff}%
        </span>
      );
    }
    return (
      <span className="flex items-center text-gray-500 text-sm">
        <Minus className="w-3 h-3 mr-1" />
        0%
      </span>
    );
  };

  const getBarColor = (entity: typeof entities[0]) => {
    if (entity.color) return entity.color;
    if (!entity.target) return '#3b82f6';
    
    const performance = (entity.value / entity.target) * 100;
    if (performance >= 100) return '#22c55e';
    if (performance >= 80) return '#eab308';
    return '#ef4444';
  };

  return (
    <Card className={cn("p-6", className)}>
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">{metricName}</h3>
          {comparisonType === 'percentage' && (
            <p className="text-sm text-gray-500">Showing percentage of target</p>
          )}
          {comparisonType === 'rank' && (
            <p className="text-sm text-gray-500">Ranked by performance</p>
          )}
        </div>

        <div className="space-y-3">
          {sortedEntities.map((entity, index) => {
            const barWidth = (entity.value / maxValue) * 100;
            const targetPosition = entity.target ? (entity.target / maxValue) * 100 : null;

            return (
              <div key={entity.name} className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    {comparisonType === 'rank' && (
                      <span className="text-lg font-bold text-gray-400">
                        #{index + 1}
                      </span>
                    )}
                    <span className="font-medium">{entity.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold">
                      {comparisonType === 'percentage' && entity.target
                        ? `${((entity.value / entity.target) * 100).toFixed(1)}%`
                        : entity.value}
                    </span>
                    {getDifferenceIndicator(entity.value, entity.target)}
                  </div>
                </div>

                <div className="relative h-8 bg-gray-100 rounded-lg overflow-hidden">
                  <div
                    className="absolute inset-y-0 left-0 transition-all duration-500 rounded-lg"
                    style={{
                      width: `${barWidth}%`,
                      backgroundColor: getBarColor(entity)
                    }}
                  />
                  
                  {targetPosition !== null && (
                    <div
                      className="absolute inset-y-0 w-0.5 bg-gray-800 opacity-50"
                      style={{ left: `${targetPosition}%` }}
                    >
                      <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 text-xs text-gray-600 whitespace-nowrap">
                        Target: {entity.target}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {entities.some(e => e.target) && (
          <div className="flex items-center gap-4 text-xs text-gray-500 pt-2 border-t">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-500 rounded" />
              <span>Above target</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-yellow-500 rounded" />
              <span>Near target</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-red-500 rounded" />
              <span>Below target</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}