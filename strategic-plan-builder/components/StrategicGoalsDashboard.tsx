import React, { useState, useEffect, useRef } from 'react';
import { Search, Filter, Settings2, ListTree, CheckCircle2, AlertTriangle, Target, Expand, ChevronRight, ArrowUpRight, TrendingUp, Plus, Share2, Clock } from 'lucide-react';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

// Sample hierarchical data
const data = {
  g1: {
    id: 'g1',
    title: 'Increase ARR to $50M',
    breadcrumbs: 'Company • FY • Roll-up from Sales, Success',
    status: 'on',
    completion: 62,
    primary: { label: 'ARR (target $50M)', value: '$32.4M', pct: 65, color: 'indigo' },
    secondary: { label: 'NRR (target 110%)', value: '114%', pct: 80, color: 'emerald' },
    trend: {
      labels: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
      actual: [18,19,21,23,25,27,29,30,32,33,34,36],
      target: [19,20,22,24,26,28,30,32,34,36,38,40]
    },
    breakdown: { labels: ['New Biz','Expansion','Retention','Pricing'], values: [35, 28, 22, 15] },
    objectives: [
      { name: 'Enterprise expansion in NA', owner: 'VP Sales', status: 'on', pct: 70 },
      { name: 'Mid-market velocity', owner: 'Dir. Sales', status: 'off', pct: 32 },
      { name: 'Reduce onboarding time', owner: 'Onboarding', status: 'on', pct: 76 },
      { name: 'Proactive health alerts', owner: 'CS Ops', status: 'risk', pct: 54 },
    ],
  },
  'g1-1': {
    id: 'g1-1',
    title: 'Grow New Business',
    breadcrumbs: 'Company • Sales • Roll-up to ARR',
    status: 'risk',
    completion: 48,
    primary: { label: 'Pipeline (target $22M)', value: '$18M', pct: 52, color: 'amber' },
    secondary: { label: 'Win rate (target 25%)', value: '21%', pct: 60, color: 'indigo' },
    trend: {
      labels: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
      actual: [1.0,1.2,1.5,1.8,2.2,2.6,3.1,3.6,4.0,4.5,5.1,5.6],
      target: [1.1,1.3,1.6,2.0,2.5,3.0,3.5,4.0,4.6,5.2,5.8,6.4]
    },
    breakdown: { labels: ['Enterprise','Mid-market','Velocity','Channel'], values: [40, 25, 20, 15] },
    objectives: [
      { name: 'Enterprise expansion in NA', owner: 'VP Sales', status: 'on', pct: 70 },
      { name: 'Mid-market velocity', owner: 'Dir. Sales', status: 'off', pct: 32 },
    ],
  },
  'g1-1-1': {
    id: 'g1-1-1',
    title: 'Enterprise expansion in NA',
    breadcrumbs: 'Sales • New Business • Enterprise',
    status: 'on',
    completion: 70,
    primary: { label: 'Enterprise deals (12)', value: '9 won', pct: 75, color: 'emerald' },
    secondary: { label: 'Avg ACV', value: '$210k', pct: 68, color: 'indigo' },
    trend: {
      labels: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
      actual: [0,1,2,3,4,5,6,7,8,9,10,11],
      target: [1,2,3,4,5,6,7,8,9,10,11,12]
    },
    breakdown: { labels: ['Manufacturing','Finance','Tech','Public'], values: [30, 25, 30, 15] },
    objectives: [
      { name: 'Top-50 account plan', owner: 'AE Team', status: 'on', pct: 64 },
      { name: 'Partner-led pilots', owner: 'Alliances', status: 'risk', pct: 52 },
    ],
  },
  'g1-1-2': {
    id: 'g1-1-2',
    title: 'Mid-market velocity',
    breadcrumbs: 'Sales • New Business • Velocity',
    status: 'off',
    completion: 32,
    primary: { label: 'Cycle time (target -15%)', value: '+18%', pct: 30, color: 'rose' },
    secondary: { label: 'SQL to Win', value: '14%', pct: 40, color: 'amber' },
    trend: {
      labels: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
      actual: [14,15,17,18,19,21,22,23,24,25,26,28],
      target: [12,12,13,14,15,16,16,17,18,18,19,20]
    },
    breakdown: { labels: ['Lead quality','Enablement','Pricing','Territory'], values: [22, 18, 30, 30] },
    objectives: [
      { name: 'Revamp discovery', owner: 'Enablement', status: 'risk', pct: 48 },
      { name: 'Pricing simplification', owner: 'PMM', status: 'off', pct: 25 },
    ],
  },
  'g1-2': {
    id: 'g1-2',
    title: 'Improve Retention',
    breadcrumbs: 'Success • Retention',
    status: 'on',
    completion: 68,
    primary: { label: 'NRR (target 115%)', value: '114%', pct: 82, color: 'emerald' },
    secondary: { label: 'Gross churn', value: '2.4%', pct: 76, color: 'indigo' },
    trend: {
      labels: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
      actual: [108,109,110,111,111,112,113,113,114,114,114,115],
      target: [107,108,109,110,111,112,113,114,115,116,117,118]
    },
    breakdown: { labels: ['Onboarding','Support','CSM Plays','Product'], values: [30, 25, 25, 20] },
    objectives: [
      { name: 'Reduce onboarding time', owner: 'Onboarding', status: 'on', pct: 76 },
      { name: 'Proactive health alerts', owner: 'CS Ops', status: 'risk', pct: 54 },
    ],
  },
  'g1-2-1': {
    id: 'g1-2-1',
    title: 'Reduce onboarding time',
    breadcrumbs: 'Success • Time-to-value',
    status: 'on',
    completion: 76,
    primary: { label: 'AHT reduction', value: '-22%', pct: 80, color: 'emerald' },
    secondary: { label: 'Time to first value', value: '-18%', pct: 72, color: 'indigo' },
    trend: {
      labels: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
      actual: [0,-2,-4,-8,-12,-15,-18,-19,-20,-21,-22,-24],
      target: [0,-1,-3,-6,-9,-12,-15,-17,-19,-21,-23,-25]
    },
    breakdown: { labels: ['Docs','Guides','Implementation','Automation'], values: [20, 25, 30, 25] },
    objectives: [
      { name: 'Template library', owner: 'PS', status: 'on', pct: 78 },
      { name: 'Workflow automations', owner: 'CS Ops', status: 'on', pct: 74 },
    ],
  },
  'g1-2-2': {
    id: 'g1-2-2',
    title: 'Proactive health alerts',
    breadcrumbs: 'Success • Product signals',
    status: 'risk',
    completion: 54,
    primary: { label: 'Coverage', value: '63%', pct: 63, color: 'amber' },
    secondary: { label: 'Precision', value: '0.72', pct: 72, color: 'indigo' },
    trend: {
      labels: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
      actual: [10,15,22,30,40,48,54,58,63,67,70,74],
      target: [12,18,25,35,45,55,65,72,78,84,89,94]
    },
    breakdown: { labels: ['Signals','Models','Playbooks','Coverage'], values: [22, 28, 25, 25] },
    objectives: [
      { name: 'Signal catalog', owner: 'CS Ops', status: 'risk', pct: 54 },
      { name: 'Model tuning', owner: 'DS', status: 'on', pct: 66 },
    ],
  },
  g2: {
    id: 'g2',
    title: 'Accelerate Product Adoption',
    breadcrumbs: 'Product • Growth',
    status: 'risk',
    completion: 44,
    primary: { label: 'WAU (target +15%)', value: '+7%', pct: 47, color: 'amber' },
    secondary: { label: 'Onboarding DAU', value: '32%', pct: 50, color: 'indigo' },
    trend: {
      labels: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
      actual: [2,3,4,5,5,6,7,7,8,8,9,10],
      target: [3,4,5,6,7,8,9,10,11,12,13,14]
    },
    breakdown: { labels: ['Guides','Activation','Performance','Education'], values: [25, 30, 20, 25] },
    objectives: [
      { name: 'Launch Activation 2.0', owner: 'PM Lead', status: 'off', pct: 28 },
      { name: 'In-product guidance', owner: 'Design', status: 'risk', pct: 46 },
    ],
  },
  'g2-1': {
    id: 'g2-1',
    title: 'Launch Activation 2.0',
    breadcrumbs: 'Product • Activation',
    status: 'off',
    completion: 28,
    primary: { label: 'Activation lift', value: '+3.1pts', pct: 20, color: 'rose' },
    secondary: { label: 'Funnel drop-off', value: '-4%', pct: 35, color: 'emerald' },
    trend: {
      labels: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
      actual: [0,0,1,1,2,2,2,3,3,3,3,4],
      target: [0,1,2,3,4,5,6,7,8,9,10,11]
    },
    breakdown: { labels: ['Instrumentation','Flows','UX','Infra'], values: [35, 25, 25, 15] },
    objectives: [
      { name: 'Analytics readiness', owner: 'Data', status: 'off', pct: 22 },
      { name: 'Activation flows', owner: 'PM', status: 'risk', pct: 40 },
    ],
  },
  'g2-2': {
    id: 'g2-2',
    title: 'In-product guidance',
    breadcrumbs: 'Product • Education',
    status: 'risk',
    completion: 46,
    primary: { label: 'Guide CTR', value: '3.2%', pct: 46, color: 'amber' },
    secondary: { label: 'Guided sessions', value: '+18%', pct: 60, color: 'indigo' },
    trend: {
      labels: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
      actual: [1.8,2.1,2.4,2.6,2.8,3.0,3.2,3.0,3.1,3.3,3.5,3.6],
      target: [2.0,2.2,2.5,2.7,3.0,3.3,3.6,3.8,4.0,4.2,4.5,4.8]
    },
    breakdown: { labels: ['Contextual','Templates','Media','Localization'], values: [25, 30, 25, 20] },
    objectives: [
      { name: 'Contextual triggers', owner: 'PM', status: 'risk', pct: 42 },
      { name: 'Template system', owner: 'Design', status: 'on', pct: 62 },
    ],
  },
};

// Helper functions
const statusPill = (status: string) => {
  if (status === 'on') return { cls: 'bg-emerald-500/10 ring-1 ring-emerald-500/30 text-emerald-300', text: 'On Track' };
  if (status === 'risk') return { cls: 'bg-amber-500/10 ring-1 ring-amber-500/30 text-amber-300', text: 'At Risk' };
  return { cls: 'bg-rose-500/10 ring-1 ring-rose-500/30 text-rose-300', text: 'Off Track' };
};

interface ChartComponentProps {
  selectedGoal: string;
}

const CompletionChart: React.FC<ChartComponentProps> = ({ selectedGoal }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    const goalData = data[selectedGoal as keyof typeof data] || data.g1;
    const completed = Math.round(goalData.completion);

    if (chartRef.current) {
      chartRef.current.destroy();
    }

    const backgroundColor = ['#6366F1', 'rgba(255,255,255,0.06)'];

    chartRef.current = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Completed', 'Remaining'],
        datasets: [{
          data: [completed, Math.max(0, 100 - completed)],
          backgroundColor,
          borderWidth: 0,
          spacing: 2
        }]
      },
      options: {
        plugins: { legend: { display: false }, tooltip: { enabled: false } },
        responsive: true,
        maintainAspectRatio: false,
        cutout: '72%'
      }
    });

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [selectedGoal]);

  return <canvas ref={canvasRef} className="w-full h-full" />;
};

const TrendChart: React.FC<ChartComponentProps> = ({ selectedGoal }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    const goalData = data[selectedGoal as keyof typeof data] || data.g1;

    if (chartRef.current) {
      chartRef.current.destroy();
    }

    const colors = {
      tickColor: 'rgba(255,255,255,0.45)',
      gridColor: 'rgba(255,255,255,0.06)',
      targetColor: 'rgba(255,255,255,0.25)'
    };

    chartRef.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: goalData.trend.labels,
        datasets: [
          {
            label: 'Actual',
            data: goalData.trend.actual,
            borderColor: '#A5B4FC',
            backgroundColor: 'rgba(129,140,248,0.15)',
            fill: true,
            tension: 0.35,
            pointRadius: 0
          },
          {
            label: 'Target',
            data: goalData.trend.target,
            borderColor: colors.targetColor,
            borderDash: [4,4],
            fill: false,
            tension: 0.35,
            pointRadius: 0
          }
        ]
      },
      options: {
        plugins: { legend: { display: false } },
        scales: {
          x: {
            ticks: { color: colors.tickColor, font: { size: 10 } },
            grid: { color: colors.gridColor }
          },
          y: {
            ticks: { color: colors.tickColor, font: { size: 10 } },
            grid: { color: colors.gridColor }
          }
        },
        responsive: true,
        maintainAspectRatio: false
      }
    });

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [selectedGoal]);

  return <canvas ref={canvasRef} className="w-full h-full" />;
};

const BreakdownChart: React.FC<ChartComponentProps> = ({ selectedGoal }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    const goalData = data[selectedGoal as keyof typeof data] || data.g1;

    if (chartRef.current) {
      chartRef.current.destroy();
    }

    const colors = {
      tickColor: 'rgba(255,255,255,0.45)',
      gridColor: 'rgba(255,255,255,0.06)'
    };

    chartRef.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: goalData.breakdown.labels,
        datasets: [
          {
            label: 'Contribution',
            data: goalData.breakdown.values,
            backgroundColor: ['#34D399','#F59E0B','#A5B4FC','#60A5FA'],
            borderWidth: 0,
            borderRadius: 8,
            barThickness: 18
          }
        ]
      },
      options: {
        plugins: { legend: { display: false } },
        scales: {
          x: {
            ticks: { color: colors.tickColor, font: { size: 10 } },
            grid: { display: false }
          },
          y: {
            ticks: { color: colors.tickColor, font: { size: 10 } },
            grid: { color: colors.gridColor },
            beginAtZero: true
          }
        },
        responsive: true,
        maintainAspectRatio: false
      }
    });

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [selectedGoal]);

  return <canvas ref={canvasRef} className="w-full h-full" />;
};

export function StrategicGoalsDashboard() {
  const [selectedGoal, setSelectedGoal] = useState('g1');
  const [expandedGoals, setExpandedGoals] = useState<Set<string>>(new Set(['g1']));
  const [showFilters, setShowFilters] = useState(false);

  const toggleGoalExpansion = (goalId: string) => {
    const newExpanded = new Set(expandedGoals);
    if (newExpanded.has(goalId)) {
      newExpanded.delete(goalId);
    } else {
      newExpanded.add(goalId);
    }
    setExpandedGoals(newExpanded);
  };

  const currentGoal = data[selectedGoal as keyof typeof data] || data.g1;
  const statusInfo = statusPill(currentGoal.status);

  const renderObjectives = (objectives: any[]) => {
    return objectives.map((obj, index) => {
      const pill = statusPill(obj.status);
      const barColor = obj.status === 'on' ? 'bg-gradient-to-r from-emerald-400 to-emerald-300'
                    : obj.status === 'risk' ? 'bg-gradient-to-r from-amber-400 to-amber-300'
                    : 'bg-gradient-to-r from-rose-400 to-rose-300';
      
      return (
        <div key={index} className="p-3 rounded-lg bg-gray-800 ring-1 ring-border hover:ring-border/50 transition">
          <div className="flex items-center justify-between">
            <div className="text-sm text-foreground">{obj.name}</div>
            <span className={`text-[10px] px-1.5 py-0.5 rounded ring-1 ${pill.cls}`}>{pill.text}</span>
          </div>
          <div className="text-[11px] text-muted-foreground">Owner: {obj.owner}</div>
          <div className="mt-2 h-1.5 w-full rounded-full bg-muted ring-1 ring-border overflow-hidden">
            <div className={`h-full ${barColor}`} style={{ width: `${obj.pct}%` }}></div>
          </div>
          <div className="mt-1 text-[11px] text-muted-foreground">{obj.pct}% complete</div>
        </div>
      );
    });
  };

  return (
    <div className="min-h-screen bg-gray-950 text-foreground antialiased" style={{ fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial' }}>
      {/* Top Bar */}
      <header className="sticky top-0 z-40 backdrop-blur bg-gray-900/95 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-8 h-8 rounded-md bg-muted ring-1 ring-border">
                <span className="text-sm font-semibold tracking-tight">AC</span>
              </div>
              <div className="hidden sm:flex flex-col">
                <h1 className="text-[20px] sm:text-[22px] font-semibold tracking-tight text-foreground">Strategic Goals</h1>
                <p className="text-xs text-muted-foreground">Company-wide objectives with hierarchical roll-ups</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-2 bg-muted ring-1 ring-border rounded-lg px-2.5 h-9">
                <Search className="w-4.5 h-4.5 text-muted-foreground" />
                <input placeholder="Search goals, owners, metrics..." className="bg-transparent focus:outline-none text-sm placeholder:text-muted-foreground w-64" />
                <span className="text-[10px] text-muted-foreground border border-border rounded px-1.5 py-0.5">⌘K</span>
              </div>
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className={`hidden sm:flex items-center gap-2 h-9 px-3 rounded-lg transition-all ${
                  showFilters 
                    ? 'bg-indigo-500/15 ring-1 ring-indigo-400/30 text-indigo-300' 
                    : 'bg-muted hover:bg-muted/80 ring-1 ring-border hover:ring-border/50'
                }`}
              >
                <Filter className="w-4.5 h-4.5 text-muted-foreground" />
                <span className="text-sm">Filters</span>
              </button>
              <button className="flex items-center gap-2 h-9 px-3 rounded-lg bg-muted hover:bg-muted/80 ring-1 ring-border hover:ring-border/50 transition-all">
                <Settings2 className="w-4.5 h-4.5 text-muted-foreground" />
                <span className="hidden sm:inline text-sm">Configure</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="space-y-6">
          {/* Collapsible Filters Panel */}
          {showFilters && (
            <section className="p-4 rounded-xl bg-gray-900 ring-1 ring-border">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-[15px] font-semibold tracking-tight">Filters</h2>
                <div className="flex items-center gap-3">
                  <button className="text-xs text-muted-foreground hover:text-foreground transition">Reset</button>
                  {/* Legend */}
                  <div className="flex items-center gap-4 pl-4 border-l border-border">
                    <span className="text-xs text-muted-foreground">Legend:</span>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-400/80"></span>
                        <span className="text-xs text-foreground/70">On Track</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-amber-400/80"></span>
                        <span className="text-xs text-foreground/70">At Risk</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-rose-400/80"></span>
                        <span className="text-xs text-foreground/70">Off Track</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <label className="text-xs text-muted-foreground">Timeframe</label>
                  <div className="mt-2 grid grid-cols-3 gap-2">
                    <button className="text-xs px-2.5 py-1.5 rounded-lg bg-muted ring-1 ring-border hover:ring-border/50 transition">Q1</button>
                    <button className="text-xs px-2.5 py-1.5 rounded-lg bg-muted ring-1 ring-border hover:ring-border/50 transition">Q2</button>
                    <button className="text-xs px-2.5 py-1.5 rounded-lg bg-muted ring-1 ring-border hover:ring-border/50 transition">Q3</button>
                    <button className="text-xs px-2.5 py-1.5 rounded-lg bg-muted ring-1 ring-border hover:ring-border/50 transition">Q4</button>
                    <button className="text-xs px-2.5 py-1.5 rounded-lg bg-indigo-500/15 ring-1 ring-indigo-400/30 text-indigo-300">FY</button>
                    <button className="text-xs px-2.5 py-1.5 rounded-lg bg-muted ring-1 ring-border hover:ring-border/50 transition">Custom</button>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-muted-foreground">Owner</label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <button className="text-xs px-2.5 py-1.5 rounded-full bg-muted ring-1 ring-border hover:ring-border/50 transition">Company</button>
                    <button className="text-xs px-2.5 py-1.5 rounded-full bg-muted ring-1 ring-border hover:ring-border/50 transition">Sales</button>
                    <button className="text-xs px-2.5 py-1.5 rounded-full bg-muted ring-1 ring-border hover:ring-border/50 transition">Product</button>
                    <button className="text-xs px-2.5 py-1.5 rounded-full bg-muted ring-1 ring-border hover:ring-border/50 transition">Success</button>
                    <button className="text-xs px-2.5 py-1.5 rounded-full bg-muted ring-1 ring-border hover:ring-border/50 transition">Ops</button>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-muted-foreground">Status</label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <button className="text-xs px-2.5 py-1.5 rounded-full bg-emerald-500/10 ring-1 ring-emerald-500/30 text-emerald-300">On Track</button>
                    <button className="text-xs px-2.5 py-1.5 rounded-full bg-amber-500/10 ring-1 ring-amber-500/30 text-amber-300">At Risk</button>
                    <button className="text-xs px-2.5 py-1.5 rounded-full bg-rose-500/10 ring-1 ring-rose-500/30 text-rose-300">Off Track</button>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-muted-foreground">Show</label>
                  <div className="mt-2 flex items-center gap-2 flex-wrap">
                    <button className="text-[11px] px-2.5 py-1.5 rounded-lg bg-muted ring-1 ring-border hover:ring-border/50 transition">Roll-ups</button>
                    <button className="text-[11px] px-2.5 py-1.5 rounded-lg bg-muted ring-1 ring-border hover:ring-border/50 transition">Only leaf</button>
                    <button className="text-[11px] px-2.5 py-1.5 rounded-lg bg-muted ring-1 ring-border hover:ring-border/50 transition">My team</button>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Content */}
          <section className="space-y-6">
            {/* KPI Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-gray-900 ring-1 ring-border hover:ring-border/50 transition">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Total Goals</span>
                  <ListTree className="w-4.5 h-4.5 text-muted-foreground" />
                </div>
                <div className="mt-2 flex items-end justify-between">
                  <div>
                    <div className="text-[22px] font-semibold tracking-tight text-foreground">18</div>
                    <div className="text-xs text-muted-foreground">8 strategic, 10 sub-goals</div>
                  </div>
                  <span className="text-xs text-emerald-300 bg-emerald-500/10 ring-1 ring-emerald-500/30 px-2 py-0.5 rounded">+2 new</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-gray-900 ring-1 ring-border hover:ring-border/50 transition">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">On Track</span>
                  <CheckCircle2 className="w-4.5 h-4.5 text-emerald-300" />
                </div>
                <div className="mt-2 flex items-end justify-between">
                  <div>
                    <div className="text-[22px] font-semibold tracking-tight text-foreground">12</div>
                    <div className="text-xs text-muted-foreground">67% of all</div>
                  </div>
                  <span className="text-xs text-emerald-300 bg-emerald-500/10 ring-1 ring-emerald-500/30 px-2 py-0.5 rounded">+1</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-gray-900 ring-1 ring-border hover:ring-border/50 transition">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">At Risk</span>
                  <AlertTriangle className="w-4.5 h-4.5 text-amber-300" />
                </div>
                <div className="mt-2 flex items-end justify-between">
                  <div>
                    <div className="text-[22px] font-semibold tracking-tight text-foreground">4</div>
                    <div className="text-xs text-muted-foreground">+1 week trend</div>
                  </div>
                  <span className="text-xs text-amber-300 bg-amber-500/10 ring-1 ring-amber-500/30 px-2 py-0.5 rounded">+1</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-gray-900 ring-1 ring-border hover:ring-border/50 transition">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Avg Completion</span>
                  <Target className="w-4.5 h-4.5 text-indigo-300" />
                </div>
                <div className="mt-2 flex items-end justify-between">
                  <div>
                    <div className="text-[22px] font-semibold tracking-tight text-foreground">58%</div>
                    <div className="text-xs text-muted-foreground">Weighted by goal impact</div>
                  </div>
                  <span className="text-xs text-muted-foreground bg-muted ring-1 ring-border px-2 py-0.5 rounded">vs plan -2%</span>
                </div>
              </div>
            </div>

            {/* Middle: Hierarchy + Details */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {/* Hierarchy */}
              <section className="p-4 rounded-xl bg-gray-900 ring-1 ring-border">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h2 className="text-[18px] font-semibold tracking-tight">Goals hierarchy</h2>
                    <p className="text-xs text-muted-foreground">Click a goal to see its roll-up metrics</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="text-xs h-8 px-2.5 rounded-lg bg-muted ring-1 ring-border hover:ring-border/50 transition flex items-center gap-1.5">
                      <Expand className="w-4 h-4" />
                      Expand
                    </button>
                  </div>
                </div>

                <div className="divide-y divide-border">
                  {/* Goal Node (Level 1) */}
                  <div className="py-3">
                    <div className="flex items-start justify-between cursor-pointer" onClick={() => {
                      setSelectedGoal('g1');
                      toggleGoalExpansion('g1');
                    }}>
                      <div className="flex items-start gap-3">
                        <div className="mt-1">
                          <ChevronRight className={`w-4 h-4 text-muted-foreground transition-transform ${expandedGoals.has('g1') ? 'rotate-90' : ''}`} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold tracking-tight text-foreground">Increase ARR to $50M</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 ring-1 ring-emerald-500/30 text-emerald-300">On Track</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted ring-1 ring-border text-muted-foreground">Company</span>
                          </div>
                          <div className="mt-2 w-full max-w-lg">
                            <div className="h-1.5 w-full rounded-full bg-muted ring-1 ring-border overflow-hidden">
                              <div className="h-full bg-gradient-to-r from-indigo-400 via-indigo-300 to-indigo-400" style={{ width: '62%' }}></div>
                            </div>
                            <div className="mt-1 text-[11px] text-muted-foreground">Completion 62% • Target 65% • ARR $32.4M</div>
                          </div>
                        </div>
                      </div>
                      <button className="ml-3 text-xs text-muted-foreground hover:text-foreground transition flex items-center gap-1.5">
                        <ArrowUpRight className="w-4 h-4" /> Open
                      </button>
                    </div>

                    {/* Level 2 - conditionally rendered */}
                    {expandedGoals.has('g1') && (
                      <div className="pl-7 mt-3 space-y-3">
                        <div className="cursor-pointer" onClick={() => {
                          setSelectedGoal('g1-1');
                          toggleGoalExpansion('g1-1');
                        }}>
                          <div className="flex items-start justify-between py-2 rounded-lg hover:bg-muted/50">
                            <div className="flex items-start gap-3">
                              <div className="mt-1">
                                <ChevronRight className={`w-4 h-4 text-muted-foreground transition-transform ${expandedGoals.has('g1-1') ? 'rotate-90' : ''}`} />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium text-foreground">Grow New Business</span>
                                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 ring-1 ring-amber-500/30 text-amber-300">At Risk</span>
                                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted ring-1 ring-border text-muted-foreground">Sales</span>
                                </div>
                                <div className="mt-2 w-full max-w-lg">
                                  <div className="h-1.5 w-full rounded-full bg-muted ring-1 ring-border overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-amber-400 to-amber-300" style={{ width: '48%' }}></div>
                                  </div>
                                  <div className="mt-1 text-[11px] text-muted-foreground">Completion 48% • Pipeline $18M • Win rate 21%</div>
                                </div>
                              </div>
                            </div>
                            <div className="ml-3 flex items-center gap-4 text-[11px] text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <TrendingUp className="w-3.5 h-3.5" /> -2% vs plan
                              </div>
                            </div>
                          </div>

                          {/* Level 3 - conditionally rendered */}
                          {expandedGoals.has('g1-1') && (
                            <div className="pl-7 mt-2 space-y-2">
                              <div className="flex items-start justify-between py-2 rounded-lg hover:bg-muted/50 cursor-pointer" onClick={(e) => {
                                e.stopPropagation();
                                setSelectedGoal('g1-1-1');
                              }}>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm text-foreground">Enterprise expansion in NA</span>
                                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 ring-1 ring-emerald-500/30 text-emerald-300">On Track</span>
                                  </div>
                                  <div className="mt-2 w-full max-w-md">
                                    <div className="h-1.5 w-full rounded-full bg-muted ring-1 ring-border overflow-hidden">
                                      <div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-300" style={{ width: '70%' }}></div>
                                    </div>
                                    <div className="mt-1 text-[11px] text-muted-foreground">70% • 9/12 enterprise deals</div>
                                  </div>
                                </div>
                                <div className="ml-3 text-[11px] text-muted-foreground">Owner: VP Sales</div>
                              </div>

                              <div className="flex items-start justify-between py-2 rounded-lg hover:bg-muted/50 cursor-pointer" onClick={(e) => {
                                e.stopPropagation();
                                setSelectedGoal('g1-1-2');
                              }}>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm text-foreground">Mid-market velocity</span>
                                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-500/10 ring-1 ring-rose-500/30 text-rose-300">Off Track</span>
                                  </div>
                                  <div className="mt-2 w-full max-w-md">
                                    <div className="h-1.5 w-full rounded-full bg-muted ring-1 ring-border overflow-hidden">
                                      <div className="h-full bg-gradient-to-r from-rose-400 to-rose-300" style={{ width: '32%' }}></div>
                                    </div>
                                    <div className="mt-1 text-[11px] text-muted-foreground">32% • Cycle time +18%</div>
                                  </div>
                                </div>
                                <div className="ml-3 text-[11px] text-muted-foreground">Owner: Dir. Sales</div>
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="cursor-pointer" onClick={() => {
                          setSelectedGoal('g1-2');
                          toggleGoalExpansion('g1-2');
                        }}>
                          <div className="flex items-start justify-between py-2 rounded-lg hover:bg-muted/50">
                            <div className="flex items-start gap-3">
                              <div className="mt-1">
                                <ChevronRight className={`w-4 h-4 text-muted-foreground transition-transform ${expandedGoals.has('g1-2') ? 'rotate-90' : ''}`} />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium text-foreground">Improve Retention</span>
                                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 ring-1 ring-emerald-500/30 text-emerald-300">On Track</span>
                                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted ring-1 ring-border text-muted-foreground">Success</span>
                                </div>
                                <div className="mt-2 w-full max-w-lg">
                                  <div className="h-1.5 w-full rounded-full bg-muted ring-1 ring-border overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-300" style={{ width: '68%' }}></div>
                                  </div>
                                  <div className="mt-1 text-[11px] text-muted-foreground">Completion 68% • NRR 114% • Churn 2.4%</div>
                                </div>
                              </div>
                            </div>
                            <div className="ml-3 text-[11px] text-muted-foreground">Owner: CCO</div>
                          </div>

                          {expandedGoals.has('g1-2') && (
                            <div className="pl-7 mt-2 space-y-2">
                              <div className="flex items-start justify-between py-2 rounded-lg hover:bg-muted/50 cursor-pointer" onClick={(e) => {
                                e.stopPropagation();
                                setSelectedGoal('g1-2-1');
                              }}>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm text-foreground">Reduce onboarding time</span>
                                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 ring-1 ring-emerald-500/30 text-emerald-300">On Track</span>
                                  </div>
                                  <div className="mt-2 w-full max-w-md">
                                    <div className="h-1.5 w-full rounded-full bg-muted ring-1 ring-border overflow-hidden">
                                      <div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-300" style={{ width: '76%' }}></div>
                                    </div>
                                    <div className="mt-1 text-[11px] text-muted-foreground">76% • AHT -22%</div>
                                  </div>
                                </div>
                                <div className="ml-3 text-[11px] text-muted-foreground">Owner: Onboarding</div>
                              </div>

                              <div className="flex items-start justify-between py-2 rounded-lg hover:bg-muted/50 cursor-pointer" onClick={(e) => {
                                e.stopPropagation();
                                setSelectedGoal('g1-2-2');
                              }}>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm text-foreground">Proactive health alerts</span>
                                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 ring-1 ring-amber-500/30 text-amber-300">At Risk</span>
                                  </div>
                                  <div className="mt-2 w-full max-w-md">
                                    <div className="h-1.5 w-full rounded-full bg-muted ring-1 ring-border overflow-hidden">
                                      <div className="h-full bg-gradient-to-r from-amber-400 to-amber-300" style={{ width: '54%' }}></div>
                                    </div>
                                    <div className="mt-1 text-[11px] text-muted-foreground">54% • Coverage 63%</div>
                                  </div>
                                </div>
                                <div className="ml-3 text-[11px] text-muted-foreground">Owner: CS Ops</div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Another Goal Node (Level 1) */}
                  <div className="py-3">
                    <div className="flex items-start justify-between cursor-pointer" onClick={() => {
                      setSelectedGoal('g2');
                      toggleGoalExpansion('g2');
                    }}>
                      <div className="flex items-start gap-3">
                        <div className="mt-1">
                          <ChevronRight className={`w-4 h-4 text-muted-foreground transition-transform ${expandedGoals.has('g2') ? 'rotate-90' : ''}`} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold tracking-tight text-foreground">Accelerate Product Adoption</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 ring-1 ring-amber-500/30 text-amber-300">At Risk</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted ring-1 ring-border text-muted-foreground">Product</span>
                          </div>
                          <div className="mt-2 w-full max-w-lg">
                            <div className="h-1.5 w-full rounded-full bg-muted ring-1 ring-border overflow-hidden">
                              <div className="h-full bg-gradient-to-r from-amber-400 to-amber-300" style={{ width: '44%' }}></div>
                            </div>
                            <div className="mt-1 text-[11px] text-muted-foreground">44% • WAU +7% • Onboarding DAU 32%</div>
                          </div>
                        </div>
                      </div>
                      <span className="ml-3 text-[11px] text-muted-foreground">Owner: CPO</span>
                    </div>

                    {expandedGoals.has('g2') && (
                      <div className="pl-7 mt-3 space-y-3">
                        <div className="flex items-start justify-between py-2 rounded-lg hover:bg-muted/50 cursor-pointer" onClick={() => setSelectedGoal('g2-1')}>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-foreground">Launch Activation 2.0</span>
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-500/10 ring-1 ring-rose-500/30 text-rose-300">Off Track</span>
                            </div>
                            <div className="mt-2 w-full max-w-md">
                              <div className="h-1.5 w-full rounded-full bg-muted ring-1 ring-border overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-rose-400 to-rose-300" style={{ width: '28%' }}></div>
                              </div>
                              <div className="mt-1 text-[11px] text-muted-foreground">28% • Blocked by analytics</div>
                            </div>
                          </div>
                          <div className="ml-3 text-[11px] text-muted-foreground">Owner: PM Lead</div>
                        </div>

                        <div className="flex items-start justify-between py-2 rounded-lg hover:bg-muted/50 cursor-pointer" onClick={() => setSelectedGoal('g2-2')}>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-foreground">In-product guidance</span>
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 ring-1 ring-amber-500/30 text-amber-300">At Risk</span>
                            </div>
                            <div className="mt-2 w-full max-w-md">
                              <div className="h-1.5 w-full rounded-full bg-muted ring-1 ring-border overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-amber-400 to-amber-300" style={{ width: '46%' }}></div>
                              </div>
                              <div className="mt-1 text-[11px] text-muted-foreground">46% • Guide CTR 3.2%</div>
                            </div>
                          </div>
                          <div className="ml-3 text-[11px] text-muted-foreground">Owner: Design</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </section>

              {/* Details */}
              <section className="p-4 rounded-xl bg-gray-900 ring-1 ring-border">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-[18px] font-semibold tracking-tight">{currentGoal.title}</h2>
                    <div className="text-xs text-muted-foreground mt-0.5">{currentGoal.breadcrumbs}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] px-2 py-1 rounded ring-1 ${statusInfo.cls}`}>{statusInfo.text}</span>
                    <button className="h-8 px-2.5 rounded-lg bg-muted ring-1 ring-border hover:ring-border/50 transition text-xs flex items-center gap-1.5">
                      <Share2 className="w-4 h-4" /> Share
                    </button>
                  </div>
                </div>

                {/* Metrics Top */}
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Completion Ring */}
                  <div className="rounded-lg bg-gray-800 ring-1 ring-border p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Completion</span>
                      <Target className="w-4 h-4 text-indigo-300" />
                    </div>
                    <div className="mt-2">
                      <div className="relative mx-auto w-28 h-28">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-[18px] font-semibold tracking-tight text-foreground">{currentGoal.completion}%</div>
                        </div>
                        <div className="h-full">
                          <CompletionChart selectedGoal={selectedGoal} />
                        </div>
                      </div>
                      <div className="mt-2 text-[11px] text-muted-foreground text-center">vs plan 65%</div>
                    </div>
                  </div>

                  {/* KPI 1 */}
                  <div className="rounded-lg bg-gray-800 ring-1 ring-border p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Primary Metric</span>
                      <TrendingUp className="w-4 h-4 text-emerald-300" />
                    </div>
                    <div className="mt-2">
                      <div className="text-[18px] font-semibold tracking-tight text-foreground">{currentGoal.primary.value}</div>
                      <div className="text-[11px] text-muted-foreground">{currentGoal.primary.label}</div>
                      <div className="mt-2 h-1.5 w-full rounded-full bg-muted ring-1 ring-border overflow-hidden">
                        <div className={`h-full bg-gradient-to-r ${currentGoal.primary.color === 'indigo' ? 'from-indigo-400 via-indigo-300 to-indigo-400' : currentGoal.primary.color === 'emerald' ? 'from-emerald-400 to-emerald-300' : currentGoal.primary.color === 'amber' ? 'from-amber-400 to-amber-300' : 'from-rose-400 to-rose-300'}`} style={{ width: `${currentGoal.primary.pct}%` }}></div>
                      </div>
                    </div>
                  </div>

                  {/* KPI 2 */}
                  <div className="rounded-lg bg-gray-800 ring-1 ring-border p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Secondary Metric</span>
                      <Clock className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div className="mt-2">
                      <div className="text-[18px] font-semibold tracking-tight text-foreground">{currentGoal.secondary.value}</div>
                      <div className="text-[11px] text-muted-foreground">{currentGoal.secondary.label}</div>
                      <div className="mt-2 h-1.5 w-full rounded-full bg-muted ring-1 ring-border overflow-hidden">
                        <div className={`h-full bg-gradient-to-r ${currentGoal.secondary.color === 'indigo' ? 'from-indigo-400 via-indigo-300 to-indigo-400' : currentGoal.secondary.color === 'emerald' ? 'from-emerald-400 to-emerald-300' : currentGoal.secondary.color === 'amber' ? 'from-amber-400 to-amber-300' : 'from-rose-400 to-rose-300'}`} style={{ width: `${currentGoal.secondary.pct}%` }}></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Charts */}
                <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Trend Line */}
                  <div className="rounded-lg bg-gray-800 ring-1 ring-border p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-[15px] font-semibold tracking-tight">Performance trend</h3>
                        <p className="text-xs text-muted-foreground">Actual vs target over time</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="text-xs h-7 px-2 rounded bg-muted ring-1 ring-border hover:ring-border/50">M</button>
                        <button className="text-xs h-7 px-2 rounded bg-muted ring-1 ring-border hover:ring-border/50">Q</button>
                      </div>
                    </div>
                    <div className="mt-2">
                      <div className="h-44">
                        <TrendChart selectedGoal={selectedGoal} />
                      </div>
                    </div>
                  </div>

                  {/* Breakdown */}
                  <div className="rounded-lg bg-gray-800 ring-1 ring-border p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-[15px] font-semibold tracking-tight">Impact by KPI</h3>
                        <p className="text-xs text-muted-foreground">Contribution to goal completion</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted ring-1 ring-border text-muted-foreground">weighted</span>
                      </div>
                    </div>
                    <div className="mt-2">
                      <div className="h-44">
                        <BreakdownChart selectedGoal={selectedGoal} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Objectives list */}
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-[15px] font-semibold tracking-tight">Objectives under this goal</h3>
                    <button className="text-xs h-8 px-2.5 rounded-lg bg-muted ring-1 ring-border hover:ring-border/50 transition flex items-center gap-1.5">
                      <Plus className="w-4 h-4" /> Add
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {renderObjectives(currentGoal.objectives)}
                  </div>
                </div>
              </section>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}