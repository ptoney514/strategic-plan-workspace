'use client';

import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Goal, Metric, GoalWithMetrics } from '@/lib/types';
import {
  TrendingUp,
  Users,
  Heart,
  Award,
  CheckCircle,
  Clock,
  ChevronRight,
  BookOpen,
  MessageCircle,
  Calendar,
  Star,
  AlertCircle
} from 'lucide-react';

interface OverviewV2Props {
  district: any;
  goals: GoalWithMetrics[];
  onDrillDown?: (goalId: string) => void;
}

export default function OverviewV2({ district, goals, onDrillDown }: OverviewV2Props) {
  const [selectedObjectiveId, setSelectedObjectiveId] = useState<string | null>(null);
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const [expandedObjectives, setExpandedObjectives] = useState<Set<string>>(new Set());

  // Initialize with first objective selected
  useEffect(() => {
    if (goals && goals.length > 0 && !selectedObjectiveId) {
      setSelectedObjectiveId(goals[0].id);
    }
  }, [goals]);

  // Calculate metric status
  const getMetricStatus = (current: number, target: number): 'on-track' | 'needs-attention' | 'at-risk' => {
    const ratio = current / target;
    if (ratio >= 0.95) return 'on-track';
    if (ratio >= 0.8) return 'needs-attention';
    return 'at-risk';
  };

  // Calculate overall goal status based on progress percentage
  const calculateGoalStatus = (progress: number): 'on-track' | 'needs-attention' | 'at-risk' => {
    if (progress >= 90) return 'on-track';
    if (progress >= 70) return 'needs-attention';
    return 'at-risk';
  };

  // Sample key metrics (these would be calculated from actual data)
  const keyMetrics = [
    {
      icon: TrendingUp,
      label: 'Students Reading at Grade Level',
      value: 87,
      change: 12,
      color: 'green'
    },
    {
      icon: Users,
      label: 'Daily Attendance Rate',
      value: 94,
      change: 3,
      color: 'blue'
    },
    {
      icon: Heart,
      label: 'Students Feel Safe & Supported',
      value: 92,
      change: 8,
      color: 'purple'
    },
    {
      icon: Award,
      label: 'College & Career Ready',
      value: 78,
      change: 15,
      color: 'orange'
    }
  ];

  // Get strategic priorities from goals
  const strategicPriorities = goals.filter(g => g.level === 0).slice(0, 4);

  // Get selected goal/objective data
  const getSelectedGoal = () => {
    if (selectedGoalId) {
      // Find in children of all objectives
      for (const objective of goals) {
        if (objective.children) {
          const found = objective.children.find(c => c.id === selectedGoalId);
          if (found) return found;
        }
      }
    }
    if (selectedObjectiveId) {
      return goals.find(g => g.id === selectedObjectiveId);
    }
    return goals[0]; // Default to first objective
  };

  const selectedGoal = getSelectedGoal();

  // Calculate progress for selected goal
  const calculateProgress = (goal: GoalWithMetrics) => {
    let totalProgress = 0;
    let metricCount = 0;
    
    const countMetrics = (g: GoalWithMetrics) => {
      if (g.metrics && g.metrics.length > 0) {
        g.metrics.forEach(metric => {
          if (metric.current_value !== undefined && metric.target_value !== undefined && metric.target_value > 0) {
            totalProgress += (metric.current_value / metric.target_value * 100);
            metricCount++;
          }
        });
      }
      if (g.children && g.children.length > 0) {
        g.children.forEach(child => countMetrics(child));
      }
    };
    
    countMetrics(goal);
    return metricCount > 0 ? totalProgress / metricCount : 0;
  };

  // Toggle objective expansion
  const toggleObjectiveExpansion = (objectiveId: string) => {
    const newExpanded = new Set(expandedObjectives);
    if (newExpanded.has(objectiveId)) {
      newExpanded.delete(objectiveId);
    } else {
      newExpanded.add(objectiveId);
    }
    setExpandedObjectives(newExpanded);
  };

  // Handle objective/goal selection
  const handleSelectObjective = (objectiveId: string) => {
    setSelectedObjectiveId(objectiveId);
    setSelectedGoalId(null);
  };

  const handleSelectGoal = (goalId: string, objectiveId: string) => {
    setSelectedGoalId(goalId);
    setSelectedObjectiveId(objectiveId);
  };

  return (
    <div className="bg-gray-50">
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .fade-in { animation: fadeIn 0.8s ease-out forwards; opacity: 0; }
        .fade-in-delay-1 { animation-delay: 0.1s; }
        .fade-in-delay-2 { animation-delay: 0.2s; }
        .fade-in-delay-3 { animation-delay: 0.3s; }
        .fade-in-delay-4 { animation-delay: 0.4s; }
        .fade-in-delay-5 { animation-delay: 0.5s; }
        .fade-in-delay-6 { animation-delay: 0.6s; }
        .progress-ring {
          transform: rotate(-90deg);
        }
        .progress-ring-circle {
          transition: stroke-dashoffset 0.5s ease-in-out;
        }
        .card-hover:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }
        .success-badge {
          background: linear-gradient(135deg, #10b981, #059669);
        }
        .warning-badge {
          background: linear-gradient(135deg, #f59e0b, #d97706);
        }
        .danger-badge {
          background: linear-gradient(135deg, #ef4444, #dc2626);
        }
      `}</style>

      {/* Main Dashboard */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8 fade-in fade-in-delay-1">
          <h2 className="text-3xl font-semibold text-gray-900 tracking-tight mb-2">Our Progress This Year</h2>
          <p className="text-lg text-gray-600">See how we're making a difference for your children and our community.</p>
        </div>

        {/* Key Metrics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {keyMetrics.map((metric, idx) => {
            const IconComponent = metric.icon;
            const bgColorFrom = {
              green: 'from-green-50',
              blue: 'from-blue-50',
              purple: 'from-purple-50',
              orange: 'from-orange-50'
            }[metric.color];
            const bgColorTo = {
              green: 'to-emerald-50',
              blue: 'to-cyan-50',
              purple: 'to-violet-50',
              orange: 'to-amber-50'
            }[metric.color];
            const borderColor = {
              green: 'border-green-200',
              blue: 'border-blue-200',
              purple: 'border-purple-200',
              orange: 'border-orange-200'
            }[metric.color];
            const iconBgColor = {
              green: 'bg-green-100',
              blue: 'bg-blue-100',
              purple: 'bg-purple-100',
              orange: 'bg-orange-100'
            }[metric.color];
            const iconColor = {
              green: 'text-green-600',
              blue: 'text-blue-600',
              purple: 'text-purple-600',
              orange: 'text-orange-600'
            }[metric.color];
            const valueColor = {
              green: 'text-green-700',
              blue: 'text-blue-700',
              purple: 'text-purple-700',
              orange: 'text-orange-700'
            }[metric.color];
            const labelColor = {
              green: 'text-green-900',
              blue: 'text-blue-900',
              purple: 'text-purple-900',
              orange: 'text-orange-900'
            }[metric.color];
            const changeColor = {
              green: 'text-green-700',
              blue: 'text-blue-700',
              purple: 'text-purple-700',
              orange: 'text-orange-700'
            }[metric.color];

            return (
              <div 
                key={idx}
                className={`bg-gradient-to-br ${bgColorFrom} ${bgColorTo} border ${borderColor} rounded-2xl p-6 fade-in fade-in-delay-${idx + 2}`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 ${iconBgColor} rounded-xl flex items-center justify-center`}>
                    <IconComponent className={`w-6 h-6 ${iconColor}`} />
                  </div>
                  <span className={`text-3xl font-bold ${valueColor}`}>{metric.value}%</span>
                </div>
                <h3 className={`text-sm font-semibold ${labelColor} mb-1`}>{metric.label}</h3>
                <p className={`text-xs ${changeColor}`}>↑ {metric.change}% from last year</p>
              </div>
            );
          })}
        </div>

        {/* Strategic Priority Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {strategicPriorities.map((goal, idx) => {
            // Calculate progress based on all metrics in the goal and its children
            let totalProgress = 0;
            let metricCount = 0;
            
            // Add metrics from the main goal
            if (goal.metrics && goal.metrics.length > 0) {
              goal.metrics.forEach(m => {
                if (m.current_value !== undefined && m.target_value !== undefined && m.target_value > 0) {
                  totalProgress += (m.current_value / m.target_value * 100);
                  metricCount++;
                }
              });
            }
            
            // Add metrics from child goals
            if (goal.children && goal.children.length > 0) {
              goal.children.forEach(child => {
                if (child.metrics && child.metrics.length > 0) {
                  child.metrics.forEach(m => {
                    if (m.current_value !== undefined && m.target_value !== undefined && m.target_value > 0) {
                      totalProgress += (m.current_value / m.target_value * 100);
                      metricCount++;
                    }
                  });
                }
              });
            }
            
            const progress = metricCount > 0 ? totalProgress / metricCount : 0;
            const status = calculateGoalStatus(progress);

            const statusBadgeClass = status === 'on-track' ? 'success-badge' 
              : status === 'needs-attention' ? 'warning-badge' 
              : 'danger-badge';

            const statusText = status === 'on-track' ? 'On Track' 
              : status === 'needs-attention' ? 'Needs Attention' 
              : 'At Risk';

            const statusTextColor = status === 'on-track' ? 'text-green-700' 
              : status === 'needs-attention' ? 'text-orange-700' 
              : 'text-red-700';

            const strokeColor = status === 'on-track' ? '#10b981' 
              : status === 'needs-attention' ? '#f59e0b' 
              : '#ef4444';

            const circumference = 2 * Math.PI * 50;
            const strokeDashoffset = circumference - (progress / 100) * circumference;

            return (
              <div
                key={goal.id}
                className={`bg-white rounded-2xl shadow-lg border border-gray-200 p-8 card-hover transition-all duration-300 cursor-pointer fade-in fade-in-delay-${idx + 2}`}
                onClick={() => onDrillDown?.(goal.id)}
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className={`${statusBadgeClass} w-3 h-3 rounded-full`}></div>
                      <span className={`text-sm font-medium ${statusTextColor}`}>{statusText}</span>
                    </div>
                    <h3 className="text-2xl font-semibold text-gray-900 mb-2 tracking-tight">
                      {goal.title}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {goal.description || 'Working towards excellence in this strategic area through focused initiatives and measurable outcomes.'}
                    </p>
                  </div>
                  <div className="flex-shrink-0 ml-6">
                    <div className="relative w-24 h-24">
                      <svg className="progress-ring w-24 h-24" viewBox="0 0 120 120">
                        <circle 
                          cx="60" 
                          cy="60" 
                          r="50" 
                          stroke="#e5e7eb" 
                          strokeWidth="8" 
                          fill="transparent"
                        />
                        <circle 
                          cx="60" 
                          cy="60" 
                          r="50" 
                          stroke={strokeColor}
                          strokeWidth="8" 
                          fill="transparent" 
                          strokeDasharray={circumference}
                          strokeDashoffset={strokeDashoffset}
                          className="progress-ring-circle"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-2xl font-bold text-gray-900">{Math.round(progress)}%</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {/* Display metrics as sub-items if no children exist */}
                  {goal.children && goal.children.length > 0 ? (
                    // Display actual sub-goals if they exist
                    goal.children.map((child, childIdx) => {
                      // Calculate child goal completion based on its metrics
                      let childProgress = 0;
                      let childMetricCount = 0;
                      
                      if (child.metrics && child.metrics.length > 0) {
                        child.metrics.forEach(m => {
                          if (m.current_value !== undefined && m.target_value !== undefined && m.target_value > 0) {
                            childProgress += (m.current_value / m.target_value * 100);
                            childMetricCount++;
                          }
                        });
                      }
                      
                      const childProgressPercent = childMetricCount > 0 ? childProgress / childMetricCount : 0;
                      const childStatus = calculateGoalStatus(childProgressPercent);
                      
                      // Determine background colors and text based on status
                      const bgColor = childStatus === 'on-track' ? 'bg-green-50' 
                        : childStatus === 'needs-attention' ? 'bg-yellow-50' 
                        : 'bg-red-50';
                      
                      const iconColor = childStatus === 'on-track' ? 'text-green-600'
                        : childStatus === 'needs-attention' ? 'text-yellow-600'
                        : 'text-red-600';
                      
                      const textColor = childStatus === 'on-track' ? 'text-green-900'
                        : childStatus === 'needs-attention' ? 'text-yellow-900'
                        : 'text-red-900';
                      
                      const statusPillBg = childStatus === 'on-track' ? 'bg-green-100 text-green-700'
                        : childStatus === 'needs-attention' ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-red-100 text-red-700';
                      
                      const statusText = childStatus === 'on-track' ? 'On Target'
                        : childStatus === 'needs-attention' ? 'Needs Improvement'
                        : 'At Risk';
                      
                      return (
                        <div 
                          key={child.id}
                          className={`flex items-center justify-between p-4 ${bgColor} rounded-xl`}
                        >
                          <div className="flex items-center space-x-3">
                            {childStatus === 'on-track' ? (
                              <CheckCircle className={`w-5 h-5 ${iconColor}`} />
                            ) : childStatus === 'needs-attention' ? (
                              <Clock className={`w-5 h-5 ${iconColor}`} />
                            ) : (
                              <AlertCircle className={`w-5 h-5 ${iconColor}`} />
                            )}
                            <span className={`font-medium ${textColor}`}>
                              {child.title}
                            </span>
                          </div>
                          <span className={`text-xs px-3 py-1 rounded-full font-medium ${statusPillBg}`}>
                            {statusText}
                          </span>
                        </div>
                      );
                    })
                  ) : (
                    // Display metrics as sub-items if no children exist
                    goal.metrics?.map((metric, metricIdx) => {
                      const metricProgress = metric.current_value && metric.target_value && metric.target_value > 0
                        ? (metric.current_value / metric.target_value * 100)
                        : 0;
                      
                      const metricStatus = calculateGoalStatus(metricProgress);
                      
                      // Determine background colors and text based on status
                      const bgColor = metricStatus === 'on-track' ? 'bg-green-50' 
                        : metricStatus === 'needs-attention' ? 'bg-yellow-50' 
                        : 'bg-red-50';
                      
                      const iconColor = metricStatus === 'on-track' ? 'text-green-600'
                        : metricStatus === 'needs-attention' ? 'text-yellow-600'
                        : 'text-red-600';
                      
                      const textColor = metricStatus === 'on-track' ? 'text-green-900'
                        : metricStatus === 'needs-attention' ? 'text-yellow-900'
                        : 'text-red-900';
                      
                      const statusPillBg = metricStatus === 'on-track' ? 'bg-green-100 text-green-700'
                        : metricStatus === 'needs-attention' ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-red-100 text-red-700';
                      
                      const statusText = metricStatus === 'on-track' ? 'On Target'
                        : metricStatus === 'needs-attention' ? 'Needs Improvement'
                        : 'At Risk';
                      
                      return (
                        <div 
                          key={metric.id}
                          className={`flex items-center justify-between p-4 ${bgColor} rounded-xl`}
                        >
                          <div className="flex items-center space-x-3">
                            {metricStatus === 'on-track' ? (
                              <CheckCircle className={`w-5 h-5 ${iconColor}`} />
                            ) : metricStatus === 'needs-attention' ? (
                              <Clock className={`w-5 h-5 ${iconColor}`} />
                            ) : (
                              <AlertCircle className={`w-5 h-5 ${iconColor}`} />
                            )}
                            <span className={`font-medium ${textColor}`}>
                              {metric.name}
                            </span>
                          </div>
                          <span className={`text-xs px-3 py-1 rounded-full font-medium ${statusPillBg}`}>
                            {statusText}
                          </span>
                        </div>
                      );
                    })
                  )}
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      Next milestone: {Math.min(Math.round(progress + 5), 100)}% by quarter end
                    </span>
                    <button className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center space-x-1 transition-colors duration-200">
                      <span>View Details</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Story Spotlight */}
        <div className="bg-gradient-to-br from-blue-600 to-purple-700 rounded-2xl p-8 text-white mb-8 fade-in fade-in-delay-6">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Star className="w-5 h-5 text-yellow-300" />
                <span className="text-yellow-300 text-sm font-medium">Success Story</span>
              </div>
              <h3 className="text-2xl font-semibold mb-4 tracking-tight">Emma's Reading Journey</h3>
              <p className="text-blue-100 mb-6 leading-relaxed">
                "Six months ago, Emma struggled with reading. Thanks to our new reading specialists and personalized support, 
                she's now reading above grade level and loves picking out books at the library!"
              </p>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
                  <span className="text-white font-medium">SJ</span>
                </div>
                <div>
                  <p className="font-medium">Sarah Johnson</p>
                  <p className="text-sm text-blue-200">Emma's Mom, Grade 2</p>
                </div>
              </div>
            </div>
            <div className="text-center">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8">
                <BookOpen className="w-32 h-32 text-white/80 mx-auto" />
              </div>
            </div>
          </div>
        </div>

        {/* How to Get Involved */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 fade-in fade-in-delay-6">
          <h3 className="text-2xl font-semibold text-gray-900 mb-6 tracking-tight">How You Can Help</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors duration-200 cursor-pointer">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
              <h4 className="font-medium text-gray-900 mb-2">Volunteer to Read</h4>
              <p className="text-sm text-gray-600 mb-4">
                Help students practice reading skills during our daily reading circles.
              </p>
              <button className="text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors duration-200">
                Sign Up
              </button>
            </div>
            
            <div className="text-center p-6 bg-green-50 rounded-xl hover:bg-green-100 transition-colors duration-200 cursor-pointer">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-6 h-6 text-green-600" />
              </div>
              <h4 className="font-medium text-gray-900 mb-2">Share Your Story</h4>
              <p className="text-sm text-gray-600 mb-4">
                Tell us how our programs have impacted your child's learning journey.
              </p>
              <button className="text-green-600 hover:text-green-700 font-medium text-sm transition-colors duration-200">
                Share Now
              </button>
            </div>
            
            <div className="text-center p-6 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors duration-200 cursor-pointer">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
              <h4 className="font-medium text-gray-900 mb-2">Attend Events</h4>
              <p className="text-sm text-gray-600 mb-4">
                Join our monthly community events and school board meetings.
              </p>
              <button className="text-purple-600 hover:text-purple-700 font-medium text-sm transition-colors duration-200">
                View Calendar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}