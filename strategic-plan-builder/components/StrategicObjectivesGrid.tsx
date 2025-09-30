'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle, Clock, TrendingUp } from 'lucide-react';
import { GoalWithMetrics } from '@/lib/types';
import { cn } from '@/lib/utils';

interface StrategicObjectivesGridProps {
  goals: GoalWithMetrics[];
  onDrillDown?: (goalId: string) => void;
}

export default function StrategicObjectivesGrid({ goals, onDrillDown }: StrategicObjectivesGridProps) {
  // Filter for strategic objectives only (level 0)
  const strategicObjectives = goals.filter(g => g.level === 0);

  // Calculate metric status
  const getMetricStatus = (metrics: any[]): 'on-target' | 'at-risk' | 'in-progress' => {
    if (!metrics || metrics.length === 0) return 'in-progress';
    
    const validMetrics = metrics.filter(m => m.current_value !== undefined && m.target_value !== undefined);
    if (validMetrics.length === 0) return 'in-progress';
    
    const onTargetCount = validMetrics.filter(m => {
      const ratio = m.current_value / m.target_value;
      return ratio >= 0.95;
    }).length;
    
    const onTargetRatio = onTargetCount / validMetrics.length;
    if (onTargetRatio >= 0.7) return 'on-target';
    if (onTargetRatio >= 0.4) return 'in-progress';
    return 'at-risk';
  };

  const getStatusIcon = (status: 'on-target' | 'at-risk' | 'in-progress') => {
    switch (status) {
      case 'on-target':
        return (
          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
        );
      case 'at-risk':
        return (
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
            <AlertCircle className="w-6 h-6 text-red-600" />
          </div>
        );
      case 'in-progress':
        return (
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
            <Clock className="w-6 h-6 text-blue-600" />
          </div>
        );
    }
  };

  const getStatusBadge = (status: 'on-target' | 'at-risk' | 'in-progress') => {
    switch (status) {
      case 'on-target':
        return (
          <Badge className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100">
            On Target
          </Badge>
        );
      case 'at-risk':
        return (
          <Badge className="bg-red-50 text-red-700 border-red-200 hover:bg-red-100">
            At Risk
          </Badge>
        );
      case 'in-progress':
        return (
          <Badge className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100">
            In Progress
          </Badge>
        );
    }
  };

  // Default gradient colors if no image or color is set
  const defaultGradients = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    'linear-gradient(135deg, #30cfd0 0%, #330867 100%)'
  ];

  return (
    <div className="w-full bg-gray-50 rounded-3xl p-8">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Strategic Objectives</h2>
        <p className="text-gray-600">
          Track progress across all strategic objectives and their key performance metrics
        </p>
      </div>

      {/* Grid of Strategic Objectives */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {strategicObjectives.map((objective, index) => {
          const status = getMetricStatus(objective.metrics || []);
          const hasImage = objective.image_url || objective.header_color;
          
          return (
            <Card
              key={objective.id}
              className={cn(
                "overflow-hidden cursor-pointer transition-all duration-300",
                "hover:shadow-xl hover:-translate-y-1",
                "border-0 bg-white"
              )}
              onClick={() => onDrillDown?.(objective.id)}
            >
              <div className="flex flex-col h-full">
                {/* Header with Status Icon */}
                <div className="p-6 pb-4">
                  <div className="flex items-start justify-between mb-4">
                    {getStatusIcon(status)}
                    {getStatusBadge(status)}
                  </div>
                  
                  {/* Title and Description */}
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                    {objective.title}
                  </h3>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {objective.description || `Strategic focus on ${objective.title.toLowerCase()}`}
                  </p>
                </div>

                {/* Image or Color Section */}
                <div className="relative h-48 mt-auto">
                  {objective.image_url ? (
                    <>
                      <img
                        src={objective.image_url}
                        alt={objective.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    </>
                  ) : objective.header_color ? (
                    <div
                      className="w-full h-full"
                      style={{ backgroundColor: objective.header_color }}
                    />
                  ) : (
                    <div
                      className="w-full h-full"
                      style={{ background: defaultGradients[index % defaultGradients.length] }}
                    />
                  )}
                  
                  {/* Metrics Summary Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm p-4">
                    <div className="flex items-center justify-between">
                      <div className="text-sm">
                        <span className="text-gray-600">Metrics</span>
                        <div className="font-semibold text-gray-900">
                          {objective.metrics?.length || 0} tracked
                        </div>
                      </div>
                      <div className="text-sm text-right">
                        <span className="text-gray-600">Sub-goals</span>
                        <div className="font-semibold text-gray-900">
                          {objective.children?.length || 0} active
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}