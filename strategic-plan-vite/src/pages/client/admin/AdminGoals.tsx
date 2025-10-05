import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MetricBuilderWizard } from '../../../components/MetricBuilderWizard';
import { SimpleGoalEdit } from '../../../components/SimpleGoalEdit';
import {
  ChevronDown,
  ChevronRight,
  Edit2,
  X,
  Trash2,
  AlertTriangle,
  BarChart3,
  Plus,
  CheckCircle,
  AlertCircle,
  XCircle,
  Clock
} from 'lucide-react';
import { useDistrict } from '../../../hooks/useDistricts';
import { useGoals } from '../../../hooks/useGoals';
import { useMetrics, useCreateMetric } from '../../../hooks/useMetrics';
import { GoalsService } from '../../../lib/services/goals.service';
import type { Goal, HierarchicalGoal } from '../../../lib/types';

export function AdminGoals() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { data: district } = useDistrict(slug!);
  const { data: goals, isLoading: loading, refetch } = useGoals(district?.id!);
  const { data: metrics, refetch: refetchMetrics } = useMetrics(district?.id!);
  const createMetricMutation = useCreateMetric();
  const [expandedGoals, setExpandedGoals] = useState<Set<string>>(new Set());
  const [metricWizardGoal, setMetricWizardGoal] = useState<Goal | null>(null);
  const [editGoalWizard, setEditGoalWizard] = useState<Goal | null>(null);
  const [deleteModal, setDeleteModal] = useState<Goal | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const toggleExpanded = (goalId: string) => {
    const newExpanded = new Set(expandedGoals);
    if (newExpanded.has(goalId)) {
      newExpanded.delete(goalId);
    } else {
      newExpanded.add(goalId);
    }
    setExpandedGoals(newExpanded);
  };

  const handleDelete = async (goal: Goal) => {
    if (!goal) return;

    setIsDeleting(true);
    try {
      await GoalsService.delete(goal.id);
      await refetch();
      setDeleteModal(null);
      alert('Objective deleted successfully');
    } catch (error) {
      console.error('Error deleting objective:', error);
      alert('Failed to delete objective. Please try again.');
    } finally {
      setIsDeleting(false);
    }
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
    const isObjective = level === 0;

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
        <tr className={`border-b hover:bg-muted/50 ${
          isObjective ? 'bg-blue-50/50' : level > 0 ? 'bg-muted/20' : ''
        }`}>
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
                <div className="flex items-center space-x-2">
                  <p className={`${isObjective ? 'font-bold text-lg' : 'font-medium'}`}>
                    {goal.goal_number} {goal.title}
                  </p>
                </div>
                {goal.description && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {goal.description}
                  </p>
                )}
              </div>
            </div>
          </td>

          <td className="py-3 px-4">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => isObjective
                  ? navigate(`/${slug}/admin/objectives/${goal.id}/edit`)
                  : setEditGoalWizard(goal)
                }
                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                title="Edit Goal"
              >
                <Edit2 className="h-4 w-4" />
              </button>
              {isObjective ? (
                <button
                  onClick={() => setDeleteModal(goal)}
                  className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                  title="Delete Objective"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              ) : (
                <button
                  onClick={() => setMetricWizardGoal(goal)}
                  className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center space-x-1"
                  title="Add Measure"
                >
                  <BarChart3 className="h-3 w-3" />
                  <span>Add Measure</span>
                </button>
              )}
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
    <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              Strategic Objectives & Goals
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1">
              Manage your strategic objectives and their goals
            </p>
          </div>
          <button
            onClick={() => navigate(`/${slug}/admin/objectives/new`)}
            className="flex items-center justify-center space-x-2 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm sm:text-base whitespace-nowrap"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Create Strategic Objective</span>
            <span className="sm:hidden">New Objective</span>
          </button>
        </div>

        {/* Goals Table - Desktop Only */}
        <div className="hidden md:block bg-card rounded-lg border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left py-3 px-4 font-medium">Strategic Objectives and Goals</th>
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

        {/* Goals Cards - Mobile Only */}
        <div className="md:hidden space-y-3">
          {goals?.filter(g => g.level === 0).map(goal => {
            const goalMetrics = metrics?.filter(m => m.goal_id === goal.id) || [];
            const hasChildren = goal.children && goal.children.length > 0;
            const isExpanded = expandedGoals.has(goal.id);

            return (
              <div key={goal.id} className="bg-white rounded-lg border border-border">
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {hasChildren && (
                          <button
                            onClick={() => toggleExpanded(goal.id)}
                            className="p-1 hover:bg-muted rounded flex-shrink-0"
                          >
                            {isExpanded ?
                              <ChevronDown className="h-4 w-4" /> :
                              <ChevronRight className="h-4 w-4" />
                            }
                          </button>
                        )}
                        <span className="inline-flex items-center justify-center px-2 py-0.5 rounded text-xs font-semibold bg-blue-100 text-blue-800">
                          {goal.goal_number}
                        </span>
                      </div>
                      <h3 className="font-semibold text-sm sm:text-base text-foreground line-clamp-2">
                        {goal.title}
                      </h3>
                    </div>
                    {getStatusIcon(goal.status)}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Status:</span>
                      {getStatusBadge(goal.status)}
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Metrics:</span>
                      <span className="font-medium">{goalMetrics.length || 0}</span>
                    </div>

                    {goal.overall_progress !== null && goal.overall_progress !== undefined && (
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Progress:</span>
                        <span className="font-medium">{Math.round(goal.overall_progress)}%</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
                    <button
                      onClick={() => navigate(`/${slug}/admin/objectives/${goal.id}/edit`)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-1.5 text-xs font-medium text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50 transition-colors"
                    >
                      <Edit2 className="h-3 w-3" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => setDeleteModal(goal)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-1.5 text-xs font-medium text-red-600 border border-red-600 rounded-md hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="h-3 w-3" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>

                {/* Child Goals */}
                {hasChildren && isExpanded && (
                  <div className="border-t border-border bg-muted/20">
                    {goal.children?.map((child: any) => (
                      <div key={child.id} className="p-3 border-b border-border last:border-b-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-medium text-muted-foreground">{child.goal_number}</span>
                              {getStatusBadge(child.status)}
                            </div>
                            <p className="text-sm text-foreground line-clamp-2">{child.title}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Delete Confirmation Modal */}
        {deleteModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
              {/* Header */}
              <div className="px-6 py-4 border-b border-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    <h2 className="text-xl font-bold text-foreground">Delete Objective</h2>
                  </div>
                  <button
                    onClick={() => setDeleteModal(null)}
                    className="p-1 hover:bg-muted rounded"
                    disabled={isDeleting}
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="px-6 py-4 space-y-4">
                {/* Danger Zone Warning */}
                <div className="p-4 bg-red-50 border-2 border-red-200 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-red-900">Danger Zone</h3>
                      <p className="text-sm text-red-800 mt-1">
                        This action cannot be undone. This will permanently delete the objective and all associated data.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Objective Details */}
                <div>
                  <p className="text-sm text-muted-foreground mb-2">You are about to delete:</p>
                  <div className="p-3 bg-muted/50 rounded border border-border">
                    <p className="font-semibold text-foreground">
                      {deleteModal.goal_number} {deleteModal.title}
                    </p>
                  </div>
                </div>

                {/* Cascade Warning */}
                <div className="space-y-2">
                  <p className="text-sm font-medium text-foreground">This will also delete:</p>
                  <ul className="text-sm text-muted-foreground space-y-1 pl-4">
                    <li className="flex items-center space-x-2">
                      <span className="w-1.5 h-1.5 bg-red-600 rounded-full"></span>
                      <span>All child goals under this objective</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <span className="w-1.5 h-1.5 bg-red-600 rounded-full"></span>
                      <span>All metrics associated with this objective and its goals</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <span className="w-1.5 h-1.5 bg-red-600 rounded-full"></span>
                      <span>All historical data and progress tracking</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Actions */}
              <div className="px-6 py-4 border-t border-border flex items-center justify-end space-x-3">
                <button
                  onClick={() => setDeleteModal(null)}
                  disabled={isDeleting}
                  className="px-4 py-2 text-sm font-medium text-foreground bg-white border border-border rounded-md hover:bg-muted/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteModal)}
                  disabled={isDeleting}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {isDeleting ? (
                    <>
                      <span className="animate-spin">⏳</span>
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4" />
                      <span>Delete Objective</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Metric Builder Wizard */}
        {metricWizardGoal && (
          <MetricBuilderWizard
            isOpen={!!metricWizardGoal}
            onClose={() => setMetricWizardGoal(null)}
            onSave={async (metricData) => {
              await createMetricMutation.mutateAsync(metricData);
              await refetchMetrics();
            }}
            goalId={metricWizardGoal.id}
            goalNumber={metricWizardGoal.goal_number || ''}
          />
        )}

        {/* Simple Goal Edit */}
        <SimpleGoalEdit
          goal={editGoalWizard}
          isOpen={!!editGoalWizard}
          onClose={() => setEditGoalWizard(null)}
          onSuccess={async () => {
            await refetch();
            setEditGoalWizard(null);
          }}
        />
    </div>
  );
}