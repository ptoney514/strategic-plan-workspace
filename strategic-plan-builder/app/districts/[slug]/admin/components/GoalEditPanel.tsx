'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { MetricBuilderWizard } from '@/components/metrics/MetricBuilderWizard';
import {
  Target,
  Flag,
  Zap,
  Save,
  Undo,
  Redo,
  Plus,
  Trash2,
  Edit2,
  BarChart3,
  ChevronRight,
  Clock,
  AlertCircle
} from 'lucide-react';
import { GoalWithMetrics, Metric } from '@/lib/types';
import { useUpdateGoal, useCreateMetric, useUpdateMetric, useDeleteMetric } from '@/hooks/use-district';
import { toast } from 'sonner';
import { useHotkeys } from 'react-hotkeys-hook';
import { cn } from '@/lib/utils';

interface GoalEditPanelProps {
  goalId: string;
  district: any;
  onClose: () => void;
  districtSlug: string;
}

interface EditHistory {
  past: any[];
  present: any;
  future: any[];
}

function findGoalById(goals: GoalWithMetrics[], goalId: string): GoalWithMetrics | null {
  for (const goal of goals) {
    if (goal.id === goalId) return goal;
    if (goal.children) {
      const found = findGoalById(goal.children, goalId);
      if (found) return found;
    }
  }
  return null;
}

function getBreadcrumb(goals: GoalWithMetrics[], goalId: string): string[] {
  const breadcrumb: string[] = [];
  
  function findPath(goals: GoalWithMetrics[], targetId: string, path: string[]): boolean {
    for (const goal of goals) {
      const currentPath = [...path, goal.title];
      if (goal.id === targetId) {
        breadcrumb.push(...currentPath);
        return true;
      }
      if (goal.children && findPath(goal.children, targetId, currentPath)) {
        return true;
      }
    }
    return false;
  }
  
  findPath(goals, goalId, []);
  return breadcrumb;
}

export default function GoalEditPanel({
  goalId,
  district,
  onClose,
  districtSlug
}: GoalEditPanelProps) {
  const updateGoalMutation = useUpdateGoal(districtSlug);
  const createMetricMutation = useCreateMetric(districtSlug);
  const updateMetricMutation = useUpdateMetric(districtSlug);
  const deleteMetricMutation = useDeleteMetric(districtSlug);
  
  const goal = useMemo(() => findGoalById(district.goals || [], goalId), [district.goals, goalId]);
  const breadcrumb = useMemo(() => getBreadcrumb(district.goals || [], goalId), [district.goals, goalId]);
  
  // Form state
  const [title, setTitle] = useState(goal?.title || '');
  const [description, setDescription] = useState(goal?.description || '');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  
  // Undo/Redo history
  const [history, setHistory] = useState<EditHistory>({
    past: [],
    present: { title: goal?.title || '', description: goal?.description || '' },
    future: []
  });
  
  // Metric dialog
  const [isMetricDialogOpen, setIsMetricDialogOpen] = useState(false);
  const [isMetricWizardOpen, setIsMetricWizardOpen] = useState(false);
  const [editingMetric, setEditingMetric] = useState<Metric | null>(null);
  const [metricForm, setMetricForm] = useState({
    name: '',
    target_value: '',
    current_value: '',
    unit: '%'
  });
  
  // Auto-save timer
  const [autoSaveTimer, setAutoSaveTimer] = useState<NodeJS.Timeout | null>(null);
  
  // Initialize form when goal changes
  useEffect(() => {
    if (goal) {
      setTitle(goal.title);
      setDescription(goal.description || '');
      setHistory({
        past: [],
        present: { title: goal.title, description: goal.description || '' },
        future: []
      });
      setHasUnsavedChanges(false);
    }
  }, [goal]);
  
  // Auto-save functionality
  const autoSave = useCallback(() => {
    if (!hasUnsavedChanges || !goal) return;
    
    updateGoalMutation.mutate(
      { goalId: goal.id, updates: { title, description } },
      {
        onSuccess: () => {
          setHasUnsavedChanges(false);
          setLastSaved(new Date());
          toast.success('Changes saved automatically');
        }
      }
    );
  }, [hasUnsavedChanges, goal, title, description, updateGoalMutation]);
  
  // Handle form changes with auto-save
  const handleTitleChange = (value: string) => {
    setTitle(value);
    setHasUnsavedChanges(true);
    
    // Update history
    setHistory(prev => ({
      past: [...prev.past, prev.present],
      present: { title: value, description },
      future: []
    }));
    
    // Reset auto-save timer
    if (autoSaveTimer) clearTimeout(autoSaveTimer);
    setAutoSaveTimer(setTimeout(autoSave, 1500)); // Auto-save after 1.5 seconds
  };
  
  const handleDescriptionChange = (value: string) => {
    setDescription(value);
    setHasUnsavedChanges(true);
    
    // Update history
    setHistory(prev => ({
      past: [...prev.past, prev.present],
      present: { title, description: value },
      future: []
    }));
    
    // Reset auto-save timer
    if (autoSaveTimer) clearTimeout(autoSaveTimer);
    setAutoSaveTimer(setTimeout(autoSave, 1500));
  };
  
  // Undo/Redo functionality
  const undo = useCallback(() => {
    if (history.past.length === 0) return;
    
    const previous = history.past[history.past.length - 1];
    const newPast = history.past.slice(0, -1);
    
    setHistory({
      past: newPast,
      present: previous,
      future: [history.present, ...history.future]
    });
    
    setTitle(previous.title);
    setDescription(previous.description);
    setHasUnsavedChanges(true);
  }, [history]);
  
  const redo = useCallback(() => {
    if (history.future.length === 0) return;
    
    const next = history.future[0];
    const newFuture = history.future.slice(1);
    
    setHistory({
      past: [...history.past, history.present],
      present: next,
      future: newFuture
    });
    
    setTitle(next.title);
    setDescription(next.description);
    setHasUnsavedChanges(true);
  }, [history]);
  
  // Keyboard shortcuts
  useHotkeys('cmd+z, ctrl+z', (e) => {
    e.preventDefault();
    undo();
  });
  
  useHotkeys('cmd+shift+z, ctrl+shift+z', (e) => {
    e.preventDefault();
    redo();
  });
  
  useHotkeys('cmd+s, ctrl+s', (e) => {
    e.preventDefault();
    if (hasUnsavedChanges) {
      autoSave();
    }
  });
  
  // Manual save
  const handleSave = () => {
    if (!goal) return;
    
    updateGoalMutation.mutate(
      { goalId: goal.id, updates: { title, description } },
      {
        onSuccess: () => {
          setHasUnsavedChanges(false);
          setLastSaved(new Date());
          toast.success('Goal updated successfully');
        }
      }
    );
  };
  
  // Metric management
  const handleAddMetric = () => {
    // Open the new metric builder wizard
    setIsMetricWizardOpen(true);
  };
  
  const handleEditMetric = (metric: Metric) => {
    setEditingMetric(metric);
    setMetricForm({
      name: metric.name,
      target_value: metric.target_value?.toString() || '',
      current_value: metric.current_value?.toString() || '',
      unit: metric.unit || '%'
    });
    setIsMetricDialogOpen(true);
  };
  
  const handleSaveMetric = () => {
    if (!goal) return;
    
    if (editingMetric) {
      // Update existing metric
      updateMetricMutation.mutate(
        {
          metricId: editingMetric.id,
          updates: {
            name: metricForm.name,
            target_value: parseFloat(metricForm.target_value) || null,
            current_value: parseFloat(metricForm.current_value) || null,
            unit: metricForm.unit
          }
        },
        {
          onSuccess: () => {
            setIsMetricDialogOpen(false);
            toast.success('Metric updated successfully');
          }
        }
      );
    } else {
      // Create new metric
      createMetricMutation.mutate(
        {
          goalId: goal.id,
          metric: {
            name: metricForm.name,
            metric_type: 'percent',
            data_source: 'manual',
            target_value: parseFloat(metricForm.target_value) || null,
            current_value: parseFloat(metricForm.current_value) || null,
            unit: metricForm.unit
          }
        },
        {
          onSuccess: () => {
            setIsMetricDialogOpen(false);
            toast.success('Metric created successfully');
          }
        }
      );
    }
  };
  
  const handleDeleteMetric = (metricId: string) => {
    if (confirm('Are you sure you want to delete this metric?')) {
      deleteMetricMutation.mutate(metricId, {
        onSuccess: () => {
          toast.success('Metric deleted successfully');
        }
      });
    }
  };
  
  if (!goal) {
    return (
      <div className="p-4 text-center text-gray-500">
        <AlertCircle className="h-12 w-12 mx-auto mb-3 text-gray-300" />
        <p>Goal not found</p>
      </div>
    );
  }
  
  const getLevelIcon = () => {
    if (goal.level === 0) return <Target className="h-5 w-5 text-blue-600" />;
    if (goal.level === 1) return <Flag className="h-5 w-5 text-green-600" />;
    return <Zap className="h-5 w-5 text-purple-600" />;
  };
  
  const getLevelLabel = () => {
    if (goal.level === 0) return 'Strategic Objective';
    if (goal.level === 1) return 'Goal';
    return 'Sub-goal';
  };
  
  return (
    <div className="p-4 space-y-4">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1 text-xs text-gray-500">
        {breadcrumb.map((item, index) => (
          <React.Fragment key={index}>
            {index > 0 && <ChevronRight className="h-3 w-3" />}
            <span className={cn(index === breadcrumb.length - 1 && "text-gray-900 font-medium")}>
              {item}
            </span>
          </React.Fragment>
        ))}
      </div>
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {getLevelIcon()}
          <Badge variant="outline">{goal.goal_number}</Badge>
          <span className="text-sm text-gray-500">{getLevelLabel()}</span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={undo}
            disabled={history.past.length === 0}
          >
            <Undo className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={redo}
            disabled={history.future.length === 0}
          >
            <Redo className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={!hasUnsavedChanges}
          >
            <Save className="h-4 w-4 mr-1" />
            Save
          </Button>
        </div>
      </div>
      
      {/* Status indicators */}
      {(hasUnsavedChanges || lastSaved) && (
        <div className="flex items-center gap-4 text-xs text-gray-500">
          {hasUnsavedChanges && (
            <span className="flex items-center gap-1">
              <div className="h-2 w-2 bg-yellow-400 rounded-full" />
              Unsaved changes
            </span>
          )}
          {lastSaved && (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Last saved {lastSaved.toLocaleTimeString()}
            </span>
          )}
        </div>
      )}
      
      <Separator />
      
      {/* Form */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Enter goal title..."
          />
        </div>
        
        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => handleDescriptionChange(e.target.value)}
            placeholder="Enter goal description..."
            rows={4}
          />
        </div>
      </div>
      
      <Separator />
      
      {/* Metrics Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium">Metrics</h4>
          <Button size="sm" onClick={handleAddMetric}>
            <Plus className="h-4 w-4 mr-1" />
            Add Metric
          </Button>
        </div>
        
        {goal.metrics && goal.metrics.length > 0 ? (
          <div className="space-y-2">
            {goal.metrics.map((metric) => (
              <Card key={metric.id} className="p-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="font-medium text-sm">{metric.name}</div>
                    <div className="flex items-center gap-3 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        {metric.current_value || 0}/{metric.target_value || 0} {metric.unit}
                      </Badge>
                      {metric.current_value && metric.target_value && (
                        <div className="flex items-center gap-1">
                          <div className="w-20 bg-gray-200 rounded-full h-1.5">
                            <div
                              className="bg-blue-500 h-1.5 rounded-full"
                              style={{ width: `${Math.min((metric.current_value / metric.target_value) * 100, 100)}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-500">
                            {Math.round((metric.current_value / metric.target_value) * 100)}%
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEditMetric(metric)}
                    >
                      <Edit2 className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteMetric(metric.id)}
                      className="text-red-500"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-gray-500 bg-gray-50 rounded-lg">
            <BarChart3 className="h-8 w-8 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">No metrics defined</p>
          </div>
        )}
      </div>
      
      {/* New Metric Builder Wizard */}
      <MetricBuilderWizard
        isOpen={isMetricWizardOpen}
        onClose={() => setIsMetricWizardOpen(false)}
        onSave={async (metric) => {
          // Create the metric using the existing mutation
          await createMetricMutation.mutateAsync({
            goal_id: goalId,
            ...metric
          });
          setIsMetricWizardOpen(false);
        }}
        goalId={goalId}
        goalNumber={goal?.goal_number || ''}
      />
      
      {/* Legacy Metric Dialog - Keep for editing existing metrics */}
      <Dialog open={isMetricDialogOpen} onOpenChange={setIsMetricDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingMetric ? 'Edit Metric' : 'Add Metric'}
            </DialogTitle>
            <DialogDescription>
              Define measurable outcomes for this goal.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="metric-name">Name</Label>
              <Input
                id="metric-name"
                value={metricForm.name}
                onChange={(e) => setMetricForm({ ...metricForm, name: e.target.value })}
                placeholder="e.g., Student Attendance Rate"
              />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <Label htmlFor="current">Current</Label>
                <Input
                  id="current"
                  type="number"
                  value={metricForm.current_value}
                  onChange={(e) => setMetricForm({ ...metricForm, current_value: e.target.value })}
                  placeholder="0"
                />
              </div>
              <div>
                <Label htmlFor="target">Target</Label>
                <Input
                  id="target"
                  type="number"
                  value={metricForm.target_value}
                  onChange={(e) => setMetricForm({ ...metricForm, target_value: e.target.value })}
                  placeholder="100"
                />
              </div>
              <div>
                <Label htmlFor="unit">Unit</Label>
                <Input
                  id="unit"
                  value={metricForm.unit}
                  onChange={(e) => setMetricForm({ ...metricForm, unit: e.target.value })}
                  placeholder="%"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsMetricDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveMetric} disabled={!metricForm.name.trim()}>
              {editingMetric ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}