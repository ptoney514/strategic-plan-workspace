'use client';

import React, { useState } from 'react';
import { DndContext, DragEndEvent, DragOverlay, useSensor, useSensors, PointerSensor } from '@dnd-kit/core';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronRight, ChevronDown, Plus, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Goal, Metric } from '@/lib/types';
import { GoalWithDropZone } from './GoalWithDropZone';

interface StrategicObjectiveContainerProps {
  objective: Goal;
  children?: React.ReactNode;
  onAddMetric?: (goalId: string, metricType: string) => void;
  onRemoveMetric?: (goalId: string, metricId: string) => void;
  onEditMetric?: (goalId: string, metricId: string) => void;
  isEditable?: boolean;
}

export function StrategicObjectiveContainer({
  objective,
  children,
  onAddMetric,
  onRemoveMetric,
  onEditMetric,
  isEditable = false
}: StrategicObjectiveContainerProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);

  // Calculate overall status from child goals
  const calculateOverallStatus = () => {
    if (!objective.children || objective.children.length === 0) {
      return 'not-started';
    }

    const statuses = objective.children.map(child => {
      // Calculate status based on child's metrics
      if (!child.metrics || child.metrics.length === 0) return 'not-started';
      
      // Simple logic: if all metrics are on target, goal is on target
      const onTargetCount = child.metrics.filter(m => 
        m.current_value && m.target_value && 
        (m.current_value / m.target_value) >= 0.95
      ).length;
      
      const ratio = onTargetCount / child.metrics.length;
      if (ratio >= 0.8) return 'on-target';
      if (ratio >= 0.5) return 'near-target';
      if (ratio >= 0.25) return 'off-target';
      return 'at-risk';
    });

    // Aggregate statuses
    if (statuses.every(s => s === 'on-target')) return 'on-target';
    if (statuses.some(s => s === 'at-risk')) return 'at-risk';
    if (statuses.some(s => s === 'off-target')) return 'off-target';
    if (statuses.some(s => s === 'near-target')) return 'near-target';
    return 'on-target';
  };

  const getStatusBadge = (status: string) => {
    const configs = {
      'on-target': { 
        label: 'On Target',
        className: 'bg-green-100 text-green-800 border-green-200'
      },
      'near-target': { 
        label: 'Near Target',
        className: 'bg-yellow-100 text-yellow-800 border-yellow-200'
      },
      'off-target': { 
        label: 'Off Target',
        className: 'bg-orange-100 text-orange-800 border-orange-200'
      },
      'at-risk': { 
        label: 'At Risk',
        className: 'bg-red-100 text-red-800 border-red-200'
      },
      'not-started': {
        label: 'Not Started',
        className: 'bg-gray-100 text-gray-800 border-gray-200'
      }
    };
    
    const config = configs[status] || configs['not-started'];
    return (
      <Badge className={cn('border', config.className)}>
        {config.label}
      </Badge>
    );
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && over.data.current?.isDropZone) {
      const goalId = over.data.current.goalId;
      const metricType = active.data.current?.type;
      
      if (goalId && metricType && onAddMetric) {
        onAddMetric(goalId, metricType);
      }
    }
    
    setActiveId(null);
  };

  const overallStatus = calculateOverallStatus();

  return (
    <DndContext 
      sensors={sensors}
      onDragStart={(event) => setActiveId(event.active.id as string)}
      onDragEnd={handleDragEnd}
    >
      <div className="bg-slate-900 rounded-lg p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-0 h-8 w-8 text-white hover:bg-slate-800"
            >
              {isExpanded ? 
                <ChevronDown className="h-5 w-5" /> : 
                <ChevronRight className="h-5 w-5" />
              }
            </Button>
            
            <div className="flex items-center gap-3">
              <span className="text-3xl font-bold text-white">
                {objective.goal_number}
              </span>
              <h2 className="text-2xl font-semibold text-white">
                {objective.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {getStatusBadge(overallStatus)}
            {isEditable && (
              <Button
                size="sm"
                variant="ghost"
                className="text-gray-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Description if exists */}
        {objective.description && (
          <p className="text-gray-400 text-sm ml-12">
            {objective.description}
          </p>
        )}

        {/* Child Goals with Metrics */}
        {isExpanded && objective.children && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
            {objective.children.map((childGoal) => (
              <GoalWithDropZone
                key={childGoal.id}
                goal={childGoal}
                onAddMetric={onAddMetric}
                onRemoveMetric={onRemoveMetric}
                onEditMetric={onEditMetric}
                isEditable={isEditable}
              />
            ))}
            
            {/* Add Goal Button */}
            {isEditable && (
              <Card className="border-2 border-dashed border-slate-600 bg-slate-800/50 flex items-center justify-center min-h-[200px] hover:bg-slate-800/70 transition-colors cursor-pointer">
                <Button
                  variant="ghost"
                  className="flex flex-col items-center gap-2 text-gray-400 hover:text-white"
                >
                  <Plus className="h-8 w-8" />
                  <span>Add Goal</span>
                </Button>
              </Card>
            )}
          </div>
        )}
      </div>

      {/* Drag Overlay */}
      <DragOverlay>
        {activeId ? (
          <div className="bg-white shadow-lg rounded-lg p-4 opacity-80">
            <p className="text-sm font-medium">Dragging metric...</p>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}