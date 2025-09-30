'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Trash2, Edit2, Check, X, TrendingUp, Target, BarChart3, LineChart, PieChart, Activity } from 'lucide-react';
import { Metric, MetricType, DataSourceType, ChartType } from '@/lib/types';
import { createMetric, updateMetric, deleteMetric } from '@/lib/db-service';
import { Badge } from '@/components/ui/badge';

interface MetricInputProps {
  goalId: string;
  metrics: Metric[];
  onUpdate: (metrics: Metric[]) => void;
  onAddMetric?: (goalId: string, metric: any) => Promise<void>;
  onUpdateMetric?: (metricId: string, updates: any) => Promise<void>;
  onDeleteMetric?: (metricId: string) => Promise<void>;
}

export default function MetricInput({ goalId, metrics, onUpdate, onAddMetric, onUpdateMetric, onDeleteMetric }: MetricInputProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newMetric, setNewMetric] = useState<Partial<Metric>>({
    metric_type: 'percent',
    data_source: 'survey',
    chart_type: 'line'
  });
  const [editedMetrics, setEditedMetrics] = useState<Record<string, Metric>>({});

  const metricTypes: { value: MetricType; label: string }[] = [
    { value: 'percent', label: 'Percentage' },
    { value: 'number', label: 'Number' },
    { value: 'rating', label: 'Rating' },
    { value: 'currency', label: 'Currency' },
    { value: 'status', label: 'Status' },
    { value: 'narrative', label: 'Narrative' },
    { value: 'link', label: 'Link' }
  ];

  const dataSources: { value: DataSourceType; label: string }[] = [
    { value: 'survey', label: 'Survey Results' },
    { value: 'map_data', label: 'MAP Data' },
    { value: 'state_testing', label: 'State Testing' },
    { value: 'total_number', label: 'Total Number' },
    { value: 'percent', label: 'Percentage' },
    { value: 'narrative', label: 'Narrative' },
    { value: 'link', label: 'External Link' }
  ];

  const chartTypes: { value: ChartType; label: string; icon: React.ReactNode }[] = [
    { value: 'line', label: 'Line Chart', icon: <LineChart className="w-4 h-4" /> },
    { value: 'bar', label: 'Bar Chart', icon: <BarChart3 className="w-4 h-4" /> },
    { value: 'donut', label: 'Donut Chart', icon: <PieChart className="w-4 h-4" /> },
    { value: 'area', label: 'Area Chart', icon: <Activity className="w-4 h-4" /> }
  ];

  const handleAddMetric = async () => {
    if (!newMetric.name) {
      console.log('⚠️ No metric name provided');
      return;
    }

    console.log('📊 Adding new metric:', { goalId, newMetric });

    if (onAddMetric) {
      const metricData = {
        name: newMetric.name,
        metric_type: newMetric.metric_type || 'percent',
        data_source: newMetric.data_source,
        current_value: newMetric.current_value,
        target_value: newMetric.target_value,
        unit: newMetric.unit,
        timeframe_start: newMetric.timeframe_start,
        timeframe_end: newMetric.timeframe_end,
        chart_type: newMetric.chart_type || 'line',
        is_primary: metrics.length === 0, // First metric is primary
        display_order: metrics.length
      };
      
      console.log('📤 Calling onAddMetric with:', metricData);
      await onAddMetric(goalId, metricData);
      setNewMetric({ metric_type: 'percent', data_source: 'survey', chart_type: 'line' });
      setIsAdding(false);
    } else {
      // Fallback to direct database call if no parent handler
      const metric = await createMetric({
        goal_id: goalId,
        name: newMetric.name,
        metric_type: newMetric.metric_type || 'percent',
        data_source: newMetric.data_source,
        current_value: newMetric.current_value,
        target_value: newMetric.target_value,
        unit: newMetric.unit,
        timeframe_start: newMetric.timeframe_start,
        timeframe_end: newMetric.timeframe_end,
        chart_type: newMetric.chart_type || 'line',
        is_primary: metrics.length === 0,
        display_order: metrics.length
      });

      if (metric) {
        onUpdate([...metrics, metric]);
        setNewMetric({ metric_type: 'percent', data_source: 'survey', chart_type: 'line' });
        setIsAdding(false);
      }
    }
  };

  const handleUpdateMetric = async (metricId: string, updates: Partial<Metric>) => {
    console.log('📊 Updating metric:', { metricId, updates });
    
    if (onUpdateMetric) {
      console.log('📤 Calling onUpdateMetric...');
      await onUpdateMetric(metricId, updates);
      setEditingId(null);
    } else {
      // Fallback to direct database call if no parent handler
      const success = await updateMetric(metricId, updates);
      if (success) {
        onUpdate(metrics.map(m => m.id === metricId ? { ...m, ...updates } : m));
        setEditingId(null);
      }
    }
  };

  const handleDeleteMetric = async (metricId: string) => {
    if (onDeleteMetric) {
      await onDeleteMetric(metricId);
    } else {
      // Fallback to direct database call if no parent handler
      const success = await deleteMetric(metricId);
      if (success) {
        onUpdate(metrics.filter(m => m.id !== metricId));
      }
    }
  };

  const handleSetPrimary = async (metricId: string) => {
    if (onUpdateMetric) {
      // Update through parent handlers
      for (const m of metrics) {
        const isPrimary = m.id === metricId;
        await onUpdateMetric(m.id, { is_primary: isPrimary });
      }
    } else {
      // Fallback to direct database calls
      const updatedMetrics = await Promise.all(
        metrics.map(async (m) => {
          const isPrimary = m.id === metricId;
          await updateMetric(m.id, { is_primary: isPrimary });
          return { ...m, is_primary: isPrimary };
        })
      );
      onUpdate(updatedMetrics);
    }
  };

  const renderMetricForm = (
    metric: Partial<Metric>,
    onSave: () => void,
    onCancel: () => void,
    onChange: (updates: Partial<Metric>) => void
  ) => (
    <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-xs">Metric Name</Label>
          <Input
            placeholder="e.g., Student Proficiency"
            value={metric.name || ''}
            onChange={(e) => onChange({ ...metric, name: e.target.value })}
            className="h-8"
          />
        </div>
        <div>
          <Label className="text-xs">Data Source</Label>
          <Select
            value={metric.data_source || 'survey'}
            onValueChange={(value: DataSourceType) => onChange({ ...metric, data_source: value })}
          >
            <SelectTrigger className="h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {dataSources.map(ds => (
                <SelectItem key={ds.value} value={ds.value}>{ds.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <Label className="text-xs">Type</Label>
          <Select
            value={metric.metric_type || 'percent'}
            onValueChange={(value: MetricType) => onChange({ ...metric, metric_type: value })}
          >
            <SelectTrigger className="h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {metricTypes.map(mt => (
                <SelectItem key={mt.value} value={mt.value}>{mt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs">Current Value</Label>
          <Input
            type="number"
            placeholder="75"
            value={metric.current_value || ''}
            onChange={(e) => onChange({ ...metric, current_value: parseFloat(e.target.value) })}
            className="h-8"
          />
        </div>
        <div>
          <Label className="text-xs">Target Value</Label>
          <Input
            type="number"
            placeholder="90"
            value={metric.target_value || ''}
            onChange={(e) => onChange({ ...metric, target_value: parseFloat(e.target.value) })}
            className="h-8"
          />
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <div>
          <Label className="text-xs">Chart Type</Label>
          <Select 
            value={metric.chart_type || 'line'}
            onValueChange={(value: ChartType) => onChange({ ...metric, chart_type: value })}
          >
            <SelectTrigger className="h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {chartTypes.map(ct => (
                <SelectItem key={ct.value} value={ct.value}>
                  <div className="flex items-center gap-2">
                    {ct.icon}
                    {ct.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs">Unit</Label>
          <Input
            placeholder="%"
            value={metric.unit || ''}
            onChange={(e) => onChange({ ...metric, unit: e.target.value })}
            className="h-8"
          />
        </div>
        <div>
          <Label className="text-xs">Start Year</Label>
          <Input
            type="number"
            placeholder="2021"
            value={metric.timeframe_start || ''}
            onChange={(e) => onChange({ ...metric, timeframe_start: parseInt(e.target.value) })}
            className="h-8"
          />
        </div>
        <div>
          <Label className="text-xs">End Year</Label>
          <Input
            type="number"
            placeholder="2025"
            value={metric.timeframe_end || ''}
            onChange={(e) => onChange({ ...metric, timeframe_end: parseInt(e.target.value) })}
            className="h-8"
          />
        </div>
      </div>

      <div className="flex gap-2">
        <Button size="sm" onClick={onSave} disabled={!metric.name}>
          <Check size={14} className="mr-1" /> Save
        </Button>
        <Button size="sm" variant="outline" onClick={onCancel}>
          <X size={14} className="mr-1" /> Cancel
        </Button>
      </div>
    </div>
  );

  const renderMetricCard = (metric: Metric) => {
    if (editingId === metric.id) {
      const editedMetric = editedMetrics[metric.id] || metric;
      const setEditedMetric = (updates: Partial<Metric>) => {
        setEditedMetrics(prev => ({ ...prev, [metric.id]: { ...editedMetric, ...updates } }));
      };
      return (
        <Card key={metric.id} className="mb-2">
          <CardContent className="p-0">
            {renderMetricForm(
              editedMetric,
              () => handleUpdateMetric(metric.id, editedMetric),
              () => {
                setEditingId(null);
                setEditedMetrics(prev => {
                  const { [metric.id]: removed, ...rest } = prev;
                  return rest;
                });
              },
              setEditedMetric
            )}
          </CardContent>
        </Card>
      );
    }

    const progress = metric.current_value && metric.target_value
      ? (metric.current_value / metric.target_value) * 100
      : 0;

    const getStatusColor = () => {
      if (!metric.current_value || !metric.target_value) return 'gray';
      const ratio = metric.current_value / metric.target_value;
      if (ratio >= 0.95) return 'green';
      if (ratio >= 0.8) return 'yellow';
      return 'red';
    };

    return (
      <Card key={metric.id} className="mb-2">
        <CardContent className="p-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-medium text-sm">{metric.name}</h4>
                {metric.is_primary && (
                  <Badge variant="secondary" className="text-xs">Primary</Badge>
                )}
                {metric.data_source && (
                  <Badge variant="outline" className="text-xs">
                    {dataSources.find(ds => ds.value === metric.data_source)?.label}
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center gap-4 text-xs text-gray-600">
                {metric.current_value !== undefined && (
                  <div className="flex items-center gap-1">
                    <TrendingUp size={12} />
                    <span>Current: {metric.current_value}{metric.unit || ''}</span>
                  </div>
                )}
                {metric.target_value !== undefined && (
                  <div className="flex items-center gap-1">
                    <Target size={12} />
                    <span>Target: {metric.target_value}{metric.unit || ''}</span>
                  </div>
                )}
                {metric.timeframe_start && metric.timeframe_end && (
                  <span>{metric.timeframe_start}-{metric.timeframe_end}</span>
                )}
              </div>

              {metric.current_value !== undefined && metric.target_value !== undefined && (
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all bg-${getStatusColor()}-500`}
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex gap-1 ml-2">
              {!metric.is_primary && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSetPrimary(metric.id)}
                  title="Set as primary"
                  className="h-7 w-7 p-0"
                >
                  <Target size={14} />
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setEditedMetrics(prev => ({ ...prev, [metric.id]: metric }));
                  setEditingId(metric.id);
                }}
                className="h-7 w-7 p-0"
              >
                <Edit2 size={14} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDeleteMetric(metric.id)}
                className="text-red-600 hover:text-red-700 h-7 w-7 p-0"
              >
                <Trash2 size={14} />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-2">
      {metrics.map(renderMetricCard)}
      
      {isAdding ? (
        <Card>
          <CardContent className="p-0">
            {renderMetricForm(
              newMetric,
              handleAddMetric,
              () => {
                setIsAdding(false);
                setNewMetric({ metric_type: 'percent', data_source: 'survey', chart_type: 'line' });
              },
              setNewMetric
            )}
          </CardContent>
        </Card>
      ) : (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsAdding(true)}
          className="w-full"
        >
          <Plus size={14} className="mr-1" /> Add Metric
        </Button>
      )}
    </div>
  );
}