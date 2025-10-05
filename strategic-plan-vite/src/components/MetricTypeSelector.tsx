import React from 'react';
import { visualizationOptions, type VisualizationType } from '../lib/metric-visualizations';
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
        <p className="text-sm text-muted-foreground">
          Select how you want to display your metric data
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {visualizationOptions.map((option) => {
          const Icon = option.icon;
          const isSelected = selectedType === option.id;

          return (
            <div
              key={option.id}
              className={`
                relative cursor-pointer transition-all hover:shadow-lg
                border-2 rounded-lg
                ${isSelected
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-border hover:border-gray-300'}
              `}
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
                <div className={`
                  w-12 h-12 rounded-lg flex items-center justify-center
                  ${isSelected ? 'bg-blue-100' : 'bg-muted'}
                `}>
                  <Icon className={`
                    w-6 h-6
                    ${isSelected ? 'text-blue-600' : 'text-muted-foreground'}
                  `} />
                </div>

                {/* Name */}
                <h4 className={`
                  font-medium text-sm
                  ${isSelected ? 'text-blue-900' : 'text-foreground'}
                `}>
                  {option.name}
                </h4>

                {/* Description */}
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {option.description}
                </p>

                {/* Visual Preview Placeholder */}
                <div className="pt-2 border-t border-border">
                  <div className="h-16 bg-gradient-to-br from-muted/50 to-muted rounded flex items-center justify-center">
                    <span className="text-[10px] text-muted-foreground">Preview</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
