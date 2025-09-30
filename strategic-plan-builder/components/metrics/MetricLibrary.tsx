'use client';

import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { Card } from '@/components/ui/card';
import { 
  BarChart3, 
  Percent, 
  Star, 
  FileText, 
  TrendingUp,
  Users,
  Target,
  Activity,
  GripVertical
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Metric template types
export interface MetricTemplate {
  id: string;
  type: 'survey' | 'percentage' | 'classification' | 'number' | 'narrative';
  title: string;
  description: string;
  icon: React.ReactNode;
  defaultConfig: any;
}

// Available metric templates
export const metricTemplates: MetricTemplate[] = [
  {
    id: 'survey-rating',
    type: 'survey',
    title: 'Survey Rating',
    description: 'Collect ratings on a 1-5 scale',
    icon: <Star className="h-5 w-5" />,
    defaultConfig: {
      maxValue: 5,
      suffix: 'Overall average rating'
    }
  },
  {
    id: 'percentage-metric',
    type: 'percentage',
    title: 'Percentage',
    description: 'Track percentage-based metrics',
    icon: <Percent className="h-5 w-5" />,
    defaultConfig: {
      target: 100,
      suffix: '% meeting expectations'
    }
  },
  {
    id: 'classification',
    type: 'classification',
    title: 'Classification',
    description: 'Categorize into multiple groups',
    icon: <BarChart3 className="h-5 w-5" />,
    defaultConfig: {
      categories: [
        { label: 'Excellent', value: 0 },
        { label: 'Good', value: 0 },
        { label: 'Needs Improvement', value: 0 }
      ]
    }
  },
  {
    id: 'progress-number',
    type: 'number',
    title: 'Progress Number',
    description: 'Track a single numeric value',
    icon: <TrendingUp className="h-5 w-5" />,
    defaultConfig: {
      unit: '',
      target: 100
    }
  },
  {
    id: 'narrative-update',
    type: 'narrative',
    title: 'Narrative Update',
    description: 'Text-based progress updates',
    icon: <FileText className="h-5 w-5" />,
    defaultConfig: {
      updateFrequency: 'monthly'
    }
  }
];

interface DraggableMetricTemplateProps {
  template: MetricTemplate;
}

function DraggableMetricTemplate({ template }: DraggableMetricTemplateProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: template.id,
    data: template
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "cursor-move transition-all",
        isDragging && "opacity-50 z-50"
      )}
    >
      <Card 
        className={cn(
          "p-4 hover:shadow-md transition-all border-2",
          isDragging ? "border-blue-500 shadow-lg" : "border-transparent"
        )}
      >
        <div className="flex items-start gap-3">
          <div 
            {...listeners}
            {...attributes}
            className="mt-1 text-gray-400 hover:text-gray-600"
          >
            <GripVertical className="h-4 w-4" />
          </div>
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <div className="text-blue-600">
                {template.icon}
              </div>
              <h4 className="font-medium text-sm">{template.title}</h4>
            </div>
            <p className="text-xs text-gray-500">{template.description}</p>
          </div>
        </div>
      </Card>
    </div>
  );
}

interface MetricLibraryProps {
  className?: string;
}

export function MetricLibrary({ className }: MetricLibraryProps) {
  return (
    <div className={cn("space-y-4", className)}>
      <div className="sticky top-0 bg-white z-10 pb-2">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Metric Library
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          Drag metrics to goals to track progress
        </p>
      </div>
      
      <div className="space-y-3">
        {metricTemplates.map((template) => (
          <DraggableMetricTemplate key={template.id} template={template} />
        ))}
      </div>

      {/* Instructions */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h4 className="text-sm font-medium text-blue-900 mb-2">How to use:</h4>
        <ol className="text-xs text-blue-700 space-y-1">
          <li>1. Drag a metric type from above</li>
          <li>2. Drop it onto a goal or sub-goal</li>
          <li>3. Configure the metric details</li>
          <li>4. Track progress over time</li>
        </ol>
      </div>
    </div>
  );
}