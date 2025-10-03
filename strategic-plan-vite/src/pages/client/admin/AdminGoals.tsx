import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { StatusManager } from '../../../components/StatusManager';
import {
  Target,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  ChevronDown,
  ChevronRight,
  Edit2,
  Save,
  X,
  Plus
} from 'lucide-react';
import { useDistrict } from '../../../hooks/useDistricts';
import { useGoals } from '../../../hooks/useGoals';
import { useMetrics } from '../../../hooks/useMetrics';
import type { Goal, HierarchicalGoal } from '../../../lib/types';

export function AdminGoals() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { district } = useDistrict(slug!);
  const { goals, loading } = useGoals(district?.id);
  const { metrics } = useMetrics(district?.id);
  const [expandedGoals, setExpandedGoals] = useState<Set<string>>(new Set());
  const [editingGoal, setEditingGoal] = useState<string | null>(null);
  const [overrideModal, setOverrideModal] = useState<Goal | null>(null);
  
  const toggleExpanded = (goalId: string) => {
    const newExpanded = new Set(expandedGoals);
    if (newExpanded.has(goalId)) {
      newExpanded.delete(goalId);
    } else {
      newExpanded.add(goalId);
    }
    setExpandedGoals(newExpanded);
  };
  
  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'on-target':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'at-risk':
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      case 'critical':
      case 'off-target':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };
  
  const getStatusBadge = (status?: string) => {
    const statusColors: Record<string, string> = {
      'on-target': 'bg-green-100 text-green-800',
      'at-risk': 'bg-yellow-100 text-yellow-800',
      'critical': 'bg-red-100 text-red-800',
      'off-target': 'bg-orange-100 text-orange-800',
      'not-started': 'bg-gray-100 text-gray-800'
    };
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[status || 'not-started']}`}>
        {status?.replace('-', ' ') || 'Not Started'}
      </span>
    );
  };
  
  const renderGoalRow = (goal: HierarchicalGoal, level: number = 0) => {
    const hasChildren = goal.children && goal.children.length > 0;
    const isExpanded = expandedGoals.has(goal.id);
    const goalMetrics = metrics?.filter(m => m.goal_id === goal.id) || [];
    
    // Calculate metrics summary
    const metricsWithValues = goalMetrics.filter(m => m.current_value && m.target_value);
    const avgProgress = metricsWithValues.length > 0
      ? metricsWithValues.reduce((sum, m) => {
          const progress = m.current_value! / m.target_value! * 100;
          return sum + progress;
        }, 0) / metricsWithValues.length
      : null;
    
    return (
      <React.Fragment key={goal.id}>
        <tr className={`border-b hover:bg-muted/50 ${level > 0 ? 'bg-muted/20' : ''}`}>
          <td className="py-3 px-4">
            <div className="flex items-center" style={{ paddingLeft: `${level * 24}px` }}>
              {hasChildren && (
                <button
                  onClick={() => toggleExpanded(goal.id)}
                  className="mr-2 p-1 hover:bg-muted rounded"
                >
                  {isExpanded ? 
                    <ChevronDown className="h-4 w-4" /> : 
                    <ChevronRight className="h-4 w-4" />
                  }
                </button>
              )}
              <div className="flex-1">
                <p className="font-medium">
                  {goal.goal_number} {goal.title}
                </p>
                {goal.description && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {goal.description}
                  </p>
                )}
              </div>
            </div>
          </td>
          
          <td className="py-3 px-4">
            <div className="space-y-1">
              {avgProgress !== null && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">
                    {avgProgress.toFixed(1)}%
                  </span>
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${Math.min(100, avgProgress)}%` }}
                    />
                  </div>
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                {metricsWithValues.length} of {goalMetrics.length} metrics
              </p>
            </div>
          </td>
          
          <td className="py-3 px-4">
            <div className="flex items-center space-x-2">
              {getStatusIcon(goal.status)}
              {getStatusBadge(goal.status)}
            </div>
            {goal.status_source === 'manual' && (
              <p className="text-xs text-muted-foreground mt-1">
                Manual Override
              </p>
            )}
          </td>
          
          <td className="py-3 px-4">
            {goal.calculated_status && goal.calculated_status !== goal.status && (
              <div className="space-y-1">
                {getStatusBadge(goal.calculated_status)}
                <p className="text-xs text-muted-foreground">
                  System suggestion
                </p>
              </div>
            )}
          </td>
          
          <td className="py-3 px-4">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setOverrideModal(goal)}
                className="p-1 hover:bg-muted rounded"
                title="Override Status"
              >
                <Edit2 className="h-4 w-4" />
              </button>
            </div>
          </td>
        </tr>
        
        {/* Render children if expanded */}
        {hasChildren && isExpanded && goal.children?.map(child => 
          renderGoalRow(child as HierarchicalGoal, level + 1)
        )}
      </React.Fragment>
    );
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading goals...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Strategic Objectives & Goals
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage your strategic objectives and their goals
            </p>
          </div>
          <button
            onClick={() => navigate(`/${slug}/admin/objectives/new`)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Create Strategic Objective</span>
          </button>
        </div>
        
        {/* Goals Table */}
        <div className="bg-card rounded-lg border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left py-3 px-4 font-medium">Goal</th>
                  <th className="text-left py-3 px-4 font-medium">Metrics</th>
                  <th className="text-left py-3 px-4 font-medium">Current Status</th>
                  <th className="text-left py-3 px-4 font-medium">Calculated</th>
                  <th className="text-left py-3 px-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {goals?.filter(g => g.level === 0).map(goal => 
                  renderGoalRow(goal as HierarchicalGoal)
                )}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Status Override Modal */}
        {overrideModal && (
          <StatusManager
            goal={overrideModal}
            onClose={() => setOverrideModal(null)}
            onSave={(status, reason) => {
              // TODO: Implement save logic
              console.log('Saving override:', status, reason);
              setOverrideModal(null);
            }}
          />
        )}
    </div>
  );
}