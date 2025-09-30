'use client';

import { useState, useCallback, useEffect } from 'react';
import { Tree, NodeApi, TreeApi } from 'react-arborist';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
  Target,
  Flag,
  Zap,
  Plus,
  Edit2,
  Trash2,
  BarChart3,
  ChevronRight,
  ChevronDown,
  GripVertical,
  Save,
  X
} from 'lucide-react';
import { GoalWithMetrics } from '@/lib/types';
import { useCreateGoal, useUpdateGoal, useDeleteGoal } from '@/hooks/use-district';
import { toast } from 'sonner';

interface GoalTreePanelProps {
  goals: GoalWithMetrics[];
  selectedGoalId: string | null;
  expandedNodes: Set<string>;
  onGoalSelect: (goalId: string) => void;
  onExpandedNodesChange: (nodes: Set<string>) => void;
  districtSlug: string;
}

// Convert goals to tree data structure for react-arborist
function goalsToTreeData(goals: GoalWithMetrics[]): any[] {
  return goals.map(goal => ({
    id: goal.id,
    name: goal.title,
    data: goal,
    children: goal.children ? goalsToTreeData(goal.children) : undefined
  }));
}

// Custom node renderer
function Node({ node, style, dragHandle }: any) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(node.data.data.title);
  const goal = node.data.data as GoalWithMetrics;
  const level = goal.level;
  
  const getIcon = () => {
    if (level === 0) return <Target className="h-4 w-4 text-blue-600" />;
    if (level === 1) return <Flag className="h-4 w-4 text-green-600" />;
    return <Zap className="h-4 w-4 text-purple-600" />;
  };
  
  const handleSave = () => {
    // This would call the update mutation
    setIsEditing(false);
    node.submit(editTitle);
  };
  
  const handleCancel = () => {
    setEditTitle(goal.title);
    setIsEditing(false);
  };
  
  return (
    <div
      style={style}
      className={cn(
        "flex items-center gap-2 px-2 py-1.5 hover:bg-gray-50 rounded cursor-pointer group",
        node.isSelected && "bg-blue-50",
        isEditing && "bg-blue-50"
      )}
      onClick={() => !isEditing && node.select()}
    >
      {/* Expand/Collapse */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          node.toggle();
        }}
        className="h-4 w-4 flex items-center justify-center"
      >
        {node.isInternal && (
          node.isOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />
        )}
      </button>
      
      {/* Drag Handle */}
      <div ref={dragHandle} className="cursor-move opacity-0 group-hover:opacity-100">
        <GripVertical className="h-4 w-4 text-gray-400" />
      </div>
      
      {/* Icon */}
      {getIcon()}
      
      {/* Goal Number */}
      <Badge variant="outline" className="text-xs">
        {goal.goal_number}
      </Badge>
      
      {/* Title */}
      {isEditing ? (
        <div className="flex items-center gap-1 flex-1">
          <Input
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSave()}
            onKeyDown={(e) => e.key === 'Escape' && handleCancel()}
            className="h-6 text-sm"
            autoFocus
            onClick={(e) => e.stopPropagation()}
          />
          <Button size="sm" variant="ghost" onClick={handleSave} className="h-6 w-6 p-0">
            <Save className="h-3 w-3" />
          </Button>
          <Button size="sm" variant="ghost" onClick={handleCancel} className="h-6 w-6 p-0">
            <X className="h-3 w-3" />
          </Button>
        </div>
      ) : (
        <div
          className="flex-1 text-sm truncate"
          onDoubleClick={(e) => {
            e.stopPropagation();
            setIsEditing(true);
          }}
        >
          {goal.title}
        </div>
      )}
      
      {/* Badges */}
      <div className="flex items-center gap-1">
        {goal.metrics && goal.metrics.length > 0 && (
          <Badge variant="secondary" className="text-xs h-5">
            {goal.metrics.length} <BarChart3 className="h-3 w-3 ml-0.5" />
          </Badge>
        )}
        {goal.children && goal.children.length > 0 && (
          <Badge variant="outline" className="text-xs h-5">
            {goal.children.length}
          </Badge>
        )}
      </div>
      
      {/* Actions */}
      <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1">
        {level < 2 && (
          <Button
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0"
            onClick={(e) => {
              e.stopPropagation();
              // Add child logic
            }}
          >
            <Plus className="h-3 w-3" />
          </Button>
        )}
        <Button
          size="sm"
          variant="ghost"
          className="h-6 w-6 p-0"
          onClick={(e) => {
            e.stopPropagation();
            setIsEditing(true);
          }}
        >
          <Edit2 className="h-3 w-3" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="h-6 w-6 p-0 text-red-500"
          onClick={(e) => {
            e.stopPropagation();
            // Delete logic
          }}
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}

export default function GoalTreePanel({
  goals,
  selectedGoalId,
  expandedNodes,
  onGoalSelect,
  onExpandedNodesChange,
  districtSlug
}: GoalTreePanelProps) {
  const createGoalMutation = useCreateGoal(districtSlug);
  const updateGoalMutation = useUpdateGoal(districtSlug);
  const deleteGoalMutation = useDeleteGoal(districtSlug);
  
  const [treeRef, setTreeRef] = useState<TreeApi<any> | null>(null);
  const [isAddingRoot, setIsAddingRoot] = useState(false);
  const [newRootTitle, setNewRootTitle] = useState('');
  
  const treeData = goalsToTreeData(goals);
  
  // Handle selection
  const handleSelect = useCallback((nodes: NodeApi[]) => {
    if (nodes.length > 0) {
      onGoalSelect(nodes[0].data.id);
    }
  }, [onGoalSelect]);
  
  // Handle node rename
  const handleRename = useCallback((args: { id: string; name: string }) => {
    updateGoalMutation.mutate(
      { goalId: args.id, updates: { title: args.name } },
      {
        onSuccess: () => {
          toast.success('Goal updated successfully');
        }
      }
    );
  }, [updateGoalMutation]);
  
  // Handle node move (drag and drop)
  const handleMove = useCallback((args: any) => {
    // TODO: Implement reordering/reparenting logic
    console.log('Move:', args);
    toast.info('Drag and drop reordering coming soon!');
  }, []);
  
  // Handle add root goal
  const handleAddRoot = () => {
    if (newRootTitle.trim()) {
      createGoalMutation.mutate(
        { parentId: null, level: 0, title: newRootTitle.trim() },
        {
          onSuccess: () => {
            setNewRootTitle('');
            setIsAddingRoot(false);
            toast.success('Strategic objective created successfully');
          }
        }
      );
    }
  };
  
  // Sync expanded state
  useEffect(() => {
    if (treeRef) {
      const currentExpanded = new Set<string>();
      treeRef.visibleNodes.forEach(node => {
        if (node.isOpen) {
          currentExpanded.add(node.data.id);
        }
      });
      if (currentExpanded.size !== expandedNodes.size) {
        onExpandedNodesChange(currentExpanded);
      }
    }
  }, [treeRef, expandedNodes, onExpandedNodesChange]);
  
  return (
    <div className="p-2">
      {/* Add Root Button */}
      <div className="mb-2">
        {isAddingRoot ? (
          <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg border border-blue-200">
            <Target className="h-4 w-4 text-blue-600" />
            <Input
              placeholder="Enter strategic objective title..."
              value={newRootTitle}
              onChange={(e) => setNewRootTitle(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddRoot()}
              onKeyDown={(e) => e.key === 'Escape' && setIsAddingRoot(false)}
              className="h-7 text-sm flex-1"
              autoFocus
            />
            <Button size="sm" variant="ghost" onClick={handleAddRoot}>
              <Save className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setIsAddingRoot(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <Button
            size="sm"
            className="w-full"
            onClick={() => setIsAddingRoot(true)}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Strategic Objective
          </Button>
        )}
      </div>
      
      {/* Tree */}
      {treeData.length > 0 ? (
        <Tree
          ref={(ref) => setTreeRef(ref)}
          data={treeData}
          openByDefault={false}
          width="100%"
          height={600}
          indent={24}
          rowHeight={32}
          overscanCount={5}
          onSelect={handleSelect}
          onRename={handleRename}
          onMove={handleMove}
          selection={selectedGoalId}
        >
          {Node}
        </Tree>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <Target className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p className="text-sm">No goals defined yet</p>
          <p className="text-xs mt-1">Click "Add Strategic Objective" to get started</p>
        </div>
      )}
    </div>
  );
}