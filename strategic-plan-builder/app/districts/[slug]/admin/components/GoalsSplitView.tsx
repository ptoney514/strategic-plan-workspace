'use client';

import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
  Info
} from 'lucide-react';
import { GoalWithMetrics } from '@/lib/types';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useUpdateGoal, useDeleteGoal, useCreateGoal } from '@/hooks/use-district';

interface GoalsSplitViewProps {
  goals: GoalWithMetrics[];
  districtSlug: string;
  onRefresh: () => void;
}

// Color palette for status indicators
const COLOR_PALETTE = [
  { label: 'On Track', hex: '#10B981', description: 'Goal is progressing well' },
  { label: 'Progressing', hex: '#84CC16', description: 'Making steady progress' },
  { label: 'Caution', hex: '#EAB308', description: 'Needs monitoring' },
  { label: 'Needs Attention', hex: '#F97316', description: 'Requires immediate focus' },
  { label: 'At Risk', hex: '#EF4444', description: 'Critical issues' },
  { label: 'Information', hex: '#3B82F6', description: 'Informational status' },
  { label: 'Strategic', hex: '#8B5CF6', description: 'Strategic priority' },
  { label: 'Not Started', hex: '#6B7280', description: 'Not yet begun' },
];

// Tree node component for the navigation
function GoalTreeNode({ 
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
  const paddingLeft = level * 24 + 12;

  // Get status indicator
  const getStatusColor = () => {
    if (goal.indicator_color) return goal.indicator_color;
    // Default colors based on level
    if (goal.level === 0) return '#3B82F6';
    if (goal.level === 1) return '#10B981';
    return '#6B7280';
  };

  return (
    <>
      <div
        className={cn(
          "group flex items-center gap-2 py-2 px-3 cursor-pointer hover:bg-gray-100 transition-colors",
          isSelected && "bg-blue-50 hover:bg-blue-100"
        )}
        style={{ paddingLeft }}
        onClick={onSelect}
      >
        {hasChildren && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggle();
            }}
            className="p-0.5 hover:bg-gray-200 rounded"
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 text-gray-500" />
            ) : (
              <ChevronRight className="h-4 w-4 text-gray-500" />
            )}
          </button>
        )}
        {!hasChildren && <div className="w-5" />}
        
        <div 
          className="w-2 h-2 rounded-full flex-shrink-0" 
          style={{ backgroundColor: getStatusColor() }}
        />
        
        <span className={cn(
          "text-sm font-medium text-gray-700",
          goal.level === 0 && "text-gray-900",
          isSelected && "text-blue-700"
        )}>
          {goal.goal_number}
        </span>
        
        <span className={cn(
          "text-sm text-gray-600 truncate flex-1",
          isSelected && "text-blue-600"
        )}>
          {goal.title}
        </span>

        {goal.metrics && goal.metrics.length > 0 && (
          <Badge variant="secondary" className="text-xs">
            {goal.metrics.length}
          </Badge>
        )}
      </div>

    </>
  );
}

// Right panel detail/edit view
function GoalDetailPanel({
  goal,
  districtSlug,
  onRefresh,
  onClose
}: {
  goal: GoalWithMetrics | null;
  districtSlug: string;
  onRefresh: () => void;
  onClose: () => void;
}) {
  const updateGoalMutation = useUpdateGoal(districtSlug);
  const deleteGoalMutation = useDeleteGoal(districtSlug);

  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [indicatorText, setIndicatorText] = useState('');
  const [indicatorColor, setIndicatorColor] = useState('#10B981');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Update form when goal changes
  React.useEffect(() => {
    if (goal) {
      setTitle(goal.title || '');
      setDescription(goal.description || '');
      setIndicatorText(goal.indicator_text || '');
      setIndicatorColor(goal.indicator_color || '#10B981');
      setIsEditing(false);
    }
  }, [goal]);

  if (!goal) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500">
        <div className="text-center">
          <Target className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p>Select a goal to view details</p>
        </div>
      </div>
    );
  }

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error('Title is required');
      return;
    }

    setIsSaving(true);
    try {
      await updateGoalMutation.mutateAsync({
        goalId: goal.id,
        updates: {
          title: title.trim(),
          description: description.trim(),
          indicator_text: indicatorText.trim() || null,
          indicator_color: indicatorColor || null
        }
      });
      toast.success('Goal updated successfully');
      onRefresh();
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update goal:', error);
      toast.error('Failed to update goal');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    const confirmMessage = goal.children && goal.children.length > 0
      ? `Are you sure you want to delete "${goal.title}" and all its ${goal.children.length} sub-goals? This action cannot be undone.`
      : `Are you sure you want to delete "${goal.title}"? This action cannot be undone.`;
    
    if (!confirm(confirmMessage)) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteGoalMutation.mutateAsync(goal.id);
      toast.success('Goal deleted successfully');
      onRefresh();
      onClose();
    } catch (error) {
      console.error('Failed to delete goal:', error);
      toast.error('Failed to delete goal');
    } finally {
      setIsDeleting(false);
    }
  };

  const getLevelLabel = () => {
    if (goal.level === 0) return 'Strategic Objective';
    if (goal.level === 1) return 'Goal';
    return 'Sub-goal';
  };

  const selectedColorInfo = COLOR_PALETTE.find(c => c.hex === indicatorColor) || COLOR_PALETTE[0];

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 border-b bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="text-xs">
              {getLevelLabel()}
            </Badge>
            <h2 className="text-xl font-semibold text-gray-900">
              {goal.goal_number} {!isEditing && goal.title}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            {!isEditing ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
              >
                Edit
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setTitle(goal.title || '');
                    setDescription(goal.description || '');
                    setIndicatorText(goal.indicator_text || '');
                    setIndicatorColor(goal.indicator_color || '#10B981');
                    setIsEditing(false);
                  }}
                >
                  <X className="h-4 w-4 mr-1" />
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={isSaving}
                >
                  <Save className="h-4 w-4 mr-1" />
                  {isSaving ? 'Saving...' : 'Save'}
                </Button>
              </>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-6 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditing ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Title <span className="text-red-500">*</span>
                    </label>
                    <Input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Enter goal title"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <Textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Enter goal description"
                      className="min-h-[100px]"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Title</p>
                    <p className="text-gray-900">{goal.title}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Description</p>
                    <p className="text-gray-900">{goal.description || 'No description provided'}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Status Indicator */}
          {(goal.level === 0 || goal.level === 1) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Status Indicator</CardTitle>
                <CardDescription>
                  Set a custom status for this {getLevelLabel().toLowerCase()}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isEditing ? (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Status Text
                      </label>
                      <Input
                        value={indicatorText}
                        onChange={(e) => setIndicatorText(e.target.value)}
                        placeholder="e.g., On Track, At Risk..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Status Color
                      </label>
                      <div className="grid grid-cols-4 gap-2">
                        {COLOR_PALETTE.map((color) => (
                          <button
                            key={color.hex}
                            onClick={() => setIndicatorColor(color.hex)}
                            className={cn(
                              "relative p-2 rounded-lg border-2 transition-all text-xs",
                              "hover:shadow-md focus:outline-none",
                              indicatorColor === color.hex
                                ? "border-gray-900 shadow-md"
                                : "border-gray-200"
                            )}
                            style={{ backgroundColor: color.hex + '20' }}
                          >
                            <div className="flex flex-col items-center gap-1">
                              <div 
                                className="w-4 h-4 rounded-full"
                                style={{ backgroundColor: color.hex }}
                              />
                              <span className="text-[10px] text-gray-700">
                                {color.label}
                              </span>
                            </div>
                          </button>
                        ))}
                      </div>
                      <p className="mt-2 text-xs text-gray-500">
                        {selectedColorInfo.description}
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center gap-3">
                    <Badge 
                      className="px-3 py-1"
                      style={{
                        backgroundColor: goal.indicator_color ? goal.indicator_color + '20' : '#e5e7eb',
                        color: goal.indicator_color || '#6b7280',
                        borderColor: goal.indicator_color || '#e5e7eb'
                      }}
                    >
                      {goal.indicator_text || 'Not Set'}
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              {goal.metrics && goal.metrics.length > 0 ? (
                <div className="space-y-3">
                  {goal.metrics.map(metric => (
                    <div key={metric.id} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium text-sm">{metric.name}</p>
                        <Badge variant="outline" className="text-xs">
                          {metric.metric_type}
                        </Badge>
                      </div>
                      {metric.current_value !== undefined && metric.target_value !== undefined && (
                        <div className="flex items-center gap-3 text-xs text-gray-600">
                          <span>Current: {metric.current_value}{metric.unit}</span>
                          <span>•</span>
                          <span>Target: {metric.target_value}{metric.unit}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No metrics defined</p>
              )}
            </CardContent>
          </Card>

          {/* Children Goals */}
          {goal.children && goal.children.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Sub-goals</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {goal.children.map(child => (
                    <div key={child.id} className="flex items-center gap-3 p-2">
                      <div 
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: child.indicator_color || '#6b7280' }}
                      />
                      <span className="text-sm font-medium text-gray-700">
                        {child.goal_number}
                      </span>
                      <span className="text-sm text-gray-600">
                        {child.title}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Delete Button */}
          {isEditing && (
            <div className="pt-4 border-t">
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                disabled={isDeleting}
                className="w-full"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {isDeleting ? 'Deleting...' : `Delete ${getLevelLabel()}`}
              </Button>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

export default function GoalsSplitView({
  goals,
  districtSlug,
  onRefresh
}: GoalsSplitViewProps) {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const createGoalMutation = useCreateGoal(districtSlug);

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

  const handleAddStrategicObjective = async () => {
    const nextNumber = goals.filter(g => g.level === 0).length + 1;
    
    try {
      await createGoalMutation.mutateAsync({
        parentId: null,
        level: 0,
        title: `New Strategic Objective ${nextNumber}`
      });
      toast.success('Strategic objective created successfully');
      onRefresh();
    } catch (error) {
      console.error('Failed to create strategic objective:', error);
      toast.error('Failed to create strategic objective');
    }
  };

  // Render goal tree recursively
  const renderGoalTree = (goals: GoalWithMetrics[], level = 0): JSX.Element[] => {
    const elements: JSX.Element[] = [];
    
    goals.forEach(goal => {
      elements.push(
        <GoalTreeNode
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
    <div className="flex h-[calc(100vh-8rem)] bg-white rounded-lg border">
      {/* Left Panel - Navigation */}
      <div className="w-80 border-r flex flex-col">
        {/* Search and Add Button */}
        <div className="p-4 border-b">
          <div className="flex items-center gap-2 mb-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search goals..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9"
              />
            </div>
            <Button
              size="sm"
              onClick={handleAddStrategicObjective}
              className="h-9"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Goal Tree */}
        <ScrollArea className="flex-1">
          <div className="py-2">
            {renderGoalTree(filteredGoals)}
          </div>
        </ScrollArea>
      </div>

      {/* Right Panel - Details/Edit */}
      <div className="flex-1">
        <GoalDetailPanel
          goal={selectedGoal}
          districtSlug={districtSlug}
          onRefresh={onRefresh}
          onClose={() => setSelectedGoalId(null)}
        />
      </div>
    </div>
  );
}