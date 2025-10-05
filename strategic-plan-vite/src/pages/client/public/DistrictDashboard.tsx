import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDistrict } from '../../../hooks/useDistricts';
import { useGoals } from '../../../hooks/useGoals';
import { useMetrics } from '../../../hooks/useMetrics';
import {
  GraduationCap,
  Target,
  BarChart3,
  ArrowRight,
  BookOpen,
  Star,
  Users,
  HandCoins,
  Megaphone
} from 'lucide-react';
import { SlidePanel } from '../../../components/SlidePanel';
import { PerformanceIndicator } from '../../../components/PerformanceIndicator';
import { AnnualProgressChart } from '../../../components/AnnualProgressChart';
import { GoalNarrativeDetail } from '../../../components/GoalNarrativeDetail';
import type { Goal } from '../../../lib/types';
import { getProgressColor } from '../../../lib/types';

export function DistrictDashboard() {
  const { slug } = useParams<{ slug: string }>();
  const { data: district, isLoading: districtLoading } = useDistrict(slug!);
  const { data: goals, isLoading: goalsLoading } = useGoals(district?.id || '');
  const { isLoading: metricsLoading } = useMetrics(district?.id || '');
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [showSlidePanel, setShowSlidePanel] = useState(false);
  const [expandedGoalId, setExpandedGoalId] = useState<string | null>(null);
  const [expandedSubGoalId, setExpandedSubGoalId] = useState<string | null>(null);

  const isLoading = districtLoading || goalsLoading || metricsLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neutral-900 mx-auto"></div>
          <p className="mt-4 text-neutral-600">Loading district data...</p>
        </div>
      </div>
    );
  }

  if (!district) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-neutral-600">District not found</p>
          <Link to="/" className="mt-4 inline-flex items-center text-neutral-900 hover:underline">
            Back to districts
          </Link>
        </div>
      </div>
    );
  }

  // Get top-level objectives (level 0)
  const objectives = goals?.filter(g => g.level === 0) || [];

  // Icon gradients for cards
  const cardStyles = [
    { from: 'from-emerald-500', to: 'to-emerald-600', bg: 'bg-emerald-50', text: 'text-emerald-700', ring: 'ring-emerald-200' },
    { from: 'from-sky-500', to: 'to-indigo-600', bg: 'bg-neutral-50', text: 'text-neutral-700', ring: 'ring-neutral-200' },
    { from: 'from-fuchsia-500', to: 'to-rose-600', bg: 'bg-neutral-50', text: 'text-neutral-700', ring: 'ring-neutral-200' },
    { from: 'from-amber-500', to: 'to-orange-600', bg: 'bg-neutral-50', text: 'text-neutral-700', ring: 'ring-neutral-200' },
    { from: 'from-violet-500', to: 'to-purple-600', bg: 'bg-neutral-50', text: 'text-neutral-700', ring: 'ring-neutral-200' },
    { from: 'from-cyan-500', to: 'to-blue-600', bg: 'bg-neutral-50', text: 'text-neutral-700', ring: 'ring-neutral-200' },
  ];

  return (
    <div className="min-h-full antialiased text-neutral-800 bg-neutral-50">

      {/* Hero */}
      <section className="relative overflow-hidden bg-white py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-6 md:px-8 text-center">
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-neutral-900">
            {district.name}
            <br />
            <span className="text-red-600">Strategic Plan 2021-2026</span>
          </h1>
          <p className="mt-6 text-base md:text-lg text-neutral-600 max-w-3xl mx-auto">
            Community. Innovation. Excellence. - Charting our course for educational excellence through strategic pillars that guide our commitment to student success
          </p>
        </div>
      </section>

      {/* Objectives Grid */}
      <section className="max-w-7xl mx-auto px-6 md:px-8 pb-12 md:pb-16">
        {!objectives || objectives.length === 0 ? (
          <div className="text-center py-12">
            <Target className="h-16 w-16 text-neutral-400 mx-auto mb-4" />
            <p className="text-xl text-neutral-600">No strategic goals available</p>
            <p className="text-sm text-neutral-500 mt-2">
              Strategic objectives are being developed
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {objectives.map((goal, index) => {
              const style = cardStyles[index % cardStyles.length];
              const subGoalsCount = goal.children?.length || 0;
              const progress = goal.overall_progress_override ?? goal.overall_progress ?? 0;
              const progressColor = getProgressColor(progress);

              return (
                <article
                  key={goal.id}
                  onClick={() => {
                    setSelectedGoal(goal);
                    setShowSlidePanel(true);
                  }}
                  className="group relative rounded-2xl bg-white ring-1 ring-neutral-200 hover:ring-neutral-300 transition-all shadow-sm hover:shadow-md cursor-pointer overflow-hidden"
                >
                  {/* Header Visual - Image or Color */}
                  {(goal.image_url || goal.header_color) && (
                    <div className="h-32 w-full relative">
                      {goal.image_url ? (
                        <img
                          src={goal.image_url}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : goal.header_color ? (
                        <div
                          className="w-full h-full"
                          style={{ backgroundColor: goal.header_color }}
                        />
                      ) : null}
                    </div>
                  )}

                  <div className="pointer-events-none absolute -top-6 -right-6 h-28 w-28 rounded-full bg-gradient-to-br from-emerald-400/30 via-sky-400/30 to-indigo-500/30 blur-2xl"></div>
                  <div className="p-5 md:p-6">
                    <div className="flex items-start justify-between">
                      <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${style.from} ${style.to} text-white flex items-center justify-center shadow-sm`}>
                        {index === 0 ? <GraduationCap className="h-5 w-5" /> :
                         index === 1 ? <BarChart3 className="h-5 w-5" /> :
                         <BookOpen className="h-5 w-5" />}
                      </div>
                      {goal.indicator_text && (
                        <span
                          className="inline-flex items-center gap-1.5 rounded-full text-xs font-medium px-2.5 py-1"
                          style={{
                            backgroundColor: goal.indicator_color || '#10b981',
                            color: '#ffffff'
                          }}
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-white/80"></span>
                          {goal.indicator_text}
                        </span>
                      )}
                    </div>
                    <h3 className="mt-4 text-xl md:text-2xl font-semibold tracking-tight text-neutral-900">
                      {goal.title}
                    </h3>
                    <p className="mt-3 text-neutral-600 text-sm md:text-base line-clamp-3">
                      {goal.description || 'Strategic initiatives focused on this objective'}
                    </p>

                    {/* Goal overall progress label - Only show if progress bar is enabled */}
                    {goal.show_progress_bar !== false && (
                      <div className="mt-5 flex items-center gap-4 text-sm text-neutral-600">
                        <div className="inline-flex items-center gap-1.5">
                          <Target className="h-4 w-4 text-neutral-400" />
                          <span>Goal overall progress</span>
                        </div>
                      </div>
                    )}

                    {/* Progress Bar - Only show if enabled */}
                    {goal.show_progress_bar !== false && (
                      <div className="mt-5">
                        <div className="relative">
                          <div className="w-full bg-secondary rounded-full h-3 overflow-hidden shadow-inner">
                            <div
                              className="h-full transition-all duration-700 ease-out relative"
                              style={{
                                width: `${Math.min(Math.max(progress, 0), 100)}%`,
                                background: `linear-gradient(90deg, ${progressColor}, ${progressColor}dd)`,
                                boxShadow: `0 0 8px ${progressColor}40`
                              }}
                            >
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20" />
                            </div>
                          </div>
                        </div>
                        <div className="mt-2 text-right">
                          <span
                            className="text-sm font-bold"
                            style={{
                              color: progressColor,
                              textShadow: `0 1px 2px ${progressColor}20`
                            }}
                          >
                            {Math.round(progress)}%
                          </span>
                        </div>
                      </div>
                    )}
                    {/* Spacer to maintain uniform card height when progress bar is hidden */}
                    {goal.show_progress_bar === false && (
                      <div className="mt-5 h-[84px]" aria-hidden="true" />
                    )}
                  </div>
                  <div className="px-5 md:px-6 pb-5 md:pb-6">
                    <button className="inline-flex items-center gap-2 text-sm font-medium text-neutral-800 hover:text-neutral-900">
                      Annual progress click here
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* Success Story */}
      <section className="max-w-7xl mx-auto px-6 md:px-8 pb-12 md:pb-20">
        <div className="relative overflow-hidden rounded-3xl ring-1 ring-neutral-200 bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 text-white shadow-[0_10px_35px_-10px_rgba(79,70,229,0.35)]">
          <div className="absolute inset-0">
            <img
              src="https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=1600&auto=format&fit=crop"
              alt=""
              className="absolute right-0 top-0 h-full w-[60%] object-cover opacity-10 hidden sm:block"
            />
          </div>
          <div className="relative p-6 md:p-10">
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-amber-300" />
              <span className="text-sm font-medium">Success Story</span>
            </div>
            <h3 className="mt-3 text-2xl md:text-4xl font-semibold tracking-tight">
              Emma's Reading Journey
            </h3>
            <p className="mt-4 max-w-3xl text-white/90 text-base md:text-lg">
              "Six months ago, Emma struggled with reading. Thanks to our new reading specialists and personalized support, she's now reading above grade level and loves picking out books at the library!"
            </p>
            <div className="mt-6 flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-white/20 backdrop-blur ring-1 ring-white/30 flex items-center justify-center font-medium">SJ</div>
              <div>
                <div className="text-sm font-medium">Sarah Johnson</div>
                <div className="text-sm text-white/80">Emma's Mom, Grade 2</div>
              </div>
            </div>
            <BookOpen className="absolute right-6 bottom-6 md:right-8 md:bottom-8 h-16 w-16 md:h-24 md:w-24 text-white/25" />
          </div>
        </div>
      </section>

      {/* How You Can Help */}
      <section className="max-w-7xl mx-auto px-6 md:px-8 pb-16 md:pb-24">
        <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-neutral-900">How You Can Help</h2>
        <p className="mt-2 text-neutral-600">Join families, educators, and partners to strengthen each objective.</p>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Help card 1 */}
          <div className="rounded-2xl bg-white ring-1 ring-neutral-200 hover:ring-neutral-300 transition-shadow shadow-sm hover:shadow-md overflow-hidden">
            <div className="aspect-[16/9] overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1517520287167-4bbf64a00d66?q=80&w=1600&auto=format&fit=crop"
                alt=""
                className="h-full w-full object-cover"
              />
            </div>
            <div className="p-5">
              <div className="inline-flex items-center gap-2 text-sm font-medium text-neutral-700">
                <Users className="h-4 w-4 text-emerald-600" />
                Volunteer &amp; Mentor
              </div>
              <p className="mt-2 text-sm text-neutral-600">
                Support tutoring, after‑school clubs, and wellness programs.
              </p>
              <button className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-neutral-800">
                Get involved
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Help card 2 */}
          <div className="rounded-2xl bg-white ring-1 ring-neutral-200 hover:ring-neutral-300 transition-shadow shadow-sm hover:shadow-md overflow-hidden">
            <div className="aspect-[16/9] overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1516979187457-637abb4f9353?q=80&w=1600&auto=format&fit=crop"
                alt=""
                className="h-full w-full object-cover"
              />
            </div>
            <div className="p-5">
              <div className="inline-flex items-center gap-2 text-sm font-medium text-neutral-700">
                <HandCoins className="h-4 w-4 text-indigo-600" />
                Fund Classroom Needs
              </div>
              <p className="mt-2 text-sm text-neutral-600">
                Provide books, technology, and program resources.
              </p>
              <button className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-neutral-800">
                See priorities
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Help card 3 */}
          <div className="rounded-2xl bg-white ring-1 ring-neutral-200 hover:ring-neutral-300 transition-shadow shadow-sm hover:shadow-md overflow-hidden">
            <div className="aspect-[16/9] overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=1600&auto=format&fit=crop"
                alt=""
                className="h-full w-full object-cover"
              />
            </div>
            <div className="p-5">
              <div className="inline-flex items-center gap-2 text-sm font-medium text-neutral-700">
                <Megaphone className="h-4 w-4 text-rose-600" />
                Share Your Story
              </div>
              <p className="mt-2 text-sm text-neutral-600">
                Celebrate wins like Emma's—and inspire others to join.
              </p>
              <button className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-neutral-800">
                Submit a story
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

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
            <div className="p-6 border-b border-neutral-200 space-y-4">
              {/* Description */}
              <div>
                <p className="text-neutral-600 text-sm leading-relaxed">
                  {selectedGoal.description || 'Strategic initiatives focused on this objective'}
                </p>
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
                <p className="text-sm text-neutral-600 mb-4">
                  Track progress across all goals and measures within this strategic objective.
                </p>
              </div>

              {/* Goals List */}
              {selectedGoal.children && selectedGoal.children.length > 0 ? (
                <div className="space-y-4">
                  {selectedGoal.children.map((child: any, index: number) => {
                    const childProgress = child.overall_progress_override ?? child.overall_progress ?? 0;
                    const isExpanded = expandedGoalId === child.id;

                    // Mock data for demonstration - will be replaced with real data from backend
                    const mockChartData = index === 0 ? [
                      { year: '2021', value: 3.96, target: 4.0 },
                      { year: '2022', value: 2.76, target: 4.0 },
                      { year: '2023', value: 3.92, target: 4.0 },
                      { year: '2024', value: 2.28, target: 4.0 }
                    ] : null;

                    const mockNarrative = index === 1 ? {
                      summary: "The Department of Education ranks schools based on State testing of Needs Improvement, Good, Great, and Excellent. The district has received a marking of Great the last three years. This past year, the district missed excellent, by .06 overall.",
                      highlights: [
                        "District received 'Great' classification for the third consecutive year",
                        "Composite scores developed from Math, ELA, and Science proficiency",
                        "Student assessments in grades 3-8 and 11th grade",
                        "Missed 'Excellent' rating by only 0.06 points"
                      ],
                      links: [
                        {
                          label: "Compare district scores to state average",
                          url: "#"
                        }
                      ],
                      dataSource: "Nebraska Department of Education District Classification"
                    } : null;

                    return (
                      <div key={child.id} className="bg-white border border-neutral-200 rounded-lg overflow-hidden transition-all">
                        <div className="p-5">
                          <div className="flex items-start gap-3 mb-4">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center">
                              <span className="text-sm font-semibold text-neutral-900">
                                {child.goal_number}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-neutral-900 mb-1">{child.title}</h4>
                              {child.description && !isExpanded && (
                                <p className="text-sm text-neutral-600 mb-2">{child.description}</p>
                              )}
                            </div>
                            <div className="flex-shrink-0">
                              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                On Track
                              </span>
                            </div>
                          </div>

                          {/* Performance Indicator */}
                          <PerformanceIndicator
                            progress={childProgress}
                            displayMode={child.overall_progress_display_mode || 'qualitative'}
                            customValue={child.overall_progress_custom_value}
                            showLabels={true}
                            onClick={() => {
                              setExpandedGoalId(isExpanded ? null : child.id);
                            }}
                          />
                        </div>

                        {/* Expanded Detail Section */}
                        {isExpanded && (
                          <div className="border-t border-neutral-200 p-5 bg-neutral-50 animate-in slide-in-from-top duration-300">
                            <div className="space-y-4">
                              {/* Primary metrics/charts for this goal */}
                              {mockChartData ? (
                                <AnnualProgressChart
                                  data={mockChartData}
                                  title="Annual Progress"
                                  description="Survey data showing year-over-year trends. The annual tracking increases each year shown are committed to..."
                                  unit=""
                                />
                              ) : mockNarrative ? (
                                <GoalNarrativeDetail
                                  title="Academic Performance Details"
                                  summary={mockNarrative.summary}
                                  highlights={mockNarrative.highlights}
                                  links={mockNarrative.links}
                                  dataSource={mockNarrative.dataSource}
                                />
                              ) : null}

                              {/* Level 2 Sub-goals (e.g., 1.1.1, 1.1.2) */}
                              {child.children && child.children.length > 0 && (
                                <div className="space-y-3 pt-4">
                                  <h5 className="text-sm font-semibold text-neutral-700">Sub-Goals</h5>
                                  {child.children.map((subGoal: any, subIndex: number) => {
                                    const isSubExpanded = expandedSubGoalId === subGoal.id;
                                    const subGoalProgress = subGoal.overall_progress_override ?? subGoal.overall_progress ?? 0;

                                    // Mock data for Level 2 sub-goals
                                    const mockSubGoalChart = subIndex === 0 ? [
                                      { year: '2021', value: 40, target: 50 },
                                      { year: '2022', value: 48, target: 50 },
                                      { year: '2023', value: 49, target: 50 },
                                      { year: '2024', value: 52, target: 50 }
                                    ] : subIndex === 1 ? [
                                      { year: '2021', value: 65, target: 70 },
                                      { year: '2022', value: 68, target: 70 },
                                      { year: '2023', value: 71, target: 70 },
                                      { year: '2024', value: 73, target: 70 }
                                    ] : null;

                                    const subGoalTitle = subIndex === 0
                                      ? "Enrollment Data - Secondary Data Source"
                                      : subIndex === 1
                                      ? "Student Retention Rates"
                                      : "Progress Tracking";

                                    const subGoalDescription = subIndex === 0
                                      ? "Proportional enrollment of non-white students tracked year over year."
                                      : subIndex === 1
                                      ? "Year-over-year student retention and completion rates."
                                      : "Additional metrics and progress indicators.";

                                    return (
                                      <div key={subGoal.id} className="bg-white border border-neutral-300 rounded-lg overflow-hidden">
                                        <div className="p-4">
                                          <div className="flex items-start gap-2 mb-3">
                                            <div className="flex-shrink-0 w-7 h-7 rounded-full bg-neutral-200 flex items-center justify-center">
                                              <span className="text-xs font-semibold text-neutral-900">
                                                {subGoal.goal_number}
                                              </span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                              <h5 className="text-sm font-medium text-neutral-900">{subGoal.title}</h5>
                                              {subGoal.description && !isSubExpanded && (
                                                <p className="text-xs text-neutral-600 mt-1">{subGoal.description}</p>
                                              )}
                                            </div>
                                          </div>

                                          {/* Performance Indicator for Sub-goal */}
                                          <PerformanceIndicator
                                            progress={subGoalProgress}
                                            displayMode={subGoal.overall_progress_display_mode || 'percentage'}
                                            customValue={subGoal.overall_progress_custom_value}
                                            showLabels={false}
                                            onClick={() => {
                                              setExpandedSubGoalId(isSubExpanded ? null : subGoal.id);
                                            }}
                                          />
                                        </div>

                                        {/* Expanded Sub-goal Detail */}
                                        {isSubExpanded && mockSubGoalChart && (
                                          <div className="border-t border-neutral-300 p-4 bg-neutral-100">
                                            <AnnualProgressChart
                                              data={mockSubGoalChart}
                                              title={subGoalTitle}
                                              description={subGoalDescription}
                                              unit="%"
                                            />
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              )}

                              {!mockChartData && !mockNarrative && (!child.children || child.children.length === 0) && (
                                <div className="text-center py-8 text-neutral-500">
                                  <p className="text-sm">Detailed metrics coming soon</p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 text-neutral-500">
                  <Target className="h-12 w-12 mx-auto mb-3 text-neutral-300" />
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
