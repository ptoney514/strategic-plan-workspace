'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ImagePicker } from '@/components/ui/image-picker';
import {
  Target,
  CheckCircle,
  AlertCircle,
  Clock,
  Activity,
  Users,
  Briefcase,
  GraduationCap,
  BarChart3,
  Settings,
} from 'lucide-react';
import { GoalWithMetrics } from '@/lib/types';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useUpdateGoal } from '@/hooks/use-district';
import { MetricsEditPanelSimple } from '@/components/MetricsEditPanelSimple';

interface GoalDetailPanelSimpleProps {
  goal: GoalWithMetrics | null;
  districtSlug: string;
  onRefresh: () => void;
  onClose: () => void;
}

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

export default function GoalDetailPanelSimple({
  goal,
  districtSlug,
  onRefresh,
  onClose
}: GoalDetailPanelSimpleProps) {
  const updateGoalMutation = useUpdateGoal(districtSlug);
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [indicatorText, setIndicatorText] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  React.useEffect(() => {
    if (goal) {
      setTitle(goal.title || '');
      setDescription(goal.description || '');
      setIndicatorText(goal.indicator_text || 'Not Started');
      setImageUrl(goal.image_url || '');
      setIsEditing(false);
    }
  }, [goal]);

  if (!goal) {
    return (
      <div className="h-full p-8">
        <Card className="h-full bg-white shadow-sm border-0 flex items-center justify-center">
          <div className="text-center px-8">
            <div className="mx-auto h-20 w-20 rounded-full bg-gray-50 flex items-center justify-center mb-6">
              <Target className="h-10 w-10 text-gray-300" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No objective selected</h3>
            <p className="text-sm text-gray-500 max-w-sm mx-auto">
              Select an objective from the left panel to view its details, metrics, and sub-goals
            </p>
          </div>
        </Card>
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
      const statusConfig = STATUS_CONFIG[indicatorText as keyof typeof STATUS_CONFIG];
      const updates: any = {
        title: title.trim(),
        description: description.trim(),
        indicator_text: indicatorText,
        indicator_color: statusConfig?.color || '#6B7280'
      };
      
      // Include image_url for strategic objectives
      if (goal.level === 0) {
        updates.image_url = imageUrl || null;
      }
      
      await updateGoalMutation.mutateAsync({
        goalId: goal.id,
        updates
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

  const statusText = goal.indicator_text || 'Not Started';
  const statusConfig = STATUS_CONFIG[statusText as keyof typeof STATUS_CONFIG] || STATUS_CONFIG['Not Started'];
  const StatusIcon = statusConfig.icon;

  // Default solid color gradient for objectives without images
  const getDefaultGradient = (goalNumber: string) => {
    const gradients = [
      'from-blue-400 to-blue-600',
      'from-emerald-400 to-emerald-600',
      'from-purple-400 to-purple-600',
      'from-amber-400 to-amber-600',
      'from-rose-400 to-rose-600',
      'from-indigo-400 to-indigo-600'
    ];
    // Use goal number to consistently select a gradient
    const index = parseInt(goalNumber.replace(/\D/g, '')) % gradients.length;
    return gradients[index] || gradients[0];
  };

  return (
    <div className="h-full p-8">
      <Card className="h-full bg-white shadow-sm border-0 overflow-hidden">
        <ScrollArea className="h-full">
          {/* Cover Image Section for Strategic Objectives */}
          {goal.level === 0 && (
            <div className="relative h-56 -mt-1 -mx-1 mb-6">
              {imageUrl || goal.image_url ? (
                <img
                  src={imageUrl || goal.image_url}
                  alt={goal.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className={`w-full h-full bg-gradient-to-br ${getDefaultGradient(goal.goal_number)}`} />
              )}
              {/* Darker overlay for better text readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/30" />
              <div className="absolute bottom-4 left-8 right-8">
                <div className="flex items-center gap-2 mb-2">
                  <StatusIcon className="h-5 w-5 text-white/90" />
                  <span className="text-sm font-medium text-white/90">
                    {statusText}
                  </span>
                </div>
                <h1 className="text-2xl font-bold text-white mb-2">
                  {goal.goal_number}. {goal.title}
                </h1>
                <p className="text-sm text-white/90 leading-relaxed">
                  {goal.description || 'Ensure equitable access to quality education for all students'}
                </p>
              </div>
            </div>
          )}
          
          <div className="p-8">
            {/* Header with Status and Edit Button - Only for non-strategic objectives */}
            {goal.level !== 0 && (
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  {/* Status Badge */}
                  <div className="flex items-center gap-2 mb-4">
                    <StatusIcon className="h-4 w-4" style={{ color: statusConfig.color }} />
                    <span className="text-sm font-medium" style={{ color: statusConfig.color }}>
                      {statusText}
                    </span>
                  </div>
                  
                  {/* Title */}
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    {goal.goal_number}. {!isEditing ? goal.title : ''}
                  </h1>
                  {isEditing && (
                    <Input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Enter goal title"
                      className="mb-4 text-xl font-semibold"
                    />
                  )}
                  
                  {/* Description */}
                  <p className="text-gray-600">
                    {!isEditing ? (goal.description || 'Integrate technology and innovative teaching methods') : ''}
                  </p>
                  {isEditing && (
                    <Textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Enter goal description"
                      className="mt-2 min-h-[80px]"
                    />
                  )}
                </div>
                
                {/* Edit Button Only */}
                <div className="flex items-center gap-2 ml-4">
                  {!isEditing && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditing(true)}
                    >
                      Edit
                    </Button>
                  )}
                </div>
              </div>
            )}

            {/* For Strategic Objectives - Simplified header with just edit button */}
            {goal.level === 0 && (
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  {/* Title (editable) */}
                  {isEditing && (
                    <>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                      <Input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Enter goal title"
                        className="mb-4 text-xl font-semibold"
                      />
                    </>
                  )}
                  
                  {/* Description */}
                  <p className="text-gray-600">
                    {!isEditing ? (goal.description || 'Ensure equitable access to quality education for all students') : ''}
                  </p>
                  {isEditing && (
                    <>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                      <Textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Enter goal description"
                        className="min-h-[80px]"
                      />
                    </>
                  )}
                </div>
                
                {/* Edit Button Only */}
                <div className="flex items-center gap-2 ml-4">
                  {!isEditing && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditing(true)}
                    >
                      Edit
                    </Button>
                  )}
                </div>
              </div>
            )}

            {/* Save/Cancel buttons when editing */}
            {isEditing && (
              <div className="flex justify-end gap-2 mb-6 pb-4 border-b">
                <Button
                  variant="outline"
                  onClick={() => {
                    setTitle(goal.title || '');
                    setDescription(goal.description || '');
                    setIndicatorText(goal.indicator_text || 'Not Started');
                    setImageUrl(goal.image_url || '');
                    setIsEditing(false);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            )}
            
            {/* Content Sections - No Tabs */}
            <div className="space-y-8">
              {/* Status Selector - Only show when editing */}
              {isEditing && (goal.level === 0 || goal.level === 1) && (
                <div>
                  <h3 className="text-base font-semibold text-gray-900 mb-4">Status</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(STATUS_CONFIG).map(([status, config]) => {
                      const Icon = config.icon;
                      return (
                        <button
                          key={status}
                          onClick={() => setIndicatorText(status)}
                          className={cn(
                            "flex items-center gap-2 p-3 rounded-lg border-2 transition-all",
                            indicatorText === status
                              ? "border-blue-500 bg-blue-50"
                              : "border-gray-200 hover:border-gray-300"
                          )}
                        >
                          <Icon 
                            className="h-4 w-4" 
                            style={{ color: config.color }}
                          />
                          <span className="text-sm font-medium">{status}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Objectives under this goal */}
              {goal.children && goal.children.length > 0 && (
                <div>
                  <h3 className="text-base font-semibold text-gray-900 mb-4">Objectives under this goal</h3>
                  <div className="space-y-3">
                    {goal.children.map(child => {
                      const childStatus = child.indicator_text || 'Not Started';
                      const childConfig = STATUS_CONFIG[childStatus as keyof typeof STATUS_CONFIG] || STATUS_CONFIG['Not Started'];
                      const ChildIcon = childConfig.icon;
                      
                      return (
                        <div key={child.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <ChildIcon 
                            className="h-4 w-4 flex-shrink-0" 
                            style={{ color: childConfig.color }}
                          />
                          <div className="flex-1 flex items-center gap-2">
                            <span className="font-medium text-sm">{child.goal_number}</span>
                            <span className="text-sm text-gray-700">{child.title}</span>
                          </div>
                          <Badge 
                            variant="outline"
                            className={cn(
                              "text-xs",
                              childConfig.bgColor,
                              childConfig.textColor,
                              childConfig.borderColor
                            )}
                          >
                            {childStatus}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Cover Image Section - Only for Strategic Objectives */}
              {goal.level === 0 && isEditing && (
                <div>
                  <h3 className="text-base font-semibold text-gray-900 mb-2">Cover Photo</h3>
                  <p className="text-sm text-gray-500 mb-4">Choose an image to display on the strategic objective card</p>
                  <ImagePicker
                    value={imageUrl}
                    onChange={(url) => setImageUrl(url || '')}
                  />
                  {/* Preview of selected image */}
                  {imageUrl && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-600 mb-2">Preview:</p>
                      <div className="relative h-32 rounded-lg overflow-hidden border border-gray-200">
                        <img
                          src={imageUrl}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Metrics Section - Always visible */}
              <MetricsEditPanelSimple
                goalId={goal.id}
                districtSlug={districtSlug}
                metrics={goal.metrics || []}
                onRefresh={onRefresh}
              />
            </div>
          </div>
        </ScrollArea>
      </Card>
    </div>
  );
}