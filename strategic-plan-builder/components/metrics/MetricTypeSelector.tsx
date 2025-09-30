'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { visualizationOptions, VisualizationType } from '@/lib/metric-visualizations';
import { Check } from 'lucide-react';

interface MetricTypeSelectorProps {
  selectedType?: VisualizationType;
  onSelect: (type: VisualizationType) => void;
}

export function MetricTypeSelector({ selectedType, onSelect }: MetricTypeSelectorProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Choose a Visualization Type</h3>
        <p className="text-sm text-gray-600">
          Select how you want to display your metric data
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {visualizationOptions.map((option) => {
          const Icon = option.icon;
          const isSelected = selectedType === option.id;

          return (
            <Card
              key={option.id}
              className={cn(
                "relative cursor-pointer transition-all hover:shadow-lg",
                "border-2",
                isSelected 
                  ? "border-blue-500 bg-blue-50" 
                  : "border-gray-200 hover:border-gray-300"
              )}
              onClick={() => onSelect(option.id)}
            >
              {/* Selection indicator */}
              {isSelected && (
                <div className="absolute top-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <Check className="w-4 h-4 text-white" />
                </div>
              )}

              <div className="p-4 space-y-3">
                {/* Icon */}
                <div className={cn(
                  "w-12 h-12 rounded-lg flex items-center justify-center",
                  isSelected ? "bg-blue-100" : "bg-gray-100"
                )}>
                  <Icon className={cn(
                    "w-6 h-6",
                    isSelected ? "text-blue-600" : "text-gray-600"
                  )} />
                </div>

                {/* Name */}
                <h4 className={cn(
                  "font-medium text-sm",
                  isSelected ? "text-blue-900" : "text-gray-900"
                )}>
                  {option.name}
                </h4>

                {/* Description */}
                <p className="text-xs text-gray-500 line-clamp-2">
                  {option.description}
                </p>

                {/* Visual Preview Placeholder */}
                <div className="pt-2 border-t">
                  <div className="h-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded flex items-center justify-center">
                    <span className="text-[10px] text-gray-400">Preview</span>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}