// Metric Visualization Types and Configurations

import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  Percent, 
  Hash, 
  Gauge, 
  Activity,
  CheckCircle2,
  LineChart,
  GitCompare,
  Target,
  Grid3x3,
  Zap,
  Layers
} from 'lucide-react';

export type VisualizationType = 
  | 'percentage'
  | 'number'
  | 'bar-chart'
  | 'line-chart'
  | 'donut-chart'
  | 'gauge'
  | 'survey'
  | 'status'
  | 'performance-trend'
  | 'comparative'
  | 'milestone'
  | 'heatmap'
  | 'sparkline'
  | 'composite-score';

export interface VisualizationOption {
  id: VisualizationType;
  name: string;
  description: string;
  icon: any;
  preview: string;
  dataFields: string[];
}

export const visualizationOptions: VisualizationOption[] = [
  {
    id: 'percentage',
    name: 'Percentage',
    description: 'Show a percentage with optional target and progress bar',
    icon: Percent,
    preview: '/previews/percentage.svg',
    dataFields: ['currentValue', 'targetValue', 'label', 'showProgressBar']
  },
  {
    id: 'number',
    name: 'Number/KPI',
    description: 'Display a key number or metric with trend indicator',
    icon: Hash,
    preview: '/previews/number.svg',
    dataFields: ['currentValue', 'targetValue', 'unit', 'showTrend', 'previousValue']
  },
  {
    id: 'bar-chart',
    name: 'Bar Chart',
    description: 'Compare values across categories or time periods',
    icon: BarChart3,
    preview: '/previews/bar-chart.svg',
    dataFields: ['dataPoints', 'xAxisLabel', 'yAxisLabel', 'showLegend']
  },
  {
    id: 'line-chart',
    name: 'Line Chart',
    description: 'Show trends and changes over time',
    icon: LineChart,
    preview: '/previews/line-chart.svg',
    dataFields: ['dataPoints', 'xAxisLabel', 'yAxisLabel', 'showArea']
  },
  {
    id: 'donut-chart',
    name: 'Donut Chart',
    description: 'Display proportions and percentages of a whole',
    icon: PieChart,
    preview: '/previews/donut-chart.svg',
    dataFields: ['categories', 'centerLabel', 'showLegend', 'colors']
  },
  {
    id: 'gauge',
    name: 'Gauge/Meter',
    description: 'Show performance against a scale or range',
    icon: Gauge,
    preview: '/previews/gauge.svg',
    dataFields: ['currentValue', 'minValue', 'maxValue', 'segments', 'unit']
  },
  {
    id: 'survey',
    name: 'Survey Results',
    description: 'Display survey data with multiple sources and trends',
    icon: Activity,
    preview: '/previews/survey.svg',
    dataFields: ['surveyData', 'scale', 'sources', 'narrative']
  },
  {
    id: 'status',
    name: 'Status Indicator',
    description: 'Simple status card with color coding',
    icon: CheckCircle2,
    preview: '/previews/status.svg',
    dataFields: ['status', 'label', 'description', 'lastUpdated']
  },
  {
    id: 'performance-trend',
    name: 'Performance Trend',
    description: 'Track target vs actual performance over multiple years',
    icon: TrendingUp,
    preview: '/previews/performance-trend.svg',
    dataFields: ['years', 'yAxisMin', 'yAxisMax', 'unit', 'frequency']
  },
  {
    id: 'comparative',
    name: 'Comparative Analysis',
    description: 'Compare metrics across schools, departments, or categories',
    icon: GitCompare,
    preview: '/previews/comparative.svg',
    dataFields: ['entities', 'metricName', 'showDifference', 'sortOrder']
  },
  {
    id: 'milestone',
    name: 'Milestone Tracker',
    description: 'Track progress towards key milestones and deadlines',
    icon: Target,
    preview: '/previews/milestone.svg',
    dataFields: ['milestones', 'currentDate', 'showTimeline', 'showPercentComplete']
  },
  {
    id: 'heatmap',
    name: 'Heat Map',
    description: 'Visualize performance across multiple dimensions',
    icon: Grid3x3,
    preview: '/previews/heatmap.svg',
    dataFields: ['rows', 'columns', 'values', 'colorScale']
  },
  {
    id: 'sparkline',
    name: 'Sparkline',
    description: 'Compact trend indicator for quick insights',
    icon: Zap,
    preview: '/previews/sparkline.svg',
    dataFields: ['values', 'showArea', 'color', 'height']
  },
  {
    id: 'composite-score',
    name: 'Composite Score',
    description: 'Aggregate multiple metrics into a single score',
    icon: Layers,
    preview: '/previews/composite-score.svg',
    dataFields: ['components', 'weights', 'scoreRange', 'showBreakdown']
  }
];

// Configuration interfaces for each visualization type
export interface PercentageConfig {
  currentValue: number;
  targetValue?: number;
  label: string;
  showProgressBar?: boolean;
  showTrend?: boolean;
  suffix?: string;
}

export interface NumberConfig {
  currentValue: number;
  targetValue?: number;
  previousValue?: number;
  unit?: string;
  label: string;
  showTrend?: boolean;
  decimals?: number;
}

export interface BarChartConfig {
  dataPoints: Array<{
    label: string;
    value: number;
    color?: string;
  }>;
  xAxisLabel?: string;
  yAxisLabel?: string;
  showLegend?: boolean;
  orientation?: 'vertical' | 'horizontal';
}

export interface LineChartConfig {
  dataPoints: Array<{
    x: string | number;
    y: number;
    series?: string;
  }>;
  xAxisLabel?: string;
  yAxisLabel?: string;
  showArea?: boolean;
  showDots?: boolean;
  smoothCurve?: boolean;
}

export interface DonutChartConfig {
  categories: Array<{
    name: string;
    value: number;
    color?: string;
  }>;
  centerLabel?: string;
  centerValue?: string;
  showLegend?: boolean;
  showPercentages?: boolean;
}

export interface GaugeConfig {
  currentValue: number;
  minValue: number;
  maxValue: number;
  segments?: Array<{
    min: number;
    max: number;
    color: string;
    label?: string;
  }>;
  unit?: string;
  label: string;
}

export interface SurveyConfig {
  surveyData: Array<{
    year: number;
    primaryValue?: number;
    dataValue?: number;
    surveyValue?: number;
  }>;
  scaleMin: number;
  scaleMax: number;
  sources?: string[];
  narrative?: string;
  label: string;
}

export interface StatusConfig {
  status: 'on-target' | 'off-target' | 'at-risk' | 'completed' | 'pending';
  label: string;
  description?: string;
  lastUpdated?: Date;
  showIcon?: boolean;
}

export interface PerformanceTrendConfig {
  years: Array<{
    year: number;
    target: number;
    actual: number;
  }>;
  yAxisMin: number;
  yAxisMax: number;
  unit?: string;
  frequency?: 'quarterly' | 'monthly' | 'annual';
}

export interface ComparativeConfig {
  entities: Array<{
    name: string;
    value: number;
    target?: number;
    color?: string;
  }>;
  metricName: string;
  showDifference?: boolean;
  sortOrder?: 'asc' | 'desc' | 'none';
  comparisonType?: 'value' | 'percentage' | 'rank';
}

export interface MilestoneConfig {
  milestones: Array<{
    id: string;
    name: string;
    dueDate: Date;
    completedDate?: Date;
    status: 'completed' | 'on-track' | 'at-risk' | 'overdue';
    progress?: number;
  }>;
  currentDate?: Date;
  showTimeline?: boolean;
  showPercentComplete?: boolean;
  timelineView?: 'gantt' | 'list' | 'calendar';
}

export interface HeatmapConfig {
  rows: string[];
  columns: string[];
  values: Array<{
    row: string;
    column: string;
    value: number;
    label?: string;
  }>;
  colorScale?: {
    min: string;
    mid?: string;
    max: string;
  };
  showValues?: boolean;
  showLegend?: boolean;
}

export interface SparklineConfig {
  values: number[];
  showArea?: boolean;
  color?: string;
  height?: number;
  showDots?: boolean;
  showCurrentValue?: boolean;
  trendPeriod?: string;
}

export interface CompositeScoreConfig {
  components: Array<{
    name: string;
    value: number;
    weight: number;
    unit?: string;
  }>;
  weights?: number[];
  scoreRange?: {
    min: number;
    max: number;
  };
  showBreakdown?: boolean;
  aggregationMethod?: 'weighted-average' | 'sum' | 'custom';
  gradeScale?: Array<{
    min: number;
    max: number;
    grade: string;
    color: string;
  }>;
}

export type MetricVisualizationConfig = 
  | { type: 'percentage'; config: PercentageConfig }
  | { type: 'number'; config: NumberConfig }
  | { type: 'bar-chart'; config: BarChartConfig }
  | { type: 'line-chart'; config: LineChartConfig }
  | { type: 'donut-chart'; config: DonutChartConfig }
  | { type: 'gauge'; config: GaugeConfig }
  | { type: 'survey'; config: SurveyConfig }
  | { type: 'status'; config: StatusConfig }
  | { type: 'performance-trend'; config: PerformanceTrendConfig }
  | { type: 'comparative'; config: ComparativeConfig }
  | { type: 'milestone'; config: MilestoneConfig }
  | { type: 'heatmap'; config: HeatmapConfig }
  | { type: 'sparkline'; config: SparklineConfig }
  | { type: 'composite-score'; config: CompositeScoreConfig };

// Helper to get default config for a visualization type
export function getDefaultConfig(type: VisualizationType): any {
  switch (type) {
    case 'percentage':
      return {
        currentValue: '',
        targetValue: 100,
        label: 'Metric Name',
        showProgressBar: true,
        showTrend: true
      };
    case 'number':
      return {
        currentValue: 0,
        label: 'Metric Name',
        showTrend: true,
        decimals: 0
      };
    case 'bar-chart':
      return {
        dataPoints: [
          { label: '2023', value: 0 },
          { label: '2024', value: 0 },
          { label: '2025', value: 0 }
        ],
        yAxisLabel: 'Value',
        showLegend: false
      };
    case 'line-chart':
      return {
        dataPoints: [
          { x: 'Jan', y: 0 },
          { x: 'Feb', y: 0 },
          { x: 'Mar', y: 0 }
        ],
        showArea: false,
        showDots: true
      };
    case 'donut-chart':
      return {
        categories: [
          { name: 'Category 1', value: 30 },
          { name: 'Category 2', value: 40 },
          { name: 'Category 3', value: 30 }
        ],
        showLegend: true,
        showPercentages: true
      };
    case 'gauge':
      return {
        currentValue: 50,
        minValue: 0,
        maxValue: 100,
        label: 'Performance',
        segments: [
          { min: 0, max: 33, color: '#ef4444', label: 'Low' },
          { min: 33, max: 66, color: '#eab308', label: 'Medium' },
          { min: 66, max: 100, color: '#22c55e', label: 'High' }
        ]
      };
    case 'survey':
      return {
        surveyData: [],
        scaleMin: 1,
        scaleMax: 5,
        label: 'Survey Results'
      };
    case 'status':
      return {
        status: 'on-target',
        label: 'Status',
        showIcon: true
      };
    case 'performance-trend':
      const currentYear = new Date().getFullYear();
      return {
        years: [
          { year: currentYear - 3, target: 3.66, actual: 3.66 },
          { year: currentYear - 2, target: 3.66, actual: 3.75 },
          { year: currentYear - 1, target: 3.66, actual: 3.74 },
          { year: currentYear, target: 3.66, actual: 3.79 }
        ],
        yAxisMin: 3.64,
        yAxisMax: 3.82,
        unit: '',
        frequency: 'annual'
      };
    case 'comparative':
      return {
        entities: [
          { name: 'School A', value: 85, target: 90 },
          { name: 'School B', value: 78, target: 90 },
          { name: 'School C', value: 92, target: 90 }
        ],
        metricName: 'Performance Score',
        showDifference: true,
        sortOrder: 'desc'
      };
    case 'milestone':
      return {
        milestones: [
          { 
            id: '1', 
            name: 'Q1 Target', 
            dueDate: new Date(new Date().getFullYear(), 2, 31),
            status: 'on-track',
            progress: 75
          },
          { 
            id: '2', 
            name: 'Mid-Year Review', 
            dueDate: new Date(new Date().getFullYear(), 5, 30),
            status: 'at-risk',
            progress: 45
          }
        ],
        showTimeline: true,
        showPercentComplete: true
      };
    case 'heatmap':
      return {
        rows: ['Math', 'Reading', 'Science'],
        columns: ['Q1', 'Q2', 'Q3', 'Q4'],
        values: [
          { row: 'Math', column: 'Q1', value: 85 },
          { row: 'Math', column: 'Q2', value: 88 },
          { row: 'Reading', column: 'Q1', value: 78 },
          { row: 'Reading', column: 'Q2', value: 82 }
        ],
        showValues: true,
        showLegend: true
      };
    case 'sparkline':
      return {
        values: [65, 72, 68, 75, 82, 85, 88],
        showArea: true,
        color: '#3b82f6',
        height: 40,
        showCurrentValue: true
      };
    case 'composite-score':
      return {
        components: [
          { name: 'Academic Achievement', value: 85, weight: 0.4 },
          { name: 'Student Growth', value: 78, weight: 0.3 },
          { name: 'School Climate', value: 92, weight: 0.3 }
        ],
        scoreRange: { min: 0, max: 100 },
        showBreakdown: true,
        aggregationMethod: 'weighted-average',
        gradeScale: [
          { min: 90, max: 100, grade: 'A', color: '#22c55e' },
          { min: 80, max: 89, grade: 'B', color: '#3b82f6' },
          { min: 70, max: 79, grade: 'C', color: '#eab308' },
          { min: 0, max: 69, grade: 'D', color: '#ef4444' }
        ]
      };
    default:
      return {};
  }
}