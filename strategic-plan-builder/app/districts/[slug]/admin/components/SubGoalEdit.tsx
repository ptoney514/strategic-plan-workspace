'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Save, 
  X,
  Trash2,
  Edit2,
  Check,
  Info
} from 'lucide-react';
import { GoalWithMetrics } from '@/lib/types';
import { useUpdateGoal, useDeleteGoal } from '@/hooks/use-district';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface SubGoalEditProps {
  goal: GoalWithMetrics;
  districtSlug: string;
  onRefresh: () => void;
  onClose: () => void;
}

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

export default function SubGoalEdit({
  goal,
  districtSlug,
  onRefresh,
  onClose
}: SubGoalEditProps) {
  const updateGoalMutation = useUpdateGoal(districtSlug);
  const deleteGoalMutation = useDeleteGoal(districtSlug);

  const [title, setTitle] = useState(goal.title || '');
  const [description, setDescription] = useState(goal.description || '');
  const [indicatorText, setIndicatorText] = useState(goal.indicator_text || '');
  const [indicatorColor, setIndicatorColor] = useState(goal.indicator_color || '#10B981');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Check for changes
  useEffect(() => {
    const changed = 
      title !== goal.title ||
      description !== (goal.description || '') ||
      indicatorText !== (goal.indicator_text || '') ||
      indicatorColor !== (goal.indicator_color || '#10B981');
    setHasChanges(changed);
  }, [title, description, indicatorText, indicatorColor, goal]);

  // Handle save
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
      setHasChanges(false);
    } catch (error) {
      console.error('Failed to update goal:', error);
      toast.error('Failed to update goal');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle delete
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

  // Get selected color info
  const selectedColorInfo = COLOR_PALETTE.find(c => c.hex === indicatorColor) || COLOR_PALETTE[0];

  return (
    <div className="bg-gray-50 border-t border-gray-200 p-6">
      <div className="max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Edit2 className="h-5 w-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              Edit Goal {goal.goal_number}
            </h3>
            {hasChanges && (
              <Badge variant="secondary" className="text-xs">
                Unsaved changes
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDelete}
              disabled={isDeleting}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
            >
              <X className="h-4 w-4 mr-1" />
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={!hasChanges || isSaving}
            >
              <Save className="h-4 w-4 mr-1" />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>

        {/* Form */}
        <div className="space-y-6">
          {/* Title Field */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Title <span className="text-red-500">*</span>
            </label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter goal title"
              className="w-full"
            />
          </div>

          {/* Description Field */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide a detailed description of this goal..."
              className="min-h-[100px] w-full"
            />
          </div>

          {/* Custom Indicator Section - Only for level 1 goals */}
          {goal.level === 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Status Indicator</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Indicator Text */}
                <div>
                  <label htmlFor="indicator" className="block text-sm font-medium text-gray-700 mb-2">
                    Indicator Text
                  </label>
                  <Input
                    id="indicator"
                    value={indicatorText}
                    onChange={(e) => setIndicatorText(e.target.value)}
                    placeholder="e.g., At Risk, In Progress..."
                    className="w-full"
                  />
                </div>

                {/* Color Picker */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Indicator Color
                  </label>
                  <div className="grid grid-cols-4 gap-3">
                    {COLOR_PALETTE.map((color) => (
                      <button
                        key={color.hex}
                        onClick={() => setIndicatorColor(color.hex)}
                        className={cn(
                          "relative p-2 rounded-lg border-2 transition-all",
                          "hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2",
                          indicatorColor === color.hex
                            ? "border-gray-900 shadow-md"
                            : "border-gray-200"
                        )}
                        style={{ 
                          backgroundColor: color.hex + '20'
                        }}
                      >
                        <div className="flex flex-col items-center space-y-1">
                          <div 
                            className="w-6 h-6 rounded-full shadow-sm"
                            style={{ backgroundColor: color.hex }}
                          />
                          <span className="text-xs font-medium text-gray-700">
                            {color.label}
                          </span>
                          {indicatorColor === color.hex && (
                            <Check className="absolute top-1 right-1 h-3 w-3 text-gray-900" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                  <p className="mt-2 text-xs text-gray-500 flex items-center gap-1">
                    <Info className="h-3 w-3" />
                    {selectedColorInfo.description}
                  </p>
                </div>

                {/* Preview */}
                {(indicatorText || indicatorColor) && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Preview
                    </label>
                    <div className="p-3 bg-white rounded-lg border">
                      <Badge 
                        className="px-2 py-1 text-xs font-medium"
                        style={{
                          backgroundColor: indicatorColor + '20',
                          color: indicatorColor,
                          borderColor: indicatorColor
                        }}
                      >
                        {indicatorText || 'Status Indicator'}
                      </Badge>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}