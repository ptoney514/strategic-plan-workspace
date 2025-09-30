'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  Target, 
  TrendingUp, 
  TrendingDown,
  AlertCircle,
  CheckCircle,
  Users,
  BookOpen,
  Building,
  HandHeart,
  ChevronRight
} from 'lucide-react';
import { Goal, Metric, GoalWithMetrics } from '@/lib/types';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from 'recharts';

interface StrategicGoalsOverviewProps {
  district: any;
  goals: GoalWithMetrics[];
  onDrillDown?: (goalId: string) => void;
}

interface OverviewStats {
  totalGoals: number;
  onTarget: number;
  needsAttention: number;
  atRisk: number;
}

interface GoalSummary {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  status: 'on-target' | 'needs-attention' | 'at-risk';
  progress: number;
  metrics: Array<{
    name: string;
    current: number;
    target: number;
    unit: string;
  }>;
  trendData: Array<{
    month: string;
    value: number;
  }>;
  performanceAreas: string[];
}

export default function StrategicGoalsOverview({ district, goals, onDrillDown }: StrategicGoalsOverviewProps) {
  const [overviewStats, setOverviewStats] = useState<OverviewStats>({
    totalGoals: 0,
    onTarget: 0,
    needsAttention: 0,
    atRisk: 0
  });

  const [goalSummaries, setGoalSummaries] = useState<GoalSummary[]>([]);

  // Icon mapping for different strategic objectives
  const getGoalIcon = (title: string): React.ComponentType<{ className?: string }> => {
    if (title.toLowerCase().includes('student') || title.toLowerCase().includes('academic')) return BookOpen;
    if (title.toLowerCase().includes('staff') || title.toLowerCase().includes('employee')) return Users;
    if (title.toLowerCase().includes('operational') || title.toLowerCase().includes('excellence')) return Building;
    if (title.toLowerCase().includes('community') || title.toLowerCase().includes('partnership')) return HandHeart;
    return Target;
  };

  // Calculate metric status (handles rating metrics properly)
  const getMetricStatus = (metric: Metric): 'on-target' | 'needs-attention' | 'at-risk' => {
    if (!metric.current_value || !metric.target_value) return 'at-risk';
    
    // For rating metrics, on-target means current >= target
    if (metric.metric_type === 'rating') {
      if (metric.current_value >= metric.target_value) return 'on-target';
      const diff = metric.target_value - metric.current_value;
      if (diff <= 0.2) return 'needs-attention'; // Within 0.2 points
      return 'at-risk';
    }
    
    // For other metrics, use ratio
    const ratio = metric.current_value / metric.target_value;
    if (ratio >= 0.95) return 'on-target';
    if (ratio >= 0.8) return 'needs-attention';
    return 'at-risk';
  };

  // Calculate overall goal status
  const calculateGoalStatus = (metrics: Metric[]): 'on-target' | 'needs-attention' | 'at-risk' => {
    // For strategic objectives without metrics, default to on-target
    if (metrics.length === 0) return 'on-target';
    
    const validMetrics = metrics.filter(m => m.current_value !== undefined && m.target_value !== undefined);
    if (validMetrics.length === 0) return 'on-target';
    
    const statuses = validMetrics.map(m => getMetricStatus(m));
    const onTargetCount = statuses.filter(s => s === 'on-target').length;
    const needsAttentionCount = statuses.filter(s => s === 'needs-attention').length;
    
    const onTargetRatio = onTargetCount / validMetrics.length;
    if (onTargetRatio >= 0.7) return 'on-target';
    if ((onTargetCount + needsAttentionCount) / validMetrics.length >= 0.6) return 'needs-attention';
    return 'at-risk';
  };

  // Generate mock trend data (in real app, this would come from historical data)
  const generateTrendData = () => {
    return [
      { month: 'Sep', value: Math.floor(Math.random() * 100) },
      { month: 'Oct', value: Math.floor(Math.random() * 100) },
      { month: 'Nov', value: Math.floor(Math.random() * 100) },
      { month: 'Dec', value: Math.floor(Math.random() * 100) }
    ];
  };

  useEffect(() => {
    // Calculate overview stats
    const strategicObjectives = goals.filter(g => g.level === 0);
    const stats: OverviewStats = {
      totalGoals: strategicObjectives.length,
      onTarget: 0,
      needsAttention: 0,
      atRisk: 0
    };

    // Process each strategic objective
    const summaries: GoalSummary[] = strategicObjectives.map(goal => {
      const allMetrics = goal.metrics || [];
      const status = calculateGoalStatus(allMetrics);
      
      // Update stats
      if (status === 'on-target') stats.onTarget++;
      else if (status === 'needs-attention') stats.needsAttention++;
      else stats.atRisk++;

      // Calculate percentage of metrics on target (not average ratio)
      const validMetrics = allMetrics.filter(m => m.current_value !== undefined && m.target_value !== undefined);
      const onTargetMetrics = validMetrics.filter(m => getMetricStatus(m) === 'on-target').length;
      const progress = validMetrics.length > 0 
        ? Math.round((onTargetMetrics / validMetrics.length) * 100)
        : 100; // Default to 100% for objectives without metrics

      // Create performance areas from sub-goals
      const performanceAreas = goal.children?.map(child => child.title.substring(0, 20)) || [];

      return {
        id: goal.id,
        title: goal.title,
        icon: getGoalIcon(goal.title),
        status,
        progress,
        metrics: validMetrics.slice(0, 3).map(m => ({
          name: m.name,
          current: m.current_value!,
          target: m.target_value!,
          unit: m.unit || ''
        })),
        trendData: generateTrendData(),
        performanceAreas: performanceAreas.slice(0, 4)
      };
    });

    setOverviewStats(stats);
    setGoalSummaries(summaries);
  }, [goals]);

  const getStatusBadge = (status: 'on-target' | 'needs-attention' | 'at-risk') => {
    switch (status) {
      case 'on-target':
        return <Badge className="bg-green-100 text-green-800 border-green-200">On Target</Badge>;
      case 'needs-attention':
        return <Badge className="bg-orange-100 text-orange-800 border-orange-200">Needs Attention</Badge>;
      case 'at-risk':
        return <Badge className="bg-red-100 text-red-800 border-red-200">At Risk</Badge>;
    }
  };

  const getStatusIcon = (status: 'on-target' | 'needs-attention' | 'at-risk') => {
    switch (status) {
      case 'on-target':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'needs-attention':
        return <AlertCircle className="w-5 h-5 text-orange-500" />;
      case 'at-risk':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Strategic Goals - Unified Overview</h1>
        <p className="text-gray-600">Comprehensive view of all strategic goals with performance insights</p>
      </div>

      {/* Overview Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-sm text-gray-500 mb-1">Total Goals</div>
              <div className="text-4xl font-bold text-gray-900">{overviewStats.totalGoals}</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-sm text-gray-500 mb-1">On Target</div>
              <div className="text-4xl font-bold text-green-600">{overviewStats.onTarget}</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-sm text-gray-500 mb-1">Needs Attention</div>
              <div className="text-4xl font-bold text-orange-600">{overviewStats.needsAttention}</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-sm text-gray-500 mb-1">At Risk</div>
              <div className="text-4xl font-bold text-red-600">{overviewStats.atRisk}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Strategic Objectives Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {goalSummaries.map(goal => {
          const IconComponent = goal.icon;
          const goalData = goals.find(g => g.id === goal.id);
          return (
            <Card 
              key={goal.id} 
              className="cursor-pointer hover:shadow-md transition-shadow overflow-hidden"
              onClick={() => onDrillDown?.(goal.id)}
            >
              {/* Header - Image or Color */}
              {(goalData?.image_url || goalData?.header_color) && (
                <div className="relative h-32 w-full">
                  {goalData?.image_url ? (
                    <>
                      <img
                        src={goalData.image_url}
                        alt={goal.title}
                        className="w-full h-full object-cover"
                      />
                      {/* Gradient overlay for better text readability */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                    </>
                  ) : (
                    <div
                      className="w-full h-full"
                      style={{ backgroundColor: goalData.header_color }}
                    />
                  )}
                  {/* Status badge on header */}
                  <div className="absolute top-3 right-3">
                    {getStatusBadge(goal.status)}
                  </div>
                </div>
              )}
              <CardContent className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gray-100">
                      <IconComponent className="w-6 h-6 text-gray-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{goal.title}</h3>
                      {!goalData?.image_url && !goalData?.header_color && getStatusBadge(goal.status)}
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>

                {/* Overall Progress */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-600">Overall Progress</span>
                    <span className="font-medium">{Math.round(goal.progress)}%</span>
                  </div>
                  <Progress value={goal.progress} className="h-2" />
                </div>

                {/* Key Metrics */}
                <div className="mb-4">
                  <h4 className="font-medium text-gray-900 mb-2">Key Metrics</h4>
                  <div className="space-y-2">
                    {goal.metrics.map((metric, idx) => (
                      <div key={idx} className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 flex items-center gap-1">
                          {getStatusIcon(getMetricStatus({ current_value: metric.current, target_value: metric.target } as Metric))}
                          {metric.name}
                        </span>
                        <div className="text-right">
                          <span className="font-medium">{metric.current}{metric.unit}</span>
                          <div className="text-xs text-gray-500">Target: {metric.target}{metric.unit}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Progress Trend Chart */}
                <div className="mb-4">
                  <h4 className="font-medium text-gray-900 mb-2">Progress Trend</h4>
                  <div className="h-20">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={goal.trendData}>
                        <Line 
                          type="monotone" 
                          dataKey="value" 
                          stroke="#3b82f6" 
                          strokeWidth={2}
                          dot={false}
                        />
                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Performance Areas */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Performance Areas</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {goal.performanceAreas.map((area, idx) => (
                      <div key={idx} className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-700 text-center">
                        {area}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}