'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, ChevronRight, ChevronDown, Target, BarChart3, Edit2, Check, X, Loader2, Sparkles, BookOpen } from 'lucide-react';
import { Goal, GoalWithMetrics, Metric, buildGoalHierarchy, getLevelName, getNextGoalNumber } from '@/lib/types';
import MetricInput from './MetricInput';
import ObjectiveWizard from './ObjectiveWizard';
import { cn } from '@/lib/utils';

interface GoalBuilderProps {
  district: any;
  districtSlug: string;
  onAddGoal?: (parentId: string | null, level: number, title: string) => Promise<void>;
  onAddMetric?: (goalId: string, metric: any) => Promise<void>;
  onUpdateDistrict?: (updates: any) => Promise<void>;
  onDeleteGoal?: (goalId: string) => Promise<void>;
  onUpdateGoal?: (goalId: string, updates: any) => Promise<void>;
  onUpdateMetric?: (metricId: string, updates: any) => Promise<void>;
  onDeleteMetric?: (metricId: string) => Promise<void>;
}

// Updated with new wizard interface
export default function GoalBuilder({ 
  district, 
  districtSlug, 
  onAddGoal, 
  onAddMetric, 
  onUpdateDistrict, 
  onDeleteGoal, 
  onUpdateGoal, 
  onUpdateMetric, 
  onDeleteMetric 
}: GoalBuilderProps) {
  const [hierarchicalGoals, setHierarchicalGoals] = useState<GoalWithMetrics[]>([]);
  const [expandedGoals, setExpandedGoals] = useState<Set<string>>(new Set());
  const [editingGoal, setEditingGoal] = useState<string | null>(null);
  const [addingChild, setAddingChild] = useState<string | null>(null);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [isSubmittingObjective, setIsSubmittingObjective] = useState(false);

  useEffect(() => {
    console.log('🎯 GoalBuilder useEffect - district:', district);
    console.log('🎯 GoalBuilder useEffect - district.goals:', district?.goals);
    console.log('🎯 GoalBuilder useEffect - goals length:', district?.goals?.length || 0);
    
    if (district && district.goals && district.goals.length > 0) {
      // Use the hierarchical goals directly from the district data
      setHierarchicalGoals(district.goals);
      
      // Extract flat goals to find strategic objectives for expansion
      const flatGoals: Goal[] = [];
      const flattenGoals = (goals: any[]) => {
        goals.forEach(goal => {
          const { children, metrics, ...goalData } = goal;
          flatGoals.push(goalData);
          if (children && children.length > 0) {
            flattenGoals(children);
          }
        });
      };
      
      flattenGoals(district.goals);
      
      // Expand all strategic objectives by default
      const strategicObjectiveIds = flatGoals
        .filter(g => g.level === 0)
        .map(g => g.id);
      setExpandedGoals(new Set(strategicObjectiveIds));
    } else {
      setHierarchicalGoals([]);
    }
  }, [district]);



  const handleAddTopLevel = async () => {
    if (onAddGoal) {
      // Extract flat goals from hierarchical structure to calculate next number
      const flatGoals: Goal[] = [];
      const flattenGoals = (goals: any[]) => {
        goals.forEach(goal => {
          const { children, metrics, ...goalData } = goal;
          flatGoals.push(goalData);
          if (children && children.length > 0) {
            flattenGoals(children);
          }
        });
      };
      
      flattenGoals(hierarchicalGoals);
      const goalNumber = getNextGoalNumber(null, flatGoals);
      await onAddGoal(null, 0, `Strategic Objective ${goalNumber}`);
    }
  };

  const handleWizardSubmit = async (objectiveData: { title: string; description?: string; metrics: Partial<any>[] }) => {
    if (!onAddGoal || !onAddMetric) return;
    
    setIsSubmittingObjective(true);
    try {
      // First create the strategic objective
      await onAddGoal(null, 0, objectiveData.title);
      
      // Wait a moment for the goal to be created and state to update
      // In a real implementation, we'd want the onAddGoal to return the created goal ID
      setTimeout(async () => {
        // Find the newly created goal by title (not ideal, but works for demo)
        const updatedDistrict = district; // This would be updated via TanStack Query
        if (updatedDistrict && updatedDistrict.goals && objectiveData.metrics.length > 0) {
          const newGoal = updatedDistrict.goals.find((g: any) => g.title === objectiveData.title);
          if (newGoal && onAddMetric) {
            // Add each metric to the new goal
            for (const metric of objectiveData.metrics) {
              await onAddMetric(newGoal.id, {
                ...metric,
                is_primary: metric === objectiveData.metrics[0], // First metric is primary
              });
            }
          }
        }
        setIsSubmittingObjective(false);
      }, 1000);

      // Update the goal with description if provided
      if (objectiveData.description && onUpdateGoal) {
        setTimeout(async () => {
          const updatedDistrict = district;
          if (updatedDistrict && updatedDistrict.goals) {
            const newGoal = updatedDistrict.goals.find((g: any) => g.title === objectiveData.title);
            if (newGoal) {
              await onUpdateGoal(newGoal.id, { description: objectiveData.description });
            }
          }
        }, 500);
      }
    } catch (error) {
      console.error('Error creating objective:', error);
      setIsSubmittingObjective(false);
    }
  };

  const handleAddChild = async (parentGoal: Goal) => {
    if (onAddGoal) {
      // Extract flat goals from hierarchical structure
      const flatGoals: Goal[] = [];
      const flattenGoals = (goals: any[]) => {
        goals.forEach(goal => {
          const { children, metrics, ...goalData } = goal;
          flatGoals.push(goalData);
          if (children && children.length > 0) {
            flattenGoals(children);
          }
        });
      };
      
      flattenGoals(hierarchicalGoals);
      const siblings = flatGoals.filter(g => g.parent_id === parentGoal.id);
      const goalNumber = getNextGoalNumber(parentGoal.goal_number, siblings);
      const level = (parentGoal.level + 1) as 0 | 1 | 2;
      await onAddGoal(parentGoal.id, level, `${getLevelName(level)} ${goalNumber}`);
    }
    setAddingChild(null);
  };

  const handleUpdateGoal = async (goalId: string, updates: Partial<Goal>) => {
    console.log('🔄 handleUpdateGoal called:', { goalId, updates });
    
    if (onUpdateGoal) {
      try {
        await onUpdateGoal(goalId, updates);
        console.log('✅ Goal update successful, closing edit mode');
        setEditingGoal(null);
      } catch (error) {
        console.error('❌ Error updating goal:', error);
        // Keep editing mode active so user can try again
        // TanStack Query will handle error toasts
      }
    } else {
      console.error('❌ onUpdateGoal prop not provided');
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    if (onDeleteGoal) {
      try {
        await onDeleteGoal(goalId);
        // TanStack Query will handle optimistic updates and success toasts
      } catch (error) {
        console.error('Error deleting goal:', error);
        // TanStack Query will handle error toasts and rollback
      }
    } else {
      console.error('onDeleteGoal prop not provided');
    }
  };

  const toggleExpanded = (goalId: string) => {
    const newExpanded = new Set(expandedGoals);
    if (newExpanded.has(goalId)) {
      newExpanded.delete(goalId);
    } else {
      newExpanded.add(goalId);
    }
    setExpandedGoals(newExpanded);
  };

  const handleMetricsUpdate = (goalId: string, updatedMetrics: Metric[]) => {
    // With TanStack Query, metrics updates are handled by mutations
    // This function may not be needed anymore, but keeping for backward compatibility
    console.log('handleMetricsUpdate called - now handled by TanStack Query mutations');
  };

  const renderGoal = (goal: GoalWithMetrics, depth: number = 0) => {
    const isExpanded = expandedGoals.has(goal.id);
    const isEditing = editingGoal === goal.id;
    const hasChildren = goal.children.length > 0;
    const canAddChild = goal.level < 2; // Can only add children to levels 0 and 1
    
    const levelColors = {
      0: 'bg-blue-50 border-blue-200',
      1: 'bg-green-50 border-green-200',
      2: 'bg-purple-50 border-purple-200'
    };

    return (
      <div key={goal.id} className={cn('mb-4', depth > 0 && 'ml-8')}>
        <Card className={cn('transition-colors', levelColors[goal.level])}>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-2 flex-1">
                {hasChildren && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-0 h-6 w-6"
                    onClick={() => toggleExpanded(goal.id)}
                  >
                    {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </Button>
                )}
                {!hasChildren && <div className="w-6" />}
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-bold text-blue-600">
                      {goal.goal_number}
                    </span>
                    <span className="text-xs font-semibold text-gray-500">
                      {getLevelName(goal.level)}
                    </span>
                  </div>
                  
                  {isEditing ? (
                    <div className="space-y-2">
                      <Input
                        defaultValue={goal.title}
                        className="font-semibold"
                        placeholder="Goal title"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            const value = e.currentTarget.value.trim();
                            if (value) {
                              console.log('📝 Enter pressed, updating title to:', value);
                              handleUpdateGoal(goal.id, { title: value });
                            }
                          } else if (e.key === 'Escape') {
                            setEditingGoal(null);
                          }
                        }}
                        autoFocus
                      />
                      <Textarea
                        defaultValue={goal.description || ''}
                        placeholder="Description (optional)"
                        className="min-h-[60px]"
                        onKeyDown={(e) => {
                          if (e.key === 'Escape') {
                            setEditingGoal(null);
                          }
                        }}
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={(e) => {
                            const titleInput = e.currentTarget.parentElement?.parentElement?.querySelector('input') as HTMLInputElement;
                            const descInput = e.currentTarget.parentElement?.parentElement?.querySelector('textarea') as HTMLTextAreaElement;
                            const title = titleInput?.value?.trim();
                            const description = descInput?.value?.trim();
                            
                            if (title) {
                              console.log('💾 Save button clicked, updating goal:', { title, description });
                              handleUpdateGoal(goal.id, {
                                title,
                                description: description || null
                              });
                            }
                          }}
                        >
                          <Check size={14} className="mr-1" /> Save
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingGoal(null)}
                        >
                          <X size={14} className="mr-1" /> Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <h3 className="font-semibold text-lg">{goal.title}</h3>
                      {goal.description && (
                        <p className="text-sm text-gray-600 mt-1">{goal.description}</p>
                      )}
                    </>
                  )}
                </div>
              </div>
              
              {!isEditing && (
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingGoal(goal.id)}
                  >
                    <Edit2 size={14} />
                  </Button>
                  {canAddChild && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleAddChild(goal)}
                    >
                      <Plus size={14} />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteGoal(goal.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          
          <CardContent>
            {/* Metrics Section */}
            <div className="mt-2">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 size={16} className="text-gray-500" />
                <span className="text-sm font-medium text-gray-700">
                  Metrics ({goal.metrics.length})
                </span>
              </div>
              <MetricInput
                goalId={goal.id}
                metrics={goal.metrics}
                onUpdate={(updatedMetrics) => handleMetricsUpdate(goal.id, updatedMetrics)}
                onAddMetric={onAddMetric}
                onUpdateMetric={onUpdateMetric}
                onDeleteMetric={onDeleteMetric}
              />
            </div>
          </CardContent>
        </Card>
        
        {/* Render children if expanded */}
        {isExpanded && goal.children.map(child => renderGoal(child, depth + 1))}
      </div>
    );
  };

  // Loading state is handled by the parent component

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Strategic Plan Structure</h2>
        {hierarchicalGoals.length > 0 && (
          <Button onClick={() => setIsWizardOpen(true)} className="bg-blue-600 hover:bg-blue-700">
            <Sparkles className="mr-2" size={16} />
            Add Strategic Objective
          </Button>
        )}
      </div>
      
      {hierarchicalGoals.length === 0 ? (
        <Card className="border-2 border-dashed border-gray-200 bg-gray-50/50">
          <CardContent className="p-12 text-center">
            <div className="max-w-md mx-auto space-y-6">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <Target className="w-10 h-10 text-blue-600" />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-gray-900">
                  Ready to Build Your Strategic Plan?
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Create your first Strategic Objective to get started. Our guided wizard will walk you through 
                  defining objectives, setting measurable goals, and tracking success metrics.
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <Button 
                  onClick={() => setIsWizardOpen(true)}
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8"
                >
                  <Sparkles className="mr-2" size={20} />
                  Create Your First Strategic Objective
                </Button>
                
                <div className="flex items-center justify-center gap-6 text-sm text-gray-500 mt-4">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-semibold text-xs">1</span>
                    </div>
                    <span>Name & Describe</span>
                  </div>
                  <ChevronRight size={16} className="text-gray-400" />
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-semibold text-xs">2</span>
                    </div>
                    <span>Add Metrics</span>
                  </div>
                  <ChevronRight size={16} className="text-gray-400" />
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-semibold text-xs">3</span>
                    </div>
                    <span>Review & Create</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                  <BookOpen size={16} />
                  <span>Includes examples and best practices to guide you</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {hierarchicalGoals.map(goal => renderGoal(goal))}
        </div>
      )}

      <ObjectiveWizard
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        onSubmit={handleWizardSubmit}
        isSubmitting={isSubmittingObjective}
      />
    </div>
  );
}