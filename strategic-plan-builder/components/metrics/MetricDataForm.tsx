'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Info } from 'lucide-react';
import { VisualizationType, getDefaultConfig } from '@/lib/metric-visualizations';

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
                <Label htmlFor="currentValue">Current Percentage</Label>
                <div className="relative">
                  <Input
                    id="currentValue"
                    type="number"
                    min="0"
                    max="100"
                    value={data.currentValue ?? ''}
                    onChange={(e) => updateField('currentValue', e.target.value === '' ? '' : parseFloat(e.target.value))}
                    placeholder="0"
                    className="pr-8"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">%</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Where are you now?</p>
              </div>
              <div>
                <Label htmlFor="targetValue">Target Percentage</Label>
                <div className="relative">
                  <Input
                    id="targetValue"
                    type="number"
                    min="0"
                    max="100"
                    value={data.targetValue || 100}
                    onChange={(e) => updateField('targetValue', parseFloat(e.target.value))}
                    className="pr-8"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">%</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">What's your goal?</p>
              </div>
            </div>

            <div>
              <Label htmlFor="suffix">Additional Context (optional)</Label>
              <Input
                id="suffix"
                value={data.suffix || ''}
                onChange={(e) => updateField('suffix', e.target.value)}
                placeholder="e.g., of students meeting standards"
              />
              <p className="text-xs text-gray-500 mt-1">This appears after the percentage</p>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="showProgressBar">Visual Progress Bar</Label>
                  <p className="text-xs text-gray-500">Shows a fill bar beneath the percentage</p>
                </div>
                <Switch
                  id="showProgressBar"
                  checked={data.showProgressBar !== false}
                  onCheckedChange={(checked) => updateField('showProgressBar', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="showTrend">Trend Indicator</Label>
                  <p className="text-xs text-gray-500">Shows if the value is improving</p>
                </div>
                <Switch
                  id="showTrend"
                  checked={data.showTrend !== false}
                  onCheckedChange={(checked) => updateField('showTrend', checked)}
                />
              </div>
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
                <Label htmlFor="xAxisLabel">What are you comparing?</Label>
                <Input
                  id="xAxisLabel"
                  value={data.xAxisLabel || ''}
                  onChange={(e) => updateField('xAxisLabel', e.target.value)}
                  placeholder="e.g., Schools, Quarters, Grades"
                />
              </div>
              <div>
                <Label htmlFor="yAxisLabel">What are you measuring?</Label>
                <Input
                  id="yAxisLabel"
                  value={data.yAxisLabel || ''}
                  onChange={(e) => updateField('yAxisLabel', e.target.value)}
                  placeholder="e.g., Score, Count, Percentage"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <Label>Add Your Data Points</Label>
                  <p className="text-xs text-gray-500">Each bar in your chart</p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const newDataPoints = [...(data.dataPoints || []), { label: '', value: 0 }];
                    updateField('dataPoints', newDataPoints);
                  }}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Bar
                </Button>
              </div>
              <div className="space-y-2">
                {(data.dataPoints || []).length === 0 ? (
                  <div className="text-center py-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <p className="text-gray-500">No data points yet</p>
                    <p className="text-xs text-gray-400 mt-1">Click "Add Bar" to start adding data</p>
                  </div>
                ) : (
                  (data.dataPoints || []).map((point: any, index: number) => (
                    <div key={index} className="flex gap-2 items-center">
                      <span className="text-sm text-gray-500 w-8">#{index + 1}</span>
                      <Input
                        placeholder="Category name"
                        value={point.label}
                        onChange={(e) => {
                          const newPoints = [...data.dataPoints];
                          newPoints[index].label = e.target.value;
                          updateField('dataPoints', newPoints);
                        }}
                      />
                      <Input
                        type="number"
                        placeholder="Value"
                        value={point.value}
                        onChange={(e) => {
                          const newPoints = [...data.dataPoints];
                          newPoints[index].value = parseFloat(e.target.value);
                          updateField('dataPoints', newPoints);
                        }}
                        className="w-32"
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          const newPoints = data.dataPoints.filter((_: any, i: number) => i !== index);
                          updateField('dataPoints', newPoints);
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
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
                <Label htmlFor="xAxisLabel">Time Period</Label>
                <Input
                  id="xAxisLabel"
                  value={data.xAxisLabel || ''}
                  onChange={(e) => updateField('xAxisLabel', e.target.value)}
                  placeholder="e.g., Month, Quarter, Year"
                />
              </div>
              <div>
                <Label htmlFor="yAxisLabel">What are you tracking?</Label>
                <Input
                  id="yAxisLabel"
                  value={data.yAxisLabel || ''}
                  onChange={(e) => updateField('yAxisLabel', e.target.value)}
                  placeholder="e.g., Enrollment, Performance, Budget"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <Label>Add Data Points Over Time</Label>
                  <p className="text-xs text-gray-500">Each point on your trend line</p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const newData = [...(data.data || []), { period: '', value: 0 }];
                    updateField('data', newData);
                  }}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Point
                </Button>
              </div>
              <div className="space-y-2">
                {(data.data || []).length === 0 ? (
                  <div className="text-center py-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <p className="text-gray-500">No data points yet</p>
                    <p className="text-xs text-gray-400 mt-1">Click "Add Point" to start tracking</p>
                  </div>
                ) : (
                  (data.data || []).map((point: any, index: number) => (
                    <div key={index} className="flex gap-2 items-center">
                      <span className="text-sm text-gray-500 w-8">#{index + 1}</span>
                      <Input
                        placeholder="Time period (e.g., Jan 2024)"
                        value={point.period}
                        onChange={(e) => {
                          const newData = [...data.data];
                          newData[index].period = e.target.value;
                          updateField('data', newData);
                        }}
                      />
                      <Input
                        type="number"
                        placeholder="Value"
                        value={point.value}
                        onChange={(e) => {
                          const newData = [...data.data];
                          newData[index].value = parseFloat(e.target.value);
                          updateField('data', newData);
                        }}
                        className="w-32"
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          const newData = data.data.filter((_: any, i: number) => i !== index);
                          updateField('data', newData);
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
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
                <Label htmlFor="centerLabel">Center Label (optional)</Label>
                <Input
                  id="centerLabel"
                  value={data.centerLabel || ''}
                  onChange={(e) => updateField('centerLabel', e.target.value)}
                  placeholder="e.g., Total Budget"
                />
                <p className="text-xs text-gray-500 mt-1">Appears in the donut hole</p>
              </div>
              <div>
                <Label htmlFor="centerValue">Center Value (optional)</Label>
                <Input
                  id="centerValue"
                  value={data.centerValue || ''}
                  onChange={(e) => updateField('centerValue', e.target.value)}
                  placeholder="e.g., $2.5M"
                />
                <p className="text-xs text-gray-500 mt-1">The total or sum</p>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <Label>Add Categories</Label>
                  <p className="text-xs text-gray-500">Each slice of your donut</p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const newCategories = [...(data.categories || []), { name: '', value: 0 }];
                    updateField('categories', newCategories);
                  }}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Slice
                </Button>
              </div>
              <div className="space-y-2">
                {(data.categories || []).length === 0 ? (
                  <div className="text-center py-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <p className="text-gray-500">No categories yet</p>
                    <p className="text-xs text-gray-400 mt-1">Click "Add Slice" to define categories</p>
                  </div>
                ) : (
                  (data.categories || []).map((category: any, index: number) => (
                    <div key={index} className="flex gap-2 items-center">
                      <span className="text-sm text-gray-500 w-8">#{index + 1}</span>
                      <Input
                        placeholder="Category name"
                        value={category.name}
                        onChange={(e) => {
                          const newCategories = [...data.categories];
                          newCategories[index].name = e.target.value;
                          updateField('categories', newCategories);
                        }}
                      />
                      <Input
                        type="number"
                        placeholder="Value"
                        value={category.value}
                        onChange={(e) => {
                          const newCategories = [...data.categories];
                          newCategories[index].value = parseFloat(e.target.value);
                          updateField('categories', newCategories);
                        }}
                        className="w-32"
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          const newCategories = data.categories.filter((_: any, i: number) => i !== index);
                          updateField('categories', newCategories);
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="showPercentages">Show Percentages</Label>
                  <p className="text-xs text-gray-500">Display % on each slice</p>
                </div>
                <Switch
                  id="showPercentages"
                  checked={data.showPercentages !== false}
                  onCheckedChange={(checked) => updateField('showPercentages', checked)}
                />
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
              <Label htmlFor="status">What's the current status?</Label>
              <Select
                value={data.status || 'pending'}
                onValueChange={(value) => updateField('status', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="completed">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      Completed
                    </div>
                  </SelectItem>
                  <SelectItem value="on-target">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                      On Target
                    </div>
                  </SelectItem>
                  <SelectItem value="off-target">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-yellow-500" />
                      Off Target
                    </div>
                  </SelectItem>
                  <SelectItem value="at-risk">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-red-500" />
                      At Risk
                    </div>
                  </SelectItem>
                  <SelectItem value="pending">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-gray-400" />
                      Pending
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 mt-1">This determines the color and icon shown</p>
            </div>

            <div>
              <Label htmlFor="description">Additional Details (optional)</Label>
              <Textarea
                id="description"
                value={data.description || ''}
                onChange={(e) => updateField('description', e.target.value)}
                placeholder="Add context about the current status..."
                rows={3}
              />
              <p className="text-xs text-gray-500 mt-1">Explain what's happening or what's needed</p>
            </div>
          </div>
        );

      case 'performance-trend':
        return (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium">Track performance over time!</p>
                  <p>Compare target vs actual values across multiple years to show trends.</p>
                </div>
              </div>
            </div>

            {/* Y-Axis Configuration */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="yAxisMin">Y-Axis Minimum</Label>
                <Input
                  id="yAxisMin"
                  type="number"
                  step="0.01"
                  value={data.yAxisMin || 0}
                  onChange={(e) => updateField('yAxisMin', parseFloat(e.target.value))}
                />
                <p className="text-xs text-gray-500 mt-1">Lowest value on the chart</p>
              </div>
              <div>
                <Label htmlFor="yAxisMax">Y-Axis Maximum</Label>
                <Input
                  id="yAxisMax"
                  type="number"
                  step="0.01"
                  value={data.yAxisMax || 5}
                  onChange={(e) => updateField('yAxisMax', parseFloat(e.target.value))}
                />
                <p className="text-xs text-gray-500 mt-1">Highest value on the chart</p>
              </div>
            </div>

            {/* Unit */}
            <div>
              <Label htmlFor="unit">Unit (optional)</Label>
              <Input
                id="unit"
                value={data.unit || ''}
                onChange={(e) => updateField('unit', e.target.value)}
                placeholder="e.g., %, points, GPA"
              />
            </div>

            {/* Years Data */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <Label>Yearly Performance Data</Label>
                  <p className="text-xs text-gray-500">Add target and actual values for each year</p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const years = data.years || [];
                    if (years.length < 5) {
                      const lastYear = years.length > 0 ? years[years.length - 1].year : new Date().getFullYear() - 1;
                      updateField('years', [
                        ...years,
                        { year: lastYear + 1, target: 0, actual: 0 }
                      ]);
                    }
                  }}
                  disabled={data.years && data.years.length >= 5}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Year
                </Button>
              </div>

              <div className="space-y-3">
                {(!data.years || data.years.length === 0) ? (
                  <div className="text-center py-4 border-2 border-dashed rounded-lg">
                    <p className="text-sm text-gray-500">No years added yet. Click "Add Year" to start.</p>
                  </div>
                ) : (
                  data.years.map((yearData: any, index: number) => (
                    <div key={index} className="p-3 border rounded-lg bg-gray-50">
                      <div className="grid grid-cols-4 gap-3">
                        <div>
                          <Label>Year</Label>
                          <Input
                            type="number"
                            value={yearData.year}
                            onChange={(e) => {
                              const newYears = [...data.years];
                              newYears[index].year = parseInt(e.target.value);
                              updateField('years', newYears);
                            }}
                          />
                        </div>
                        <div>
                          <Label>Target</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={yearData.target}
                            onChange={(e) => {
                              const newYears = [...data.years];
                              newYears[index].target = parseFloat(e.target.value);
                              updateField('years', newYears);
                            }}
                          />
                        </div>
                        <div>
                          <Label>Actual</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={yearData.actual}
                            onChange={(e) => {
                              const newYears = [...data.years];
                              newYears[index].actual = parseFloat(e.target.value);
                              updateField('years', newYears);
                            }}
                          />
                        </div>
                        <div className="flex items-end">
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => {
                              const newYears = data.years.filter((_: any, i: number) => i !== index);
                              updateField('years', newYears);
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center py-8 text-gray-500">
            Configuration for {type} coming soon...
          </div>
        );
    }
  };

  return renderFormFields();
}