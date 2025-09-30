'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
  Eye,
  Search,
  ChevronRight,
  ChevronDown,
  Plus
} from 'lucide-react';
import { GoalWithMetrics } from '@/lib/types';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useDeleteGoal, useCreateGoal } from '@/hooks/use-district';

interface GoalsTableUIProps {
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
    
    result.push({
      ...goal,
      parentTitle: parent?.title || null,
      parentNumber: parent?.goal_number || null,
      hasChildren,
      isExpanded,
      metricsCount: goal.metrics?.length || 0,
      status: calculateStatus(goal),
    });
    
    if (hasChildren && isExpanded) {
      result.push(...flattenGoals(goal.children, expandedGoals, goal));
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

// Removed icon function - no longer needed for cleaner design

function getStatusBadge(status: string) {
  const statusConfig = {
    'achieved': { label: 'Achieved', className: 'bg-green-50 text-green-700 border-green-200' },
    'on-target': { label: 'On Target', className: 'bg-blue-50 text-blue-700 border-blue-200' },
    'needs-attention': { label: 'Needs Attention', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  };
  
  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig['on-target'];
  
  return (
    <Badge className={cn('font-medium border', config.className)}>
      <span className="mr-1.5 inline-block w-1.5 h-1.5 rounded-full bg-current opacity-60" />
      {config.label}
    </Badge>
  );
}

export default function GoalsTableUI({
  goals,
  selectedGoals,
  onGoalSelect,
  districtSlug,
  onRefresh
}: GoalsTableUIProps) {
  const deleteGoalMutation = useDeleteGoal(districtSlug);
  const createGoalMutation = useCreateGoal(districtSlug);
  
  const [sortField, setSortField] = useState<'goal_number' | 'title'>('goal_number');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [expandedGoals, setExpandedGoals] = useState<Set<string>>(() => {
    const initialExpanded = new Set<string>();
    goals.forEach(goal => {
      if (goal.level === 0) {
        initialExpanded.add(goal.id);
      }
    });
    return initialExpanded;
  });
  
  const toggleExpanded = useCallback((goalId: string) => {
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
  
  const expandAll = useCallback(() => {
    const allGoalIds = new Set<string>();
    const collectIds = (goalList: GoalWithMetrics[]) => {
      goalList.forEach(goal => {
        if (goal.children && goal.children.length > 0) {
          allGoalIds.add(goal.id);
          collectIds(goal.children);
        }
      });
    };
    collectIds(goals);
    setExpandedGoals(allGoalIds);
  }, [goals]);
  
  const collapseAll = useCallback(() => {
    setExpandedGoals(new Set());
  }, []);
  
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
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  const flatGoals = useMemo(() => {
    let filtered = flattenGoals(goals, expandedGoals);
    
    if (searchQuery) {
      filtered = filtered.filter(goal => 
        goal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        goal.goal_number.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    filtered.sort((a, b) => {
      let comparison = 0;
      if (sortField === 'goal_number') {
        comparison = a.goal_number.localeCompare(b.goal_number, undefined, { numeric: true });
      } else if (sortField === 'title') {
        comparison = a.title.localeCompare(b.title);
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });
    
    return filtered;
  }, [goals, expandedGoals, searchQuery, sortField, sortDirection]);
  
  return (
    <div className="w-full bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Strategic Goals</h2>
            <p className="text-sm text-gray-500 mt-1">
              Manage your district's strategic objectives and goals
            </p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={expandAll}>
                Expand All
              </DropdownMenuItem>
              <DropdownMenuItem onClick={collapseAll}>
                Collapse All
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      {/* Toolbar */}
      <div className="px-6 py-3 border-b border-gray-200 bg-gray-50/50">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search goals..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 bg-white border-gray-200"
              />
            </div>
            
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={expandAll}
                className="h-9 px-2"
                title="Expand all"
              >
                <ChevronDown className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={collapseAll}
                className="h-9 px-2"
                title="Collapse all"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <Button
            onClick={handleAddStrategicObjective}
            size="sm"
            className="h-9 bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Strategic Objective
          </Button>
        </div>
      </div>
      
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <tbody className="">
            {flatGoals.map((goal, index) => (
              <tr 
                key={goal.id} 
                className={goal.level === 0 
                  ? "border-b border-gray-100 bg-white cursor-pointer" 
                  : "border-b border-gray-100 bg-gray-50/40"
                }
                onClick={() => goal.hasChildren && toggleExpanded(goal.id)}
              >
                <td className="w-12 px-3 py-4">
                  {goal.hasChildren ? (
                    <button
                      className="p-1 hover:bg-gray-200 rounded transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleExpanded(goal.id);
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
                <td className="px-3 py-4 whitespace-nowrap">
                  <span className={cn(
                    "font-semibold",
                    goal.level === 0 && "text-blue-600 text-base",
                    goal.level === 1 && "text-gray-700 text-sm",
                    goal.level === 2 && "text-gray-600 text-sm"
                  )}>
                    {goal.goal_number}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={cn(
                    "font-medium",
                    goal.level === 0 && "text-gray-900 text-base",
                    goal.level === 1 && "text-gray-800 text-sm pl-4",
                    goal.level === 2 && "text-gray-700 text-sm pl-8"
                  )}>
                    {goal.title}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(goal.status)}
                </td>
                <td className="px-6 py-4 text-center">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => onGoalSelect(goal.id)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => {
                        toast.info('View functionality coming soon!');
                      }}>
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => {
                        toast.info('Archive functionality coming soon!');
                      }}>
                        <Archive className="mr-2 h-4 w-4" />
                        Archive
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => {
                          if (confirm('Are you sure you want to delete this goal?')) {
                            deleteGoalMutation.mutate(goal.id);
                          }
                        }}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Footer */}
      <div className="px-6 py-3 border-t border-gray-200 bg-gray-50/50">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Showing {flatGoals.length} of {goals.length} goals
          </p>
        </div>
      </div>
    </div>
  );
}