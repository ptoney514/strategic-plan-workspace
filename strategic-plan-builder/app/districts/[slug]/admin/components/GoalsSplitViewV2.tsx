'use client';

import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  ChevronRight,
  ChevronDown,
  Plus,
  Search,
  Target,
  TrendingUp,
  Calendar,
  User,
  Save,
  X,
  Trash2,
  BarChart3,
  CheckCircle,
  AlertCircle,
  Clock,
  Info,
  FileText,
  Activity,
  Users,
  Briefcase,
  GraduationCap,
  Heart,
  Building
} from 'lucide-react';
import { GoalWithMetrics } from '@/lib/types';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useUpdateGoal, useDeleteGoal, useCreateGoal } from '@/hooks/use-district';
import GoalDetailPanelSimple from './GoalDetailPanelSimple';

interface GoalsSplitViewV2Props {
  goals: GoalWithMetrics[];
  districtSlug: string;
  onRefresh: () => void;
}

// Enhanced status indicators with better colors
const STATUS_CONFIG = {
  'On Track': { 
    color: '#10B981', 
    bgColor: 'bg-emerald-50', 
    textColor: 'text-emerald-700',
    borderColor: 'border-emerald-200',
    icon: CheckCircle 
  },
  'At Risk': { 
    color: '#EF4444', 
    bgColor: 'bg-red-50', 
    textColor: 'text-red-700',
    borderColor: 'border-red-200',
    icon: AlertCircle 
  },
  'Needs Attention': { 
    color: '#F59E0B', 
    bgColor: 'bg-amber-50', 
    textColor: 'text-amber-700',
    borderColor: 'border-amber-200',
    icon: AlertCircle 
  },
  'On Target': { 
    color: '#3B82F6', 
    bgColor: 'bg-blue-50', 
    textColor: 'text-blue-700',
    borderColor: 'border-blue-200',
    icon: Target 
  },
  'Not Started': { 
    color: '#6B7280', 
    bgColor: 'bg-gray-50', 
    textColor: 'text-gray-700',
    borderColor: 'border-gray-200',
    icon: Clock 
  }
};

// Get icon for goal based on level and context
const getGoalIcon = (goal: GoalWithMetrics) => {
  const title = goal.title.toLowerCase();
  
  if (title.includes('equity') || title.includes('access')) return Users;
  if (title.includes('excellence') || title.includes('academic')) return GraduationCap;
  if (title.includes('college') || title.includes('career')) return Briefcase;
  if (title.includes('innovation') || title.includes('technology')) return Activity;
  if (title.includes('sustainability') || title.includes('environment')) return Heart;
  if (title.includes('community') || title.includes('engagement')) return Building;
  
  return Target;
};

// Tree node component
function GoalTreeNodeV2({ 
  goal, 
  level = 0, 
  isExpanded, 
  isSelected,
  onToggle, 
  onSelect 
}: {
  goal: GoalWithMetrics;
  level?: number;
  isExpanded: boolean;
  isSelected: boolean;
  onToggle: () => void;
  onSelect: () => void;
}) {
  const hasChildren = goal.children && goal.children.length > 0;
  const paddingLeft = level === 0 ? 16 : level * 24 + 16;
  
  // Get status config
  const statusText = goal.indicator_text || 'Not Started';
  const statusConfig = STATUS_CONFIG[statusText as keyof typeof STATUS_CONFIG] || STATUS_CONFIG['Not Started'];
  const StatusIcon = statusConfig.icon;
  const GoalIcon = getGoalIcon(goal);
  
  // Calculate metrics count
  const getMetricsCount = (g: GoalWithMetrics): number => {
    let count = g.metrics?.length || 0;
    if (g.children) {
      g.children.forEach(child => {
        count += getMetricsCount(child);
      });
    }
    return count;
  };
  
  const metricsCount = getMetricsCount(goal);

  return (
    <>
      <div
        className={cn(
          "group relative flex items-center gap-3 py-3.5 px-6 cursor-pointer transition-all duration-150",
          "hover:bg-gray-50 border-l-3",
          isSelected ? "bg-blue-50 border-l-blue-500 hover:bg-blue-50" : "border-l-transparent hover:border-l-gray-200",
          level === 0 && "font-medium py-4"
        )}
        style={{ paddingLeft: paddingLeft + 8 }}
        onClick={onSelect}
      >
        {/* Expand/Collapse button */}
        {hasChildren && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggle();
            }}
            className="p-1 hover:bg-gray-200 rounded transition-colors"
          >
            {isExpanded ? (
              <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
            )}
          </button>
        )}
        {!hasChildren && level > 0 && <div className="w-6" />}
        
        {/* Goal Icon */}
        {level === 0 && (
          <div className={cn(
            "p-2 rounded-lg flex-shrink-0",
            isSelected ? "bg-blue-100" : "bg-gray-50"
          )}>
            <GoalIcon className={cn(
              "h-4 w-4",
              isSelected ? "text-blue-600" : "text-gray-500"
            )} />
          </div>
        )}
        
        {/* Goal Number & Title Combined */}
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2">
            <span className={cn(
              "font-semibold flex-shrink-0",
              level === 0 ? "text-base" : "text-sm",
              isSelected ? "text-blue-900" : "text-gray-800"
            )}>
              {goal.goal_number}
            </span>
            <span className={cn(
              "truncate",
              level === 0 ? "text-base" : "text-sm",
              isSelected ? "text-blue-800" : "text-gray-600"
            )}>
              {goal.title}
            </span>
          </div>
          {metricsCount > 0 && (
            <p className="text-xs text-gray-400 mt-1">{metricsCount} metrics</p>
          )}
        </div>
        
        {/* Status Badge */}
        {level === 0 && (
          <Badge 
            variant="outline"
            className={cn(
              "text-xs gap-1 border flex-shrink-0",
              statusConfig.bgColor,
              statusConfig.textColor,
              statusConfig.borderColor
            )}
          >
            <StatusIcon className="h-3 w-3" />
            {statusText}
          </Badge>
        )}
      </div>
    </>
  );
}

export default function GoalsSplitViewV2({
  goals,
  districtSlug,
  onRefresh
}: GoalsSplitViewV2Props) {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Hook for creating goals
  const createGoal = useCreateGoal(districtSlug);

  // Auto-expand first level
  React.useEffect(() => {
    const firstLevel = new Set(goals.map(g => g.id));
    setExpandedNodes(firstLevel);
  }, [goals]);

  // Find selected goal
  const findGoal = (goals: GoalWithMetrics[], id: string): GoalWithMetrics | null => {
    for (const goal of goals) {
      if (goal.id === id) return goal;
      if (goal.children) {
        const found = findGoal(goal.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  const selectedGoal = selectedGoalId ? findGoal(goals, selectedGoalId) : null;

  // Toggle node expansion
  const toggleNode = (goalId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(goalId)) {
      newExpanded.delete(goalId);
    } else {
      newExpanded.add(goalId);
    }
    setExpandedNodes(newExpanded);
  };

  // Filter goals based on search
  const filterGoals = (goals: GoalWithMetrics[], query: string): GoalWithMetrics[] => {
    if (!query) return goals;
    
    return goals.filter(goal => {
      const matchesSearch = 
        goal.title.toLowerCase().includes(query.toLowerCase()) ||
        goal.goal_number.toLowerCase().includes(query.toLowerCase()) ||
        (goal.description && goal.description.toLowerCase().includes(query.toLowerCase()));
      
      const childrenMatch = goal.children && 
        filterGoals(goal.children, query).length > 0;
      
      return matchesSearch || childrenMatch;
    });
  };

  const filteredGoals = useMemo(() => 
    filterGoals(goals, searchQuery), 
    [goals, searchQuery]
  );

  // Render goal tree recursively
  const renderGoalTree = (goals: GoalWithMetrics[], level = 0): JSX.Element[] => {
    const elements: JSX.Element[] = [];
    
    goals.forEach(goal => {
      elements.push(
        <GoalTreeNodeV2
          key={goal.id}
          goal={goal}
          level={level}
          isExpanded={expandedNodes.has(goal.id)}
          isSelected={selectedGoalId === goal.id}
          onToggle={() => toggleNode(goal.id)}
          onSelect={() => setSelectedGoalId(goal.id)}
        />
      );
      
      // If expanded and has children, render them recursively
      if (expandedNodes.has(goal.id) && goal.children && goal.children.length > 0) {
        elements.push(...renderGoalTree(goal.children, level + 1));
      }
    });
    
    return elements;
  };

  return (
    <div className="max-w-[1600px] mx-auto">
      <div className="flex h-[calc(100vh-12rem)] bg-white rounded-lg shadow-sm border overflow-hidden">
        {/* Left Panel - Navigation */}
        <div className="w-[420px] border-r bg-white flex flex-col">
          {/* Header */}
          <div className="px-8 py-6 border-b">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">Strategic Objectives</h3>
                <p className="text-sm text-gray-500">Click an objective to see its roll-up metrics</p>
              </div>
              <Button
                size="sm"
                className="gap-2"
                disabled={isCreating}
                onClick={() => {
                  setIsCreating(true);
                  // The useCreateGoal hook handles getting the next goal number internally
                  createGoal.mutate({
                    parentId: null,
                    level: 0,
                    title: 'New Strategic Objective'
                  }, {
                    onSuccess: () => {
                      toast.success('Strategic objective created');
                      onRefresh();
                      setIsCreating(false);
                    },
                    onError: (error) => {
                      toast.error('Failed to create objective');
                      console.error('Error creating objective:', error);
                      setIsCreating(false);
                    }
                  });
                }}
              >
                <Plus className="h-4 w-4" />
                {isCreating ? 'Creating...' : 'Add Objective'}
              </Button>
            </div>
          </div>

          {/* Search */}
          <div className="px-6 py-4 border-b bg-gray-50">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search objectives..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-10 bg-white border-gray-200"
              />
            </div>
          </div>

          {/* Goal Tree */}
          <ScrollArea className="flex-1">
            <div className="py-4">
              {filteredGoals.length > 0 ? (
                renderGoalTree(filteredGoals)
              ) : (
                <div className="text-center py-12 text-gray-400">
                  <p className="text-sm">No objectives found</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Right Panel - Details */}
        <div className="flex-1 bg-gray-50">
          <GoalDetailPanelSimple
            goal={selectedGoal}
            districtSlug={districtSlug}
            onRefresh={onRefresh}
            onClose={() => setSelectedGoalId(null)}
          />
        </div>
      </div>
    </div>
  );
}