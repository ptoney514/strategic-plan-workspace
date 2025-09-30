'use client';

import React, { useState, useMemo, useCallback, Fragment } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  MoreHorizontal,
  ArrowUpDown,
  Archive,
  Trash2,
  Edit,
  Edit2,
  Eye,
  ChevronRight,
  ChevronDown,
  Plus,
  BarChart3,
  Layers
} from 'lucide-react';
import { GoalWithMetrics } from '@/lib/types';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useDeleteGoal, useCreateGoal } from '@/hooks/use-district';
import ExpandedObjectiveView from './ExpandedObjectiveView';
import SubGoalEdit from './SubGoalEdit';
import StrategicObjectiveEdit from '@/components/StrategicObjectiveEdit';

interface GoalsTableResponsiveProps {
  goals: GoalWithMetrics[];
  selectedGoals: Set<string>;
  onGoalSelect: (goalId: string) => void;
  districtSlug: string;
  onRefresh?: () => void;
}

function flattenGoals(
  goals: GoalWithMetrics[], 
  expandedGoals: Set<string>,
  parent?: GoalWithMetrics
): any[] {
  const result: any[] = [];
  
  goals.forEach(goal => {
    const hasChildren = goal.children && goal.children.length > 0;
    const isExpanded = expandedGoals.has(goal.id);
    
    // Include the goal itself
    result.push({
      ...goal,
      parentTitle: parent?.title || null,
      parentNumber: parent?.goal_number || null,
      hasChildren,
      isExpanded,
      metricsCount: goal.metrics?.length || 0,
      status: calculateStatus(goal),
    });
    
    // If this goal is expanded and has children, include them too
    if (isExpanded && goal.children && goal.children.length > 0) {
      goal.children.forEach(child => {
        const childHasChildren = child.children && child.children.length > 0;
        const childIsExpanded = expandedGoals.has(child.id);
        
        result.push({
          ...child,
          parentTitle: goal.title,
          parentNumber: goal.goal_number,
          hasChildren: childHasChildren,
          isExpanded: childIsExpanded,
          metricsCount: child.metrics?.length || 0,
          status: calculateStatus(child),
        });
        
        // If sub-goal is expanded and has children, include them too
        if (childIsExpanded && child.children && child.children.length > 0) {
          child.children.forEach(subChild => {
            result.push({
              ...subChild,
              parentTitle: child.title,
              parentNumber: child.goal_number,
              hasChildren: false,
              isExpanded: false,
              metricsCount: subChild.metrics?.length || 0,
              status: calculateStatus(subChild),
            });
          });
        }
      });
    }
  });
  
  return result;
}

function calculateStatus(goal: GoalWithMetrics): 'on-target' | 'achieved' | 'needs-attention' {
  if (!goal.metrics || goal.metrics.length === 0) return 'on-target';
  
  const progressValues = goal.metrics
    .filter(m => m.current_value !== null && m.target_value !== null)
    .map(m => (m.current_value! / m.target_value!) * 100);
  
  if (progressValues.length === 0) return 'on-target';
  
  const avgProgress = Math.round(
    progressValues.reduce((sum, val) => sum + val, 0) / progressValues.length
  );
  
  if (avgProgress >= 100) return 'achieved';
  if (avgProgress < 50) return 'needs-attention';
  return 'on-target';
}

// Icon function removed - no longer needed for cleaner design

function getLevelLabel(level: number): string {
  if (level === 0) return 'Strategic Objective';
  if (level === 1) return 'Goal';
  return 'Sub-goal';
}

function getStatusBadge(status: string) {
  const statusConfig = {
    'achieved': { 
      label: 'Achieved', 
      className: 'bg-green-50 text-green-700 border-green-200',
      dotColor: 'bg-green-500'
    },
    'on-target': { 
      label: 'On Target', 
      className: 'bg-blue-50 text-blue-700 border-blue-200',
      dotColor: 'bg-blue-500'
    },
    'needs-attention': { 
      label: 'Needs Attention', 
      className: 'bg-amber-50 text-amber-700 border-amber-200',
      dotColor: 'bg-amber-500'
    },
  };
  
  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig['on-target'];
  
  return (
    <span className={cn('inline-flex items-center gap-1 px-1.5 py-0.5 text-[11px] font-medium rounded-md border', config.className)}>
      <span className={cn('h-1.5 w-1.5 rounded-full flex-shrink-0', config.dotColor)} />
      {config.label}
    </span>
  );
}

// Mobile Card Component
function GoalCard({ 
  goal, 
  onToggle, 
  onEdit, 
  onDelete,
  onArchive 
}: { 
  goal: any;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onArchive: () => void;
}) {
  // Use white background for objectives (level 0), gray for sub-goals
  const cardBgClass = goal.level === 0 ? "bg-white" : "bg-gray-50";
  
  return (
    <Card className={cn("p-4 mb-3", cardBgClass)}>
      <div className="space-y-3">
        {/* Header Row with Goal Number, Title and Expand */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              {goal.hasChildren && (
                <button
                  onClick={onToggle}
                  className="p-0.5 hover:bg-gray-100 rounded"
                >
                  {goal.isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-gray-500" />
                  )}
                </button>
              )}
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <span className={cn(
                  "font-semibold",
                  goal.level === 0 ? "text-blue-600 font-bold" : "text-gray-700"
                )}>{goal.goal_number}</span>
                <span className={cn(
                  "truncate flex-1",
                  goal.level === 0 ? "text-gray-900 font-semibold" : "text-gray-900"
                )}>{goal.title}</span>
              </div>
            </div>
          </div>
          
          {/* Actions Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onEdit}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Goal
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onArchive}>
                <Archive className="h-4 w-4 mr-2" />
                Archive
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onDelete} className="text-red-600">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        {/* Description for expanded objectives */}
        {goal.description && goal.isExpanded && goal.level === 0 && (
          <div className="pt-2 pb-1 px-2 -mx-2 bg-gray-50 rounded">
            <p className="text-sm text-gray-600">{goal.description}</p>
          </div>
        )}
        
        {/* Status and Metrics Row */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {goal.indicator_text && goal.indicator_color ? (
              <span 
                className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[11px] font-medium rounded-md border"
                style={{
                  backgroundColor: goal.indicator_color + '20',
                  color: goal.indicator_color,
                  borderColor: goal.indicator_color
                }}
              >
                <span className="h-1.5 w-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: goal.indicator_color }} />
                {goal.indicator_text}
              </span>
            ) : (
              getStatusBadge(goal.status)
            )}
            <span className="text-xs text-gray-500">{getLevelLabel(goal.level)}</span>
          </div>
          {goal.metricsCount > 0 && (
            <div className="flex items-center gap-1 text-gray-600">
              <BarChart3 className="h-3.5 w-3.5" />
              <span className="text-xs">{goal.metricsCount} metrics</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

export function GoalsTableResponsive({
  goals,
  selectedGoals,
  onGoalSelect,
  districtSlug,
  onRefresh
}: GoalsTableResponsiveProps) {
  const deleteGoalMutation = useDeleteGoal(districtSlug);
  const createGoalMutation = useCreateGoal(districtSlug);
  
  const [sortField, setSortField] = useState<'goal_number' | 'title'>('goal_number');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  const [expandedGoals, setExpandedGoals] = useState<Set<string>>(new Set());

  const toggleGoal = useCallback((goalId: string) => {
    setExpandedGoals(prev => {
      const newSet = new Set(prev);
      if (newSet.has(goalId)) {
        newSet.delete(goalId);
      } else {
        newSet.add(goalId);
      }
      return newSet;
    });
  }, []);

  const handleDelete = async (goalId: string) => {
    if (!confirm('Are you sure you want to delete this goal and all its sub-goals?')) return;
    
    try {
      await deleteGoalMutation.mutateAsync(goalId);
      toast.success('Goal deleted successfully');
      onRefresh?.();
    } catch (error) {
      toast.error('Failed to delete goal');
    }
  };

  const handleArchive = (goalId: string) => {
    toast.info('Archive functionality coming soon');
  };

  const handleAddStrategicObjective = async () => {
    const title = prompt('Enter title for new Strategic Objective:');
    if (!title) return;
    
    try {
      await createGoalMutation.mutateAsync({
        parentId: null,
        level: 0,
        title
      });
      toast.success('Strategic Objective created successfully');
      onRefresh?.();
    } catch (error) {
      toast.error('Failed to create Strategic Objective');
    }
  };

  const handleSort = (field: 'goal_number' | 'title') => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const flatGoals = useMemo(() => {
    let filtered = flattenGoals(goals, expandedGoals);
    
    filtered.sort((a, b) => {
      let comparison = 0;
      if (sortField === 'goal_number') {
        comparison = a.goal_number.localeCompare(b.goal_number, undefined, { numeric: true });
      } else {
        comparison = a.title.localeCompare(b.title);
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });
    
    return filtered;
  }, [goals, expandedGoals, sortField, sortDirection]);

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex justify-end gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleSort('goal_number')}
          className="flex items-center gap-1"
        >
          <ArrowUpDown className="h-4 w-4" />
          <span className="hidden sm:inline">Sort</span>
        </Button>
        
        <Button
          onClick={handleAddStrategicObjective}
          size="sm"
          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
        >
          <Plus className="h-4 w-4 mr-1" />
          <span className="hidden sm:inline">Add Strategic Objective</span>
          <span className="sm:hidden">Add</span>
        </Button>
      </div>

      {/* Mobile Table View */}
      <div className="sm:hidden rounded-lg border border-gray-300 bg-white overflow-hidden">
        <div className="divide-y divide-gray-200">
          {flatGoals.map((goal) => (
            <React.Fragment key={goal.id}>
              <div 
                className="p-4 bg-white cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => goal.hasChildren && toggleGoal(goal.id)}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-start gap-2 flex-1">
                    {goal.hasChildren && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleGoal(goal.id);
                        }}
                        className="mt-1"
                      >
                        {goal.isExpanded ? (
                          <ChevronDown className="h-4 w-4 text-gray-600" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-gray-600" />
                        )}
                      </button>
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-blue-600 font-bold text-base">
                          {goal.goal_number}
                        </span>
                        <span className="text-gray-900 font-semibold text-base">
                          {goal.title}
                        </span>
                      </div>
                      {goal.description && (
                        <div className="text-sm text-gray-600 mt-0.5 ml-6">
                          {goal.description}
                        </div>
                      )}
                    </div>
                  </div>
                  
                </div>
                
                <div className="flex items-center gap-3">
                  {goal.indicator_text && goal.indicator_color ? (
                    <span 
                      className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[11px] font-medium rounded-md border"
                      style={{
                        backgroundColor: goal.indicator_color + '20',
                        color: goal.indicator_color,
                        borderColor: goal.indicator_color
                      }}
                    >
                      <span className="h-1.5 w-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: goal.indicator_color }} />
                      {goal.indicator_text}
                    </span>
                  ) : (
                    getStatusBadge(goal.status)
                  )}
                  <span className="text-xs text-gray-500">Strategic Objective</span>
                  {goal.metricsCount > 0 && (
                    <div className="flex items-center gap-1 text-gray-600 ml-auto">
                      <BarChart3 className="h-3.5 w-3.5" />
                      <span className="text-xs">{goal.metricsCount} metrics</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Expanded objective view */}
              {goal.isExpanded && (
                <ExpandedObjectiveView
                  goal={goal}
                  districtSlug={districtSlug}
                  onRefresh={onRefresh || (() => {})}
                  onEditSubGoal={onGoalSelect}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden sm:block rounded-lg border border-gray-300 bg-white overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <tbody>
              {flatGoals.map((goal) => {
                // Determine indentation and styling based on level
                const isSubGoal = goal.level > 0;
                const indentClass = goal.level === 1 ? 'pl-8' : goal.level === 2 ? 'pl-16' : '';
                const bgClass = goal.level === 0 ? 'bg-white' : 'bg-gray-50';
                const shouldShowExpandedView = goal.level === 0 && goal.isExpanded;
                
                return (
                  <React.Fragment key={goal.id}>
                    <tr 
                      className={`border-b border-gray-200 ${bgClass} ${goal.hasChildren ? 'cursor-pointer' : ''} hover:bg-gray-100 transition-colors`}
                      onClick={() => goal.hasChildren && toggleGoal(goal.id)}
                    >
                      <td className={`w-12 px-3 py-3 ${indentClass}`}>
                        {goal.hasChildren ? (
                          <button
                            className="p-1 hover:bg-gray-200 rounded transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleGoal(goal.id);
                            }}
                          >
                            {goal.isExpanded ? (
                              <ChevronDown className="h-4 w-4 text-gray-600" />
                            ) : (
                              <ChevronRight className="h-4 w-4 text-gray-600" />
                            )}
                          </button>
                        ) : (
                          <div className="w-6" />
                        )}
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        <span className={`font-bold ${goal.level === 0 ? 'text-blue-600 text-base' : 'text-gray-700 text-sm'}`}>
                          {goal.goal_number}
                        </span>
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <span className={`${goal.level === 0 ? 'text-gray-900 font-semibold text-base' : 'text-gray-800 font-medium text-sm'}`}>
                              {goal.title}
                            </span>
                            {goal.description && (
                              <div className={`text-gray-600 mt-0.5 ${goal.level === 0 ? 'text-sm' : 'text-xs'}`}>
                                {goal.description}
                              </div>
                            )}
                          </div>
                          {/* Edit button for both strategic objectives and sub-goals */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (goal.level === 0) {
                                // For level-0, trigger the edit mode in ExpandedObjectiveView
                                toggleGoal(goal.id);
                              } else {
                                // For sub-goals, toggle the inline edit
                                toggleGoal(goal.id);
                              }
                            }}
                            className="ml-4 text-gray-500 hover:text-gray-700"
                          >
                            <Edit2 className="h-3 w-3 mr-1" />
                            {goal.level === 0 ? 'Edit Strategic Objective' : 'Edit'}
                          </Button>
                        </div>
                      </td>
                      <td className="px-6 py-3 whitespace-nowrap text-right">
                        {goal.indicator_text && goal.indicator_color ? (
                          <span 
                            className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[11px] font-medium rounded-md border"
                            style={{
                              backgroundColor: goal.indicator_color + '20',
                              color: goal.indicator_color,
                              borderColor: goal.indicator_color
                            }}
                          >
                            <span className="h-1.5 w-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: goal.indicator_color }} />
                            {goal.indicator_text}
                          </span>
                        ) : (
                          getStatusBadge(goal.status)
                        )}
                      </td>
                    </tr>
                    {/* Show StrategicObjectiveEdit for expanded level-0 goals */}
                    {shouldShowExpandedView && (
                      <tr className="border-b border-gray-200">
                        <td></td>
                        <td colSpan={3} className="p-0">
                          <StrategicObjectiveEdit
                            goal={goal}
                            districtSlug={districtSlug}
                            onRefresh={onRefresh || (() => {})}
                            onClose={() => toggleGoal(goal.id)}
                          />
                        </td>
                      </tr>
                    )}
                    {/* Show inline edit for expanded sub-goals */}
                    {goal.level > 0 && goal.isExpanded && (
                      <tr className="border-b border-gray-200">
                        <td></td>
                        <td colSpan={3} className="p-0">
                          <SubGoalEdit
                            goal={goal}
                            districtSlug={districtSlug}
                            onRefresh={onRefresh || (() => {})}
                            onClose={() => toggleGoal(goal.id)}
                          />
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Empty State */}
      {flatGoals.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg border">
          <Layers className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No goals found</h3>
          <p className="text-sm text-gray-500 mb-4">
            Get started by creating your first strategic objective
          </p>
          <Button
            onClick={handleAddStrategicObjective}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Strategic Objective
          </Button>
        </div>
      )}
    </div>
  );
}