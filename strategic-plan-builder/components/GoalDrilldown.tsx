'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { 
  Target, 
  ArrowLeft,
  BarChart3,
  Users,
  BookOpen,
  Building,
  HandHeart,
  ChevronRight,
  ChevronDown,
  Activity
} from 'lucide-react';
import { Goal, Metric, GoalWithMetrics } from '@/lib/types';
import { MetricGridDisplay } from '@/components/metrics/MetricGridDisplay';

interface GoalDrilldownProps {
  goal: GoalWithMetrics;
  districtName: string;
  districtSlug?: string;
  onBack: () => void;
  onEditGoal?: (goalId: string) => void;
  onRefresh?: () => void;
}

export default function GoalDrilldown({ goal, districtName, districtSlug = '', onBack, onEditGoal, onRefresh = () => {} }: GoalDrilldownProps) {
  const [expandedGoals, setExpandedGoals] = useState<Set<string>>(new Set());

  const toggleExpanded = (goalId: string) => {
    setExpandedGoals(prev => {
      const newSet = new Set(prev);
      if (newSet.has(goalId)) {
        newSet.delete(goalId);
      } else {
        newSet.add(goalId);
      }
      return newSet;
    });
  };

  // Get goal icon
  const getGoalIcon = (title: string) => {
    if (title.toLowerCase().includes('student') || title.toLowerCase().includes('academic')) return BookOpen;
    if (title.toLowerCase().includes('staff') || title.toLowerCase().includes('employee')) return Users;
    if (title.toLowerCase().includes('operational') || title.toLowerCase().includes('excellence')) return Building;
    if (title.toLowerCase().includes('community') || title.toLowerCase().includes('partnership')) return HandHeart;
    return Target;
  };

  const IconComponent = getGoalIcon(goal.title);

  // Calculate metrics status
  const getMetricStatus = (current: number, target: number): 'on-target' | 'needs-attention' | 'at-risk' => {
    const ratio = current / target;
    if (ratio >= 0.95) return 'on-target';
    if (ratio >= 0.8) return 'needs-attention';
    return 'at-risk';
  };

  // Calculate overall progress including all child goals
  const getAllMetrics = (g: GoalWithMetrics): Metric[] => {
    let allMetrics = [...(g.metrics || [])];
    if (g.children) {
      g.children.forEach(child => {
        allMetrics = allMetrics.concat(getAllMetrics(child));
      });
    }
    return allMetrics;
  };

  const allMetrics = getAllMetrics(goal);
  const validMetrics = allMetrics.filter(m => 
    m.current_value !== undefined && 
    m.target_value !== undefined && 
    m.target_value > 0
  );

  const overallProgress = validMetrics.length > 0 
    ? validMetrics.reduce((sum, m) => sum + (m.current_value! / m.target_value! * 100), 0) / validMetrics.length
    : 0;

  // Render hierarchical goal tree
  const renderGoalTree = (g: GoalWithMetrics, level: number = 0): React.ReactNode => {
    const isExpanded = expandedGoals.has(g.id);
    const hasChildren = g.children && g.children.length > 0;
    const hasMetrics = g.metrics && g.metrics.length > 0;
    const indent = level * 24;
    
    const calculateGoalProgress = (goalData: GoalWithMetrics): number => {
      const metrics = getAllMetrics(goalData);
      const valid = metrics.filter(m => m.current_value !== undefined && m.target_value !== undefined && m.target_value > 0);
      return valid.length > 0 
        ? valid.reduce((sum, m) => sum + (m.current_value! / m.target_value! * 100), 0) / valid.length
        : 0;
    };
    
    const progress = calculateGoalProgress(g);
    
    return (
      <div key={g.id} className="border-l-2 border-gray-200" style={{ marginLeft: `${indent}px` }}>
        <div 
          className="flex items-start gap-2 p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
          onClick={() => hasChildren && toggleExpanded(g.id)}
        >
          {hasChildren && (
            <Button
              variant="ghost"
              size="sm"
              className="h-5 w-5 p-0"
              onClick={(e) => {
                e.stopPropagation();
                toggleExpanded(g.id);
              }}
            >
              {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </Button>
          )}
          {!hasChildren && <div className="w-5" />}
          
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-blue-600">{g.goal_number}</span>
              <span className="font-medium">{g.title}</span>
              {hasMetrics && (
                <Badge variant="secondary" className="text-xs">
                  {g.metrics.length} metric{g.metrics.length !== 1 ? 's' : ''}
                </Badge>
              )}
            </div>
            {g.description && (
              <p className="text-sm text-gray-600 mt-1">{g.description}</p>
            )}
            <div className="mt-2">
              <Progress value={progress} className="h-1" />
              <span className="text-xs text-gray-500">{Math.round(progress)}% complete</span>
            </div>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onEditGoal?.(g.id);
            }}
          >
            View Details
          </Button>
        </div>
        
        {isExpanded && hasChildren && (
          <div className="ml-4">
            {g.children!.map(child => renderGoalTree(child, level + 1))}
          </div>
        )}
        
        {isExpanded && hasMetrics && (
          <div className="ml-8 mt-2 space-y-2">
            {g.metrics!.map(metric => {
              const metricProgress = metric.target_value ? (metric.current_value || 0) / metric.target_value * 100 : 0;
              return (
                <div key={metric.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex items-center gap-2">
                    <Activity className="h-3 w-3 text-gray-400" />
                    <span className="text-sm">{metric.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      {metric.current_value || 0}/{metric.target_value || 0} {metric.unit}
                    </span>
                    <Progress value={metricProgress} className="h-1 w-16" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  // Remove mock data generation - only use real metrics

  const getStatusBadge = (status: 'on-target' | 'needs-attention' | 'at-risk' | 'not-started') => {
    switch (status) {
      case 'on-target':
        return <Badge className="bg-green-100 text-green-800 border-green-200">On Target</Badge>;
      case 'needs-attention':
        return <Badge className="bg-orange-100 text-orange-800 border-orange-200">Needs Attention</Badge>;
      case 'at-risk':
        return <Badge className="bg-orange-100 text-orange-800 border-orange-200">At Risk</Badge>;
      case 'not-started':
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">Not Started</Badge>;
    }
  };

  const overallStatus = validMetrics.length > 0 
    ? overallProgress >= 85 ? 'on-target' : overallProgress >= 70 ? 'needs-attention' : 'at-risk'
    : 'not-started';

  return (
    <div className="space-y-6">
      {/* Header with Breadcrumb */}
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink onClick={onBack} className="cursor-pointer">Strategic Goals Overview</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{goal.title}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {getStatusBadge(overallStatus)}
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {goal.goal_number}. {goal.title}
            </h1>
            <p className="text-gray-600">{goal.description || 'Create an inclusive environment where every student feels valued, supported, and empowered to reach their full potential.'}</p>
          </div>
          
          <Button variant="outline" onClick={() => onEditGoal?.(goal.id)}>
            Edit
          </Button>
        </div>

        {/* Metrics Section - Only show for non-strategic objectives (level > 0) */}
        {goal.level > 0 && (
          <div className="mt-6">
            {goal.metrics && goal.metrics.length > 0 ? (
              <MetricGridDisplay
                metrics={goal.metrics}
                goalId={goal.id}
                districtSlug={districtSlug}
                onRefresh={onRefresh}
                editable={false}
                maxRows={10}
              />
            ) : (
              <Card>
                <CardContent className="py-8">
                  <div className="text-center">
                    <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Metrics Configured</h3>
                    <p className="text-gray-600">Add metrics to track progress for this goal.</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>

      {/* Sub-goals Section - Only show if there are sub-goals */}
      {goal.children && goal.children.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-4">Sub-goals</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {goal.children.map((subgoal) => (
              <Card key={subgoal.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm">{subgoal.goal_number}. {subgoal.title}</h3>
                    </div>
                    {subgoal.metrics && subgoal.metrics.length > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {subgoal.metrics.length} metric{subgoal.metrics.length !== 1 ? 's' : ''}
                      </Badge>
                    )}
                  </div>
                  {subgoal.description && (
                    <p className="text-xs text-gray-600">{subgoal.description}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}