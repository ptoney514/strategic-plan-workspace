'use client';

import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { GoalWithMetrics } from '@/lib/types';
import { useUpdateGoal } from '@/hooks/use-district';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface GoalEditModalProps {
  goal: GoalWithMetrics | null;
  isOpen: boolean;
  onClose: () => void;
  districtSlug: string;
  onSuccess?: () => void;
}

export default function GoalEditModal({
  goal,
  isOpen,
  onClose,
  districtSlug,
  onSuccess
}: GoalEditModalProps) {
  const updateGoalMutation = useUpdateGoal(districtSlug);
  
  const [formData, setFormData] = useState({
    title: '',
    description: ''
  });

  useEffect(() => {
    if (goal) {
      setFormData({
        title: goal.title || '',
        description: goal.description || ''
      });
    }
  }, [goal]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goal) return;

    try {
      await updateGoalMutation.mutateAsync({
        goalId: goal.id,
        updates: formData
      });
      toast.success('Goal updated successfully');
      onSuccess?.();
      onClose();
    } catch (error) {
      toast.error('Failed to update goal');
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Get goal type label
  const getGoalTypeLabel = () => {
    if (!goal) return '';
    if (goal.level === 0) return 'Strategic Objective';
    if (goal.level === 1) return 'Goal';
    return 'Sub-goal';
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          'fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300',
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={onClose}
      />

      {/* Slide-out Panel */}
      <div
        className={cn(
          'fixed right-0 top-0 h-full w-full max-w-2xl bg-white shadow-2xl z-50 transition-transform duration-300 ease-out',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Edit Goal</h2>
            <p className="text-sm text-gray-500 mt-1">
              Update the details for this {getGoalTypeLabel().toLowerCase()}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {goal && (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Goal Number and Type */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Goal Number</Label>
                  <div className="mt-1 px-3 py-2 bg-gray-50 rounded-md text-sm text-gray-900">
                    {goal.goal_number}
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Type</Label>
                  <div className="mt-1 px-3 py-2 bg-gray-50 rounded-md text-sm text-gray-900">
                    {getGoalTypeLabel()}
                  </div>
                </div>
              </div>

              {/* Title */}
              <div>
                <Label htmlFor="title" className="text-sm font-medium text-gray-700">
                  Title <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className="mt-1"
                  placeholder="Enter goal title"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <Label htmlFor="description" className="text-sm font-medium text-gray-700">
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="mt-1"
                  rows={4}
                  placeholder="Enter goal description"
                />
              </div>


              {/* Parent Goal Info */}
              {goal.parent_id && (
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-800">
                    <span className="font-medium">Parent Goal:</span> This goal is nested under another goal in the hierarchy.
                  </p>
                </div>
              )}

              {/* Metrics Summary */}
              {goal.metrics && goal.metrics.length > 0 && (
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Associated Metrics</h3>
                  <p className="text-sm text-gray-600">
                    This goal has {goal.metrics.length} metric{goal.metrics.length === 1 ? '' : 's'} attached.
                  </p>
                </div>
              )}

              {/* Footer with Actions */}
              <div className="flex items-center justify-end gap-3 pt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={updateGoalMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {updateGoalMutation.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </>
  );
}