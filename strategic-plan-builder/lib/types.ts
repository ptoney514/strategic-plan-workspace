// lib/types.ts
export interface District {
  id: string;
  name: string;
  slug: string;
  primary_color: string;
  secondary_color?: string;
  logo_url?: string;
  admin_email: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface DistrictWithSummary extends District {
  goalCount?: number;
  strategyCount?: number;
  subGoalCount?: number;
  metricCount?: number;
  lastActivity?: string;
}

export interface Goal {
  id: string;
  district_id: string;
  parent_id: string | null;
  goal_number: string; // "1", "1.1", "1.8.2"
  title: string;
  description?: string;
  level: 0 | 1 | 2; // 0=Strategic Objective, 1=Goal, 2=Sub-goal
  order_position: number;
  created_at: string;
  updated_at: string;
  // Extended fields for strategic planning
  owner_id?: string;
  owner_name?: string;
  department?: string;
  priority?: 'critical' | 'high' | 'medium' | 'low';
  status_detail?: 'not_started' | 'planning' | 'in_progress' | 'completed' | 'on_hold';
  start_date?: string;
  end_date?: string;
  review_frequency?: 'weekly' | 'monthly' | 'quarterly' | 'annually';
  last_reviewed?: string;
  budget_allocated?: number;
  budget_spent?: number;
  strategic_theme_id?: string;
  is_public?: boolean;
  executive_summary?: string;
  // Custom indicator fields
  indicator_text?: string;
  indicator_color?: string;
  // Image for objective card
  image_url?: string;
  // Header color as an alternative to image
  header_color?: string;
  // For UI purposes
  children?: Goal[];
  metrics?: Metric[];
  // Related data
  initiatives?: Initiative[];
  updates?: GoalUpdate[];
  artifacts?: GoalArtifact[];
  stakeholders?: GoalStakeholder[];
  milestones?: GoalMilestone[];
  dependencies?: GoalDependency[];
}

export type MetricType = 'percent' | 'number' | 'rating' | 'currency' | 'status' | 'narrative' | 'link' | 'survey';
export type DataSourceType = 'survey' | 'map_data' | 'state_testing' | 'total_number' | 'percent' | 'narrative' | 'link';
export type ChartType = 'line' | 'bar' | 'donut' | 'area';
export type MetricStatus = 'on-target' | 'off-target' | 'critical' | 'no-data';
export type MetricCategory = 'enrollment' | 'achievement' | 'discipline' | 'attendance' | 'culture' | 'other';

export interface Metric {
  id: string;
  goal_id: string;
  name: string;
  description?: string;  // Enhanced: Detailed metric description
  metric_type: MetricType;
  metric_category?: MetricCategory;  // Enhanced: Category for grouping
  data_source?: DataSourceType;
  current_value?: number;
  actual_value?: number;  // Alternative field name used in some data
  target_value?: number;
  unit?: string;
  timeframe_start?: number;
  timeframe_end?: number;
  data_points?: DataPoint[] | TimeSeriesDataPoint[];  // Enhanced: Backward compatible time series
  is_primary?: boolean;
  display_order?: number;
  chart_type?: ChartType;
  // Enhanced metric fields
  baseline_value?: number;
  milestone_dates?: MilestoneDate[];
  trend_direction?: 'improving' | 'stable' | 'declining';
  collection_frequency?: string;
  data_source_details?: string;
  last_collected?: string;
  // Risk assessment fields
  risk_threshold_critical?: number;  // Enhanced: Threshold for critical status
  risk_threshold_off_target?: number;  // Enhanced: Threshold for off-target status
  is_higher_better?: boolean;  // Enhanced: Whether higher values are better
  // New fields for enhanced display
  measure_title?: string;  // Custom title for the measure
  measure_unit?: string;  // Unit of measurement (%, points, etc.)
  decimal_places?: number;  // Number of decimal places to display
  show_percentage?: boolean;  // Whether to show as percentage
  aggregation_method?: 'average' | 'sum' | 'latest' | 'max' | 'min';  // How to aggregate child metrics
  // Time series data
  time_series?: MetricTimeSeries[];  // Historical data points
  // Survey-specific fields
  survey_primary_source?: number;
  survey_data_source?: number;
  survey_source_label?: string;
  narrative_text?: string;
  chart_start_year?: number;
  chart_end_year?: number;
  survey_scale_max?: number;
  survey_scale_min?: number;
  survey_data?: SurveyDataPoint[];  // Detailed survey data
  // Visualization configuration
  visualization_type?: string;  // Type of visualization (e.g., 'performance-trend')
  visualization_config?: any;  // Configuration data for the visualization
  display_width?: 'quarter' | 'third' | 'half' | 'full';  // Grid width: quarter (1/4), third (1/3), half (1/2), or full width
  // display_order is already defined above
  // is_primary is already defined above
  created_at: string;
  updated_at: string;
}

export interface DataPoint {
  year: number;
  value: number;
  label?: string;
}

// Enhanced time series data structure
export interface TimeSeriesDataPoint {
  period: string;  // '2024-Q1', '2024-01', '2024'
  period_type: 'quarterly' | 'monthly' | 'annual';
  target_value?: number;
  actual_value?: number;
  status?: MetricStatus;
  notes?: string;
}

// Time series data from database
export interface MetricTimeSeries {
  id: string;
  metric_id: string;
  period: string;  // '2024', '2024-Q1', '2024-01'
  period_type: 'annual' | 'quarterly' | 'monthly';
  target_value?: number;
  actual_value?: number;
  status?: MetricStatus;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// Survey data point structure
export interface SurveyDataPoint {
  id?: string;
  metric_id?: string;
  year: number;
  category?: string;
  primary_value?: number;
  data_value?: number;
  survey_value?: number;
  response_count?: number;
  notes?: string;
}

// Quarterly data structure for complex metrics
export interface QuarterlyData {
  year: number;
  quarters: {
    Q1: { target?: number; actual?: number; status?: MetricStatus };
    Q2: { target?: number; actual?: number; status?: MetricStatus };
    Q3: { target?: number; actual?: number; status?: MetricStatus };
    Q4: { target?: number; actual?: number; status?: MetricStatus };
  };
  annual: { target?: number; actual?: number; status?: MetricStatus };
}

export interface GoalWithMetrics extends Goal {
  metrics: Metric[];
  children: GoalWithMetrics[];
}

// New interfaces for enhanced strategic planning features

export interface StrategicTheme {
  id: string;
  district_id: string;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  display_order?: number;
  is_active?: boolean;
  created_at: string;
  updated_at: string;
}

export interface Initiative {
  id: string;
  goal_id: string;
  title: string;
  description?: string;
  status?: 'not_started' | 'in_progress' | 'completed' | 'blocked' | 'cancelled';
  priority?: 'critical' | 'high' | 'medium' | 'low';
  owner_name?: string;
  owner_id?: string;
  due_date?: string;
  completed_date?: string;
  percent_complete?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface GoalUpdate {
  id: string;
  goal_id: string;
  update_text: string;
  update_type?: 'progress' | 'risk' | 'milestone' | 'general' | 'blocker';
  sentiment?: 'positive' | 'neutral' | 'negative';
  created_by?: string;
  created_by_id?: string;
  is_public?: boolean;
  created_at: string;
}

export interface GoalArtifact {
  id: string;
  goal_id: string;
  title: string;
  description?: string;
  file_url?: string;
  file_name?: string;
  file_size?: number;
  artifact_type?: 'document' | 'image' | 'spreadsheet' | 'presentation' | 'link' | 'other';
  uploaded_by?: string;
  uploaded_by_id?: string;
  tags?: string[];
  is_public?: boolean;
  created_at: string;
}

export interface GoalStakeholder {
  id: string;
  goal_id: string;
  stakeholder_name: string;
  stakeholder_email?: string;
  stakeholder_role?: 'sponsor' | 'owner' | 'contributor' | 'reviewer' | 'informed';
  organization?: string;
  notes?: string;
  notify_on_updates?: boolean;
  created_at: string;
}

export interface GoalMilestone {
  id: string;
  goal_id: string;
  title: string;
  description?: string;
  target_date: string;
  completed_date?: string;
  status?: 'pending' | 'in_progress' | 'completed' | 'missed';
  success_criteria?: string;
  created_at: string;
  updated_at: string;
}

export interface GoalDependency {
  id: string;
  goal_id: string;
  depends_on_goal_id: string;
  dependency_type?: 'blocks' | 'requires' | 'relates_to' | 'supports';
  description?: string;
  created_at: string;
  // For UI display
  depends_on_goal?: Goal;
}

export interface MilestoneDate {
  date: string;
  target: number;
  label?: string;
}

// Helper function to build hierarchical structure
export function buildGoalHierarchy(goals: Goal[], metrics: Metric[]): GoalWithMetrics[] {
  const goalMap = new Map<string, GoalWithMetrics>();
  
  // First pass: create all goals with empty children and metrics arrays
  goals.forEach(goal => {
    goalMap.set(goal.id, {
      ...goal,
      children: [],
      metrics: metrics.filter(m => m.goal_id === goal.id)
    });
  });
  
  // Second pass: build hierarchy
  const rootGoals: GoalWithMetrics[] = [];
  goalMap.forEach(goal => {
    if (goal.parent_id === null) {
      rootGoals.push(goal);
    } else {
      const parent = goalMap.get(goal.parent_id);
      if (parent) {
        parent.children.push(goal);
      }
    }
  });
  
  // Sort by goal_number
  const sortByGoalNumber = (a: GoalWithMetrics, b: GoalWithMetrics) => {
    const aParts = a.goal_number.split('.').map(Number);
    const bParts = b.goal_number.split('.').map(Number);
    
    for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
      const aVal = aParts[i] || 0;
      const bVal = bParts[i] || 0;
      if (aVal !== bVal) return aVal - bVal;
    }
    return 0;
  };
  
  // Recursively sort all levels
  const sortGoals = (goals: GoalWithMetrics[]) => {
    goals.sort(sortByGoalNumber);
    goals.forEach(goal => {
      if (goal.children.length > 0) {
        sortGoals(goal.children);
      }
    });
  };
  
  sortGoals(rootGoals);
  return rootGoals;
}

export function getLevelName(level: 0 | 1 | 2): string {
  switch (level) {
    case 0: return 'Strategic Objective';
    case 1: return 'Goal';
    case 2: return 'Sub-goal';
  }
}

export function getNextGoalNumber(parentNumber: string | null, existingSiblings: Goal[]): string {
  if (!parentNumber) {
    // Top level - find the highest number
    const maxNum = existingSiblings
      .filter(g => !g.parent_id)
      .reduce((max, g) => {
        const num = parseInt(g.goal_number);
        return isNaN(num) ? max : Math.max(max, num);
      }, 0);
    return String(maxNum + 1);
  } else {
    // Child level - find the highest sub-number
    const siblingNumbers = existingSiblings
      .filter(g => g.goal_number.startsWith(parentNumber + '.'))
      .map(g => {
        const parts = g.goal_number.split('.');
        return parseInt(parts[parts.length - 1]);
      })
      .filter(n => !isNaN(n));
    
    const maxNum = siblingNumbers.length > 0 ? Math.max(...siblingNumbers) : 0;
    return `${parentNumber}.${maxNum + 1}`;
  }
}

// Enhanced metric utility functions
export function calculateMetricStatus(metric: Metric): MetricStatus {
  // Use actual_value if current_value is not available
  const currentVal = metric.current_value ?? metric.actual_value;
  
  if (!currentVal || !metric.target_value) {
    return 'no-data';
  }

  const targetVal = metric.target_value;
  const isHigherBetter = metric.is_higher_better ?? true;
  
  // Use custom thresholds if provided, otherwise use defaults
  const criticalThreshold = metric.risk_threshold_critical ?? (isHigherBetter ? 0.7 : 1.3);
  const offTargetThreshold = metric.risk_threshold_off_target ?? (isHigherBetter ? 0.9 : 1.1);
  
  let performanceRatio: number;
  
  if (isHigherBetter) {
    // For metrics where higher is better (e.g., test scores)
    performanceRatio = currentVal / targetVal;
    if (performanceRatio >= offTargetThreshold) return 'on-target';
    if (performanceRatio >= criticalThreshold) return 'off-target';
    return 'critical';
  } else {
    // For metrics where lower is better (e.g., dropout rates)
    performanceRatio = currentVal / targetVal;
    if (performanceRatio <= offTargetThreshold) return 'on-target';
    if (performanceRatio <= criticalThreshold) return 'off-target';
    return 'critical';
  }
}

export function getMetricStatusConfig(status: MetricStatus) {
  const configs = {
    'on-target': {
      label: 'On Target',
      color: '#16a34a', // green-600
      bgColor: 'bg-green-100',
      textColor: 'text-green-800',
      borderColor: 'border-green-200',
      icon: '✓'
    },
    'off-target': {
      label: 'Off Target',
      color: '#ea580c', // orange-600
      bgColor: 'bg-orange-100',
      textColor: 'text-orange-800', 
      borderColor: 'border-orange-200',
      icon: '⚠'
    },
    'critical': {
      label: 'Critical',
      color: '#dc2626', // red-600
      bgColor: 'bg-red-100',
      textColor: 'text-red-800',
      borderColor: 'border-red-200',
      icon: '🚨'
    },
    'no-data': {
      label: 'No Data',
      color: '#6b7280', // gray-500
      bgColor: 'bg-gray-100',
      textColor: 'text-gray-700',
      borderColor: 'border-gray-200', 
      icon: '—'
    }
  };
  
  return configs[status];
}

export function aggregateChildMetricStatus(childMetrics: Metric[]): MetricStatus {
  if (!childMetrics || childMetrics.length === 0) {
    return 'no-data';
  }
  
  const statuses = childMetrics.map(calculateMetricStatus);
  
  // If any are critical, parent is critical
  if (statuses.includes('critical')) return 'critical';
  
  // If any are off-target, parent is off-target
  if (statuses.includes('off-target')) return 'off-target';
  
  // If all have data and none are problematic, on-target
  if (statuses.every(s => s === 'on-target')) return 'on-target';
  
  // Mixed or no data
  return 'no-data';
}

// Format metric value for display
export function formatMetricValue(value: number | undefined, metric: Metric): string {
  if (value === undefined || value === null) return '--';
  
  const decimals = metric.decimal_places ?? 2;
  let formatted = value.toFixed(decimals);
  
  // Remove trailing zeros after decimal point
  if (decimals > 0) {
    formatted = formatted.replace(/\.?0+$/, '');
  }
  
  if (metric.show_percentage) {
    return `${formatted}%`;
  }
  
  if (metric.measure_unit) {
    return `${formatted} ${metric.measure_unit}`;
  }
  
  return formatted;
}

// Get aggregated metric value from child goals
export function getAggregatedMetricValue(childMetrics: Metric[], method: string = 'average'): number | undefined {
  const values = childMetrics
    .map(m => m.current_value ?? m.actual_value)
    .filter(v => v !== undefined && v !== null) as number[];
  
  if (values.length === 0) return undefined;
  
  switch (method) {
    case 'sum':
      return values.reduce((a, b) => a + b, 0);
    case 'average':
      return values.reduce((a, b) => a + b, 0) / values.length;
    case 'max':
      return Math.max(...values);
    case 'min':
      return Math.min(...values);
    case 'latest':
      return values[values.length - 1];
    default:
      return values.reduce((a, b) => a + b, 0) / values.length;
  }
}