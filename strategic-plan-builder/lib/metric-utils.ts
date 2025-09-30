import { Metric, GoalWithMetrics } from './types';

/**
 * Format a metric value for display based on its type
 */
export function formatMetricValue(metric: Metric): string {
  const { current_value, target_value, metric_type, unit } = metric;
  
  if (current_value === undefined || current_value === null) {
    return 'No data';
  }
  
  switch (metric_type) {
    case 'rating':
      // For ratings, show as "3.74 / 5.0"
      if (target_value) {
        return `${current_value.toFixed(2)} / ${target_value.toFixed(1)}`;
      }
      return current_value.toFixed(2);
      
    case 'percent':
      // For percentages, show as "87%"
      return `${Math.round(current_value)}%`;
      
    case 'currency':
      // For currency, format with dollar sign
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(current_value);
      
    case 'number':
      // For numbers, show with unit if available
      const formatted = new Intl.NumberFormat('en-US').format(Math.round(current_value));
      return unit ? `${formatted} ${unit}` : formatted;
      
    default:
      // Default to showing the raw value
      return String(current_value);
  }
}

/**
 * Get a progress description for a metric
 */
export function getMetricProgressDescription(metric: Metric): string {
  const { current_value, target_value, metric_type } = metric;
  
  if (!current_value || !target_value) return '';
  
  switch (metric_type) {
    case 'rating':
      return `Score: ${formatMetricValue(metric)}`;
      
    case 'percent':
      return `Progress: ${formatMetricValue(metric)}`;
      
    case 'number':
    case 'currency':
      const percentage = Math.round((current_value / target_value) * 100);
      return `${percentage}% of target`;
      
    default:
      return '';
  }
}

/**
 * Calculate the actual progress percentage for a metric
 * This is different from the display value - it's used for progress bars
 */
export function calculateMetricProgress(metric: Metric): number {
  const { current_value, target_value, metric_type } = metric;
  
  if (!current_value || !target_value || target_value === 0) return 0;
  
  // For all metric types, calculate as percentage of target
  const ratio = current_value / target_value;
  
  // Cap at 100% for display purposes
  return Math.min(Math.round(ratio * 100), 100);
}

/**
 * Determine the status of a metric based on its progress
 */
export function getMetricStatus(metric: Metric): 'on-track' | 'at-risk' | 'off-track' {
  const { current_value, target_value, metric_type } = metric;
  
  if (!current_value || !target_value) return 'at-risk';
  
  const ratio = current_value / target_value;
  
  // Different thresholds for different metric types
  if (metric_type === 'rating') {
    // For ratings, use tighter thresholds
    if (ratio >= 0.95) return 'on-track';
    if (ratio >= 0.85) return 'at-risk';
    return 'off-track';
  } else {
    // For other metrics, use standard thresholds
    if (ratio >= 0.90) return 'on-track';
    if (ratio >= 0.70) return 'at-risk';
    return 'off-track';
  }
}

/**
 * Get the primary metric value display for a goal
 * This intelligently selects what to show based on the goal's metrics
 */
export function getGoalPrimaryDisplay(goal: GoalWithMetrics): {
  value: string;
  description: string;
  progress: number;
} {
  // If goal has no metrics, check children
  let metricsToCheck = goal.metrics || [];
  if (metricsToCheck.length === 0 && goal.children) {
    // Collect all metrics from children
    goal.children.forEach(child => {
      if (child.metrics) {
        metricsToCheck = metricsToCheck.concat(child.metrics);
      }
    });
  }
  
  if (metricsToCheck.length === 0) {
    return {
      value: 'No metrics',
      description: '',
      progress: 0
    };
  }
  
  // Find primary metric or use first one
  const primaryMetric = metricsToCheck.find(m => m.is_primary) || metricsToCheck[0];
  
  return {
    value: formatMetricValue(primaryMetric),
    description: getMetricProgressDescription(primaryMetric),
    progress: calculateMetricProgress(primaryMetric)
  };
}

/**
 * Calculate overall status for a goal based on all its metrics
 */
export function calculateGoalStatus(goal: GoalWithMetrics): 'on-track' | 'at-risk' | 'off-track' {
  // Collect all metrics from goal and children
  let allMetrics: Metric[] = goal.metrics || [];
  
  if (goal.children) {
    goal.children.forEach(child => {
      if (child.metrics) {
        allMetrics = allMetrics.concat(child.metrics);
      }
      // Also check sub-children
      if (child.children) {
        child.children.forEach(subChild => {
          if (subChild.metrics) {
            allMetrics = allMetrics.concat(subChild.metrics);
          }
        });
      }
    });
  }
  
  if (allMetrics.length === 0) {
    // No metrics means we can't determine status
    return goal.level === 0 ? 'on-track' : 'at-risk';
  }
  
  // Count metrics by status
  let onTrackCount = 0;
  let atRiskCount = 0;
  let offTrackCount = 0;
  
  allMetrics.forEach(metric => {
    const status = getMetricStatus(metric);
    if (status === 'on-track') onTrackCount++;
    else if (status === 'at-risk') atRiskCount++;
    else offTrackCount++;
  });
  
  const total = allMetrics.length;
  
  // Determine overall status based on proportions
  if (onTrackCount >= total * 0.7) return 'on-track';
  if (offTrackCount >= total * 0.5) return 'off-track';
  return 'at-risk';
}

/**
 * Get status display configuration
 */
export function getStatusDisplay(status: 'on-track' | 'at-risk' | 'off-track') {
  switch (status) {
    case 'on-track':
      return {
        label: 'On Track',
        className: 'bg-emerald-500/10 ring-1 ring-emerald-500/30 text-emerald-300',
        color: 'emerald'
      };
    case 'at-risk':
      return {
        label: 'At Risk',
        className: 'bg-amber-500/10 ring-1 ring-amber-500/30 text-amber-300',
        color: 'amber'
      };
    case 'off-track':
      return {
        label: 'Off Track',
        className: 'bg-rose-500/10 ring-1 ring-rose-500/30 text-rose-300',
        color: 'rose'
      };
  }
}