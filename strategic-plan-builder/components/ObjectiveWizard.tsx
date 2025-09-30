'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, ChevronLeft, Target, BarChart3, CheckCircle, Lightbulb, BookOpen, Flag, Zap } from 'lucide-react';
import { Metric, MetricType, DataSourceType } from '@/lib/types';

interface ObjectiveWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (objective: { title: string; description?: string; metrics: Partial<Metric>[] }) => Promise<void>;
  isSubmitting?: boolean;
  editingObjective?: any;
  editingMetric?: any;
  onUpdateMetric?: (metricId: string, updates: any) => Promise<void>;
  creationType?: 'objective' | 'goal' | 'sub-goal' | 'metric';
  parentGoal?: any;
  availableParents?: any[];
}

interface ObjectiveData {
  title: string;
  description: string;
  metrics: Partial<Metric>[];
  creationType: 'objective' | 'goal' | 'sub-goal' | 'metric';
  parentId?: string;
  level: 0 | 1 | 2;
}

interface MetricData {
  name: string;
  description?: string;
  metric_type: MetricType;
  data_source: DataSourceType;
  unit?: string;
  target_value?: number;
  current_value?: number;
  timeframe_start?: string;
  timeframe_end?: string;
  is_primary?: boolean;
}

const EXAMPLE_OBJECTIVES = [
  {
    title: "Academic Excellence",
    description: "Ensure all students achieve proficiency in core academic subjects and develop critical thinking skills.",
    category: "Academic"
  },
  {
    title: "Student Well-being",
    description: "Foster a safe, inclusive, and supportive environment that promotes mental health and social-emotional learning.",
    category: "Wellness"
  },
  {
    title: "Community Engagement",
    description: "Strengthen partnerships with families and community organizations to support student success.",
    category: "Community"
  }
];

const EXAMPLE_GOALS = [
  {
    title: "Improve Reading Proficiency",
    description: "Increase the percentage of students reading at grade level through targeted interventions.",
    category: "Academic"
  },
  {
    title: "Reduce Chronic Absenteeism", 
    description: "Implement strategies to improve student attendance and engagement.",
    category: "Engagement"
  },
  {
    title: "Enhance Teacher Retention",
    description: "Create supportive environments that retain quality educators.",
    category: "Staff"
  }
];

const EXAMPLE_SUB_GOALS = [
  {
    title: "Implement Reading Intervention Program",
    description: "Deploy evidence-based reading intervention for struggling readers.",
    category: "Academic"
  },
  {
    title: "Create Attendance Incentive System",
    description: "Develop rewards and recognition for improved attendance.",
    category: "Engagement"  
  },
  {
    title: "Establish Mentorship Program",
    description: "Pair new teachers with experienced mentors for support.",
    category: "Staff"
  }
];

const EXAMPLE_METRICS = [
  {
    name: "Reading Proficiency Rate",
    metric_type: "percent" as MetricType,
    data_source: "state_testing" as DataSourceType,
    unit: "%",
    target_value: 85,
    category: "Academic"
  },
  {
    name: "Student Attendance Rate",
    metric_type: "percent" as MetricType,
    data_source: "total_number" as DataSourceType,
    unit: "%",
    target_value: 95,
    category: "Engagement"
  },
  {
    name: "Teacher Retention Rate",
    metric_type: "percent" as MetricType,
    data_source: "survey" as DataSourceType,
    unit: "%",
    target_value: 90,
    category: "Staff"
  }
];

export default function ObjectiveWizard({ 
  isOpen, 
  onClose, 
  onSubmit, 
  isSubmitting = false, 
  editingObjective,
  editingMetric,
  onUpdateMetric,
  creationType = 'objective',
  parentGoal,
  availableParents = []
}: ObjectiveWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [objectiveData, setObjectiveData] = useState<ObjectiveData>({
    title: '',
    description: '',
    metrics: [],
    creationType: creationType,
    parentId: parentGoal?.id || undefined,
    level: creationType === 'objective' ? 0 : creationType === 'goal' ? 1 : 2
  });
  const [metricData, setMetricData] = useState<MetricData>({
    name: '',
    description: '',
    metric_type: 'percent',
    data_source: 'survey',
    unit: '',
    target_value: undefined,
    current_value: undefined,
    timeframe_start: '',
    timeframe_end: '',
    is_primary: false
  });
  const [newMetric, setNewMetric] = useState<Partial<Metric>>({
    metric_type: 'percent',
    data_source: 'survey'
  });
  
  const isMetricMode = creationType === 'metric';

  // Update objectiveData when props change
  React.useEffect(() => {
    setObjectiveData(prev => ({
      ...prev,
      creationType: creationType,
      parentId: parentGoal?.id || undefined,
      level: creationType === 'objective' ? 0 : creationType === 'goal' ? 1 : 2
    }));
  }, [creationType, parentGoal]);

  // Populate form when editing an existing objective
  React.useEffect(() => {
    if (editingObjective) {
      setObjectiveData({
        title: editingObjective.title || '',
        description: editingObjective.description || '',
        metrics: editingObjective.metrics ? editingObjective.metrics.map((metric: any) => ({
          name: metric.name,
          metric_type: metric.metric_type || 'percent',
          data_source: metric.data_source || 'survey',
          unit: metric.unit || '',
          target_value: metric.target_value,
          current_value: metric.current_value,
          display_order: metric.display_order || 0
        })) : [],
        creationType: editingObjective.level === 0 ? 'objective' : editingObjective.level === 1 ? 'goal' : 'sub-goal',
        parentId: editingObjective.parent_id || undefined,
        level: editingObjective.level || 0
      });
    }
  }, [editingObjective]);

  // Populate form when editing an existing metric
  React.useEffect(() => {
    if (editingMetric) {
      setMetricData({
        name: editingMetric.name || '',
        description: editingMetric.description || '',
        metric_type: editingMetric.metric_type || 'percent',
        data_source: editingMetric.data_source || 'survey',
        unit: editingMetric.unit || '',
        target_value: editingMetric.target_value,
        current_value: editingMetric.current_value,
        timeframe_start: editingMetric.timeframe_start || '',
        timeframe_end: editingMetric.timeframe_end || '',
        is_primary: editingMetric.is_primary || false
      });
    }
  }, [editingMetric]);

  const getStepTitle = () => {
    if (isMetricMode) {
      return [
        { number: 1, title: 'Metric Details', icon: BarChart3 },
        { number: 2, title: 'Values & Settings', icon: Target },
        { number: 3, title: 'Review & Save', icon: CheckCircle }
      ];
    }
    
    const typeLabel = creationType === 'objective' ? 'Strategic Objective' : creationType === 'goal' ? 'Goal' : 'Sub-goal';
    const typeIcon = creationType === 'objective' ? Target : creationType === 'goal' ? Flag : Zap;
    return [
      { number: 1, title: `${typeLabel} Details`, icon: typeIcon },
      { number: 2, title: 'Success Metrics', icon: BarChart3 },
      { number: 3, title: 'Review & Create', icon: CheckCircle }
    ];
  };
  
  const steps = getStepTitle();

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (isMetricMode && editingMetric && onUpdateMetric) {
      // Remove the id from metricData before sending as updates
      const { ...updates } = metricData;
      await onUpdateMetric(editingMetric.id, updates);
    } else {
      await onSubmit(objectiveData);
    }
    handleClose();
  };

  const handleClose = () => {
    setCurrentStep(1);
    setObjectiveData({
      title: '',
      description: '',
      metrics: [],
      creationType: creationType,
      parentId: parentGoal?.id || undefined,
      level: creationType === 'objective' ? 0 : creationType === 'goal' ? 1 : 2
    });
    setMetricData({
      name: '',
      description: '',
      metric_type: 'percent',
      data_source: 'survey',
      unit: '',
      target_value: undefined,
      current_value: undefined,
      timeframe_start: '',
      timeframe_end: '',
      is_primary: false
    });
    setNewMetric({
      metric_type: 'percent',
      data_source: 'survey'
    });
    onClose();
  };

  const addMetric = () => {
    if (newMetric.name) {
      setObjectiveData(prev => ({
        ...prev,
        metrics: [...prev.metrics, { ...newMetric, display_order: prev.metrics.length }]
      }));
      setNewMetric({
        metric_type: 'percent',
        data_source: 'survey'
      });
    }
  };

  const removeMetric = (index: number) => {
    setObjectiveData(prev => ({
      ...prev,
      metrics: prev.metrics.filter((_, i) => i !== index)
    }));
  };

  const useExampleObjective = (example: typeof EXAMPLE_OBJECTIVES[0]) => {
    setObjectiveData(prev => ({
      ...prev,
      title: example.title,
      description: example.description
    }));
  };

  const useExampleMetric = (example: typeof EXAMPLE_METRICS[0]) => {
    setNewMetric(example);
  };

  const progress = (currentStep / 3) * 100;

  const renderStep1 = () => {
    // Skip this step for metric editing
    if (isMetricMode) {
      return null;
    }

    const typeConfig = {
      objective: {
        label: 'Strategic Objective Name',
        description: 'Give your strategic objective a clear, memorable name that reflects its core purpose.',
        placeholder: 'e.g., Academic Excellence',
        icon: Target,
        color: 'text-blue-600'
      },
      goal: {
        label: 'Goal Name',
        description: 'Define a specific goal that contributes to the strategic objective.',
        placeholder: 'e.g., Improve Reading Scores',
        icon: Flag,
        color: 'text-green-600'
      },
      'sub-goal': {
        label: 'Sub-goal Name', 
        description: 'Create a focused sub-goal that supports the parent goal.',
        placeholder: 'e.g., Implement Reading Intervention Program',
        icon: Zap,
        color: 'text-purple-600'
      }
    };

    const config = typeConfig[objectiveData.creationType] || typeConfig.objective;

    return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <config.icon className={`w-5 h-5 ${config.color}`} />
            <Label htmlFor="title" className="text-base font-semibold">{config.label}</Label>
          </div>
          <p className="text-sm text-gray-600 mt-1 mb-3">
            {config.description}
          </p>
          <Input
            id="title"
            value={objectiveData.title}
            onChange={(e) => setObjectiveData(prev => ({ ...prev, title: e.target.value }))}
            placeholder={config.placeholder}
            className="text-lg"
          />
        </div>

        <div>
          <Label htmlFor="description" className="text-base font-semibold">Description</Label>
          <p className="text-sm text-gray-600 mt-1 mb-3">
            Provide a brief description of what this objective aims to achieve and why it's important.
          </p>
          <Textarea
            id="description"
            value={objectiveData.description}
            onChange={(e) => setObjectiveData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Describe the objective's purpose, scope, and expected impact..."
            className="min-h-[100px]"
          />
        </div>
      </div>

      <div className="border-t pt-6">
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb size={20} className="text-yellow-600" />
          <span className="font-semibold text-gray-900">
            Example {objectiveData.creationType === 'objective' ? 'Strategic Objectives' : objectiveData.creationType === 'goal' ? 'Goals' : 'Sub-goals'}
          </span>
        </div>
        <div className="grid gap-3">
          {(objectiveData.creationType === 'objective' ? EXAMPLE_OBJECTIVES : 
            objectiveData.creationType === 'goal' ? EXAMPLE_GOALS : 
            EXAMPLE_SUB_GOALS).map((example, index) => (
            <Card key={index} className="cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => useExampleObjective(example)}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold">{example.title}</h4>
                      <Badge variant="outline" className="text-xs">{example.category}</Badge>
                    </div>
                    <p className="text-sm text-gray-600">{example.description}</p>
                  </div>
                  <Button variant="ghost" size="sm" className="ml-2">Use This</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
    );
  };

  // Metric editing steps
  const renderMetricStep1 = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            <Label htmlFor="metric-name" className="text-base font-semibold">Metric Name</Label>
          </div>
          <p className="text-sm text-gray-600 mt-1 mb-3">
            Give your metric a clear, descriptive name that indicates what is being measured.
          </p>
          <Input
            id="metric-name"
            value={metricData.name}
            onChange={(e) => setMetricData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="e.g., Reading Proficiency Rate"
            className="text-lg"
          />
        </div>

        <div>
          <Label htmlFor="metric-description" className="text-base font-semibold">Description (Optional)</Label>
          <p className="text-sm text-gray-600 mt-1 mb-3">
            Provide additional context about this metric, how it's calculated, or why it's important.
          </p>
          <Textarea
            id="metric-description"
            value={metricData.description}
            onChange={(e) => setMetricData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Describe what this metric measures and how it's calculated..."
            className="min-h-[80px]"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="metric-type">Metric Type</Label>
            <select
              id="metric-type"
              value={metricData.metric_type}
              onChange={(e) => setMetricData(prev => ({ ...prev, metric_type: e.target.value as MetricType }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="percent">Percentage</option>
              <option value="total_number">Total Number</option>
              <option value="narrative">Narrative</option>
              <option value="link">Link</option>
            </select>
          </div>
          <div>
            <Label htmlFor="data-source">Data Source</Label>
            <select
              id="data-source"
              value={metricData.data_source}
              onChange={(e) => setMetricData(prev => ({ ...prev, data_source: e.target.value as DataSourceType }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="survey">Survey Results</option>
              <option value="map_data">MAP Data</option>
              <option value="state_testing">State Testing</option>
              <option value="total_number">Total Number</option>
              <option value="percent">Percentage</option>
              <option value="narrative">Narrative</option>
              <option value="link">External Link</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  const renderMetricStep2 = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label htmlFor="target-value">Target Value</Label>
            <Input
              id="target-value"
              type="number"
              value={metricData.target_value || ''}
              onChange={(e) => setMetricData(prev => ({ ...prev, target_value: parseFloat(e.target.value) || undefined }))}
              placeholder="e.g., 85"
            />
          </div>
          <div>
            <Label htmlFor="current-value">Current Value</Label>
            <Input
              id="current-value"
              type="number"
              value={metricData.current_value || ''}
              onChange={(e) => setMetricData(prev => ({ ...prev, current_value: parseFloat(e.target.value) || undefined }))}
              placeholder="e.g., 78"
            />
          </div>
          <div>
            <Label htmlFor="unit">Unit</Label>
            <Input
              id="unit"
              value={metricData.unit}
              onChange={(e) => setMetricData(prev => ({ ...prev, unit: e.target.value }))}
              placeholder="e.g., %, points"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="timeframe-start">Timeframe Start</Label>
            <Input
              id="timeframe-start"
              value={metricData.timeframe_start}
              onChange={(e) => setMetricData(prev => ({ ...prev, timeframe_start: e.target.value }))}
              placeholder="e.g., 2024-25 School Year"
            />
          </div>
          <div>
            <Label htmlFor="timeframe-end">Timeframe End</Label>
            <Input
              id="timeframe-end"
              value={metricData.timeframe_end}
              onChange={(e) => setMetricData(prev => ({ ...prev, timeframe_end: e.target.value }))}
              placeholder="e.g., Spring 2025"
            />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="is-primary"
            checked={metricData.is_primary}
            onChange={(e) => setMetricData(prev => ({ ...prev, is_primary: e.target.checked }))}
            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <Label htmlFor="is-primary" className="text-sm">
            Mark as primary metric for this goal
          </Label>
        </div>
      </div>
    </div>
  );

  const renderMetricStep3 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Review Metric</h3>
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-lg">{metricData.name}</h4>
                {metricData.description && (
                  <p className="text-gray-600 mt-2">{metricData.description}</p>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Type:</span>
                  <span className="ml-2 capitalize">{metricData.metric_type.replace('_', ' ')}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Data Source:</span>
                  <span className="ml-2">{metricData.data_source.replace('_', ' ')}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Target:</span>
                  <span className="ml-2">{metricData.target_value}{metricData.unit}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Current:</span>
                  <span className="ml-2">{metricData.current_value || 'Not set'}{metricData.unit}</span>
                </div>
                {(metricData.timeframe_start || metricData.timeframe_end) && (
                  <div className="col-span-2">
                    <span className="font-medium text-gray-700">Timeframe:</span>
                    <span className="ml-2">
                      {metricData.timeframe_start} {metricData.timeframe_start && metricData.timeframe_end && '- '} {metricData.timeframe_end}
                    </span>
                  </div>
                )}
                {metricData.is_primary && (
                  <div className="col-span-2">
                    <Badge className="bg-blue-100 text-blue-800">Primary Metric</Badge>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderStep2 = () => {
    // Skip this step for metric editing
    if (isMetricMode) {
      return null;
    }

    return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold mb-2">Success Metrics</h3>
          <p className="text-sm text-gray-600">
            Add measurable metrics that will help you track progress toward this objective. You can always add more metrics later.
          </p>
        </div>

        {objectiveData.metrics.length > 0 && (
          <div className="space-y-2">
            <Label className="font-semibold">Added Metrics</Label>
            {objectiveData.metrics.map((metric, index) => (
              <Card key={index} className="p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-medium">{metric.name}</span>
                    <div className="text-sm text-gray-600">
                      Target: {metric.target_value}{metric.unit} • {metric.data_source?.replace('_', ' ')}
                      {metric.current_value !== null && metric.current_value !== undefined && (
                        <div className="text-xs text-gray-500 mt-1">Current: {metric.current_value}{metric.unit}</div>
                      )}
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => removeMetric(index)} className="text-red-500 hover:text-red-700">
                    Remove
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        <div className="border rounded-lg p-4 space-y-4">
          <Label className="font-semibold">Add New Metric</Label>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="metric-name">Metric Name</Label>
              <Input
                id="metric-name"
                value={newMetric.name || ''}
                onChange={(e) => setNewMetric(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Reading Proficiency Rate"
              />
            </div>
            <div>
              <Label htmlFor="metric-target">Target Value</Label>
              <div className="flex gap-2">
                <Input
                  id="metric-target"
                  type="number"
                  value={newMetric.target_value || ''}
                  onChange={(e) => setNewMetric(prev => ({ ...prev, target_value: parseFloat(e.target.value) }))}
                  placeholder="85"
                />
                <Input
                  value={newMetric.unit || ''}
                  onChange={(e) => setNewMetric(prev => ({ ...prev, unit: e.target.value }))}
                  placeholder="%"
                  className="w-16"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="metric-current">Current Value (Optional)</Label>
              <Input
                id="metric-current"
                type="number"
                value={newMetric.current_value || ''}
                onChange={(e) => setNewMetric(prev => ({ ...prev, current_value: parseFloat(e.target.value) }))}
                placeholder="75"
              />
              <p className="text-xs text-gray-500 mt-1">Leave blank if you'll enter this later</p>
            </div>
            <div>
              <Label htmlFor="metric-type">Data Source</Label>
              <select
                id="metric-type"
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                value={newMetric.data_source || 'survey'}
                onChange={(e) => setNewMetric(prev => ({ ...prev, data_source: e.target.value as DataSourceType }))}
              >
                <option value="survey">Survey</option>
                <option value="state_testing">State Testing</option>
                <option value="total_number">Total Number</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={addMetric} disabled={!newMetric.name} size="sm">
              Add Metric
            </Button>
            <Button variant="outline" size="sm" onClick={() => setNewMetric({ metric_type: 'percent', data_source: 'survey' })}>
              Clear
            </Button>
          </div>
        </div>
      </div>

      <div className="border-t pt-6">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen size={20} className="text-blue-600" />
          <span className="font-semibold text-gray-900">Common Metrics Examples</span>
        </div>
        <div className="grid gap-2">
          {EXAMPLE_METRICS.map((example, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <span className="font-medium text-sm">{example.name}</span>
                <div className="text-xs text-gray-600">
                  Target: {example.target_value}{example.unit} • {example.category}
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => useExampleMetric(example)}>Use</Button>
            </div>
          ))}
        </div>
      </div>
    </div>
    );
  };

  const renderStep3 = () => {
    // Skip this step for metric editing
    if (isMetricMode) {
      return null;
    }

    return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Review Your Strategic Objective</h3>
        <p className="text-sm text-gray-600">
          Review the details below and click "{editingObjective ? 'Update' : 'Create'} Objective" to {editingObjective ? 'update' : 'add it to'} your strategic plan.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target size={20} />
            {objectiveData.title || 'Untitled Objective'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {objectiveData.description && (
            <div>
              <Label className="text-sm font-semibold">Description</Label>
              <p className="text-sm text-gray-700 mt-1">{objectiveData.description}</p>
            </div>
          )}
          
          <div>
            <Label className="text-sm font-semibold">Success Metrics ({objectiveData.metrics.length})</Label>
            {objectiveData.metrics.length > 0 ? (
              <div className="mt-2 space-y-2">
                {objectiveData.metrics.map((metric, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm font-medium">{metric.name}</span>
                    <div className="text-right">
                      <span className="text-sm text-gray-600">Target: {metric.target_value}{metric.unit}</span>
                      {metric.current_value !== null && metric.current_value !== undefined && (
                        <div className="text-xs text-gray-500">Current: {metric.current_value}{metric.unit}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 mt-1">No metrics added yet. You can add them after creating the objective.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" aria-describedby="objective-wizard-description">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {isMetricMode 
              ? editingMetric ? 'Edit Metric' : 'Create Metric'
              : editingObjective 
                ? `Edit ${objectiveData.creationType === 'objective' ? 'Strategic Objective' : objectiveData.creationType === 'goal' ? 'Goal' : 'Sub-goal'}`
                : `Create ${objectiveData.creationType === 'objective' ? 'Strategic Objective' : objectiveData.creationType === 'goal' ? 'Goal' : 'Sub-goal'}`
            }
          </DialogTitle>
          <div id="objective-wizard-description" className="sr-only">
            Dialog for creating or editing goals, objectives, and metrics in the strategic plan
          </div>
          
          {/* Show parent context when creating sub-items */}
          {parentGoal && !editingObjective && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-3">
              <div className="flex items-center gap-2">
                <Flag className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-blue-900">
                  Creating {objectiveData.creationType === 'goal' ? 'Goal' : 'Sub-goal'} under:
                </span>
              </div>
              <div className="text-blue-800 font-medium mt-1">
                {parentGoal.goal_number ? `${parentGoal.goal_number}. ` : ''}{parentGoal.title}
              </div>
            </div>
          )}
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-4">
              {steps.map((step, index) => (
                <div key={step.number} className="flex items-center gap-2">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors ${
                    currentStep >= step.number 
                      ? step.number === 1 
                        ? `${objectiveData.creationType === 'objective' ? 'bg-blue-600 border-blue-600' : objectiveData.creationType === 'goal' ? 'bg-green-600 border-green-600' : 'bg-purple-600 border-purple-600'} text-white`
                        : 'bg-blue-600 border-blue-600 text-white'
                      : 'border-gray-300 text-gray-500'
                  }`}>
                    <step.icon size={16} />
                  </div>
                  <span className={`text-sm font-medium ${
                    currentStep >= step.number 
                      ? step.number === 1
                        ? objectiveData.creationType === 'objective' ? 'text-blue-600' : objectiveData.creationType === 'goal' ? 'text-green-600' : 'text-purple-600'
                        : 'text-blue-600'
                      : 'text-gray-500'
                  }`}>
                    {step.title}
                  </span>
                  {index < steps.length - 1 && (
                    <ChevronRight size={16} className="text-gray-400 ml-2" />
                  )}
                </div>
              ))}
            </div>
          </div>
          <Progress value={progress} className="mt-4" />
        </DialogHeader>

        <div className="mt-6">
          {isMetricMode ? (
            <>
              {currentStep === 1 && renderMetricStep1()}
              {currentStep === 2 && renderMetricStep2()}
              {currentStep === 3 && renderMetricStep3()}
            </>
          ) : (
            <>
              {currentStep === 1 && renderStep1()}
              {currentStep === 2 && renderStep2()}
              {currentStep === 3 && renderStep3()}
            </>
          )}
        </div>

        <div className="flex items-center justify-between pt-6 border-t">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="flex items-center gap-2"
          >
            <ChevronLeft size={16} />
            Previous
          </Button>
          
          <div className="flex gap-2">
            <Button variant="ghost" onClick={handleClose}>
              Cancel
            </Button>
            {currentStep < 3 ? (
              <Button
                onClick={handleNext}
                disabled={currentStep === 1 && (isMetricMode ? !metricData.name.trim() : !objectiveData.title.trim())}
                className="flex items-center gap-2"
              >
                Next
                <ChevronRight size={16} />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={isMetricMode ? !metricData.name.trim() || isSubmitting : !objectiveData.title.trim() || isSubmitting}
                className="flex items-center gap-2"
              >
                {isSubmitting 
                  ? (isMetricMode ? (editingMetric ? 'Updating...' : 'Creating...') : (editingObjective ? 'Updating...' : 'Creating...'))
                  : isMetricMode 
                    ? (editingMetric ? 'Update Metric' : 'Create Metric')
                    : editingObjective 
                      ? `Update ${objectiveData.creationType === 'objective' ? 'Strategic Objective' : objectiveData.creationType === 'goal' ? 'Goal' : 'Sub-goal'}`
                      : `Create ${objectiveData.creationType === 'objective' ? 'Strategic Objective' : objectiveData.creationType === 'goal' ? 'Goal' : 'Sub-goal'}`
                }
                {isMetricMode ? <BarChart3 size={16} /> :
                 objectiveData.creationType === 'objective' ? <Target size={16} /> : 
                 objectiveData.creationType === 'goal' ? <Flag size={16} /> : 
                 <Zap size={16} />}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}