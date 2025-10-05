import React from 'react';
import { Info, Plus, Trash2 } from 'lucide-react';
import { type VisualizationType, getDefaultConfig } from '../lib/metric-visualizations';

interface MetricDataFormProps {
  type: VisualizationType;
  data: any;
  onChange: (data: any) => void;
}

export function MetricDataForm({ type, data, onChange }: MetricDataFormProps) {
  const updateField = (field: string, value: any) => {
    onChange({ ...data, [field]: value });
  };

  const renderFormFields = () => {
    switch (type) {
      case 'percentage':
        return (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium">Perfect for progress tracking!</p>
                  <p>Show achievement rates, completion percentages, or any metric measured from 0-100%.</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Current Percentage</label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={data.currentValue ?? ''}
                    onChange={(e) => updateField('currentValue', e.target.value === '' ? '' : parseFloat(e.target.value))}
                    placeholder="0"
                    className="w-full px-3 py-2 border border-border rounded-md pr-8"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Where are you now?</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Target Percentage</label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={data.targetValue || 100}
                    onChange={(e) => updateField('targetValue', parseFloat(e.target.value))}
                    className="w-full px-3 py-2 border border-border rounded-md pr-8"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">What's your goal?</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Additional Context (optional)</label>
              <input
                type="text"
                value={data.suffix || ''}
                onChange={(e) => updateField('suffix', e.target.value)}
                placeholder="e.g., of students meeting standards"
                className="w-full px-3 py-2 border border-border rounded-md"
              />
              <p className="text-xs text-muted-foreground mt-1">This appears after the percentage</p>
            </div>
          </div>
        );

      case 'bar-chart':
        return (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium">Great for comparisons!</p>
                  <p>Compare different categories, groups, or time periods side by side.</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">What are you comparing?</label>
                <input
                  type="text"
                  value={data.xAxisLabel || ''}
                  onChange={(e) => updateField('xAxisLabel', e.target.value)}
                  placeholder="e.g., Schools, Quarters, Grades"
                  className="w-full px-3 py-2 border border-border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">What are you measuring?</label>
                <input
                  type="text"
                  value={data.yAxisLabel || ''}
                  onChange={(e) => updateField('yAxisLabel', e.target.value)}
                  placeholder="Value"
                  className="w-full px-3 py-2 border border-border rounded-md"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <label className="block text-sm font-medium">Add Your Data Points</label>
                  <p className="text-xs text-muted-foreground">Each bar in your chart</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const newDataPoints = [...(data.dataPoints || []), { label: '', value: 0 }];
                    updateField('dataPoints', newDataPoints);
                  }}
                  className="px-3 py-1.5 text-sm border border-border rounded-md hover:bg-muted flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Add Bar
                </button>
              </div>
              <div className="space-y-2">
                {(data.dataPoints || []).length === 0 ? (
                  <div className="text-center py-6 bg-muted/50 rounded-lg border-2 border-dashed border-border">
                    <p className="text-muted-foreground">No data points yet</p>
                    <p className="text-xs text-muted-foreground mt-1">Click "Add Bar" to start adding data</p>
                  </div>
                ) : (
                  (data.dataPoints || []).map((point: any, index: number) => (
                    <div key={index} className="flex gap-2 items-center">
                      <span className="text-sm text-muted-foreground w-8">#{index + 1}</span>
                      <input
                        type="text"
                        placeholder="Category name"
                        value={point.label}
                        onChange={(e) => {
                          const newPoints = [...data.dataPoints];
                          newPoints[index].label = e.target.value;
                          updateField('dataPoints', newPoints);
                        }}
                        className="flex-1 px-3 py-2 border border-border rounded-md"
                      />
                      <input
                        type="number"
                        placeholder="Value"
                        value={point.value}
                        onChange={(e) => {
                          const newPoints = [...data.dataPoints];
                          newPoints[index].value = parseFloat(e.target.value) || 0;
                          updateField('dataPoints', newPoints);
                        }}
                        className="w-32 px-3 py-2 border border-border rounded-md"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const newPoints = data.dataPoints.filter((_: any, i: number) => i !== index);
                          updateField('dataPoints', newPoints);
                        }}
                        className="p-2 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        );

      case 'line-chart':
        return (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium">Perfect for trends over time!</p>
                  <p>Show how metrics change over days, months, or years.</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Time Period</label>
                <input
                  type="text"
                  value={data.xAxisLabel || ''}
                  onChange={(e) => updateField('xAxisLabel', e.target.value)}
                  placeholder="e.g., Month, Quarter, Year"
                  className="w-full px-3 py-2 border border-border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">What are you tracking?</label>
                <input
                  type="text"
                  value={data.yAxisLabel || ''}
                  onChange={(e) => updateField('yAxisLabel', e.target.value)}
                  placeholder="e.g., Enrollment, Performance"
                  className="w-full px-3 py-2 border border-border rounded-md"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <label className="block text-sm font-medium">Add Data Points Over Time</label>
                  <p className="text-xs text-muted-foreground">Each point on your trend line</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const newData = [...(data.dataPoints || []), { x: '', y: 0 }];
                    updateField('dataPoints', newData);
                  }}
                  className="px-3 py-1.5 text-sm border border-border rounded-md hover:bg-muted flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Add Point
                </button>
              </div>
              <div className="space-y-2">
                {(data.dataPoints || []).length === 0 ? (
                  <div className="text-center py-6 bg-muted/50 rounded-lg border-2 border-dashed border-border">
                    <p className="text-muted-foreground">No data points yet</p>
                    <p className="text-xs text-muted-foreground mt-1">Click "Add Point" to start tracking</p>
                  </div>
                ) : (
                  (data.dataPoints || []).map((point: any, index: number) => (
                    <div key={index} className="flex gap-2 items-center">
                      <span className="text-sm text-muted-foreground w-8">#{index + 1}</span>
                      <input
                        type="text"
                        placeholder="Time period (e.g., Jan 2024)"
                        value={point.x}
                        onChange={(e) => {
                          const newData = [...data.dataPoints];
                          newData[index].x = e.target.value;
                          updateField('dataPoints', newData);
                        }}
                        className="flex-1 px-3 py-2 border border-border rounded-md"
                      />
                      <input
                        type="number"
                        placeholder="Value"
                        value={point.y}
                        onChange={(e) => {
                          const newData = [...data.dataPoints];
                          newData[index].y = parseFloat(e.target.value) || 0;
                          updateField('dataPoints', newData);
                        }}
                        className="w-32 px-3 py-2 border border-border rounded-md"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const newData = data.dataPoints.filter((_: any, i: number) => i !== index);
                          updateField('dataPoints', newData);
                        }}
                        className="p-2 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        );

      case 'donut-chart':
        return (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium">Show parts of a whole!</p>
                  <p>Perfect for budget breakdowns, distribution of resources, or category percentages.</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Center Label (optional)</label>
                <input
                  type="text"
                  value={data.centerLabel || ''}
                  onChange={(e) => updateField('centerLabel', e.target.value)}
                  placeholder="e.g., Total Budget"
                  className="w-full px-3 py-2 border border-border rounded-md"
                />
                <p className="text-xs text-muted-foreground mt-1">Appears in the donut hole</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Center Value (optional)</label>
                <input
                  type="text"
                  value={data.centerValue || ''}
                  onChange={(e) => updateField('centerValue', e.target.value)}
                  placeholder="e.g., $2.5M"
                  className="w-full px-3 py-2 border border-border rounded-md"
                />
                <p className="text-xs text-muted-foreground mt-1">The total or sum</p>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <label className="block text-sm font-medium">Add Categories</label>
                  <p className="text-xs text-muted-foreground">Each slice of your donut</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const newCategories = [...(data.categories || []), { name: '', value: 0 }];
                    updateField('categories', newCategories);
                  }}
                  className="px-3 py-1.5 text-sm border border-border rounded-md hover:bg-muted flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Add Slice
                </button>
              </div>
              <div className="space-y-2">
                {(data.categories || []).length === 0 ? (
                  <div className="text-center py-6 bg-muted/50 rounded-lg border-2 border-dashed border-border">
                    <p className="text-muted-foreground">No categories yet</p>
                    <p className="text-xs text-muted-foreground mt-1">Click "Add Slice" to define categories</p>
                  </div>
                ) : (
                  (data.categories || []).map((category: any, index: number) => (
                    <div key={index} className="flex gap-2 items-center">
                      <span className="text-sm text-muted-foreground w-8">#{index + 1}</span>
                      <input
                        type="text"
                        placeholder="Category name"
                        value={category.name}
                        onChange={(e) => {
                          const newCategories = [...data.categories];
                          newCategories[index].name = e.target.value;
                          updateField('categories', newCategories);
                        }}
                        className="flex-1 px-3 py-2 border border-border rounded-md"
                      />
                      <input
                        type="number"
                        placeholder="Value"
                        value={category.value}
                        onChange={(e) => {
                          const newCategories = [...data.categories];
                          newCategories[index].value = parseFloat(e.target.value) || 0;
                          updateField('categories', newCategories);
                        }}
                        className="w-32 px-3 py-2 border border-border rounded-md"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const newCategories = data.categories.filter((_: any, i: number) => i !== index);
                          updateField('categories', newCategories);
                        }}
                        className="p-2 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        );

      case 'status':
        return (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium">Quick status indicator!</p>
                  <p>Show if something is on track, completed, or needs attention.</p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">What's the current status?</label>
              <select
                value={data.status || 'pending'}
                onChange={(e) => updateField('status', e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-md"
              >
                <option value="completed">✓ Completed</option>
                <option value="on-target">● On Target</option>
                <option value="off-target">● Off Target</option>
                <option value="at-risk">● At Risk</option>
                <option value="pending">○ Pending</option>
              </select>
              <p className="text-xs text-muted-foreground mt-1">This determines the color and icon shown</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Additional Details (optional)</label>
              <textarea
                value={data.description || ''}
                onChange={(e) => updateField('description', e.target.value)}
                placeholder="Add context about the current status..."
                rows={3}
                className="w-full px-3 py-2 border border-border rounded-md"
              />
              <p className="text-xs text-muted-foreground mt-1">Explain what's happening or what's needed</p>
            </div>
          </div>
        );

      case 'likert-scale':
        return (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium">Perfect for survey data!</p>
                  <p>Track responses on rating scales like 1-5 scale or 1-7 scale over time.</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Scale Min</label>
                <input
                  type="number"
                  value={data.scaleMin || 1}
                  onChange={(e) => updateField('scaleMin', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Scale Max</label>
                <input
                  type="number"
                  value={data.scaleMax || 5}
                  onChange={(e) => updateField('scaleMax', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Scale Label</label>
                <input
                  type="text"
                  value={data.scaleLabel || ''}
                  onChange={(e) => updateField('scaleLabel', e.target.value)}
                  placeholder="e.g., (5 high)"
                  className="w-full px-3 py-2 border border-border rounded-md"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Target Value (optional)</label>
              <input
                type="number"
                step="0.1"
                value={data.targetValue || ''}
                onChange={(e) => updateField('targetValue', e.target.value ? parseFloat(e.target.value) : undefined)}
                placeholder="e.g., 4.0"
                className="w-full px-3 py-2 border border-border rounded-md"
              />
              <p className="text-xs text-muted-foreground mt-1">The goal you're aiming for on this scale</p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <label className="block text-sm font-medium">Add Data Points Over Time</label>
                  <p className="text-xs text-muted-foreground">Track your scale values across different periods</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const newDataPoints = [...(data.dataPoints || []), { label: '', value: 0 }];
                    updateField('dataPoints', newDataPoints);
                  }}
                  className="px-3 py-1.5 text-sm border border-border rounded-md hover:bg-muted flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Add Point
                </button>
              </div>
              <div className="space-y-2">
                {(data.dataPoints || []).length === 0 ? (
                  <div className="text-center py-6 bg-muted/50 rounded-lg border-2 border-dashed border-border">
                    <p className="text-muted-foreground">No data points yet</p>
                    <p className="text-xs text-muted-foreground mt-1">Click "Add Point" to start tracking</p>
                  </div>
                ) : (
                  (data.dataPoints || []).map((point: any, index: number) => (
                    <div key={index} className="flex gap-2 items-center">
                      <span className="text-sm text-muted-foreground w-8">#{index + 1}</span>
                      <input
                        type="text"
                        placeholder="Period (e.g., 2023, Q1 2024)"
                        value={point.label}
                        onChange={(e) => {
                          const newDataPoints = [...data.dataPoints];
                          newDataPoints[index].label = e.target.value;
                          updateField('dataPoints', newDataPoints);
                        }}
                        className="flex-1 px-3 py-2 border border-border rounded-md"
                      />
                      <input
                        type="number"
                        step="0.1"
                        placeholder="Value"
                        value={point.value}
                        onChange={(e) => {
                          const newDataPoints = [...data.dataPoints];
                          newDataPoints[index].value = parseFloat(e.target.value) || 0;
                          updateField('dataPoints', newDataPoints);
                        }}
                        className="w-32 px-3 py-2 border border-border rounded-md"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const newDataPoints = data.dataPoints.filter((_: any, i: number) => i !== index);
                          updateField('dataPoints', newDataPoints);
                        }}
                        className="p-2 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center py-8 text-muted-foreground">
            Configuration for {type} coming soon...
          </div>
        );
    }
  };

  return renderFormFields();
}
