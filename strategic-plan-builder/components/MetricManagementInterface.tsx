'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { 
  Plus, 
  Save, 
  Trash2, 
  Calendar, 
  TrendingUp,
  Target,
  Info,
  BarChart3,
  Edit2
} from 'lucide-react';
import { Metric, MetricType, MetricCategory, TimeSeriesDataPoint, SurveyDataPoint, getMetricStatusConfig } from '@/lib/types';
import { toast } from 'sonner';
import { MetricBuilderWizard } from './metrics/MetricBuilderWizard';

interface MetricManagementInterfaceProps {
  goalId: string;
  goalNumber: string;
  existingMetrics?: Metric[];
  onSave: (metric: Partial<Metric>) => Promise<void>;
  onUpdate: (metricId: string, updates: Partial<Metric>) => Promise<void>;
  onDelete: (metricId: string) => Promise<void>;
  onClose?: () => void;
}

export default function MetricManagementInterface({
  goalId,
  goalNumber,
  existingMetrics = [],
  onSave,
  onUpdate, 
  onDelete,
  onClose
}: MetricManagementInterfaceProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [showWizard, setShowWizard] = useState(false);
  const [editingMetricId, setEditingMetricId] = useState<string | null>(null);
  const [newMetric, setNewMetric] = useState<Partial<Metric>>({
    goal_id: goalId,
    name: '',
    description: '',
    metric_type: 'number',
    metric_category: 'achievement',
    current_value: 0,
    target_value: 0,
    unit: '',
    is_higher_better: true,
    collection_frequency: 'quarterly',
    risk_threshold_critical: 0.7,
    risk_threshold_off_target: 0.9
  });

  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesDataPoint[]>([]);
  const [surveyData, setSurveyData] = useState<SurveyDataPoint[]>([]);

  // Handle creating new metric
  const handleCreateMetric = async () => {
    if (!newMetric.name?.trim()) {
      toast.error('Metric name is required');
      return;
    }

    try {
      const metricData = {
        ...newMetric,
        data_points: timeSeriesData.length > 0 ? timeSeriesData : undefined,
        survey_data: surveyData.length > 0 ? surveyData : undefined
      };
      
      await onSave(metricData);
      toast.success('Metric created successfully');
      setIsCreating(false);
      resetForm();
    } catch (error) {
      console.error('Failed to create metric:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create metric';
      toast.error(errorMessage);
      // Don't close the form on error so user can retry
    }
  };

  // Reset form
  const resetForm = () => {
    setNewMetric({
      goal_id: goalId,
      name: '',
      description: '',
      metric_type: 'number',
      metric_category: 'achievement',
      current_value: 0,
      target_value: 0,
      unit: '',
      is_higher_better: true,
      collection_frequency: 'quarterly',
      risk_threshold_critical: 0.7,
      risk_threshold_off_target: 0.9
    });
    setTimeSeriesData([]);
    setSurveyData([]);
  };

  // Add time series data point
  const addTimeSeriesPoint = () => {
    const newPoint: TimeSeriesDataPoint = {
      period: `${new Date().getFullYear()}-Q1`,
      period_type: 'quarterly',
      target_value: newMetric.target_value || 0,
      actual_value: 0,
      status: 'no-data'
    };
    setTimeSeriesData([...timeSeriesData, newPoint]);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Metric Management
          </h2>
          <p className="text-sm text-gray-600">
            {goalNumber} - Manage metrics and performance data
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowWizard(true)}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Metric
          </Button>
          {onClose && (
            <Button variant="outline" size="sm" onClick={onClose}>
              Close
            </Button>
          )}
        </div>
      </div>

      {/* Existing Metrics */}
      {existingMetrics.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Existing Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {existingMetrics.map(metric => {
                const status = getMetricStatusConfig(
                  metric.current_value && metric.target_value 
                    ? (metric.current_value / metric.target_value >= 0.9 ? 'on-target' : 
                       metric.current_value / metric.target_value >= 0.7 ? 'off-target' : 'critical')
                    : 'no-data'
                );
                
                return (
                  <div key={metric.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{metric.name}</h4>
                        <Badge className={`${status.bgColor} ${status.textColor}`}>
                          {status.label}
                        </Badge>
                      </div>
                      {metric.description && (
                        <p className="text-sm text-gray-600">{metric.description}</p>
                      )}
                      <div className="text-sm text-gray-500 mt-1">
                        Current: {metric.current_value} | Target: {metric.target_value} {metric.unit}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setEditingMetricId(metric.id)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => onDelete(metric.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create New Metric Form */}
      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Metric</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="thresholds">Thresholds</TabsTrigger>
                <TabsTrigger value="data">Time Series</TabsTrigger>
                <TabsTrigger value="survey">Survey Data</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4 mt-4">
                {/* Basic metric information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Metric Name *</Label>
                    <Input
                      id="name"
                      value={newMetric.name || ''}
                      onChange={(e) => setNewMetric({...newMetric, name: e.target.value})}
                      placeholder="e.g., Student Achievement Rate"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="type">Metric Type</Label>
                    <Select value={newMetric.metric_type} onValueChange={(value: MetricType) => 
                      setNewMetric({...newMetric, metric_type: value})
                    }>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="number">Number</SelectItem>
                        <SelectItem value="percent">Percent</SelectItem>
                        <SelectItem value="rating">Rating</SelectItem>
                        <SelectItem value="survey">Survey</SelectItem>
                        <SelectItem value="currency">Currency</SelectItem>
                        <SelectItem value="status">Status</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select value={newMetric.metric_category} onValueChange={(value: MetricCategory) => 
                      setNewMetric({...newMetric, metric_category: value})
                    }>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="achievement">Achievement</SelectItem>
                        <SelectItem value="enrollment">Enrollment</SelectItem>
                        <SelectItem value="discipline">Discipline</SelectItem>
                        <SelectItem value="attendance">Attendance</SelectItem>
                        <SelectItem value="culture">Culture</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newMetric.description || ''}
                    onChange={(e) => setNewMetric({...newMetric, description: e.target.value})}
                    placeholder="Detailed description of what this metric measures..."
                    className="min-h-[80px]"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="current">Current Value</Label>
                    <Input
                      id="current"
                      type="number"
                      step="0.01"
                      value={newMetric.current_value || 0}
                      onChange={(e) => setNewMetric({...newMetric, current_value: parseFloat(e.target.value)})}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="target">Target Value</Label>
                    <Input
                      id="target"
                      type="number"
                      step="0.01"
                      value={newMetric.target_value || 0}
                      onChange={(e) => setNewMetric({...newMetric, target_value: parseFloat(e.target.value)})}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="unit">Unit</Label>
                    <Input
                      id="unit"
                      value={newMetric.unit || ''}
                      onChange={(e) => setNewMetric({...newMetric, unit: e.target.value})}
                      placeholder="%, points, ratio, etc."
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="thresholds" className="space-y-4 mt-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="higher-better">Higher values are better</Label>
                    <Switch
                      id="higher-better"
                      checked={newMetric.is_higher_better || false}
                      onCheckedChange={(checked) => setNewMetric({...newMetric, is_higher_better: checked})}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="off-target">Off Target Threshold</Label>
                      <Input
                        id="off-target"
                        type="number"
                        step="0.01"
                        value={newMetric.risk_threshold_off_target || 0.9}
                        onChange={(e) => setNewMetric({...newMetric, risk_threshold_off_target: parseFloat(e.target.value)})}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Ratio threshold for off-target status
                      </p>
                    </div>
                    
                    <div>
                      <Label htmlFor="critical">Critical Threshold</Label>
                      <Input
                        id="critical"
                        type="number"
                        step="0.01"
                        value={newMetric.risk_threshold_critical || 0.7}
                        onChange={(e) => setNewMetric({...newMetric, risk_threshold_critical: parseFloat(e.target.value)})}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Ratio threshold for critical status
                      </p>
                    </div>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-start gap-2">
                      <Info className="w-4 h-4 text-blue-600 mt-0.5" />
                      <div className="text-sm text-blue-800">
                        <p className="font-medium mb-1">Threshold Guidelines:</p>
                        <ul className="text-xs space-y-1">
                          <li>• For metrics where higher is better: On Target ≥ {newMetric.risk_threshold_off_target}, Off Target ≥ {newMetric.risk_threshold_critical}</li>
                          <li>• For metrics where lower is better: On Target ≤ {newMetric.risk_threshold_off_target}, Off Target ≤ {newMetric.risk_threshold_critical}</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="data" className="space-y-4 mt-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Time Series Data Points</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addTimeSeriesPoint}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Data Point
                  </Button>
                </div>

                {timeSeriesData.length > 0 ? (
                  <div className="space-y-3">
                    {timeSeriesData.map((point, index) => (
                      <div key={index} className="grid grid-cols-4 gap-2 p-3 border rounded-lg">
                        <Input
                          placeholder="2024-Q1"
                          value={point.period}
                          onChange={(e) => {
                            const updated = [...timeSeriesData];
                            updated[index].period = e.target.value;
                            setTimeSeriesData(updated);
                          }}
                        />
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="Target"
                          value={point.target_value || ''}
                          onChange={(e) => {
                            const updated = [...timeSeriesData];
                            updated[index].target_value = parseFloat(e.target.value);
                            setTimeSeriesData(updated);
                          }}
                        />
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="Actual"
                          value={point.actual_value || ''}
                          onChange={(e) => {
                            const updated = [...timeSeriesData];
                            updated[index].actual_value = parseFloat(e.target.value);
                            setTimeSeriesData(updated);
                          }}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const updated = timeSeriesData.filter((_, i) => i !== index);
                            setTimeSeriesData(updated);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-sm">No time series data points added yet</p>
                    <p className="text-xs mt-1">Add data points to track performance over time</p>
                  </div>
                )}
              </TabsContent>

              {/* Survey Data Tab - Only show for survey type metrics */}
              {newMetric.metric_type === 'survey' && (
                <TabsContent value="survey" className="space-y-4 mt-4">
                  <div className="space-y-4">
                    {/* Survey Configuration */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="scale-min">Scale Minimum</Label>
                        <Input
                          id="scale-min"
                          type="number"
                          step="0.1"
                          value={newMetric.survey_scale_min || 1}
                          onChange={(e) => setNewMetric({...newMetric, survey_scale_min: parseFloat(e.target.value)})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="scale-max">Scale Maximum</Label>
                        <Input
                          id="scale-max"
                          type="number"
                          step="0.1"
                          value={newMetric.survey_scale_max || 5}
                          onChange={(e) => setNewMetric({...newMetric, survey_scale_max: parseFloat(e.target.value)})}
                        />
                      </div>
                    </div>

                    {/* Survey Source Labels */}
                    <div>
                      <Label htmlFor="source-label">Survey Source Label</Label>
                      <Input
                        id="source-label"
                        value={newMetric.survey_source_label || ''}
                        onChange={(e) => setNewMetric({...newMetric, survey_source_label: e.target.value})}
                        placeholder="e.g., Annual Student Belonging Survey"
                      />
                    </div>

                    {/* Current Survey Values */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="survey-primary">Primary Source Value</Label>
                        <Input
                          id="survey-primary"
                          type="number"
                          step="0.01"
                          value={newMetric.survey_primary_source || 0}
                          onChange={(e) => setNewMetric({...newMetric, survey_primary_source: parseFloat(e.target.value)})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="survey-data">Data Source Value</Label>
                        <Input
                          id="survey-data"
                          type="number"
                          step="0.01"
                          value={newMetric.survey_data_source || 0}
                          onChange={(e) => setNewMetric({...newMetric, survey_data_source: parseFloat(e.target.value)})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="survey-current">Survey Value</Label>
                        <Input
                          id="survey-current"
                          type="number"
                          step="0.01"
                          value={newMetric.current_value || 0}
                          onChange={(e) => setNewMetric({...newMetric, current_value: parseFloat(e.target.value)})}
                        />
                      </div>
                    </div>

                    {/* Narrative Text */}
                    <div>
                      <Label htmlFor="narrative">Narrative Summary</Label>
                      <Textarea
                        id="narrative"
                        value={newMetric.narrative_text || ''}
                        onChange={(e) => setNewMetric({...newMetric, narrative_text: e.target.value})}
                        placeholder="The annual student belonging survey continues to increase each year. Staff are committed to..."
                        className="min-h-[100px]"
                      />
                    </div>

                    {/* Survey Data Points */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">Historical Survey Data</h3>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const currentYear = new Date().getFullYear();
                            const newPoint: SurveyDataPoint = {
                              year: currentYear,
                              primary_value: 0,
                              data_value: 0,
                              survey_value: 0
                            };
                            setSurveyData([...surveyData, newPoint]);
                          }}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add Year
                        </Button>
                      </div>

                      {surveyData.length > 0 ? (
                        <div className="space-y-2">
                          {surveyData.map((point, index) => (
                            <div key={index} className="grid grid-cols-5 gap-2 p-3 border rounded-lg">
                              <Input
                                type="number"
                                placeholder="Year"
                                value={point.year}
                                onChange={(e) => {
                                  const updated = [...surveyData];
                                  updated[index].year = parseInt(e.target.value);
                                  setSurveyData(updated);
                                }}
                              />
                              <Input
                                type="number"
                                step="0.01"
                                placeholder="Primary"
                                value={point.primary_value || ''}
                                onChange={(e) => {
                                  const updated = [...surveyData];
                                  updated[index].primary_value = parseFloat(e.target.value);
                                  setSurveyData(updated);
                                }}
                              />
                              <Input
                                type="number"
                                step="0.01"
                                placeholder="Data"
                                value={point.data_value || ''}
                                onChange={(e) => {
                                  const updated = [...surveyData];
                                  updated[index].data_value = parseFloat(e.target.value);
                                  setSurveyData(updated);
                                }}
                              />
                              <Input
                                type="number"
                                step="0.01"
                                placeholder="Survey"
                                value={point.survey_value || ''}
                                onChange={(e) => {
                                  const updated = [...surveyData];
                                  updated[index].survey_value = parseFloat(e.target.value);
                                  setSurveyData(updated);
                                }}
                              />
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSurveyData(surveyData.filter((_, i) => i !== index));
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-6 text-gray-500 border rounded-lg">
                          <BarChart3 className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                          <p className="text-sm">No historical data added yet</p>
                          <p className="text-xs mt-1">Add yearly data to show trends</p>
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>
              )}
            </Tabs>

            {/* Form Actions */}
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => {
                  setIsCreating(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleCreateMetric}>
                <Save className="h-4 w-4 mr-1" />
                Create Metric
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Add Metric Button */}
      {!isCreating && (
        <Card className="border-dashed border-2 border-gray-300 hover:border-gray-400 transition-colors">
          <CardContent className="p-6">
            <button
              onClick={() => setShowWizard(true)}
              className="w-full flex flex-col items-center gap-2 text-gray-600 hover:text-gray-700"
            >
              <Plus className="w-8 h-8" />
              <span className="font-medium">Add New Metric</span>
              <span className="text-sm">Track performance indicators for this goal</span>
            </button>
          </CardContent>
        </Card>
      )}

      {/* Metric Builder Wizard */}
      <MetricBuilderWizard
        isOpen={showWizard}
        onClose={() => setShowWizard(false)}
        onSave={async (metric) => {
          try {
            await onSave(metric);
            setShowWizard(false);
            toast.success('Metric saved successfully');
          } catch (error) {
            console.error('Failed to save metric:', error);
            const errorMessage = error instanceof Error ? error.message : 'Failed to save metric';
            toast.error(errorMessage);
            // Don't close wizard on error so user can retry
          }
        }}
        goalId={goalId}
        goalNumber={goalNumber}
      />
    </div>
  );
}