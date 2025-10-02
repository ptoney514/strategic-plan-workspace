import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDistrict } from '../../../hooks/useDistricts';
import { useGoals } from '../../../hooks/useGoals';
import { useMetrics } from '../../../hooks/useMetrics';
import { ChevronLeft, Target, Users, ChevronRight, Plus, BarChart2 } from 'lucide-react';
import { GoalActions } from '../../../components/GoalActions';
import { StatusSummary } from '../../../components/StatusSummary';
import { ObjectiveWizard } from '../../../components/ObjectiveWizard';
import { SlidePanel } from '../../../components/SlidePanel';
import { OverallProgressBar } from '../../../components/OverallProgressBar';
import { ProgressOverrideModal } from '../../../components/ProgressOverrideModal';
import { GoalEditWizard } from '../../../components/GoalEditWizard';
import { updateProgressOverride } from '../../../lib/services/progressService';
import { ToastContainer, useToast, toast } from '../../../components/Toast';
import type { Goal } from '../../../lib/types';

export function DistrictDashboard() {
  const { slug } = useParams<{ slug: string }>();
  const { data: district, isLoading: districtLoading } = useDistrict(slug!);
  const { data: goals, isLoading: goalsLoading, refetch: refetchGoals } = useGoals(district?.id || '');
  const { data: metrics, isLoading: metricsLoading } = useMetrics(district?.id || '');
  const [showObjectiveWizard, setShowObjectiveWizard] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [showSlidePanel, setShowSlidePanel] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [progressOverrideGoal, setProgressOverrideGoal] = useState<Goal | null>(null);
  const [isAdmin] = useState(true); // TODO: Replace with actual auth check
  const { messages, removeMessage } = useToast();

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
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-6">
          <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to districts
          </Link>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-card-foreground">
                {district.name}
              </h1>
              <p className="text-muted-foreground mt-1">
                Strategic Planning Dashboard
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{district.goalCount || 0}</div>
                  <div className="text-sm text-muted-foreground">Goals</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{district.metricCount || 0}</div>
                  <div className="text-sm text-muted-foreground">Metrics</div>
                </div>
              </div>
              <div className="flex gap-2">
                <Link
                  to={`/${slug}/metrics`}
                  className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition"
                >
                  <BarChart2 className="h-4 w-4" />
                  Metrics Dashboard
                </Link>
                {!editingGoal && (
                  <button
                    onClick={() => setShowObjectiveWizard(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition"
                  >
                    <Plus className="h-4 w-4" />
                    New Objective
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">

        {!goals || goals.length === 0 ? (
          <div className="text-center py-12">
            <Target className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-xl text-muted-foreground">No strategic goals yet</p>
            <p className="text-sm text-muted-foreground mt-2">
              Create your first strategic objective to get started
            </p>
            <button 
              onClick={() => setShowObjectiveWizard(true)}
              className="mt-6 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition">
              Create Strategic Objective
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Status Summary */}
            <StatusSummary goals={goals} metrics={metrics} />

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
                      className="bg-card rounded-lg border border-border p-6 hover:shadow-lg transition-all hover:border-primary/50"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <Link to={`/${slug}/goals/${goal.id}`} className="flex-1">
                          <div>
                            <span className="text-sm font-medium text-muted-foreground">
                              Objective {goal.goal_number}
                            </span>
                            <h3 className="text-lg font-semibold text-card-foreground mt-1">
                              {goal.title}
                            </h3>
                          </div>
                        </Link>
                        <div className="flex items-center gap-2">
                          {/* Status Badge - Only for Level 1 & 2 (Goals & Sub-goals) */}
                          {goal.level !== 0 && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium"
                              style={{
                                backgroundColor: status === 'on-target' ? '#10b98120' :
                                               status === 'monitoring' ? '#f59e0b20' :
                                               status === 'critical' ? '#ef444420' :
                                               status === 'off-target' ? '#fb923c20' : '#6b728020',
                                color: status === 'on-target' ? '#059669' :
                                      status === 'monitoring' ? '#d97706' :
                                      status === 'critical' ? '#dc2626' :
                                      status === 'off-target' ? '#ea580c' : '#4b5563'
                              }}>
                              <span className="w-1.5 h-1.5 rounded-full"
                                style={{
                                  backgroundColor: status === 'on-target' ? '#059669' :
                                                  status === 'monitoring' ? '#d97706' :
                                                  status === 'critical' ? '#dc2626' :
                                                  status === 'off-target' ? '#ea580c' : '#4b5563'
                                }} />
                              {status === 'on-target' ? 'On Target' :
                               status === 'monitoring' ? 'Monitoring' :
                               status === 'critical' ? 'Critical' :
                               status === 'off-target' ? 'Off Target' : 'Not Started'}
                            </span>
                          )}
                          <GoalActions
                            goal={goal}
                            onEdit={() => {
                              setEditingGoal(goal);
                              setShowEditModal(true);
                            }}
                            onAddChild={() => {
                              // Navigate to goal detail page to add child
                              window.location.href = `/${slug}/goals/${goal.id}`;
                            }}
                            canAddChild={goal.level < 2}
                          />
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
                            isAdmin={isAdmin}
                            onClick={isAdmin ? () => setProgressOverrideGoal(goal) : undefined}
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

                      <button 
                        onClick={() => {
                          setSelectedGoal(goal);
                          setShowSlidePanel(true);
                        }}
                        className="w-full flex items-center justify-between text-sm hover:bg-gray-50 rounded-lg p-2 -m-2 transition-colors"
                      >
                        <div className="flex items-center text-muted-foreground">
                          <Target className="h-4 w-4 mr-1" />
                          <span>{goal.children?.length || 0} sub-goals</span>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </button>

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
      </main>
      
      <ObjectiveWizard
        isOpen={showObjectiveWizard}
        onClose={() => {
          setShowObjectiveWizard(false);
        }}
        districtId={district.id}
        existingObjective={null}
        onComplete={async (objectiveData) => {
          console.log('Creating objective:', objectiveData);
          // TODO: Implement API call to create/update objective and goals
          setShowObjectiveWizard(false);
          refetchGoals();
        }}
      />
      
      {/* Progress Override Modal */}
      {progressOverrideGoal && (
        <ProgressOverrideModal
          goal={progressOverrideGoal}
          isOpen={!!progressOverrideGoal}
          onClose={() => setProgressOverrideGoal(null)}
          onSave={async (overrideValue, displayMode, reason) => {
            try {
              await updateProgressOverride(progressOverrideGoal.id, {
                overrideValue,
                displayMode,
                reason,
                userId: undefined // TODO: Get from auth context
              });
              await refetchGoals();

              if (overrideValue !== null) {
                toast.success('Progress override saved successfully');
              } else {
                toast.success('Progress override cleared successfully');
              }
            } catch (error) {
              toast.error(error instanceof Error ? error.message : 'Failed to update progress');
              throw error; // Re-throw so modal can handle it
            }
          }}
        />
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
          <div className="p-6 space-y-6">
            {/* Header Section */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground">
                  Objective {selectedGoal.goal_number}
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium"
                  style={{
                    backgroundColor: selectedGoal.status === 'on-target' ? '#10b98120' : 
                                   selectedGoal.status === 'monitoring' ? '#f59e0b20' :
                                   selectedGoal.status === 'critical' ? '#ef444420' :
                                   selectedGoal.status === 'off-target' ? '#fb923c20' : '#6b728020',
                    color: selectedGoal.status === 'on-target' ? '#059669' : 
                          selectedGoal.status === 'monitoring' ? '#d97706' :
                          selectedGoal.status === 'critical' ? '#dc2626' :
                          selectedGoal.status === 'off-target' ? '#ea580c' : '#4b5563'
                  }}>
                  <span className="w-1.5 h-1.5 rounded-full"
                    style={{
                      backgroundColor: selectedGoal.status === 'on-target' ? '#059669' : 
                                      selectedGoal.status === 'monitoring' ? '#d97706' :
                                      selectedGoal.status === 'critical' ? '#dc2626' :
                                      selectedGoal.status === 'off-target' ? '#ea580c' : '#4b5563'
                    }} />
                  {selectedGoal.status === 'on-target' ? 'On Target' :
                   selectedGoal.status === 'monitoring' ? 'Monitoring' :
                   selectedGoal.status === 'critical' ? 'Critical' :
                   selectedGoal.status === 'off-target' ? 'Off Target' : 'Not Started'}
                </span>
              </div>
              <h2 className="text-2xl font-semibold">{selectedGoal.title}</h2>
              {selectedGoal.description && (
                <p className="text-muted-foreground">{selectedGoal.description}</p>
              )}
            </div>
            
            {/* Owner Section */}
            {selectedGoal.owner_name && (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Owner</p>
                    <p className="text-sm text-muted-foreground">{selectedGoal.owner_name}</p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Sub-goals Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Sub-goals</h3>
                <span className="text-sm text-muted-foreground">
                  {selectedGoal.children?.length || 0} total
                </span>
              </div>
              
              {selectedGoal.children && selectedGoal.children.length > 0 ? (
                <div className="space-y-3">
                  {selectedGoal.children.map((child: any) => (
                    <div key={child.id} className="bg-card border border-border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium text-muted-foreground">
                              Goal {child.goal_number}
                            </span>
                          </div>
                          <h4 className="font-medium">{child.title}</h4>
                          {child.description && (
                            <p className="text-sm text-muted-foreground mt-1">{child.description}</p>
                          )}
                        </div>
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium"
                          style={{
                            backgroundColor: child.status === 'on-target' ? '#10b98120' : 
                                           child.status === 'monitoring' ? '#f59e0b20' :
                                           child.status === 'critical' ? '#ef444420' : '#6b728020',
                            color: child.status === 'on-target' ? '#059669' : 
                                  child.status === 'monitoring' ? '#d97706' :
                                  child.status === 'critical' ? '#dc2626' : '#4b5563'
                          }}>
                          {child.status === 'on-target' ? 'On Target' :
                           child.status === 'monitoring' ? 'Monitoring' :
                           child.status === 'critical' ? 'Critical' : 'Not Started'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Target className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>No sub-goals defined yet</p>
                </div>
              )}
            </div>
            
            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-border">
              <Link 
                to={`/${slug}/goals/${selectedGoal.id}`}
                className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition text-center"
              >
                View Full Details
              </Link>
              <button
                onClick={() => {
                  setEditingGoal(selectedGoal);
                  setShowSlidePanel(false);
                  setShowEditModal(true);
                }}
                className="flex-1 px-4 py-2 border border-input rounded-lg hover:bg-gray-50 transition"
              >
                Edit Objective
              </button>
            </div>
          </div>
        )}
      </SlidePanel>

      {/* Goal Edit Wizard */}
      <GoalEditWizard
        goal={editingGoal}
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingGoal(null);
        }}
        onSuccess={() => {
          refetchGoals();
        }}
      />

      {/* Toast Notifications */}
      <ToastContainer messages={messages} onClose={removeMessage} />
    </div>
  );
}