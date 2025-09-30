'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { DndContext } from '@dnd-kit/core';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MetricLibrary } from '@/components/metrics/MetricLibrary';
import { StrategicObjectiveContainer } from '@/components/metrics/StrategicObjectiveContainer';
import { toast } from 'sonner';
import { Goal, Metric } from '@/lib/types';

// Example data structure matching client's system
const exampleObjective: Goal = {
  id: '1',
  district_id: 'example',
  parent_id: null,
  goal_number: '1',
  title: 'Student Achievement & Well-being',
  description: 'Ensure all students achieve academic success and personal well-being',
  level: 0,
  order_position: 1,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  children: [
    {
      id: '1.1',
      district_id: 'example',
      parent_id: '1',
      goal_number: '1.1',
      title: 'Grow and nurture a district culture that values, supports, and celebrates equity, diversity, and inclusion',
      level: 1,
      order_position: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      metrics: [
        {
          id: 'm1',
          goal_id: '1.1',
          name: 'Culture Survey',
          metric_type: 'rating',
          current_value: 3.74,
          target_value: 5,
          unit: 'rating',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ]
    },
    {
      id: '1.2',
      district_id: 'example',
      parent_id: '1',
      goal_number: '1.2',
      title: 'NDE Academic Classification',
      level: 1,
      order_position: 2,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      metrics: [
        {
          id: 'm2',
          goal_id: '1.2',
          name: 'NDE Academic Classification',
          metric_type: 'rating',
          current_value: 90,
          target_value: 100,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ]
    },
    {
      id: '1.3',
      district_id: 'example',
      parent_id: '1',
      goal_number: '1.3',
      title: 'Average Score of Teachers on the Instructional Framework',
      level: 1,
      order_position: 3,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      metrics: [
        {
          id: 'm3',
          goal_id: '1.3',
          name: 'Teacher Performance',
          metric_type: 'percent',
          current_value: 3.73,
          target_value: 4,
          unit: '%',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ]
    }
  ]
};

export default function MetricsBuilderPage() {
  const params = useParams();
  const router = useRouter();
  const districtSlug = params.slug as string;
  
  const [objective, setObjective] = useState<Goal>(exampleObjective);

  const handleAddMetric = (goalId: string, metricType: string) => {
    toast.success(`Adding ${metricType} metric to goal ${goalId}`);
    
    // In real implementation, this would:
    // 1. Open a configuration dialog
    // 2. Save to database
    // 3. Update the UI
    
    // For demo, we'll just add a placeholder metric
    const newMetric: Metric = {
      id: `m-${Date.now()}`,
      goal_id: goalId,
      name: `New ${metricType} Metric`,
      metric_type: metricType as any,
      current_value: 0,
      target_value: 100,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Update the objective state
    setObjective(prev => ({
      ...prev,
      children: prev.children?.map(child => {
        if (child.id === goalId) {
          return {
            ...child,
            metrics: [...(child.metrics || []), newMetric]
          };
        }
        return child;
      })
    }));
  };

  const handleRemoveMetric = (goalId: string, metricId: string) => {
    toast.success('Metric removed');
    
    setObjective(prev => ({
      ...prev,
      children: prev.children?.map(child => {
        if (child.id === goalId) {
          return {
            ...child,
            metrics: child.metrics?.filter(m => m.id !== metricId)
          };
        }
        return child;
      })
    }));
  };

  const handleEditMetric = (goalId: string, metricId: string) => {
    toast.info(`Edit metric ${metricId} in goal ${goalId}`);
    // In real implementation, open edit dialog
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push(`/districts/${districtSlug}/admin`)}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Admin
              </Button>
              <div className="h-6 w-px bg-gray-300" />
              <div>
                <h1 className="text-lg font-semibold">Metrics Builder</h1>
                <p className="text-sm text-gray-500">Drag and drop metrics to track goals</p>
              </div>
            </div>
            <Button className="gap-2">
              Save Changes
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-12 gap-8">
          {/* Metric Library Sidebar */}
          <div className="col-span-3">
            <div className="sticky top-24 bg-white rounded-lg shadow-sm border p-6">
              <MetricLibrary />
            </div>
          </div>

          {/* Strategic Objectives Area */}
          <div className="col-span-9">
            <StrategicObjectiveContainer
              objective={objective}
              onAddMetric={handleAddMetric}
              onRemoveMetric={handleRemoveMetric}
              onEditMetric={handleEditMetric}
              isEditable={true}
            />

            {/* Instructions */}
            <div className="mt-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                How the new metric system works:
              </h3>
              <ul className="space-y-2 text-sm text-blue-800">
                <li className="flex items-start gap-2">
                  <span className="font-semibold">1.</span>
                  <span>Strategic Objectives are containers - they don't have metrics directly</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold">2.</span>
                  <span>Goals (1.1, 1.2, etc.) are where you attach metrics</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold">3.</span>
                  <span>Drag metric types from the library and drop them on goals</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold">4.</span>
                  <span>Each goal can have multiple metrics of different types</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold">5.</span>
                  <span>The Strategic Objective's status is calculated from all child goals</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}