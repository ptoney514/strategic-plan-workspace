'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Trash2, 
  Edit, 
  Save, 
  X, 
  TrendingUp,
  Target,
  AlertTriangle,
  CheckCircle,
  XCircle,
  BarChart3,
  LineChart,
  PieChart,
  Activity
} from 'lucide-react';
import { Metric, MetricType, MetricCategory, ChartType, MetricStatus, calculateMetricStatus, getMetricStatusConfig } from '@/lib/types';
import { MetricBuilderWizard } from './metrics/MetricBuilderWizard';

interface MetricsEditPanelProps {
  goalId: string;
  metrics: Metric[];
  onSave: (metrics: Metric[]) => void;
  onCancel?: () => void;
}

interface MetricFormData {
  id?: string;
  name: string;
  description: string;
  measure_title: string;
  metric_type: MetricType;
  metric_category: MetricCategory;
  current_value?: number;
  target_value?: number;
  measure_unit: string;
  decimal_places: number;
  show_percentage: boolean;
  is_higher_better: boolean;
  risk_threshold_critical?: number;
  risk_threshold_off_target?: number;
  collection_frequency: string;
  chart_type: ChartType;
  aggregation_method?: string;
}

const defaultMetric: MetricFormData = {
  name: '',
  description: '',
  measure_title: '',
  metric_type: 'number',
  metric_category: 'other',
  measure_unit: '',
  decimal_places: 2,
  show_percentage: false,
  is_higher_better: true,
  collection_frequency: 'quarterly',
  chart_type: 'line',
  aggregation_method: 'average'
};

export function MetricsEditPanel({ goalId, metrics, onSave, onCancel }: MetricsEditPanelProps) {
  const [editingMetrics, setEditingMetrics] = useState<Metric[]>(metrics);
  const [newMetric, setNewMetric] = useState<MetricFormData>(defaultMetric);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [showWizard, setShowWizard] = useState(false);
  const [activeTab, setActiveTab] = useState('metrics');

  const handleAddMetric = () => {
    const metric: Metric = {
      id: `temp-${Date.now()}`,
      goal_id: goalId,
      ...newMetric,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    } as Metric;
    
    setEditingMetrics([...editingMetrics, metric]);
    setNewMetric(defaultMetric);
    setShowNewForm(false);
  };

  const handleUpdateMetric = (id: string, updates: Partial<Metric>) => {
    setEditingMetrics(editingMetrics.map(m => 
      m.id === id ? { ...m, ...updates, updated_at: new Date().toISOString() } : m
    ));
  };

  const handleDeleteMetric = (id: string) => {
    setEditingMetrics(editingMetrics.filter(m => m.id !== id));
  };

  const handleSave = () => {
    onSave(editingMetrics);
  };

  const getStatusIcon = (status: MetricStatus) => {
    switch (status) {
      case 'on-target':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'off-target':
        return <AlertTriangle className="w-4 h-4 text-orange-600" />;
      case 'critical':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Activity className="w-4 h-4 text-gray-400" />;
    }
  };

  const getChartIcon = (type: ChartType) => {
    switch (type) {
      case 'bar':
        return <BarChart3 className="w-4 h-4" />;
      case 'line':
        return <LineChart className="w-4 h-4" />;
      case 'donut':
        return <PieChart className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Metrics & KPIs</h3>
        <div className="flex gap-2">
          {onCancel && (
            <Button variant="outline" size="sm" onClick={onCancel}>
              <X className="w-4 h-4 mr-1" />
              Cancel
            </Button>
          )}
          <Button size="sm" onClick={handleSave}>
            <Save className="w-4 h-4 mr-1" />
            Save Metrics
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="metrics">Metrics</TabsTrigger>
          <TabsTrigger value="timeseries">Time Series</TabsTrigger>
          <TabsTrigger value="visualization">Visualization</TabsTrigger>
        </TabsList>

        <TabsContent value="metrics" className="space-y-4">
          {/* Existing Metrics List */}
          <div className="space-y-3">
            {editingMetrics.map((metric) => {
              const status = calculateMetricStatus(metric);
              const statusConfig = getMetricStatusConfig(status);
              const isEditing = editingId === metric.id;

              return (
                <Card key={metric.id}>
                  <CardContent className="p-4">
                    {isEditing ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Metric Name</Label>
                            <Input
                              value={metric.name}
                              onChange={(e) => handleUpdateMetric(metric.id, { name: e.target.value })}
                            />
                          </div>
                          <div>
                            <Label>Measure Title</Label>
                            <Input
                              value={metric.measure_title || ''}
                              onChange={(e) => handleUpdateMetric(metric.id, { measure_title: e.target.value })}
                            />
                          </div>
                        </div>

                        <div>
                          <Label>Description</Label>
                          <Input
                            value={metric.description || ''}
                            onChange={(e) => handleUpdateMetric(metric.id, { description: e.target.value })}
                          />
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <Label>Type</Label>
                            <Select
                              value={metric.metric_type}
                              onValueChange={(value) => handleUpdateMetric(metric.id, { metric_type: value as MetricType })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="number">Number</SelectItem>
                                <SelectItem value="percent">Percent</SelectItem>
                                <SelectItem value="rating">Rating</SelectItem>
                                <SelectItem value="currency">Currency</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label>Category</Label>
                            <Select
                              value={metric.metric_category || 'other'}
                              onValueChange={(value) => handleUpdateMetric(metric.id, { metric_category: value as MetricCategory })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="enrollment">Enrollment</SelectItem>
                                <SelectItem value="achievement">Achievement</SelectItem>
                                <SelectItem value="discipline">Discipline</SelectItem>
                                <SelectItem value="attendance">Attendance</SelectItem>
                                <SelectItem value="culture">Culture</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label>Frequency</Label>
                            <Select
                              value={metric.collection_frequency || 'quarterly'}
                              onValueChange={(value) => handleUpdateMetric(metric.id, { collection_frequency: value })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="daily">Daily</SelectItem>
                                <SelectItem value="weekly">Weekly</SelectItem>
                                <SelectItem value="monthly">Monthly</SelectItem>
                                <SelectItem value="quarterly">Quarterly</SelectItem>
                                <SelectItem value="annually">Annually</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="grid grid-cols-4 gap-4">
                          <div>
                            <Label>Current Value</Label>
                            <Input
                              type="number"
                              value={metric.current_value || ''}
                              onChange={(e) => handleUpdateMetric(metric.id, { current_value: parseFloat(e.target.value) })}
                            />
                          </div>
                          <div>
                            <Label>Target Value</Label>
                            <Input
                              type="number"
                              value={metric.target_value || ''}
                              onChange={(e) => handleUpdateMetric(metric.id, { target_value: parseFloat(e.target.value) })}
                            />
                          </div>
                          <div>
                            <Label>Unit</Label>
                            <Input
                              value={metric.measure_unit || ''}
                              onChange={(e) => handleUpdateMetric(metric.id, { measure_unit: e.target.value })}
                              placeholder="%, points, etc."
                            />
                          </div>
                          <div>
                            <Label>Decimal Places</Label>
                            <Input
                              type="number"
                              min="0"
                              max="4"
                              value={metric.decimal_places || 2}
                              onChange={(e) => handleUpdateMetric(metric.id, { decimal_places: parseInt(e.target.value) })}
                            />
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <Label>Higher Values Are Better</Label>
                            <Switch
                              checked={metric.is_higher_better ?? true}
                              onCheckedChange={(checked) => handleUpdateMetric(metric.id, { is_higher_better: checked })}
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <Label>Show as Percentage</Label>
                            <Switch
                              checked={metric.show_percentage || false}
                              onCheckedChange={(checked) => handleUpdateMetric(metric.id, { show_percentage: checked })}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Critical Threshold</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={metric.risk_threshold_critical || ''}
                              onChange={(e) => handleUpdateMetric(metric.id, { risk_threshold_critical: parseFloat(e.target.value) })}
                              placeholder={metric.is_higher_better ? "0.7" : "1.3"}
                            />
                          </div>
                          <div>
                            <Label>Off-Target Threshold</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={metric.risk_threshold_off_target || ''}
                              onChange={(e) => handleUpdateMetric(metric.id, { risk_threshold_off_target: parseFloat(e.target.value) })}
                              placeholder={metric.is_higher_better ? "0.9" : "1.1"}
                            />
                          </div>
                        </div>

                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingId(null)}
                          >
                            Cancel
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => setEditingId(null)}
                          >
                            Done
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            {getStatusIcon(status)}
                            <div>
                              <p className="font-medium">{metric.name}</p>
                              <p className="text-sm text-gray-600">
                                {metric.current_value || 0} / {metric.target_value || 0} {metric.measure_unit}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={`${statusConfig.bgColor} ${statusConfig.textColor}`}>
                            {statusConfig.label}
                          </Badge>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setEditingId(metric.id)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteMetric(metric.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Add New Metric Button - Opens Wizard */}
          {showNewForm ? (
            <Card>
              <CardHeader>
                <CardTitle>Add New Metric</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Metric Name *</Label>
                    <Input
                      value={newMetric.name}
                      onChange={(e) => setNewMetric({ ...newMetric, name: e.target.value })}
                      placeholder="e.g., Student Belonging Survey"
                    />
                  </div>
                  <div>
                    <Label>Measure Title</Label>
                    <Input
                      value={newMetric.measure_title}
                      onChange={(e) => setNewMetric({ ...newMetric, measure_title: e.target.value })}
                      placeholder="e.g., Belonging Score"
                    />
                  </div>
                </div>

                <div>
                  <Label>Description</Label>
                  <Input
                    value={newMetric.description}
                    onChange={(e) => setNewMetric({ ...newMetric, description: e.target.value })}
                    placeholder="Detailed description of what this metric measures"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Type</Label>
                    <Select
                      value={newMetric.metric_type}
                      onValueChange={(value) => setNewMetric({ ...newMetric, metric_type: value as MetricType })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="number">Number</SelectItem>
                        <SelectItem value="percent">Percent</SelectItem>
                        <SelectItem value="rating">Rating</SelectItem>
                        <SelectItem value="currency">Currency</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Category</Label>
                    <Select
                      value={newMetric.metric_category}
                      onValueChange={(value) => setNewMetric({ ...newMetric, metric_category: value as MetricCategory })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="enrollment">Enrollment</SelectItem>
                        <SelectItem value="achievement">Achievement</SelectItem>
                        <SelectItem value="discipline">Discipline</SelectItem>
                        <SelectItem value="attendance">Attendance</SelectItem>
                        <SelectItem value="culture">Culture</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Chart Type</Label>
                    <Select
                      value={newMetric.chart_type}
                      onValueChange={(value) => setNewMetric({ ...newMetric, chart_type: value as ChartType })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="line">Line Chart</SelectItem>
                        <SelectItem value="bar">Bar Chart</SelectItem>
                        <SelectItem value="donut">Donut Chart</SelectItem>
                        <SelectItem value="area">Area Chart</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowNewForm(false);
                      setNewMetric(defaultMetric);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleAddMetric} disabled={!newMetric.name}>
                    Add Metric
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setShowWizard(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add New Metric
            </Button>
          )}
        </TabsContent>

        <TabsContent value="timeseries" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Time Series Data</CardTitle>
              <CardDescription>
                Track actual vs target values over time for quarterly, monthly, or annual periods
              </CardDescription>
            </CardHeader>
            <CardContent>
              {editingMetrics.length > 0 ? (
                <div className="space-y-4">
                  {editingMetrics.map((metric) => (
                    <div key={metric.id} className="border rounded-lg p-4">
                      <h4 className="font-medium mb-3">{metric.name}</h4>
                      <div className="text-sm text-gray-600 mb-2">
                        Add historical data points for tracking trends
                      </div>
                      <Button variant="outline" size="sm">
                        <Plus className="w-4 h-4 mr-1" />
                        Add Data Points
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  Add metrics first to configure time series data
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="visualization" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Visualization</CardTitle>
              <CardDescription>
                Configure how metrics are displayed in dashboards and reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {editingMetrics.map((metric) => (
                  <div key={metric.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">{metric.name}</h4>
                      {getChartIcon(metric.chart_type || 'line')}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Chart Type</Label>
                        <Select
                          value={metric.chart_type || 'line'}
                          onValueChange={(value) => handleUpdateMetric(metric.id, { chart_type: value as ChartType })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="line">Line Chart</SelectItem>
                            <SelectItem value="bar">Bar Chart</SelectItem>
                            <SelectItem value="donut">Donut Chart</SelectItem>
                            <SelectItem value="area">Area Chart</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Aggregation Method</Label>
                        <Select
                          value={metric.aggregation_method || 'average'}
                          onValueChange={(value) => handleUpdateMetric(metric.id, { aggregation_method: value as 'average' | 'sum' | 'latest' | 'max' | 'min' })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="average">Average</SelectItem>
                            <SelectItem value="sum">Sum</SelectItem>
                            <SelectItem value="latest">Latest Value</SelectItem>
                            <SelectItem value="max">Maximum</SelectItem>
                            <SelectItem value="min">Minimum</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                ))}
                {editingMetrics.length === 0 && (
                  <p className="text-gray-500 text-center py-8">
                    Add metrics first to configure visualizations
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Metric Builder Wizard */}
      <MetricBuilderWizard
        isOpen={showWizard}
        onClose={() => setShowWizard(false)}
        onSave={async (metric) => {
          // Add the new metric to the list
          const newMetricData: Metric = {
            id: `temp-${Date.now()}`,
            goal_id: goalId,
            name: metric.name,
            description: metric.description || '',
            metric_type: metric.metric_type || 'number',
            metric_category: metric.metric_category || 'other',
            current_value: metric.current_value || 0,
            target_value: metric.target_value || null,
            measure_unit: metric.unit || '',
            collection_frequency: metric.collection_frequency || 'quarterly',
            is_higher_better: metric.is_higher_better !== false,
            visualization_type: metric.visualization_type,
            visualization_config: metric.visualization_config,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          } as Metric;
          
          // Add to local state
          const updatedMetrics = [...editingMetrics, newMetricData];
          setEditingMetrics(updatedMetrics);
          
          // Automatically save to database
          onSave(updatedMetrics);
          
          setShowWizard(false);
        }}
        goalId={goalId}
        goalNumber="1" // You might want to pass this as a prop
      />
    </div>
  );
}