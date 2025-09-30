'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Clock, 
  Target, 
  TrendingUp, 
  Plus, 
  Edit2, 
  Save, 
  X,
  AlertCircle,
  CheckCircle,
  BarChart3,
  Activity
} from 'lucide-react';
import { GoalWithMetrics, Metric } from '@/lib/types';
import { useUpdateGoal, useCreateMetric, useUpdateMetric, useDeleteMetric } from '@/hooks/use-district';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import StrategicObjectiveEdit from '@/components/StrategicObjectiveEdit';

interface ExpandedObjectiveViewProps {
  goal: GoalWithMetrics;
  districtSlug: string;
  onRefresh: () => void;
  onEditSubGoal?: (goalId: string) => void;
}

export default function ExpandedObjectiveView({
  goal,
  districtSlug,
  onRefresh,
  onEditSubGoal
}: ExpandedObjectiveViewProps) {
  const [isEditMode, setIsEditMode] = useState(false);
  const updateGoalMutation = useUpdateGoal(districtSlug);
  const createMetricMutation = useCreateMetric(districtSlug);
  const updateMetricMutation = useUpdateMetric(districtSlug);
  const deleteMetricMutation = useDeleteMetric(districtSlug);

  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [description, setDescription] = useState(goal.description || '');
  const [isAddingMetric, setIsAddingMetric] = useState(false);
  const [editingMetricId, setEditingMetricId] = useState<string | null>(null);
  
  const [newMetric, setNewMetric] = useState({
    name: '',
    current_value: 0,
    target_value: 0,
    unit: ''
  });

  const [editingMetric, setEditingMetric] = useState<Partial<Metric>>({});

  useEffect(() => {
    setDescription(goal.description || '');
  }, [goal.description]);

  // Use the new component for level-0 strategic objectives
  if (goal.level === 0 && isEditMode) {
    return (
      <StrategicObjectiveEdit
        goal={goal}
        districtSlug={districtSlug}
        onRefresh={onRefresh}
        onClose={() => setIsEditMode(false)}
      />
    );
  }

  // Calculate overall progress
  const calculateProgress = () => {
    const metrics = goal.metrics || [];
    const validMetrics = metrics.filter(m => 
      m.current_value !== undefined && 
      m.target_value !== undefined && 
      m.target_value > 0
    );
    
    if (validMetrics.length === 0) return 0;
    
    const totalProgress = validMetrics.reduce((sum, m) => 
      sum + (m.current_value! / m.target_value! * 100), 0
    );
    
    return Math.round(totalProgress / validMetrics.length);
  };

  const progress = calculateProgress();

  // Calculate status
  const getStatus = () => {
    if (progress >= 100) return 'achieved';
    if (progress >= 70) return 'on-target';
    if (progress >= 40) return 'needs-attention';
    return 'at-risk';
  };

  const status = getStatus();

  // Generate mock trend data
  const generateTrendData = () => {
    const months = ['Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months.map((month, index) => ({
      month,
      value: Math.max(0, progress - (5 - index) * 10 + Math.random() * 15)
    }));
  };

  const trendData = generateTrendData();

  // Handle description save
  const handleSaveDescription = async () => {
    try {
      await updateGoalMutation.mutateAsync({
        goalId: goal.id,
        updates: { description }
      });
      setIsEditingDescription(false);
      toast.success('Description updated');
      onRefresh();
    } catch (error) {
      toast.error('Failed to update description');
    }
  };

  // Handle add metric
  const handleAddMetric = async () => {
    if (!newMetric.name) {
      toast.error('Metric name is required');
      return;
    }

    try {
      await createMetricMutation.mutateAsync({
        goalId: goal.id,
        metric: newMetric
      });
      setNewMetric({ name: '', current_value: 0, target_value: 0, unit: '' });
      setIsAddingMetric(false);
      toast.success('Metric added successfully');
      onRefresh();
    } catch (error) {
      toast.error('Failed to add metric');
    }
  };

  // Handle update metric
  const handleUpdateMetric = async (metricId: string) => {
    try {
      await updateMetricMutation.mutateAsync({
        metricId,
        updates: editingMetric
      });
      setEditingMetricId(null);
      setEditingMetric({});
      toast.success('Metric updated');
      onRefresh();
    } catch (error) {
      toast.error('Failed to update metric');
    }
  };

  // Handle delete metric
  const handleDeleteMetric = async (metricId: string) => {
    if (!confirm('Are you sure you want to delete this metric?')) return;
    
    try {
      await deleteMetricMutation.mutateAsync(metricId);
      toast.success('Metric deleted');
      onRefresh();
    } catch (error) {
      toast.error('Failed to delete metric');
    }
  };

  // Get status badge component
  const getStatusBadge = () => {
    const configs = {
      'achieved': { 
        icon: CheckCircle,
        label: 'Achieved',
        className: 'bg-green-50 text-green-700 border-green-200'
      },
      'on-target': { 
        icon: Target,
        label: 'On Track',
        className: 'bg-blue-50 text-blue-700 border-blue-200'
      },
      'needs-attention': { 
        icon: AlertCircle,
        label: 'Needs Attention',
        className: 'bg-amber-50 text-amber-700 border-amber-200'
      },
      'at-risk': { 
        icon: AlertCircle,
        label: 'At Risk',
        className: 'bg-red-50 text-red-700 border-red-200'
      }
    };
    
    const config = configs[status] || configs['on-target'];
    const Icon = config.icon;
    
    return (
      <Badge className={cn('border flex items-center gap-1.5 px-2 py-1', config.className)}>
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  // Get objective status badge
  const getObjectiveStatusBadge = (objective: GoalWithMetrics) => {
    const metrics = objective.metrics || [];
    const hasMetrics = metrics.length > 0;
    
    if (!hasMetrics) {
      return (
        <Badge className="bg-yellow-50 text-yellow-700 border-yellow-200">
          At Risk
        </Badge>
      );
    }
    
    const validMetrics = metrics.filter(m => 
      m.current_value !== undefined && 
      m.target_value !== undefined && 
      m.target_value > 0
    );
    
    if (validMetrics.length === 0) {
      return (
        <Badge className="bg-yellow-50 text-yellow-700 border-yellow-200">
          At Risk
        </Badge>
      );
    }
    
    const avgProgress = validMetrics.reduce((sum, m) => 
      sum + (m.current_value! / m.target_value! * 100), 0
    ) / validMetrics.length;
    
    if (avgProgress >= 70) {
      return (
        <Badge className="bg-green-50 text-green-700 border-green-200">
          On Track
        </Badge>
      );
    }
    
    return (
      <Badge className="bg-yellow-50 text-yellow-700 border-yellow-200">
        At Risk
      </Badge>
    );
  };

  return (
    <div className="space-y-6 px-6 py-4 bg-gray-50 border-t border-gray-200">
      {/* Empty for now - Edit button has been moved inline */}
      <div className="text-sm text-gray-500">
        {/* You can add metrics, progress charts, or other details here */}
      </div>
    </div>
  );
}