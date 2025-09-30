'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Bell, 
  Target, 
  TrendingUp, 
  Users, 
  BarChart3, 
  Zap,
  CheckCircle,
  AlertCircle,
  Clock,
  Sparkles,
  Shield,
  Award,
  BookOpen,
  Briefcase,
  GraduationCap
} from 'lucide-react';
import { GoalWithMetrics } from '@/lib/types';
import { cn } from '@/lib/utils';

interface StrategicObjectivesDarkProps {
  goals: GoalWithMetrics[];
  onDrillDown?: (goalId: string) => void;
}

export default function StrategicObjectivesDark({ goals, onDrillDown }: StrategicObjectivesDarkProps) {
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

  // Get icon for objective based on title
  const getObjectiveIcon = (title: string, index: number) => {
    const titleLower = title.toLowerCase();
    
    if (titleLower.includes('academic') || titleLower.includes('student')) {
      return <GraduationCap className="w-7 h-7" />;
    }
    if (titleLower.includes('staff') || titleLower.includes('employee') || titleLower.includes('teacher')) {
      return <Users className="w-7 h-7" />;
    }
    if (titleLower.includes('community') || titleLower.includes('family')) {
      return <Briefcase className="w-7 h-7" />;
    }
    if (titleLower.includes('operational') || titleLower.includes('excellence')) {
      return <Award className="w-7 h-7" />;
    }
    if (titleLower.includes('growth') || titleLower.includes('improvement')) {
      return <TrendingUp className="w-7 h-7" />;
    }
    
    // Default icons by index
    const icons = [
      <Target className="w-7 h-7" />,
      <BarChart3 className="w-7 h-7" />,
      <BookOpen className="w-7 h-7" />,
      <Shield className="w-7 h-7" />
    ];
    
    return icons[index % icons.length];
  };

  // Get feature tags for each objective
  const getFeatureTags = (objective: GoalWithMetrics) => {
    const tags = [];
    
    // Check if metrics are tracked
    if (objective.metrics && objective.metrics.length > 0) {
      tags.push({ icon: BarChart3, text: 'Data-driven' });
    }
    
    // Check status
    const status = getMetricStatus(objective.metrics || []);
    if (status === 'on-target') {
      tags.push({ icon: CheckCircle, text: 'On track' });
    } else if (status === 'at-risk') {
      tags.push({ icon: AlertCircle, text: 'Needs attention' });
    }
    
    // Add AI/Smart features tag
    if (objective.children && objective.children.length > 3) {
      tags.push({ icon: Sparkles, text: 'AI insights' });
    }
    
    return tags.slice(0, 2); // Return max 2 tags
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Strategic Objectives</h2>
        <p className="text-slate-600">
          Monitor and track progress across all strategic initiatives
        </p>
      </div>

      {/* Grid of Strategic Objectives */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {strategicObjectives.map((objective, index) => {
          const status = getMetricStatus(objective.metrics || []);
          const featureTags = getFeatureTags(objective);
          const Icon = getObjectiveIcon(objective.title, index);
          
          return (
            <Card
              key={objective.id}
              className={cn(
                "relative overflow-hidden cursor-pointer transition-all duration-300",
                "bg-gradient-to-br from-teal-600 to-teal-700 border-teal-600",
                "hover:border-teal-500 hover:shadow-2xl hover:-translate-y-1",
                "group"
              )}
              onClick={() => onDrillDown?.(objective.id)}
            >
              <div className="p-6">
                {/* Icon */}
                <div className="mb-6">
                  <div className={cn(
                    "w-16 h-16 rounded-2xl flex items-center justify-center",
                    "bg-white/20 backdrop-blur transition-all duration-300",
                    "group-hover:scale-110 text-white"
                  )}>
                    {Icon}
                  </div>
                </div>

                {/* Title and Description */}
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-white mb-3 line-clamp-2">
                    {objective.title}
                  </h3>
                  <p className="text-teal-50 text-sm line-clamp-3">
                    {objective.description || `Strategic initiatives focused on ${objective.title.toLowerCase()}`}
                  </p>
                </div>

                {/* Feature Tags */}
                <div className="flex gap-3 flex-wrap">
                  {featureTags.map((tag, tagIndex) => (
                    <div 
                      key={tagIndex}
                      className="flex items-center gap-2 text-xs text-teal-50"
                    >
                      <div className="flex items-center">
                        <CheckCircle className="w-3.5 h-3.5 text-white mr-1" />
                        <span>{tag.text}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Progress Bar */}
                {objective.metrics && objective.metrics.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-teal-500/30">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-teal-100">Overall Progress</span>
                      <span className="text-xs text-white font-medium">
                        {Math.round(
                          (objective.metrics.filter(m => {
                            if (!m.current_value || !m.target_value) return false;
                            return (m.current_value / m.target_value) >= 0.95;
                          }).length / objective.metrics.length) * 100
                        )}%
                      </span>
                    </div>
                    <div className="w-full bg-teal-800/50 rounded-full h-1.5">
                      <div 
                        className={cn(
                          "h-full rounded-full transition-all duration-500",
                          status === 'on-target'
                            ? "bg-gradient-to-r from-white to-teal-100"
                            : status === 'at-risk'
                            ? "bg-gradient-to-r from-orange-300 to-orange-400"
                            : "bg-gradient-to-r from-teal-200 to-teal-300"
                        )}
                        style={{
                          width: `${Math.round(
                            (objective.metrics.filter(m => {
                              if (!m.current_value || !m.target_value) return false;
                              return (m.current_value / m.target_value) >= 0.95;
                            }).length / objective.metrics.length) * 100
                          )}%`
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Stats */}
                <div className="mt-6 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-4">
                    <div className="text-teal-100">
                      <span className="text-white font-medium">{objective.children?.length || 0}</span> Goals
                    </div>
                    <div className="text-teal-100">
                      <span className="text-white font-medium">{objective.metrics?.length || 0}</span> Metrics
                    </div>
                  </div>
                  <div className={cn(
                    "px-2 py-1 rounded-full text-xs font-medium",
                    status === 'on-target'
                      ? "bg-white/90 text-teal-700"
                      : status === 'at-risk'
                      ? "bg-orange-100 text-orange-700"
                      : "bg-teal-100 text-teal-700"
                  )}>
                    {status === 'on-target' ? 'On Target' : status === 'at-risk' ? 'At Risk' : 'In Progress'}
                  </div>
                </div>
              </div>

              {/* Gradient accent line at bottom */}
              <div className={cn(
                "absolute bottom-0 left-0 right-0 h-1",
                "bg-gradient-to-r from-white/50 via-teal-300 to-white/50"
              )} />
            </Card>
          );
        })}
      </div>
    </div>
  );
}