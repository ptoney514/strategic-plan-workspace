'use client';

import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ChevronLeft, ChevronRight, Save, X } from 'lucide-react';
import { MetricTypeSelector } from './MetricTypeSelector';
import { MetricDataForm } from './MetricDataForm';
import { MetricPreview } from './MetricPreview';
import { VisualizationType, getDefaultConfig } from '@/lib/metric-visualizations';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface MetricBuilderWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (metric: any) => Promise<void>;
  goalId: string;
  goalNumber: string;
  existingMetric?: any;
}

type WizardStep = 'visualization' | 'title' | 'data' | 'preview';

const STEPS: { id: WizardStep; title: string; description: string }[] = [
  {
    id: 'visualization',
    title: 'Choose Visual',
    description: 'What type of chart or display would you like?'
  },
  {
    id: 'title',
    title: 'Name Your Metric',
    description: 'What should we call this metric?'
  },
  {
    id: 'data',
    title: 'Add Your Data',
    description: 'Enter the values for your visualization'
  },
  {
    id: 'preview',
    title: 'Review & Save',
    description: 'Check everything looks good before saving'
  }
];

export function MetricBuilderWizard({
  isOpen,
  onClose,
  onSave,
  goalId,
  goalNumber,
  existingMetric
}: MetricBuilderWizardProps) {
  const [currentStep, setCurrentStep] = useState<WizardStep>('visualization');
  const [selectedType, setSelectedType] = useState<VisualizationType | undefined>();
  const [metricData, setMetricData] = useState<any>({});
  const [metricDetails, setMetricDetails] = useState({
    name: '',
    description: '',
    is_primary: false
  });
  const [isSaving, setIsSaving] = useState(false);

  // Load existing metric data when editing
  React.useEffect(() => {
    if (existingMetric && isOpen) {
      setSelectedType(existingMetric.visualization_type || 'number');
      setMetricData(existingMetric.visualization_config || {
        currentValue: existingMetric.current_value,
        targetValue: existingMetric.target_value,
        measure_unit: existingMetric.measure_unit
      });
      setMetricDetails({
        name: existingMetric.name || '',
        description: existingMetric.description || '',
        is_primary: existingMetric.is_primary || false
      });
      // Start at title step when editing
      setCurrentStep('title');
    } else if (isOpen) {
      // Reset for new metric
      setCurrentStep('visualization');
      setSelectedType(undefined);
      setMetricData({});
      setMetricDetails({
        name: '',
        description: '',
        is_primary: false
      });
    }
  }, [existingMetric, isOpen]);

  // Filter steps when editing (skip visualization step)
  const activeSteps = existingMetric ? STEPS.filter(s => s.id !== 'visualization') : STEPS;
  const currentStepIndex = activeSteps.findIndex(s => s.id === currentStep);
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === activeSteps.length - 1;

  const handleTypeSelect = (type: VisualizationType) => {
    setSelectedType(type);
    setMetricData(getDefaultConfig(type));
  };

  const handleNext = () => {
    if (currentStep === 'visualization' && !selectedType) {
      toast.error('Please select a visualization type first');
      return;
    }

    if (currentStep === 'title' && !metricDetails.name) {
      toast.error('Please provide a title for your metric');
      return;
    }

    if (currentStep === 'data') {
      // Validate based on visualization type
      if (selectedType === 'percentage') {
        const currentVal = metricData.currentValue;
        if (currentVal === '' || currentVal === undefined || currentVal === null) {
          toast.error('Please enter a current percentage value');
          return;
        }
        if (currentVal < 0 || currentVal > 100) {
          toast.error('Please enter a valid percentage value (0-100)');
          return;
        }
      }
      if (selectedType === 'bar-chart' && (!metricData.dataPoints || metricData.dataPoints.length === 0)) {
        toast.error('Please add at least one data point');
        return;
      }
      if (selectedType === 'line-chart' && (!metricData.data || metricData.data.length === 0)) {
        toast.error('Please add at least one data point');
        return;
      }
    }

    const nextIndex = currentStepIndex + 1;
    if (nextIndex < activeSteps.length) {
      setCurrentStep(activeSteps[nextIndex].id);
    }
  };

  const handleBack = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(activeSteps[prevIndex].id);
    }
  };

  const handleSave = async () => {
    if (!selectedType || !metricDetails.name) {
      toast.error('Please complete all required fields');
      return;
    }

    setIsSaving(true);
    try {
      // Prepare the metric object
      const metric = {
        goal_id: goalId,
        name: metricDetails.name,
        description: metricDetails.description,
        metric_type: selectedType === 'percentage' ? 'percent' : 
                     selectedType === 'bar-chart' || selectedType === 'line-chart' ? 'number' :
                     selectedType === 'donut-chart' ? 'percent' :
                     selectedType === 'status' ? 'status' : 'number',
        visualization_type: selectedType,
        visualization_config: metricData,
        is_primary: metricDetails.is_primary,
        current_value: metricData.currentValue || 0,
        target_value: metricData.targetValue || null,
        unit: metricData.unit || null
      };

      await onSave(metric);
      toast.success('Metric created successfully!');
      handleReset();
      onClose();
    } catch (error) {
      console.error('Failed to create metric:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create metric';
      toast.error(errorMessage);
      // Don't close the wizard so user can see the error and retry
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setCurrentStep('visualization');
    setSelectedType(undefined);
    setMetricData({});
    setMetricDetails({
      name: '',
      description: '',
      is_primary: false
    });
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'visualization':
        // Skip visualization step when editing
        if (existingMetric) {
          setCurrentStep('title');
          return null;
        }
        return (
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-2">How would you like to visualize your data?</h3>
              <p className="text-gray-600">
                Choose the best way to display your metric. Each visualization type works best for different kinds of data.
              </p>
            </div>
            <MetricTypeSelector
              selectedType={selectedType}
              onSelect={handleTypeSelect}
            />
          </div>
        );

      case 'title':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-2">What should we call this {selectedType?.replace('-', ' ')}?</h3>
              <p className="text-gray-600">
                Give your metric a clear, descriptive title that explains what it measures
              </p>
            </div>

            <div className="max-w-xl mx-auto space-y-4">
              <div>
                <Label htmlFor="name">Metric Title *</Label>
                <Input
                  id="name"
                  value={metricDetails.name}
                  onChange={(e) => setMetricDetails({ ...metricDetails, name: e.target.value })}
                  placeholder="e.g., Student Achievement Rate"
                  className="text-lg"
                  autoFocus
                />
                <p className="text-sm text-gray-500 mt-1">
                  This will be displayed as the main title of your metric
                </p>
              </div>

              <div>
                <Label htmlFor="description">Description (optional)</Label>
                <Textarea
                  id="description"
                  value={metricDetails.description}
                  onChange={(e) => setMetricDetails({ ...metricDetails, description: e.target.value })}
                  placeholder="Add any additional context about what this metric measures..."
                  rows={3}
                />
              </div>

              <div className="flex items-center gap-2 mt-4">
                <input
                  type="checkbox"
                  id="is_primary"
                  checked={metricDetails.is_primary}
                  onChange={(e) => setMetricDetails({ ...metricDetails, is_primary: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="is_primary">Primary metric for this goal</Label>
              </div>
            </div>
          </div>
        );

      case 'data':
        return selectedType ? (
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-2">
                Now let's add the data for your {selectedType?.replace('-', ' ')}
              </h3>
              <p className="text-gray-600">
                {selectedType === 'percentage' && 'Enter the current percentage value'}
                {selectedType === 'bar-chart' && 'Add categories and their values for your bar chart'}
                {selectedType === 'line-chart' && 'Add data points for your line chart over time'}
                {selectedType === 'donut-chart' && 'Add segments and their values for your donut chart'}
                {selectedType === 'status' && 'Set the current status and add any relevant details'}
                {selectedType === 'survey' && 'Configure your survey questions and response options'}
              </p>
            </div>
            <MetricDataForm
              type={selectedType}
              data={metricData}
              onChange={setMetricData}
            />
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            Please complete the previous steps first
          </div>
        );

      case 'preview':
        return selectedType ? (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-2">Here's how your metric will look</h3>
              <p className="text-gray-600">
                Review your {selectedType?.replace('-', ' ')} and make sure everything is correct
              </p>
            </div>

            <MetricPreview type={selectedType} data={metricData} />
            
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <h4 className="font-medium text-gray-900">Metric Summary</h4>
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-600">Title:</span>
                  <span className="font-medium">{metricDetails.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Visualization:</span>
                  <span className="font-medium capitalize">{selectedType?.replace('-', ' ')}</span>
                </div>
                {metricDetails.is_primary && (
                  <div className="pt-2">
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                      Primary Metric
                    </span>
                  </div>
                )}
              </div>
              {metricDetails.description && (
                <div className="pt-2 border-t">
                  <p className="text-sm text-gray-600">{metricDetails.description}</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            Please complete the previous steps
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>{existingMetric ? 'Edit Metric' : `Create New Metric for Goal ${goalNumber}`}</DialogTitle>
          <DialogDescription>
            Let's build a custom metric visualization step by step
          </DialogDescription>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="flex items-center justify-between px-4 py-2 border-y">
          {activeSteps.map((step, index) => (
            <div
              key={step.id}
              className={cn(
                "flex items-center",
                index < STEPS.length - 1 && "flex-1"
              )}
            >
              <button
                onClick={() => {
                  if (index <= currentStepIndex) {
                    setCurrentStep(step.id);
                  }
                }}
                disabled={index > currentStepIndex}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors",
                  currentStep === step.id && "bg-blue-50 text-blue-600",
                  index < currentStepIndex && "text-gray-600 hover:bg-gray-50",
                  index > currentStepIndex && "text-gray-400 cursor-not-allowed"
                )}
              >
                <div className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium",
                  currentStep === step.id && "bg-blue-600 text-white",
                  index < currentStepIndex && "bg-green-600 text-white",
                  index > currentStepIndex && "bg-gray-300 text-gray-500"
                )}>
                  {index + 1}
                </div>
                <span className="hidden sm:inline text-sm font-medium">
                  {step.title}
                </span>
              </button>
              {index < STEPS.length - 1 && (
                <div className="flex-1 mx-2">
                  <div className={cn(
                    "h-0.5",
                    index < currentStepIndex ? "bg-green-600" : "bg-gray-300"
                  )} />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {renderStepContent()}
        </div>

        {/* Footer Actions */}
        <DialogFooter className="border-t pt-4">
          <div className="flex items-center justify-between w-full">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isSaving}
            >
              <X className="w-4 h-4 mr-1" />
              Cancel
            </Button>

            <div className="flex gap-2">
              {!isFirstStep && (
                <Button
                  variant="outline"
                  onClick={handleBack}
                  disabled={isSaving}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Back
                </Button>
              )}

              {!isLastStep ? (
                <Button onClick={handleNext} disabled={isSaving}>
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              ) : (
                <Button 
                  onClick={handleSave} 
                  disabled={isSaving || !selectedType || !metricDetails.name}
                >
                  <Save className="w-4 h-4 mr-1" />
                  {isSaving ? 'Saving...' : 'Save Metric'}
                </Button>
              )}
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}