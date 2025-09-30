'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { MilestoneConfig } from '@/lib/metric-visualizations';
import { Calendar, CheckCircle2, AlertCircle, Clock, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

interface MilestoneTrackerProps {
  config: MilestoneConfig;
  className?: string;
}

export function MilestoneTracker({ config, className }: MilestoneTrackerProps) {
  const {
    milestones,
    currentDate = new Date(),
    showTimeline = true,
    showPercentComplete = true,
    timelineView = 'list'
  } = config;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'on-track':
        return <Clock className="w-5 h-5 text-blue-500" />;
      case 'at-risk':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'overdue':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'on-track':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'at-risk':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'overdue':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getDaysUntilDue = (dueDate: Date) => {
    const diff = new Date(dueDate).getTime() - currentDate.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days;
  };

  const overallProgress = React.useMemo(() => {
    const completed = milestones.filter(m => m.status === 'completed').length;
    return (completed / milestones.length) * 100;
  }, [milestones]);

  if (timelineView === 'gantt') {
    return (
      <Card className={cn("p-6", className)}>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Milestone Timeline</h3>
            {showPercentComplete && (
              <span className="text-sm text-gray-500">
                {overallProgress.toFixed(0)}% Complete
              </span>
            )}
          </div>

          <div className="relative">
            <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gray-200" />
            
            {milestones.map((milestone, index) => (
              <div key={milestone.id} className="relative pl-8 pb-8">
                <div
                  className={cn(
                    "absolute left-0 w-4 h-4 rounded-full border-2 bg-white",
                    milestone.status === 'completed' ? 'border-green-500 bg-green-500' : 'border-gray-300'
                  )}
                  style={{ top: '6px', left: '-7px' }}
                />
                
                <div className={cn(
                  "p-4 rounded-lg border",
                  getStatusColor(milestone.status)
                )}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(milestone.status)}
                        <h4 className="font-medium">{milestone.name}</h4>
                      </div>
                      
                      <div className="mt-2 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>Due: {formatDate(milestone.dueDate)}</span>
                          {milestone.completedDate && (
                            <span className="text-green-600">
                              (Completed: {formatDate(milestone.completedDate)})
                            </span>
                          )}
                        </div>
                      </div>

                      {milestone.progress !== undefined && (
                        <div className="mt-3">
                          <div className="flex justify-between text-sm mb-1">
                            <span>Progress</span>
                            <span>{milestone.progress}%</span>
                          </div>
                          <Progress value={milestone.progress} className="h-2" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className={cn("p-6", className)}>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Milestones</h3>
          {showPercentComplete && (
            <div className="text-right">
              <div className="text-2xl font-bold">{overallProgress.toFixed(0)}%</div>
              <div className="text-sm text-gray-500">Complete</div>
            </div>
          )}
        </div>

        {showPercentComplete && (
          <Progress value={overallProgress} className="h-3" />
        )}

        <div className="space-y-3">
          {milestones.map((milestone) => {
            const daysUntil = getDaysUntilDue(milestone.dueDate);
            
            return (
              <div
                key={milestone.id}
                className={cn(
                  "p-4 rounded-lg border transition-all hover:shadow-md",
                  getStatusColor(milestone.status)
                )}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    {getStatusIcon(milestone.status)}
                    <div>
                      <h4 className="font-medium">{milestone.name}</h4>
                      <div className="mt-1 text-sm space-y-1">
                        <div className="flex items-center gap-4">
                          <span className="text-gray-600">
                            Due: {formatDate(milestone.dueDate)}
                          </span>
                          {milestone.status !== 'completed' && (
                            <span className={cn(
                              "font-medium",
                              daysUntil > 30 ? "text-green-600" :
                              daysUntil > 7 ? "text-yellow-600" :
                              daysUntil >= 0 ? "text-orange-600" :
                              "text-red-600"
                            )}>
                              {daysUntil >= 0
                                ? `${daysUntil} days remaining`
                                : `${Math.abs(daysUntil)} days overdue`}
                            </span>
                          )}
                          {milestone.completedDate && (
                            <span className="text-green-600">
                              Completed: {formatDate(milestone.completedDate)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {milestone.progress !== undefined && milestone.status !== 'completed' && (
                    <div className="text-right">
                      <div className="text-2xl font-semibold">
                        {milestone.progress}%
                      </div>
                      <div className="text-xs text-gray-500">Progress</div>
                    </div>
                  )}
                </div>

                {milestone.progress !== undefined && milestone.status !== 'completed' && (
                  <div className="mt-3">
                    <Progress value={milestone.progress} className="h-2" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex items-center gap-4 text-xs text-gray-500 pt-2 border-t">
          <div className="flex items-center gap-1">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            <span>Completed</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4 text-blue-500" />
            <span>On Track</span>
          </div>
          <div className="flex items-center gap-1">
            <AlertCircle className="w-4 h-4 text-yellow-500" />
            <span>At Risk</span>
          </div>
          <div className="flex items-center gap-1">
            <XCircle className="w-4 h-4 text-red-500" />
            <span>Overdue</span>
          </div>
        </div>
      </div>
    </Card>
  );
}