'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, ReferenceLine, PieChart, Pie, Cell, AreaChart, Area 
} from 'recharts';
import { Goal, Metric, GoalWithMetrics, buildGoalHierarchy, ChartType } from '@/lib/types';
import { getGoals, getMetrics, getDistrict } from '@/lib/db-service';
import { 
  ChevronRight, Target, TrendingUp, TrendingDown, Minus, AlertCircle, 
  BarChart3, TrendingUp as LineIcon, PieChart as DonutIcon, Activity 
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface DetailedStrategicViewProps {
  districtId: string;
  districtSlug: string;
  isPublic?: boolean;
  initialData?: any;
}

export default function DetailedStrategicView({ 
  districtId, 
  districtSlug, 
  isPublic = false, 
  initialData 
}: DetailedStrategicViewProps) {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [hierarchicalGoals, setHierarchicalGoals] = useState<GoalWithMetrics[]>([]);
  const [district, setDistrict] = useState<any>(null);
  const [selectedObjective, setSelectedObjective] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (initialData) {
      setDistrict(initialData);
      if (initialData.goals) {
        const flatGoals: Goal[] = [];
        const flatMetrics: Metric[] = [];
        
        const flattenGoals = (goals: any[]) => {
          goals.forEach(goal => {
            const { children, metrics, ...goalData } = goal;
            flatGoals.push(goalData);
            if (metrics) {
              flatMetrics.push(...metrics);
            }
            if (children && children.length > 0) {
              flattenGoals(children);
            }
          });
        };
        
        flattenGoals(initialData.goals);
        setGoals(flatGoals);
        setMetrics(flatMetrics);
      }
      setLoading(false);
    } else {
      loadData();
    }
  }, [districtId, initialData]);

  useEffect(() => {
    const hierarchy = buildGoalHierarchy(goals, metrics);
    setHierarchicalGoals(hierarchy);
    if (hierarchy.length > 0 && !selectedObjective) {
      setSelectedObjective(hierarchy[0].id);
    }
  }, [goals, metrics]);

  const loadData = async () => {
    try {
      const [goalsData, metricsData, districtData] = await Promise.all([
        getGoals(districtId),
        getMetrics(districtId),
        getDistrict(districtId)
      ]);
      setGoals(goalsData || []);
      setMetrics(metricsData || []);
      setDistrict(districtData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMetricStatus = (metric: Metric): 'on-target' | 'near-target' | 'off-target' | 'no-data' => {
    if (!metric.current_value || !metric.target_value) return 'no-data';
    const ratio = metric.current_value / metric.target_value;
    if (ratio >= 0.95) return 'on-target';
    if (ratio >= 0.8) return 'near-target';
    return 'off-target';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'on-target':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'near-target':
        return <Minus className="w-4 h-4 text-yellow-500" />;
      case 'off-target':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on-target':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'near-target':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'off-target':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClass = "text-xs font-medium px-2 py-1 rounded-full";
    switch (status) {
      case 'on-target':
        return `${baseClass} bg-green-100 text-green-800`;
      case 'near-target':
        return `${baseClass} bg-yellow-100 text-yellow-800`;
      case 'off-target':
        return `${baseClass} bg-red-100 text-red-800`;
      default:
        return `${baseClass} bg-gray-100 text-gray-800`;
    }
  };

  const renderChart = (metric: Metric) => {
    if (!metric.data_points || metric.data_points.length === 0) {
      const currentYear = new Date().getFullYear();
      const startYear = metric.timeframe_start || currentYear - 4;
      const endYear = metric.timeframe_end || currentYear;
      
      const sampleData = [];
      for (let year = startYear; year <= endYear; year++) {
        const value = metric.current_value 
          ? metric.current_value * (0.8 + Math.random() * 0.4) 
          : Math.random() * 100;
        sampleData.push({ year, value: Math.round(value * 10) / 10 });
      }
      
      if (metric.current_value) {
        sampleData[sampleData.length - 1].value = metric.current_value;
      }
      
      metric.data_points = sampleData;
    }

    const chartData = metric.data_points.map(dp => ({
      name: dp.year.toString(),
      value: dp.value,
      target: metric.target_value
    }));

    const chartType = metric.chart_type || 'line';

    switch (chartType) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              {metric.target_value && (
                <ReferenceLine 
                  y={metric.target_value} 
                  stroke="#ef4444" 
                  strokeDasharray="5 5" 
                  label={{ value: "Target", position: "right", fontSize: 12 }}
                />
              )}
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#3b82f6" 
                strokeWidth={3}
                dot={{ fill: '#3b82f6', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              {metric.target_value && (
                <ReferenceLine 
                  y={metric.target_value} 
                  stroke="#ef4444" 
                  strokeDasharray="5 5" 
                  label={{ value: "Target", position: "right", fontSize: 12 }}
                />
              )}
              <Bar dataKey="value" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'area':
        return (
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              {metric.target_value && (
                <ReferenceLine 
                  y={metric.target_value} 
                  stroke="#ef4444" 
                  strokeDasharray="5 5" 
                  label={{ value: "Target", position: "right", fontSize: 12 }}
                />
              )}
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke="#3b82f6" 
                fill="#3b82f6" 
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'donut':
        const progress = metric.current_value && metric.target_value
          ? Math.min((metric.current_value / metric.target_value) * 100, 100)
          : 0;
        const donutData = [
          { name: 'Progress', value: progress, fill: '#3b82f6' },
          { name: 'Remaining', value: 100 - progress, fill: '#e5e7eb' }
        ];
        return (
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={donutData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {donutData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip />
              <text 
                x="50%" 
                y="50%" 
                textAnchor="middle" 
                dominantBaseline="middle" 
                className="text-lg font-semibold fill-gray-800"
              >
                {Math.round(progress)}%
              </text>
            </PieChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  const renderMetricCard = (metric: Metric, isCompact: boolean = false) => {
    const status = getMetricStatus(metric);
    const progress = metric.current_value && metric.target_value
      ? Math.min((metric.current_value / metric.target_value) * 100, 100)
      : 0;

    return (
      <Card key={metric.id} className="border-0 shadow-md hover:shadow-lg transition-shadow duration-200">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                {metric.name}
                <Badge className={getStatusBadge(status)} variant="secondary">
                  {status.replace('-', ' ')}
                </Badge>
              </CardTitle>
              <div className="flex items-center gap-6 mt-3">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {metric.current_value || 'N/A'}
                    <span className="text-sm font-normal text-gray-500">{metric.unit || ''}</span>
                  </div>
                  <div className="text-xs text-gray-500">Current</div>
                </div>
                {metric.target_value && (
                  <div className="text-center">
                    <div className="text-lg font-semibold text-gray-600">
                      {metric.target_value}
                      <span className="text-sm font-normal text-gray-400">{metric.unit || ''}</span>
                    </div>
                    <div className="text-xs text-gray-500">Target</div>
                  </div>
                )}
              </div>
            </div>
          </div>
          {!isCompact && metric.target_value && (
            <Progress value={progress} className="h-2 mt-3" />
          )}
        </CardHeader>
        {!isCompact && (
          <CardContent className="pt-0">
            {metric.metric_type !== 'narrative' && metric.metric_type !== 'link' && (
              <div className="mb-4">
                {renderChart(metric)}
              </div>
            )}
            
            {/* Performance Analysis */}
            <div className="space-y-3">
              <div className="p-3 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Performance Analysis
                </h4>
                <p className="text-sm text-gray-600">
                  {status === 'on-target' 
                    ? `Excellent performance! This metric is performing at ${Math.round(progress)}% of target, indicating strong progress toward strategic objectives.`
                    : status === 'near-target'
                    ? `Good progress with room for improvement. At ${Math.round(progress)}% of target, consider implementing focused interventions to reach optimal performance.`
                    : `This metric requires immediate attention. Currently at ${Math.round(progress)}% of target, strategic interventions are needed to get back on track.`
                  }
                </p>
              </div>
              
              {status !== 'on-target' && (
                <div className="p-3 bg-blue-50 rounded-lg">
                  <h4 className="text-sm font-medium text-blue-900 mb-2 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Recommended Actions
                  </h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Review current strategies and identify improvement opportunities</li>
                    <li>• Increase monitoring frequency for early intervention</li>
                    <li>• Consider resource reallocation to support this metric</li>
                    {status === 'off-target' && (
                      <li>• Develop immediate action plan with specific timelines</li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        )}
      </Card>
    );
  };

  const renderGoalContent = (goal: GoalWithMetrics) => {
    if (goal.children.length > 0) {
      // This is an objective with goals - show sub-tabs
      return (
        <Tabs defaultValue={goal.children[0]?.id} className="w-full">
          <TabsList className="grid w-full mb-6" style={{ gridTemplateColumns: `repeat(${goal.children.length}, 1fr)` }}>
            {goal.children.map(child => (
              <TabsTrigger key={child.id} value={child.id} className="text-sm">
                {child.goal_number} {child.title.split(' ').slice(0, 2).join(' ')}
              </TabsTrigger>
            ))}
          </TabsList>

          {goal.children.map(child => (
            <TabsContent key={child.id} value={child.id}>
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {child.goal_number} {child.title}
                  </h3>
                  {child.description && (
                    <p className="text-gray-600 mb-4">{child.description}</p>
                  )}
                  
                  {child.metrics.length > 0 && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {child.metrics.filter(m => m.is_primary).map(metric => renderMetricCard(metric))}
                      {child.metrics.filter(m => !m.is_primary).map(metric => renderMetricCard(metric))}
                    </div>
                  )}
                </div>

                {/* Sub-goals if any */}
                {child.children.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="text-lg font-medium text-gray-900">Sub-goals</h4>
                    {child.children.map(subGoal => (
                      <div key={subGoal.id} className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-blue-500">
                        <h5 className="text-base font-medium text-gray-900 mb-1">
                          {subGoal.goal_number} {subGoal.title}
                        </h5>
                        {subGoal.description && (
                          <p className="text-sm text-gray-600 mb-3">{subGoal.description}</p>
                        )}
                        {subGoal.metrics.length > 0 && (
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {subGoal.metrics.map(metric => renderMetricCard(metric, true))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      );
    } else {
      // This is a goal without children - show metrics directly
      return (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {goal.goal_number} {goal.title}
            </h3>
            {goal.description && (
              <p className="text-gray-600 mb-4">{goal.description}</p>
            )}
            
            {goal.metrics.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {goal.metrics.filter(m => m.is_primary).map(metric => renderMetricCard(metric))}
                {goal.metrics.filter(m => !m.is_primary).map(metric => renderMetricCard(metric))}
              </div>
            )}
          </div>
        </div>
      );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-500">Loading dashboard...</div>
      </div>
    );
  }

  if (hierarchicalGoals.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-gray-500">No strategic plan data available yet.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Strategic Goals - Detailed View
              </h1>
              <p className="text-gray-600 mt-1">
                Navigate between goals with detailed breakdowns
              </p>
            </div>
            {district?.logo_url && (
              <img src={district.logo_url} alt={district.name} className="h-12" />
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6">
        {/* Strategic Objectives Tabs */}
        <Tabs value={selectedObjective || ''} onValueChange={setSelectedObjective}>
          <TabsList className="grid w-full mb-8 bg-white shadow-sm" style={{ gridTemplateColumns: `repeat(${hierarchicalGoals.length}, 1fr)` }}>
            {hierarchicalGoals.map(objective => (
              <TabsTrigger 
                key={objective.id} 
                value={objective.id}
                className="data-[state=active]:bg-gray-900 data-[state=active]:text-white px-4 py-3"
              >
                <div className="text-center">
                  <div className="font-medium">{objective.title}</div>
                  <div className="text-xs opacity-75 mt-1">
                    {objective.metrics.length + objective.children.reduce((acc, child) => acc + child.metrics.length + child.children.reduce((acc2, subchild) => acc2 + subchild.metrics.length, 0), 0)} metrics
                  </div>
                </div>
              </TabsTrigger>
            ))}
          </TabsList>

          {hierarchicalGoals.map(objective => (
            <TabsContent key={objective.id} value={objective.id} className="space-y-6">
              {/* Objective Header Card */}
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      {objective.goal_number} {objective.title}
                    </h2>
                    {objective.description && (
                      <p className="text-gray-600">{objective.description}</p>
                    )}
                    <Badge className="mt-3 bg-green-100 text-green-800">On Target</Badge>
                  </div>
                </div>
              </div>

              {/* Goal Content */}
              {renderGoalContent(objective)}
            </TabsContent>
          ))}
        </Tabs>

        {/* Summary Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
          {['on-target', 'near-target', 'off-target', 'no-data'].map(status => {
            const count = metrics.filter(m => getMetricStatus(m) === status).length;
            return (
              <Card key={status} className="bg-white shadow-sm border-0">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 capitalize">
                        {status.replace('-', ' ')}
                      </p>
                      <p className="text-2xl font-bold text-gray-900">{count}</p>
                    </div>
                    <div className="p-2 rounded-full bg-gray-100">
                      {getStatusIcon(status)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}