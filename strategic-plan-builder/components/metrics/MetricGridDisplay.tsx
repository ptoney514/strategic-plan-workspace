'use client';

import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, Plus, LayoutGrid, Loader2 } from 'lucide-react';
import { Metric } from '@/lib/types';
import { MetricCardCompact } from './MetricCardCompact';
import { MetricCardStandard } from './MetricCardStandard';
import { MetricBuilderWizard } from './MetricBuilderWizard';
import { toast } from 'sonner';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  rectSortingStrategy
} from '@dnd-kit/sortable';
import { cn } from '@/lib/utils';

interface MetricGridDisplayProps {
  metrics: Metric[];
  goalId: string;
  districtSlug: string;
  onRefresh: () => void;
  onEdit?: (metric: Metric) => void;
  maxRows?: number;
  editable?: boolean;
}

// Helper to determine default width based on visualization type
function getDefaultWidth(metric: Metric): 'quarter' | 'third' | 'half' | 'full' {
  // Use explicit width if set
  if (metric.display_width) {
    return metric.display_width as 'quarter' | 'third' | 'half' | 'full';
  }

  // Smart defaults based on visualization type
  if (metric.visualization_type === 'percentage') return 'third';
  if (metric.visualization_type === 'number') return 'third';
  if (metric.visualization_type === 'status') return 'third';
  if (metric.visualization_type === 'performance-trend') return 'full';
  if (metric.visualization_type === 'bar-chart') return 'half';
  if (metric.visualization_type === 'line-chart') return 'half';
  if (metric.visualization_type === 'donut-chart') return 'half';
  
  // Default for standard metrics
  return 'half';
}

export function MetricGridDisplay({
  metrics = [],
  goalId,
  districtSlug,
  onRefresh,
  onEdit,
  maxRows = 3,
  editable = true
}: MetricGridDisplayProps) {
  const [showAll, setShowAll] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [orderedMetrics, setOrderedMetrics] = useState<Metric[]>(metrics);
  const [showWizard, setShowWizard] = useState(false);
  const [editingMetric, setEditingMetric] = useState<Metric | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingWidths, setEditingWidths] = useState(false);

  // Update ordered metrics when props change
  React.useEffect(() => {
    // Sort by primary first, then by display_order
    const sorted = [...metrics].sort((a, b) => {
      // Primary metrics first
      if (a.is_primary && !b.is_primary) return -1;
      if (!a.is_primary && b.is_primary) return 1;
      
      // Then by display_order
      return (a.display_order || 0) - (b.display_order || 0);
    });
    setOrderedMetrics(sorted);
  }, [metrics]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Helper to convert width string to numeric value for calculations
  const getWidthValue = (width: string): number => {
    switch (width) {
      case 'quarter': return 0.25;
      case 'third': return 0.33;
      case 'half': return 0.5;
      case 'full': return 1;
      default: return 0.5;
    }
  };

  // Calculate how many metric slots fit in the first 3 rows
  const calculateVisibleMetrics = useCallback(() => {
    let rowsUsed = 0;
    let visibleCount = 0;
    let currentRowWidth = 0;

    for (const metric of orderedMetrics) {
      const widthStr = getDefaultWidth(metric);
      const width = getWidthValue(widthStr);
      
      // Check if this metric fits in current row (row = 1.0 width)
      if (currentRowWidth + width > 1) {
        // Start new row
        rowsUsed++;
        currentRowWidth = width;
      } else {
        currentRowWidth += width;
      }

      if (rowsUsed < maxRows) {
        visibleCount++;
      } else {
        break;
      }
    }

    return visibleCount;
  }, [orderedMetrics, maxRows]);

  const visibleMetrics = showAll ? orderedMetrics : orderedMetrics.slice(0, calculateVisibleMetrics());
  const hasMore = orderedMetrics.length > visibleMetrics.length;

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
    setIsDragging(true);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    setIsDragging(false);

    if (over && active.id !== over.id) {
      const oldIndex = orderedMetrics.findIndex(m => m.id === active.id);
      const newIndex = orderedMetrics.findIndex(m => m.id === over.id);
      
      const newOrder = arrayMove(orderedMetrics, oldIndex, newIndex);
      setOrderedMetrics(newOrder);

      // Update display_order in database
      try {
        const updates = newOrder.map((metric, index) => ({
          id: metric.id,
          display_order: index
        }));

        const response = await fetch(`/api/districts/${districtSlug}/metrics/reorder`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ updates })
        });

        if (!response.ok) {
          throw new Error('Failed to save order');
        }

        toast.success('Metric order updated');
        onRefresh();
      } catch (error) {
        console.error('Failed to update order:', error);
        toast.error('Failed to save new order');
        // Revert on error
        setOrderedMetrics(metrics);
      }
    }
  };

  const handleDelete = async (metricId: string) => {
    setDeletingId(metricId);
    try {
      const response = await fetch(`/api/districts/${districtSlug}/metrics?metricId=${metricId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete metric');
      }

      toast.success('Metric deleted');
      onRefresh();
    } catch (error) {
      console.error('Failed to delete metric:', error);
      toast.error('Failed to delete metric');
    } finally {
      setDeletingId(null);
    }
  };

  const handleUpdateWidth = async (metricId: string, width: 'quarter' | 'third' | 'half' | 'full') => {
    try {
      const response = await fetch(`/api/districts/${districtSlug}/metrics`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          metricId, 
          updates: { display_width: width }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update width');
      }

      toast.success('Metric width updated');
      onRefresh();
    } catch (error) {
      console.error('Failed to update width:', error);
      toast.error('Failed to update width');
    }
  };

  const handleEditMetric = (metric: Metric) => {
    setEditingMetric(metric);
    setShowWizard(true);
  };

  const handleSaveMetric = async (metricData: any) => {
    try {
      if (editingMetric) {
        // Update existing metric
        const response = await fetch(`/api/districts/${districtSlug}/metrics`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            metricId: editingMetric.id,
            updates: {
              ...metricData,
              display_width: metricData.display_width || getDefaultWidth(metricData)
            }
          })
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Failed to update metric' }));
          throw new Error(errorData.error || errorData.message || 'Failed to update metric');
        }

        toast.success('Metric updated successfully');
      } else {
        // Add new metric
        const response = await fetch(`/api/districts/${districtSlug}/metrics`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            goalId, 
            metricData: {
              ...metricData,
              display_order: orderedMetrics.length,
              display_width: getDefaultWidth(metricData)
            }
          })
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Failed to add metric' }));
          throw new Error(errorData.error || errorData.message || 'Failed to add metric');
        }

        toast.success('Metric added successfully');
      }
      
      setShowWizard(false);
      setEditingMetric(null);
      onRefresh();
    } catch (error) {
      console.error('Failed to save metric:', error);
      const errorMessage = error instanceof Error ? error.message : (editingMetric ? 'Failed to update metric' : 'Failed to add metric');
      toast.error(errorMessage);
      // Don't close the wizard on error so user can retry
    }
  };

  const activeMetric = orderedMetrics.find(m => m.id === activeId);

  return (
    <div className="space-y-4">
      {/* Header */}
      {editable && (
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setEditingWidths(!editingWidths)}
          >
            <LayoutGrid className="w-4 h-4 mr-1" />
            {editingWidths ? 'Done' : 'Adjust Widths'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setEditingMetric(null);
              setShowWizard(true);
            }}
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Metric
          </Button>
        </div>
      )}

      {/* Metrics Grid */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={visibleMetrics.map(m => m.id)}
          strategy={rectSortingStrategy}
        >
          <div className="grid grid-cols-12 gap-3">
            {visibleMetrics.map((metric) => {
              const width = getDefaultWidth(metric);
              const isDeleting = deletingId === metric.id;
              
              return (
                <div
                  key={metric.id}
                  className={cn(
                    "relative",
                    (width === 'third' || width === 'quarter') && "col-span-12 sm:col-span-6 lg:col-span-4",
                    width === 'half' && "col-span-12 lg:col-span-6",
                    width === 'full' && "col-span-12",
                    isDeleting && "opacity-50 pointer-events-none"
                  )}
                >
                  {/* Width selector (when in edit mode) */}
                  {editingWidths && editable && (
                    <div className="absolute -top-8 left-0 flex gap-1 z-10">
                      {[
                        { value: 'third', label: '1/3' },
                        { value: 'half', label: '1/2' },
                        { value: 'full', label: 'Full' }
                      ].map(({ value, label }) => (
                        <Button
                          key={value}
                          size="sm"
                          variant={width === value ? "default" : "outline"}
                          className="h-6 px-2 text-xs"
                          onClick={() => handleUpdateWidth(metric.id, value as 'quarter' | 'third' | 'half' | 'full')}
                        >
                          {label}
                        </Button>
                      ))}
                    </div>
                  )}

                  {/* Render appropriate card based on width */}
                  {(width === 'third' || width === 'quarter') ? (
                    <MetricCardCompact
                      metric={metric}
                      onEdit={() => handleEditMetric(metric)}
                      onDelete={() => handleDelete(metric.id)}
                      isDragging={isDragging && activeId === metric.id}
                    />
                  ) : (
                    <MetricCardStandard
                      metric={metric}
                      width={width}
                      onEdit={() => handleEditMetric(metric)}
                      onDelete={() => handleDelete(metric.id)}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </SortableContext>

        <DragOverlay>
          {activeId && activeMetric ? (
            <div className={cn(
              "shadow-xl",
              (getDefaultWidth(activeMetric) === 'third' || getDefaultWidth(activeMetric) === 'quarter') && "w-64",
              getDefaultWidth(activeMetric) === 'half' && "w-96",
              getDefaultWidth(activeMetric) === 'full' && "w-full max-w-3xl"
            )}>
              {(getDefaultWidth(activeMetric) === 'third' || getDefaultWidth(activeMetric) === 'quarter') ? (
                <MetricCardCompact
                  metric={activeMetric}
                  onEdit={() => {}}
                  onDelete={() => {}}
                  isDragging
                />
              ) : (
                <MetricCardStandard
                  metric={activeMetric}
                  width={getDefaultWidth(activeMetric)}
                  onEdit={() => {}}
                  onDelete={() => {}}
                />
              )}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Show More/Less Button */}
      {hasMore && (
        <div className="flex justify-center pt-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAll(!showAll)}
            className="text-gray-600"
          >
            {showAll ? (
              <>
                <ChevronUp className="w-4 h-4 mr-1" />
                Show Less
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4 mr-1" />
                Show All Metrics ({orderedMetrics.length - visibleMetrics.length} more)
              </>
            )}
          </Button>
        </div>
      )}

      {/* Empty State */}
      {orderedMetrics.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <p className="text-gray-500 mb-4">No metrics defined for this goal</p>
          {editable && (
            <Button onClick={() => setShowWizard(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add First Metric
            </Button>
          )}
        </div>
      )}

      {/* Metric Builder Wizard */}
      <MetricBuilderWizard
        isOpen={showWizard}
        onClose={() => {
          setShowWizard(false);
          setEditingMetric(null);
        }}
        onSave={handleSaveMetric}
        goalId={goalId}
        goalNumber=""
        existingMetric={editingMetric}
      />
    </div>
  );
}