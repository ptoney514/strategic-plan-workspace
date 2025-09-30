'use client';

import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Goal, Metric, GoalWithMetrics } from '@/lib/types';
import { MetricGridDisplay } from '@/components/metrics/MetricGridDisplay';
import {
  formatMetricValue,
  getGoalPrimaryDisplay,
  calculateGoalStatus,
  getStatusDisplay
} from '@/lib/metric-utils';
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
  AlertCircle,
  Target,
  Flag,
  BarChart3
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
      const firstObjective = goals.find(g => g.level === 0);
      if (firstObjective) {
        setSelectedObjectiveId(firstObjective.id);
        // Auto-expand first objective if it has children
        if (firstObjective.children && firstObjective.children.length > 0) {
          setExpandedObjectives(new Set([firstObjective.id]));
        }
      }
    }
  }, [goals]);

  // Calculate metric status (keeping for backward compatibility)
  const getMetricStatusOld = (current: number, target: number): 'on-track' | 'at-risk' | 'off-track' => {
    const ratio = current / target;
    if (ratio >= 0.95) return 'on-track';
    if (ratio >= 0.8) return 'at-risk';
    return 'off-track';
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

  // Calculate progress for a goal
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

  // Prepare data for selected goal
  const selectedProgress = selectedGoal ? calculateProgress(selectedGoal) : 0;
  const selectedStatus = selectedGoal ? calculateGoalStatus(selectedGoal) : 'at-risk';

  return (
    <>
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
      <div className="bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8 fade-in fade-in-delay-1">
          <h2 className="text-3xl font-semibold text-gray-900 tracking-tight mb-2">Our Progress This Year</h2>
          <p className="text-lg text-gray-600">See how we're making a difference for your children and our community.</p>
        </div>

        {/* Strategic Objectives Grid with Images */}
        <div className="mb-8 fade-in fade-in-delay-2">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Strategic Objectives</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {goals.filter(g => g.level === 0).map((objective) => {
              const objectiveStatus = calculateGoalStatus(objective);
              const statusDisplay = getStatusDisplay(objectiveStatus);
              const hasChildren = objective.children && objective.children.length > 0;
              const childrenCount = hasChildren ? objective.children.length : 0;

              return (
                <div
                  key={objective.id}
                  className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer overflow-hidden card-hover"
                  onClick={() => {
                    handleSelectObjective(objective.id);
                    setSelectedGoalId(null);
                  }}
                >
                  {/* Image Header */}
                  {objective.image_url ? (
                    <div className="relative h-32 w-full">
                      <img
                        src={objective.image_url}
                        alt={objective.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                      {/* Title overlay on image */}
                      <div className="absolute bottom-3 left-4 right-4">
                        <h4 className="text-white font-semibold text-lg drop-shadow-lg">
                          {objective.goal_number}. {objective.title}
                        </h4>
                      </div>
                      {/* Status badge */}
                      <div className="absolute top-3 right-3">
                        <span className={`text-xs font-medium px-2 py-1 rounded-full backdrop-blur-sm ${
                          objectiveStatus === 'on-track' ? 'bg-green-100/90 text-green-700' :
                          objectiveStatus === 'at-risk' ? 'bg-yellow-100/90 text-yellow-700' :
                          'bg-red-100/90 text-red-700'
                        }`}>
                          {statusDisplay.label}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="relative h-32 w-full bg-gradient-to-br from-blue-500 to-purple-600">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Target className="w-16 h-16 text-white/30" />
                      </div>
                      {/* Title overlay */}
                      <div className="absolute bottom-3 left-4 right-4">
                        <h4 className="text-white font-semibold text-lg drop-shadow-lg">
                          {objective.goal_number}. {objective.title}
                        </h4>
                      </div>
                      {/* Status badge */}
                      <div className="absolute top-3 right-3">
                        <span className={`text-xs font-medium px-2 py-1 rounded-full backdrop-blur-sm ${
                          objectiveStatus === 'on-track' ? 'bg-green-100/90 text-green-700' :
                          objectiveStatus === 'at-risk' ? 'bg-yellow-100/90 text-yellow-700' :
                          'bg-red-100/90 text-red-700'
                        }`}>
                          {statusDisplay.label}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Card Content */}
                  <div className="p-4">
                    {objective.description && (
                      <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                        {objective.description}
                      </p>
                    )}

                    {/* Stats */}
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center space-x-4">
                        {childrenCount > 0 && (
                          <span className="flex items-center">
                            <Flag className="w-3 h-3 mr-1" />
                            {childrenCount} {childrenCount === 1 ? 'Goal' : 'Goals'}
                          </span>
                        )}
                        {objective.metrics && objective.metrics.length > 0 && (
                          <span className="flex items-center">
                            <BarChart3 className="w-3 h-3 mr-1" />
                            {objective.metrics.length} {objective.metrics.length === 1 ? 'Metric' : 'Metrics'}
                          </span>
                        )}
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Strategic Goals Dashboard with Sidebar */}
        <div className="grid grid-cols-12 gap-6 mb-8">
          {/* Left Sidebar - Strategic Objectives List */}
          <div className="col-span-4 bg-white rounded-2xl shadow-lg border border-gray-200 p-6 fade-in fade-in-delay-2">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Strategic Objectives</h3>
            <p className="text-sm text-gray-500 mb-4">Click an objective to see its roll-up metrics</p>
            <div className="space-y-2">
              {goals.filter(g => g.level === 0).map((objective) => {
                const isObjectiveSelected = selectedObjectiveId === objective.id && !selectedGoalId;
                const isExpanded = expandedObjectives.has(objective.id);
                const hasChildren = objective.children && objective.children.length > 0;
                const objectiveStatus = calculateGoalStatus(objective);
                const statusDisplay = getStatusDisplay(objectiveStatus);
                const primaryDisplay = getGoalPrimaryDisplay(objective);

                return (
                  <div key={objective.id}>
                    <div
                      className={`rounded-lg cursor-pointer transition-all duration-200 overflow-hidden ${
                        isObjectiveSelected
                          ? 'bg-blue-50 border-2 border-blue-200'
                          : 'hover:bg-gray-50 border-2 border-transparent'
                      }`}
                      onClick={() => {
                        handleSelectObjective(objective.id);
                        if (hasChildren) {
                          toggleObjectiveExpansion(objective.id);
                        }
                      }}
                    >
                      {/* Header for strategic objective - Image or Color */}
                      {(objective.image_url || objective.header_color) && (
                        <div className="relative h-24 w-full mb-2">
                          {objective.image_url ? (
                            <img
                              src={objective.image_url}
                              alt={objective.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div
                              className="w-full h-full"
                              style={{ backgroundColor: objective.header_color }}
                            />
                          )}
                          {/* Gradient overlay for better text readability */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                          {/* Status badge on image */}
                          <div className="absolute top-2 right-2">
                            <span className={`text-xs font-medium px-2 py-1 rounded-full backdrop-blur-sm ${
                              objectiveStatus === 'on-track' ? 'bg-green-100/90 text-green-700' :
                              objectiveStatus === 'at-risk' ? 'bg-yellow-100/90 text-yellow-700' :
                              'bg-red-100/90 text-red-700'
                            }`}>
                              {statusDisplay.label}
                            </span>
                          </div>
                        </div>
                      )}

                      <div className="p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2 flex-1">
                            {hasChildren && (
                              <ChevronRight
                                className={`w-4 h-4 text-gray-400 transition-transform duration-200 flex-shrink-0 ${
                                  isExpanded ? 'transform rotate-90' : ''
                                }`}
                              />
                            )}
                            {!hasChildren && <div className="w-4" />}
                            <Target className="w-4 h-4 text-blue-600 flex-shrink-0" />
                            <div className="flex-1">
                              <div className={`text-sm font-medium ${
                                isObjectiveSelected ? 'text-blue-900' : 'text-gray-700'
                              }`}>
                                {objective.goal_number}. {objective.title}
                              </div>
                              {objective.description && (
                                <div className="text-xs text-gray-500 mt-1 line-clamp-2">
                                  {objective.description}
                                </div>
                              )}
                            </div>
                          </div>
                          {!objective.image_url && (
                            <div className="flex items-center space-x-2 ml-2">
                              <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                                objectiveStatus === 'on-track' ? 'bg-green-100 text-green-700' :
                                objectiveStatus === 'at-risk' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-red-100 text-red-700'
                              }`}>
                                {statusDisplay.label}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center justify-end mt-2 text-xs text-gray-500">
                          {primaryDisplay.value !== 'No metrics' ? primaryDisplay.description : `${hasChildren ? objective.children.length : objective.metrics?.length || 0} metrics`}
                        </div>
                      </div>
                    </div>
                    
                    {/* Sub-goals */}
                    {isExpanded && hasChildren && (
                      <div className="ml-8 mt-1 space-y-1">
                        {objective.children.map((goal) => {
                          const isGoalSelected = selectedGoalId === goal.id;
                          const goalStatus = calculateGoalStatus(goal);
                          const statusDisplay = getStatusDisplay(goalStatus);
                          
                          return (
                            <div
                              key={goal.id}
                              className={`p-2 rounded-lg cursor-pointer transition-all duration-200 ${
                                isGoalSelected 
                                  ? 'bg-green-50 border-2 border-green-200' 
                                  : 'hover:bg-gray-50 border-2 border-transparent'
                              }`}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSelectGoal(goal.id, objective.id);
                              }}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  <Flag className="w-3 h-3 text-green-600 flex-shrink-0" />
                                  <span className={`text-sm ${
                                    isGoalSelected ? 'text-green-900 font-medium' : 'text-gray-600'
                                  }`}>
                                    {goal.goal_number}. {goal.title}
                                  </span>
                                </div>
                                <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${
                                  goalStatus === 'on-track' ? 'bg-green-100 text-green-600' :
                                  goalStatus === 'at-risk' ? 'bg-yellow-100 text-yellow-600' :
                                  'bg-red-100 text-red-600'
                                }`}>
                                  {statusDisplay.label}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Panel - Selected Goal/Objective Details */}
          <div className="col-span-8">
            {selectedGoal && (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden fade-in fade-in-delay-3">
                {/* Image Header if available */}
                {selectedGoal.image_url && (
                  <div className="relative h-48 w-full">
                    <img
                      src={selectedGoal.image_url}
                      alt={selectedGoal.title}
                      className="w-full h-full object-cover"
                    />
                    {/* Gradient overlay for better text readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                    {/* Status badge on image */}
                    <div className="absolute top-4 right-4">
                      <div className="flex items-center space-x-2 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1.5">
                        <div className={`${
                          selectedStatus === 'on-track' ? 'bg-gradient-to-br from-green-400 to-green-600' :
                          selectedStatus === 'at-risk' ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' :
                          'bg-gradient-to-br from-red-400 to-red-600'
                        } w-2.5 h-2.5 rounded-full`}></div>
                        <span className={`text-sm font-medium ${
                          selectedStatus === 'on-track' ? 'text-green-700' :
                          selectedStatus === 'at-risk' ? 'text-yellow-700' :
                          'text-red-700'
                        }`}>
                          {getStatusDisplay(selectedStatus).label}
                        </span>
                      </div>
                    </div>
                    {/* Title overlay on image */}
                    <div className="absolute bottom-4 left-6 right-6">
                      <h3 className="text-2xl font-semibold text-white tracking-tight drop-shadow-lg">
                        {selectedGoal.goal_number}. {selectedGoal.title}
                      </h3>
                    </div>
                  </div>
                )}
                
                <div className="p-8">
                  {/* Header Section (when no image) */}
                  {!selectedGoal.image_url && (
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-4">
                          <div className={`${
                            selectedStatus === 'on-track' ? 'bg-gradient-to-br from-green-400 to-green-600' :
                            selectedStatus === 'at-risk' ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' :
                            'bg-gradient-to-br from-red-400 to-red-600'
                          } w-3 h-3 rounded-full`}></div>
                          <span className={`text-sm font-medium ${
                            selectedStatus === 'on-track' ? 'text-green-700' :
                            selectedStatus === 'at-risk' ? 'text-yellow-700' :
                            'text-red-700'
                          }`}>
                            {getStatusDisplay(selectedStatus).label}
                          </span>
                        </div>
                        <h3 className="text-2xl font-semibold text-gray-900 mb-1 tracking-tight">
                          {selectedGoal.goal_number}. {selectedGoal.title}
                        </h3>
                        <p className="text-gray-600 text-base">
                          {selectedGoal.description || 'Working towards excellence in this strategic area through focused initiatives and measurable outcomes.'}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Description when image is present */}
                  {selectedGoal.image_url && (
                    <div className="mb-6">
                      <p className="text-gray-600 text-base">
                        {selectedGoal.description || 'Working towards excellence in this strategic area through focused initiatives and measurable outcomes.'}
                      </p>
                    </div>
                  )}

                  {/* Metrics Section - Only show for non-strategic objectives (level > 0) */}
                  {selectedGoal.level > 0 && (
                    <div className="mb-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">
                        Metrics & KPIs
                      </h4>
                      {selectedGoal.metrics && selectedGoal.metrics.length > 0 ? (
                        <MetricGridDisplay
                          metrics={selectedGoal.metrics}
                          goalId={selectedGoal.id}
                          districtSlug={district.slug || ''}
                          onRefresh={() => {}}
                          editable={false}
                          maxRows={10}
                        />
                      ) : (
                        <div className="bg-gray-50 rounded-lg p-6 text-center">
                          <p className="text-gray-500">No metrics configured for this goal</p>
                        </div>
                      )}
                    </div>
                  )}

                {/* Sub-goals or Goals under this objective */}
                {selectedGoal.children && selectedGoal.children.length > 0 && (
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">
                      {selectedGoal.level === 0 ? 'Goals under this strategic objective' : 'Objectives under this goal'}
                    </h4>
                    <div className="space-y-3">
                      {selectedGoal.children.map((child) => {
                        const childProgress = calculateProgress(child);
                        const childStatus = calculateGoalStatus(child);
                        
                        return (
                          <div 
                            key={child.id}
                            className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
                            onClick={() => handleSelectGoal(child.id, selectedObjectiveId!)}
                          >
                            <div className="flex items-center space-x-3">
                              {childStatus === 'on-track' ? (
                                <CheckCircle className="w-5 h-5 text-green-600" />
                              ) : childStatus === 'at-risk' ? (
                                <Clock className="w-5 h-5 text-yellow-600" />
                              ) : (
                                <AlertCircle className="w-5 h-5 text-red-600" />
                              )}
                              <span className="font-medium text-gray-900">
                                {child.title}
                              </span>
                            </div>
                            <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                              childStatus === 'on-track' ? 'bg-green-100 text-green-700' :
                              childStatus === 'at-risk' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {getStatusDisplay(childStatus).label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                </div>
              </div>
            )}
          </div>
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
    </>
  );
}