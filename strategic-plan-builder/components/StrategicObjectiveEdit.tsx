'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Save,
  X,
  Check,
  Info,
  FileText,
  TrendingUp,
  Users,
  DollarSign,
  Trash2,
  Palette,
  Image as ImageIcon
} from 'lucide-react';
import { GoalWithMetrics } from '@/lib/types';
import { useUpdateGoal, useDeleteGoal } from '@/hooks/use-district';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { ImagePicker } from '@/components/ui/image-picker';

interface StrategicObjectiveEditProps {
  goal: GoalWithMetrics;
  districtSlug: string;
  onRefresh: () => void;
  onClose?: () => void;
}

// Predefined color palette with suggested use cases
const COLOR_PALETTE = [
  { hex: '#10B981', name: 'Green', label: 'On Track', description: 'Goal is progressing well' },
  { hex: '#84CC16', name: 'Light Green', label: 'Progressing', description: 'Making steady progress' },
  { hex: '#EAB308', name: 'Yellow', label: 'Caution', description: 'Needs monitoring' },
  { hex: '#F97316', name: 'Orange', label: 'Needs Attention', description: 'Requires immediate focus' },
  { hex: '#EF4444', name: 'Red', label: 'At Risk', description: 'Critical issues' },
  { hex: '#3B82F6', name: 'Blue', label: 'Information', description: 'Informational status' },
  { hex: '#8B5CF6', name: 'Purple', label: 'Strategic', description: 'Strategic priority' },
  { hex: '#6B7280', name: 'Gray', label: 'Not Started', description: 'Not yet begun' },
];

// Header background color palette
const HEADER_COLOR_PALETTE = [
  { hex: '#3B82F6', name: 'Blue', label: 'Primary' },
  { hex: '#10B981', name: 'Emerald', label: 'Success' },
  { hex: '#8B5CF6', name: 'Purple', label: 'Creative' },
  { hex: '#F59E0B', name: 'Amber', label: 'Energy' },
  { hex: '#EF4444', name: 'Red', label: 'Urgent' },
  { hex: '#EC4899', name: 'Pink', label: 'Innovation' },
  { hex: '#6366F1', name: 'Indigo', label: 'Professional' },
  { hex: '#14B8A6', name: 'Teal', label: 'Balance' },
  { hex: '#F97316', name: 'Orange', label: 'Dynamic' },
  { hex: '#06B6D4', name: 'Cyan', label: 'Modern' },
  { hex: '#84CC16', name: 'Lime', label: 'Growth' },
  { hex: '#64748B', name: 'Slate', label: 'Neutral' },
];

export default function StrategicObjectiveEdit({
  goal,
  districtSlug,
  onRefresh,
  onClose
}: StrategicObjectiveEditProps) {
  const updateGoalMutation = useUpdateGoal(districtSlug);
  const deleteGoalMutation = useDeleteGoal(districtSlug);
  
  // Form state
  const [title, setTitle] = useState(goal.title || '');
  const [description, setDescription] = useState(goal.description || '');
  const [indicatorText, setIndicatorText] = useState(goal.indicator_text || '');
  const [indicatorColor, setIndicatorColor] = useState(goal.indicator_color || '#10B981');
  const [imageUrl, setImageUrl] = useState(goal.image_url || '');
  const [headerColor, setHeaderColor] = useState(goal.header_color || '');
  const [headerType, setHeaderType] = useState<'image' | 'color'>(goal.image_url ? 'image' : 'color');
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Track changes
  useEffect(() => {
    const changed = 
      title !== goal.title ||
      description !== (goal.description || '') ||
      indicatorText !== (goal.indicator_text || '') ||
      indicatorColor !== (goal.indicator_color || '#10B981') ||
      imageUrl !== (goal.image_url || '') ||
      headerColor !== (goal.header_color || '');
    setHasChanges(changed);
  }, [title, description, indicatorText, indicatorColor, imageUrl, headerColor, goal]);

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
          indicator_color: indicatorColor || null,
          image_url: headerType === 'image' ? imageUrl || null : null,
          header_color: headerType === 'color' ? headerColor || null : null
        }
      });
      toast.success('Strategic objective updated successfully');
      onRefresh();
      setHasChanges(false);
    } catch (error) {
      console.error('Failed to update goal:', error);
      toast.error('Failed to update strategic objective');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    if (hasChanges) {
      if (!confirm('You have unsaved changes. Are you sure you want to discard them?')) {
        return;
      }
    }
    // Reset to original values
    setTitle(goal.title || '');
    setDescription(goal.description || '');
    setIndicatorText(goal.indicator_text || '');
    setIndicatorColor(goal.indicator_color || '#10B981');
    setImageUrl(goal.image_url || '');
    setHeaderColor(goal.header_color || '');
    setHeaderType(goal.image_url ? 'image' : 'color');
    setHasChanges(false);
    onClose?.();
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
      toast.success('Strategic objective deleted successfully');
      onRefresh();
      onClose?.();
    } catch (error) {
      console.error('Failed to delete goal:', error);
      toast.error('Failed to delete strategic objective');
    } finally {
      setIsDeleting(false);
    }
  };

  // Get selected color info
  const selectedColorInfo = COLOR_PALETTE.find(c => c.hex === indicatorColor) || COLOR_PALETTE[0];

  return (
    <div className="space-y-6 px-6 py-4 bg-white rounded-lg">
      {/* Header */}
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Edit Strategic Objective
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {goal.goal_number} - Modify the basic information and status indicator
          </p>
        </div>
        <div className="flex items-center gap-2">
          {hasChanges && (
            <Badge variant="secondary" className="text-xs">
              Unsaved changes
            </Badge>
          )}
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
          <div className="h-4 w-px bg-gray-300" />
          <Button
            variant="outline"
            size="sm"
            onClick={handleCancel}
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

      {/* Tabs */}
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Basic Info
          </TabsTrigger>
          <TabsTrigger value="metrics" className="flex items-center gap-2" disabled>
            <TrendingUp className="h-4 w-4" />
            Metrics
          </TabsTrigger>
          <TabsTrigger value="planning" className="flex items-center gap-2" disabled>
            <Users className="h-4 w-4" />
            Planning
          </TabsTrigger>
          <TabsTrigger value="resources" className="flex items-center gap-2" disabled>
            <DollarSign className="h-4 w-4" />
            Resources
          </TabsTrigger>
        </TabsList>

        {/* Basic Info Tab */}
        <TabsContent value="basic" className="space-y-6 mt-6">
          {/* Title Field */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Title <span className="text-red-500">*</span>
            </label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter strategic objective title"
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
              placeholder="Provide a detailed description of this strategic objective..."
              className="min-h-[120px] w-full"
            />
          </div>

          {/* Custom Indicator Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Status Indicator</CardTitle>
              <CardDescription>
                Set a custom status indicator with your preferred text and color
              </CardDescription>
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
                  placeholder="e.g., On Target, At Risk, In Progress..."
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
                        "relative p-3 rounded-lg border-2 transition-all",
                        "hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2",
                        indicatorColor === color.hex
                          ? "border-gray-900 shadow-md"
                          : "border-gray-200"
                      )}
                      style={{ 
                        backgroundColor: color.hex + '20'
                      }}
                    >
                      <div className="flex flex-col items-center space-y-2">
                        <div 
                          className="w-8 h-8 rounded-full shadow-sm"
                          style={{ backgroundColor: color.hex }}
                        />
                        <span className="text-xs font-medium text-gray-700">
                          {color.label}
                        </span>
                        {indicatorColor === color.hex && (
                          <Check className="absolute top-1 right-1 h-4 w-4 text-gray-900" />
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
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <Badge 
                      className="px-3 py-1.5 text-sm font-medium"
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

          {/* Header Background Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Header Background</CardTitle>
              <CardDescription>
                Choose between an image or a solid color for the objective header
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Toggle between image and color */}
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={headerType === 'image' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setHeaderType('image')}
                  className="flex items-center gap-2"
                >
                  <ImageIcon className="h-4 w-4" />
                  Use Image
                </Button>
                <Button
                  type="button"
                  variant={headerType === 'color' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setHeaderType('color')}
                  className="flex items-center gap-2"
                >
                  <Palette className="h-4 w-4" />
                  Use Color
                </Button>
              </div>

              {/* Image Picker */}
              {headerType === 'image' && (
                <div className="space-y-2">
                  <ImagePicker
                    value={imageUrl}
                    onChange={(url) => setImageUrl(url || '')}
                  />
                </div>
              )}

              {/* Color Picker */}
              {headerType === 'color' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Select Header Color
                    </label>
                    <div className="grid grid-cols-4 gap-3">
                      {HEADER_COLOR_PALETTE.map((color) => (
                        <button
                          key={color.hex}
                          type="button"
                          onClick={() => setHeaderColor(color.hex)}
                          className={cn(
                            "relative p-3 rounded-lg border-2 transition-all",
                            "hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2",
                            headerColor === color.hex
                              ? "border-gray-900 shadow-md"
                              : "border-gray-200"
                          )}
                        >
                          <div className="flex flex-col items-center space-y-2">
                            <div
                              className="w-full h-12 rounded-md shadow-sm"
                              style={{ backgroundColor: color.hex }}
                            />
                            <span className="text-xs font-medium text-gray-700">
                              {color.label}
                            </span>
                            {headerColor === color.hex && (
                              <Check className="absolute top-1 right-1 h-4 w-4 text-gray-900" />
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Color Preview */}
                  {headerColor && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Preview
                      </label>
                      <div
                        className="w-full h-32 rounded-lg shadow-md flex items-center justify-center"
                        style={{ backgroundColor: headerColor }}
                      >
                        <span className="text-white font-semibold text-lg drop-shadow-md">
                          {title || 'Strategic Objective'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Metrics Tab (Placeholder) */}
        <TabsContent value="metrics" className="mt-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8 text-gray-500">
                <TrendingUp className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p className="text-sm">Metrics management coming soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Planning Tab (Placeholder) */}
        <TabsContent value="planning" className="mt-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8 text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p className="text-sm">Planning features coming soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Resources Tab (Placeholder) */}
        <TabsContent value="resources" className="mt-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8 text-gray-500">
                <DollarSign className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p className="text-sm">Resource management coming soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}