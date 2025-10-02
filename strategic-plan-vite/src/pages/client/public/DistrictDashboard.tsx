import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDistrict } from '../../../hooks/useDistricts';
import { useGoals } from '../../../hooks/useGoals';
import { useMetrics } from '../../../hooks/useMetrics';
import { ChevronLeft, Target, Users, ChevronRight } from 'lucide-react';
import { SlidePanel } from '../../../components/SlidePanel';
import { OverallProgressBar } from '../../../components/OverallProgressBar';
import type { Goal } from '../../../lib/types';

export function DistrictDashboard() {
  const { slug } = useParams<{ slug: string }>();
  const { data: district, isLoading: districtLoading } = useDistrict(slug!);
  const { data: goals, isLoading: goalsLoading } = useGoals(district?.id || '');
  const { data: metrics, isLoading: metricsLoading } = useMetrics(district?.id || '');
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [showSlidePanel, setShowSlidePanel] = useState(false);

  const isLoading = districtLoading || goalsLoading || metricsLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading district data...</p>
        </div>
      </div>
    );
  }

  if (!district) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-muted-foreground">District not found</p>
          <Link to="/" className="mt-4 inline-flex items-center text-primary hover:underline">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to districts
          </Link>
        </div>
      </div>
    );
  }

  const statusColors = {
    'on-track': 'bg-green-100 text-green-800 border-green-200',
    'at-risk': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'critical': 'bg-red-100 text-red-800 border-red-200',
    'completed': 'bg-blue-100 text-blue-800 border-blue-200'
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8">

        {!goals || goals.length === 0 ? (
          <div className="text-center py-12">
            <Target className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-xl text-muted-foreground">No strategic goals available</p>
            <p className="text-sm text-muted-foreground mt-2">
              Strategic objectives are being developed
            </p>
          </div>
        ) : (
          <div className="space-y-8">

            {/* Goals Grid */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-semibold text-foreground">
                  Strategic Objectives
                </h2>
              </div>
              
              {/* Goals grid without drag and drop */}
              {true ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {goals.map((goal) => {
                  const status = goal.status || 'not-started';
                  
                  return (
                    <div
                      key={goal.id}
                      onClick={() => {
                        setSelectedGoal(goal);
                        setShowSlidePanel(true);
                      }}
                      className="bg-card rounded-lg border border-border p-6 hover:shadow-lg transition-all hover:border-primary/50 cursor-pointer"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <span className="text-sm font-medium text-muted-foreground">
                            Objective {goal.goal_number}
                          </span>
                          <h3 className="text-lg font-semibold text-card-foreground mt-1">
                            {goal.title}
                          </h3>
                        </div>
                      </div>

                      {goal.description && (
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                          {goal.description}
                        </p>
                      )}

                      {/* Overall Progress Bar - Only for Level 0 (Objectives) */}
                      {goal.level === 0 && (
                        <div className="mb-4">
                          <OverallProgressBar
                            goal={goal}
                            showLabel={true}
                            isAdmin={false}
                            onClick={undefined}
                          />
                        </div>
                      )}

                      {/* Status Badge - For Level 1 & 2 (Goals & Sub-goals) */}
                      {goal.level !== 0 && (
                        <div className="mb-4">
                          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium"
                            style={{
                              backgroundColor: status === 'on-target' ? '#10b981' :
                                             status === 'monitoring' ? '#f59e0b' :
                                             status === 'critical' ? '#ef4444' : '#6b7280',
                              color: 'white'
                            }}>
                            <span className="w-2 h-2 rounded-full bg-white/30" />
                            {status === 'on-target' ? 'On Target' :
                             status === 'monitoring' ? 'Monitoring' :
                             status === 'critical' ? 'Critical' :
                             status === 'off-target' ? 'Off Target' : 'Not Started'}
                          </div>
                        </div>
                      )}

                      <div className="w-full flex items-center justify-between text-sm">
                        <div className="flex items-center text-muted-foreground">
                          <Target className="h-4 w-4 mr-1" />
                          <span>{goal.children?.length || 0} sub-goals</span>
                        </div>
                      </div>

                      {goal.owner_name && (
                        <div className="mt-3 pt-3 border-t border-border">
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Users className="h-4 w-4 mr-1" />
                            <span>{goal.owner_name}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                  })}
                </div>
              ) : (
                <div>Loading...</div>
              )}
            </div>
          </div>
        )}

      {/* Slide Panel for Goal Details */}
      <SlidePanel
        isOpen={showSlidePanel}
        onClose={() => {
          setShowSlidePanel(false);
          setSelectedGoal(null);
        }}
        title={selectedGoal?.title || 'Objective Details'}
      >
        {selectedGoal && (
          <div className="h-full flex flex-col">
            {/* Header Section - Fixed */}
            <div className="p-6 border-b border-border space-y-4">
              <div>
                <h2 className="text-2xl font-bold text-foreground">{selectedGoal.title}</h2>
                {selectedGoal.description && (
                  <p className="text-muted-foreground mt-2">{selectedGoal.description}</p>
                )}
              </div>

              {/* Status Summary Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Overall Status</div>
                  <div className="text-lg font-semibold">On Track</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Sub-goals</div>
                  <div className="text-lg font-semibold">{selectedGoal.children?.length || 0}</div>
                </div>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Goals Overview Section */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Goals
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Track progress across all goals and measures within this strategic objective.
                </p>
              </div>

              {/* Goals List */}
              {selectedGoal.children && selectedGoal.children.length > 0 ? (
                <div className="space-y-3">
                  {selectedGoal.children.map((child: any, index: number) => (
                    <div key={child.id} className="bg-card border border-border rounded-lg p-4 hover:border-primary/50 transition-colors">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-semibold text-primary">
                            {child.goal_number}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-foreground mb-1">{child.title}</h4>
                          {child.description && (
                            <p className="text-sm text-muted-foreground mb-2">{child.description}</p>
                          )}
                          {child.metrics_count !== undefined && (
                            <div className="text-xs text-muted-foreground">
                              {child.metrics_count === 0 ? 'No metrics defined' : `${child.metrics_count} metric${child.metrics_count !== 1 ? 's' : ''}`}
                            </div>
                          )}
                        </div>
                        <div className="flex-shrink-0">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium"
                            style={{
                              backgroundColor: child.status === 'on-target' ? '#10b981' :
                                             child.status === 'monitoring' ? '#f59e0b' :
                                             child.status === 'critical' ? '#ef4444' :
                                             child.status === 'off-target' ? '#fb923c' : '#6b7280',
                              color: 'white'
                            }}>
                            <span className="w-1.5 h-1.5 rounded-full bg-white/40" />
                            {child.status === 'on-target' ? 'On Track' :
                             child.status === 'monitoring' ? 'Monitoring' :
                             child.status === 'critical' ? 'Critical' :
                             child.status === 'off-target' ? 'Off Track' : 'Not Started'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Target className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p className="font-medium">No goals defined yet</p>
                  <p className="text-sm mt-1">Goals will appear here once they are added to this objective.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </SlidePanel>
    </div>
  );
}