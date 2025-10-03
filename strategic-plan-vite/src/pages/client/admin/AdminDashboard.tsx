import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Target,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  BarChart3,
  FileText,
  Upload,
  RefreshCw
} from 'lucide-react';
import { useDistrict } from '../../../hooks/useDistricts';
import { useGoals } from '../../../hooks/useGoals';
import { useMetrics } from '../../../hooks/useMetrics';
import { recalculateDistrictProgress } from '../../../lib/services/progressService';
import { ToastContainer, useToast, toast } from '../../../components/Toast';

export function AdminDashboard() {
  const { slug } = useParams();
  const { data: district } = useDistrict(slug!);
  const { data: goals, refetch: refetchGoals } = useGoals(district?.id || '');
  const { data: metrics } = useMetrics(district?.id || '');
  const [isRecalculating, setIsRecalculating] = useState(false);
  const { messages, removeMessage } = useToast();
  
  // Calculate status summary
  const statusSummary = goals?.reduce((acc, goal) => {
    const status = goal.status || 'not-started';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};
  
  // Calculate metrics needing updates
  const metricsNeedingUpdates = metrics?.filter(m => {
    if (!m.last_actual_period) return true;
    const lastUpdate = new Date(m.last_actual_period);
    const daysSinceUpdate = (Date.now() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24);
    return daysSinceUpdate > 30;
  }).length || 0;

  // Handle batch recalculation
  const handleRecalculateProgress = async () => {
    if (!district?.id) return;

    setIsRecalculating(true);
    try {
      await recalculateDistrictProgress(district.id);
      await refetchGoals();
      toast.success('Progress recalculated successfully for all goals');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to recalculate progress');
    } finally {
      setIsRecalculating(false);
    }
  };
  
  const statusCards = [
    {
      label: 'On Target',
      count: statusSummary['on-target'] || 0,
      icon: CheckCircle,
      color: 'text-green-600 bg-green-50',
      borderColor: 'border-green-200'
    },
    {
      label: 'At Risk',
      count: statusSummary['at-risk'] || 0,
      icon: AlertCircle,
      color: 'text-yellow-600 bg-yellow-50',
      borderColor: 'border-yellow-200'
    },
    {
      label: 'Critical',
      count: statusSummary['critical'] || 0,
      icon: AlertCircle,
      color: 'text-red-600 bg-red-50',
      borderColor: 'border-red-200'
    },
    {
      label: 'Not Started',
      count: statusSummary['not-started'] || 0,
      icon: Clock,
      color: 'text-gray-600 bg-gray-50',
      borderColor: 'border-gray-200'
    }
  ];
  
  const quickActions = [
    {
      title: 'Create Strategic Objective',
      description: 'Build a new objective visually',
      icon: Target,
      link: `/${slug}/admin/objectives/new`,
      color: 'bg-indigo-500'
    },
    {
      title: 'Review Goals',
      description: 'Quarterly status review',
      icon: Target,
      link: `/${slug}/admin/goals`,
      color: 'bg-purple-500'
    },
    {
      title: 'Update Metrics',
      description: `${metricsNeedingUpdates} metrics need updating`,
      icon: BarChart3,
      link: `/${slug}/admin/metrics`,
      color: 'bg-blue-500'
    },
    {
      title: 'View Audit Trail',
      description: 'Recent changes',
      icon: FileText,
      link: `/${slug}/admin/audit`,
      color: 'bg-orange-500'
    }
  ];
  
  return (
    <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            {district?.name} Strategic Plan Management
          </p>
        </div>
        
        {/* Status Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {statusCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.label}
                className={`p-4 rounded-lg border ${card.borderColor} ${card.color}`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium opacity-75">
                      {card.label}
                    </p>
                    <p className="text-2xl font-bold mt-1">
                      {card.count}
                    </p>
                  </div>
                  <Icon className="h-8 w-8 opacity-50" />
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Quick Actions */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.title}
                  to={action.link}
                  className="p-4 bg-card rounded-lg border border-border hover:shadow-md transition-shadow"
                >
                  <div className={`inline-flex p-3 rounded-lg ${action.color} text-white mb-3`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-semibold text-foreground">
                    {action.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {action.description}
                  </p>
                </Link>
              );
            })}

            {/* Recalculate Progress Button */}
            <button
              onClick={handleRecalculateProgress}
              disabled={isRecalculating || !district}
              className="p-4 bg-card rounded-lg border border-border hover:shadow-md transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="inline-flex p-3 rounded-lg bg-indigo-500 text-white mb-3">
                <RefreshCw className={`h-6 w-6 ${isRecalculating ? 'animate-spin' : ''}`} />
              </div>
              <h3 className="font-semibold text-foreground">
                {isRecalculating ? 'Recalculating...' : 'Recalculate Progress'}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Update all goal progress values
              </p>
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Goals Needing Attention */}
          <div className="bg-card rounded-lg border border-border p-6">
            <h3 className="font-semibold mb-4 flex items-center">
              <AlertCircle className="h-5 w-5 mr-2 text-yellow-600" />
              Goals Needing Attention
            </h3>
            <div className="space-y-3">
              {goals?.filter(g => g.status === 'critical' || g.status === 'at-risk')
                .slice(0, 5)
                .map(goal => (
                  <div key={goal.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{goal.goal_number} {goal.title}</p>
                      <p className="text-sm text-muted-foreground">
                        Status: {goal.status}
                      </p>
                    </div>
                    <Link
                      to={`/${slug}/admin/goals?id=${goal.id}`}
                      className="text-sm text-primary hover:underline"
                    >
                      Review
                    </Link>
                  </div>
                )) || (
                <p className="text-muted-foreground">No critical goals</p>
              )}
            </div>
          </div>
          
          {/* Metrics Updates Due */}
          <div className="bg-card rounded-lg border border-border p-6">
            <h3 className="font-semibold mb-4 flex items-center">
              <Clock className="h-5 w-5 mr-2 text-blue-600" />
              Metrics Updates Due
            </h3>
            <div className="space-y-3">
              {metrics?.filter(m => {
                  if (!m.last_actual_period) return true;
                  const lastUpdate = new Date(m.last_actual_period);
                  const daysSinceUpdate = (Date.now() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24);
                  return daysSinceUpdate > 30;
                })
                .slice(0, 5)
                .map(metric => (
                  <div key={metric.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{metric.name || metric.metric_name}</p>
                      <p className="text-sm text-muted-foreground">
                        Last updated: {metric.last_actual_period || 'Never'}
                      </p>
                    </div>
                    <Link
                      to={`/${slug}/admin/metrics?id=${metric.id}`}
                      className="text-sm text-primary hover:underline"
                    >
                      Update
                    </Link>
                  </div>
                )) || (
                <p className="text-muted-foreground">All metrics up to date</p>
              )}
            </div>
          </div>
        </div>
        
        {/* Data Health Indicators */}
        <div className="bg-card rounded-lg border border-border p-6">
          <h3 className="font-semibold mb-4">Data Health</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Data Completeness</p>
              <div className="mt-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-2xl font-bold">
                    {metrics?.length ? Math.round((metrics.filter(m => m.current_value).length / metrics.length) * 100) : 0}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full"
                    style={{ 
                      width: `${metrics?.length ? (metrics.filter(m => m.current_value).length / metrics.length) * 100 : 0}%` 
                    }}
                  />
                </div>
              </div>
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground">Status Overrides</p>
              <div className="mt-2">
                <p className="text-2xl font-bold">
                  {goals?.filter(g => g.status_source === 'manual').length || 0}
                </p>
                <p className="text-xs text-muted-foreground">
                  Manual status overrides active
                </p>
              </div>
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground">Last Import</p>
              <div className="mt-2">
                <p className="text-2xl font-bold">3 days</p>
                <p className="text-xs text-muted-foreground">
                  Since last bulk import
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Toast Notifications */}
        <ToastContainer messages={messages} onClose={removeMessage} />
      </div>
  );
}