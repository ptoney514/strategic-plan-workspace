'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  ChevronRight,
  ChevronDown,
  Plus,
  Edit2,
  Trash2,
  MoreVertical,
  Target,
  Flag,
  Zap,
  BarChart3,
  Save,
  X,
  GripVertical
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { GoalWithMetrics, Metric } from '@/lib/types';

interface GoalsTreeViewProps {
  goals: GoalWithMetrics[];
  onAddGoal: (parentId: string | null, level: number) => void;
  onEditGoal: (goalId: string, title: string) => void;
  onDeleteGoal: (goalId: string) => void;
  onAddMetric: (goalId: string) => void;
  onEditMetric: (metricId: string) => void;
  onDeleteMetric: (metricId: string) => void;
  readOnly?: boolean;
}

interface TreeNodeProps {
  goal: GoalWithMetrics;
  level: number;
  onAddGoal: (parentId: string | null, level: number) => void;
  onEditGoal: (goalId: string, title: string) => void;
  onDeleteGoal: (goalId: string) => void;
  onAddMetric: (goalId: string) => void;
  onEditMetric: (metricId: string) => void;
  onDeleteMetric: (metricId: string) => void;
  readOnly?: boolean;
}

function TreeNode({
  goal,
  level,
  onAddGoal,
  onEditGoal,
  onDeleteGoal,
  onAddMetric,
  onEditMetric,
  onDeleteMetric,
  readOnly = false
}: TreeNodeProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(goal.title);
  const [isAddingChild, setIsAddingChild] = useState(false);
  const [newChildTitle, setNewChildTitle] = useState('');

  const hasChildren = goal.children && goal.children.length > 0;
  const hasMetrics = goal.metrics && goal.metrics.length > 0;

  const getIcon = () => {
    if (level === 0) return <Target className="h-4 w-4 text-blue-600" />;
    if (level === 1) return <Flag className="h-4 w-4 text-green-600" />;
    return <Zap className="h-4 w-4 text-purple-600" />;
  };

  const getLevelLabel = () => {
    if (level === 0) return 'Strategic Objective';
    if (level === 1) return 'Goal';
    return 'Sub-goal';
  };

  const handleSave = () => {
    if (editTitle.trim() && editTitle !== goal.title) {
      onEditGoal(goal.id, editTitle.trim());
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditTitle(goal.title);
    setIsEditing(false);
  };

  const handleAddChild = () => {
    if (newChildTitle.trim()) {
      onAddGoal(goal.id, level + 1);
      setNewChildTitle('');
      setIsAddingChild(false);
      setIsExpanded(true);
    }
  };

  const handleCancelAdd = () => {
    setNewChildTitle('');
    setIsAddingChild(false);
  };

  return (
    <div className="group">
      <div
        className={cn(
          "flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 transition-colors",
          isEditing && "bg-blue-50",
          "border border-transparent hover:border-gray-200"
        )}
        style={{ paddingLeft: `${level * 24 + 8}px` }}
      >
        {/* Expand/Collapse Button */}
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0"
          onClick={() => setIsExpanded(!isExpanded)}
          disabled={!hasChildren && !hasMetrics}
        >
          {hasChildren || hasMetrics ? (
            isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )
          ) : (
            <div className="h-4 w-4" />
          )}
        </Button>

        {/* Drag Handle */}
        {!readOnly && (
          <GripVertical className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 cursor-move" />
        )}

        {/* Icon */}
        {getIcon()}

        {/* Goal Number */}
        <Badge variant="outline" className="text-xs">
          {goal.goal_number}
        </Badge>

        {/* Title */}
        {isEditing ? (
          <div className="flex items-center gap-2 flex-1">
            <Input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSave()}
              onKeyDown={(e) => e.key === 'Escape' && handleCancel()}
              className="h-7 text-sm"
              autoFocus
            />
            <Button size="sm" variant="ghost" onClick={handleSave}>
              <Save className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="ghost" onClick={handleCancel}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div
            className="flex-1 text-sm font-medium cursor-pointer"
            onDoubleClick={() => !readOnly && setIsEditing(true)}
          >
            {goal.title}
          </div>
        )}

        {/* Badges */}
        <div className="flex items-center gap-2">
          {hasMetrics && (
            <Badge variant="secondary" className="text-xs">
              {goal.metrics.length} metric{goal.metrics.length !== 1 ? 's' : ''}
            </Badge>
          )}
          {hasChildren && (
            <Badge variant="outline" className="text-xs">
              {goal.children.length} child{goal.children.length !== 1 ? 'ren' : ''}
            </Badge>
          )}
        </div>

        {/* Actions Menu */}
        {!readOnly && !isEditing && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setIsEditing(true)}>
                <Edit2 className="h-4 w-4 mr-2" />
                Edit {getLevelLabel()}
              </DropdownMenuItem>
              {level < 2 && (
                <DropdownMenuItem onClick={() => setIsAddingChild(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add {level === 0 ? 'Goal' : 'Sub-goal'}
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => onAddMetric(goal.id)}>
                <BarChart3 className="h-4 w-4 mr-2" />
                Add Metric
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDeleteGoal(goal.id)}
                className="text-red-600"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete {getLevelLabel()}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Add Child Form */}
      {isAddingChild && (
        <div
          className="flex items-center gap-2 p-2 bg-green-50 rounded-lg border border-green-200 mt-1"
          style={{ marginLeft: `${(level + 1) * 24 + 8}px` }}
        >
          {level === 0 ? (
            <Flag className="h-4 w-4 text-green-600" />
          ) : (
            <Zap className="h-4 w-4 text-purple-600" />
          )}
          <Input
            placeholder={`Enter ${level === 0 ? 'goal' : 'sub-goal'} title...`}
            value={newChildTitle}
            onChange={(e) => setNewChildTitle(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddChild()}
            onKeyDown={(e) => e.key === 'Escape' && handleCancelAdd()}
            className="h-7 text-sm flex-1"
            autoFocus
          />
          <Button size="sm" variant="ghost" onClick={handleAddChild}>
            <Save className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={handleCancelAdd}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Children and Metrics */}
      {isExpanded && (
        <>
          {/* Metrics */}
          {hasMetrics && (
            <div style={{ marginLeft: `${(level + 1) * 24 + 8}px` }}>
              {goal.metrics.map((metric) => (
                <div
                  key={metric.id}
                  className="flex items-center gap-2 p-2 text-sm text-gray-600 hover:bg-gray-50 rounded group"
                >
                  <BarChart3 className="h-4 w-4 text-indigo-600" />
                  <span className="flex-1">{metric.name}</span>
                  {metric.current_value !== null && metric.target_value !== null && (
                    <Badge variant="outline" className="text-xs">
                      {metric.current_value}/{metric.target_value} {metric.unit}
                    </Badge>
                  )}
                  {!readOnly && (
                    <div className="opacity-0 group-hover:opacity-100 flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => onEditMetric(metric.id)}
                      >
                        <Edit2 className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-red-500"
                        onClick={() => onDeleteMetric(metric.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Child Goals */}
          {hasChildren && (
            <div>
              {goal.children.map((child) => (
                <TreeNode
                  key={child.id}
                  goal={child}
                  level={level + 1}
                  onAddGoal={onAddGoal}
                  onEditGoal={onEditGoal}
                  onDeleteGoal={onDeleteGoal}
                  onAddMetric={onAddMetric}
                  onEditMetric={onEditMetric}
                  onDeleteMetric={onDeleteMetric}
                  readOnly={readOnly}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function GoalsTreeView({
  goals,
  onAddGoal,
  onEditGoal,
  onDeleteGoal,
  onAddMetric,
  onEditMetric,
  onDeleteMetric,
  readOnly = false
}: GoalsTreeViewProps) {
  const [isAddingRoot, setIsAddingRoot] = useState(false);
  const [newRootTitle, setNewRootTitle] = useState('');

  const handleAddRoot = () => {
    if (newRootTitle.trim()) {
      onAddGoal(null, 0);
      setNewRootTitle('');
      setIsAddingRoot(false);
    }
  };

  const handleCancelAddRoot = () => {
    setNewRootTitle('');
    setIsAddingRoot(false);
  };

  return (
    <div className="bg-white rounded-lg border">
      {/* Header */}
      <div className="border-b px-4 py-3 flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">Goals Hierarchy</h3>
        {!readOnly && (
          <Button
            size="sm"
            onClick={() => setIsAddingRoot(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Strategic Objective
          </Button>
        )}
      </div>

      {/* Tree Content */}
      <div className="p-2">
        {/* Add Root Form */}
        {isAddingRoot && (
          <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg border border-blue-200 mb-2">
            <Target className="h-4 w-4 text-blue-600" />
            <Input
              placeholder="Enter strategic objective title..."
              value={newRootTitle}
              onChange={(e) => setNewRootTitle(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddRoot()}
              onKeyDown={(e) => e.key === 'Escape' && handleCancelAddRoot()}
              className="h-7 text-sm flex-1"
              autoFocus
            />
            <Button size="sm" variant="ghost" onClick={handleAddRoot}>
              <Save className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="ghost" onClick={handleCancelAddRoot}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Goals Tree */}
        {goals.length > 0 ? (
          goals.map((goal) => (
            <TreeNode
              key={goal.id}
              goal={goal}
              level={0}
              onAddGoal={onAddGoal}
              onEditGoal={onEditGoal}
              onDeleteGoal={onDeleteGoal}
              onAddMetric={onAddMetric}
              onEditMetric={onEditMetric}
              onDeleteMetric={onDeleteMetric}
              readOnly={readOnly}
            />
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Target className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p className="text-sm">No goals defined yet</p>
            {!readOnly && (
              <p className="text-xs mt-1">Click "Add Strategic Objective" to get started</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}