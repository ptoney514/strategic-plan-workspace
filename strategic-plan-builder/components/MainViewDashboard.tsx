'use client';

import { useState } from 'react';
import { Search, Calendar, ChevronDown, BookOpen, Heart, Target, Users, GraduationCap, HeartHandshake, Megaphone, Handshake, Globe, ShieldCheck, Building2, Wallet, ArrowRight } from 'lucide-react';
import { GoalWithMetrics } from '@/lib/types';

interface MainViewDashboardProps {
  district: any;
  goals: GoalWithMetrics[];
  onDrillDown: (goalId: string) => void;
}

export default function MainViewDashboard({
  district,
  goals,
  onDrillDown
}: MainViewDashboardProps) {
  const [selectedFilter, setSelectedFilter] = useState('strategic-objective');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [selectedYear, setSelectedYear] = useState('2024–25');
  const [showYearDropdown, setShowYearDropdown] = useState(false);

  const filterOptions = [
    { id: 'strategic-objective', label: 'Strategic Objective' },
    { id: 'all', label: 'All Goals' },
    { id: 'on-target', label: 'On Target' },
    { id: 'watch', label: 'Watch' },
    { id: 'off-track', label: 'Off Track' }
  ];

  const yearOptions = ['2024–25', '2025–26', '2026–27'];

  // Map goals to objective cards
  const objectives = goals.map((goal, index) => {
    // Calculate metrics status
    const metrics = goal.metrics || [];
    const onTarget = metrics.filter(m => {
      // Calculate if metric is on track based on current vs target value
      if (m.target_value && (m.current_value !== undefined || m.actual_value !== undefined)) {
        const currentVal = m.current_value ?? m.actual_value ?? 0;
        const percentage = (currentVal / m.target_value) * 100;
        return percentage >= 75; // Consider on-track if >= 75% of target
      }
      return false;
    }).length;
    const total = metrics.length;
    const percentage = total > 0 ? Math.round((onTarget / total) * 100) : 0;
    
    // Determine overall status based on metrics or default to On Target
    let status: 'On Target' | 'Achieved' | 'Needs Attention' = 'On Target';
    if (total === 0) {
      // No metrics yet, default to On Target
      status = 'On Target';
    } else if (percentage >= 100) {
      status = 'Achieved';
    } else if (percentage < 50) {
      status = 'Needs Attention';
    } else {
      status = 'On Target';
    }

    // Select icons based on goal number
    const iconSets = [
      [BookOpen, Heart, Target],
      [Users, GraduationCap, HeartHandshake],
      [Megaphone, Handshake, Globe],
      [ShieldCheck, Building2, Wallet]
    ];
    const icons = iconSets[index % 4];

    // Goal images (using placeholder URLs)
    const images = [
      'https://images.unsplash.com/photo-1557734864-c78b6dfef1b1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdHVkZW50cyUyMGNvbGxhYm9yYXRpbmclMjBjbGFzc3Jvb20lMjBsZWFybmluZ3xlbnwxfHx8fDE3NTc0OTk2MDZ8MA&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1722643882339-7a6c9cb080db?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWFjaGVycyUyMHN0YWZmJTIwY29sbGFib3JhdGlvbiUyMG1lZXRpbmd8ZW58MXx8fHwxNzU3NDk5NjA5fDA&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1696041761463-8532347f4a91?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb21tdW5pdHklMjBwYXJ0bmVyc2hpcCUyMGZhbWlseSUyMGVuZ2FnZW1lbnR8ZW58MXx8fHwxNzU3NDk5NjEzfDA&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1706969151544-dfefd704a3b7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzY2hvb2wlMjBidWlsZGluZyUyMGluZnJhc3RydWN0dXJlJTIwbW9kZXJufGVufDF8fHx8MTc1NzQ5OTYxNnww&ixlib=rb-4.1.0&q=80&w=1080'
    ];

    return {
      id: goal.id,
      goalNumber: index + 1,
      title: goal.title,
      description: goal.description || '',
      imageUrl: images[index % 4],
      imageAlt: `${goal.title} visual`,
      status,
      kpiText: total > 0 ? `${onTarget}/${total} metrics on target` : 'No metrics defined',
      additionalInfo: goal.children?.length ? `${goal.children.length} sub-goals` : 'No sub-goals',
      icons,
      lastUpdated: '2d ago'
    };
  });

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'On Target':
        return 'bg-emerald-500/90 text-white';
      case 'Achieved':
        return 'bg-blue-500/90 text-white';
      case 'Needs Attention':
        return 'bg-amber-500/90 text-white';
      default:
        return 'bg-neutral-500/90 text-white';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'On Target':
        return '✓';
      case 'Achieved':
        return '★';
      case 'Needs Attention':
        return '!';
      default:
        return '•';
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      <div className="max-w-screen-2xl mx-auto px-6 md:px-8 pb-10">
        {/* Hero Section */}
        <section className="pt-8 md:pt-10">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
              <div>
                <p className="text-sm text-neutral-500">2024–2027 Strategic Plan</p>
                <h1 className="text-3xl md:text-4xl tracking-tight">Strategic Goals</h1>
                <p className="text-sm text-neutral-600 mt-1">
                  A focused snapshot of progress, status, and quick entry into each objective.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                  <input
                    type="text"
                    placeholder="Search"
                    className="pl-9 pr-3 py-2 text-sm border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                  />
                </div>

                {/* Filter Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                    className="inline-flex items-center gap-2 px-3 py-2 text-sm border border-neutral-200 rounded-xl hover:bg-neutral-50 bg-white"
                  >
                    <span className="text-neutral-600">Filtered by:</span>
                    <span className="font-medium">{filterOptions.find(f => f.id === selectedFilter)?.label}</span>
                    <ChevronDown className="h-4 w-4 text-neutral-400" />
                  </button>
                  
                  {showFilterDropdown && (
                    <div className="absolute right-0 mt-2 w-48 rounded-xl border border-neutral-200 bg-white shadow-lg overflow-hidden z-10">
                      {filterOptions.map((filter) => (
                        <button
                          key={filter.id}
                          onClick={() => {
                            setSelectedFilter(filter.id);
                            setShowFilterDropdown(false);
                          }}
                          className="w-full text-left px-3 py-2 text-sm hover:bg-neutral-50"
                        >
                          {filter.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Year Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowYearDropdown(!showYearDropdown)}
                    className="inline-flex items-center gap-2 px-3 py-2 text-sm border border-neutral-200 rounded-xl hover:bg-neutral-50 bg-white"
                  >
                    <Calendar className="h-4 w-4 text-neutral-400" />
                    <span className="font-medium">{selectedYear}</span>
                    <ChevronDown className="h-4 w-4 text-neutral-400" />
                  </button>
                  
                  {showYearDropdown && (
                    <div className="absolute right-0 mt-2 w-36 rounded-xl border border-neutral-200 bg-white shadow-lg overflow-hidden z-10">
                      {yearOptions.map((year) => (
                        <button
                          key={year}
                          onClick={() => {
                            setSelectedYear(year);
                            setShowYearDropdown(false);
                          }}
                          className="w-full text-left px-3 py-2 text-sm hover:bg-neutral-50"
                        >
                          {year}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Statistics Cards */}
        <div className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl p-4 ring-1 ring-neutral-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-600">Total Goals</p>
                  <p className="text-2xl font-semibold mt-1">{goals.length}</p>
                </div>
                <Target className="h-8 w-8 text-teal-600" />
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 ring-1 ring-neutral-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-600">On Track</p>
                  <p className="text-2xl font-semibold mt-1 text-emerald-600">
                    {objectives.filter(o => o.status === 'On Target').length}
                  </p>
                </div>
                <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center">
                  <div className="h-3 w-3 rounded-full bg-emerald-500" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 ring-1 ring-neutral-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-600">Needs Attention</p>
                  <p className="text-2xl font-semibold mt-1 text-amber-600">
                    {objectives.filter(o => o.status === 'Needs Attention').length}
                  </p>
                </div>
                <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center">
                  <div className="h-3 w-3 rounded-full bg-amber-500" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Objectives Grid */}
        <section className="mt-6 md:mt-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6 items-stretch">
            {objectives.map((objective) => (
              <div key={objective.id} className="group relative rounded-2xl bg-white ring-1 ring-neutral-200 overflow-hidden hover:shadow-lg transition">
                <div className="relative h-28">
                  <img
                    src={objective.imageUrl}
                    alt={objective.imageAlt}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/70 via-neutral-900/20 to-transparent"></div>
                  
                  <div className="absolute top-3 left-3 inline-flex items-center gap-2 rounded-full bg-white/90 backdrop-blur px-2.5 py-1">
                    <span className="text-[11px] text-neutral-700">Goal {objective.goalNumber}</span>
                  </div>
                  
                  <div className={`absolute top-3 right-3 inline-flex items-center gap-2 rounded-full px-2.5 py-1 ${getStatusStyle(objective.status)}`}>
                    <span className="h-2 w-2 rounded-full bg-white/80"></span>
                    <span className="text-[11px]">{objective.status}</span>
                  </div>
                </div>

                <div className="p-4 h-52 flex flex-col">
                  <h3 className="text-lg tracking-tight text-neutral-900">{objective.title}</h3>
                  <p className="text-sm text-neutral-600 mt-1">{objective.description}</p>
                  
                  <div className="flex-grow min-h-6"></div>
                  
                  <div className="space-y-3">
                    <div className="text-sm text-neutral-600">
                      <div>{objective.kpiText}</div>
                      <div className="text-xs mt-1">{objective.additionalInfo}</div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-neutral-600">
                        {objective.icons.map((Icon, index) => (
                          <Icon key={index} className="h-4 w-4" />
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 pb-6 flex items-center justify-between gap-2 min-h-[32px]">
                    <span className="text-xs text-neutral-500 truncate flex-shrink">Updated {objective.lastUpdated}</span>
                    <button 
                      onClick={() => onDrillDown(objective.id)}
                      className="inline-flex items-center gap-2 text-sm text-teal-700 bg-teal-50 hover:bg-teal-100 transition rounded-lg px-3 py-1.5 flex-shrink-0"
                    >
                      View Objective
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}