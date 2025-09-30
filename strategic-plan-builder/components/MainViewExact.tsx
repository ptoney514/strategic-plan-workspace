'use client';

import { useState } from 'react';
import { 
  Search, 
  Calendar, 
  ChevronDown, 
  BookOpen, 
  Heart, 
  Target, 
  Users, 
  GraduationCap, 
  HeartHandshake, 
  Megaphone, 
  Handshake, 
  Globe, 
  ShieldCheck, 
  Building2, 
  Wallet, 
  ArrowRight,
  TrendingUp,
  Activity,
  Grid3x3,
  X,
  ArrowLeft,
  ChevronRight,
  Menu,
  Layers,
  Settings,
  Home,
  LayoutGrid,
  BarChart2
} from 'lucide-react';
import { GoalWithMetrics, calculateMetricStatus, getMetricStatusConfig } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { MetricStatusCard, MetricStatusGrid } from './MetricStatusCard';
import DistrictSwitcher from './DistrictSwitcher';
import StrategicObjectivesGrid from './StrategicObjectivesGrid';
import StrategicObjectivesDark from './StrategicObjectivesDark';
import GoalDetailPanel from './GoalDetailPanel';

interface MainViewExactProps {
  district: any;
  goals: GoalWithMetrics[];
  onDrillDown: (goalId: string) => void;
  districtSlug?: string;
}

export default function MainViewExact({
  district,
  goals,
  onDrillDown,
  districtSlug = 'test-district'
}: MainViewExactProps) {
  const router = useRouter();
  const [selectedObjective, setSelectedObjective] = useState<any>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<GoalWithMetrics | null>(null);
  const [isGoalPanelOpen, setIsGoalPanelOpen] = useState(false);

  // Map goals to objective cards with exact Figma styling - only top-level goals (strategic objectives)
  const objectives = goals.filter(g => g.parent_id === null).map((goal, index) => {
    // Get metrics from all child goals
    const getAllMetrics = (g: GoalWithMetrics): any[] => {
      let allMetrics = [...(g.metrics || [])];
      if (g.children) {
        g.children.forEach(child => {
          allMetrics = allMetrics.concat(getAllMetrics(child));
        });
      }
      return allMetrics;
    };
    
    const metrics = getAllMetrics(goal);
    const childGoalsCount = goal.children?.length || 0;
    const onTarget = metrics.filter(m => {
      if (m.target_value && (m.current_value !== undefined || m.actual_value !== undefined)) {
        const currentVal = m.current_value ?? m.actual_value ?? 0;
        const percentage = (currentVal / m.target_value) * 100;
        return percentage >= 75;
      }
      return false;
    }).length;
    const total = metrics.length;
    const percentage = total > 0 ? Math.round((onTarget / total) * 100) : 0;
    
    // Use custom status indicator from database
    let statusText = goal.indicator_text || 'Not Started';
    let statusColor = goal.indicator_color || '#9ca3af';
    
    // Map preset color names to hex values if needed
    const colorMap: { [key: string]: string } = {
      'green': '#10b981',
      'yellow': '#eab308', 
      'orange': '#f97316',
      'red': '#ef4444',
      'blue': '#3b82f6',
      'purple': '#9333ea',
      'gray': '#9ca3af'
    };
    
    // Convert color name to hex if it's not already a hex value
    if (statusColor && !statusColor.startsWith('#')) {
      statusColor = colorMap[statusColor.toLowerCase()] || statusColor;
    }


    // Fallback images if no image_url is provided
    const fallbackImages = [
      'https://images.unsplash.com/photo-1557734864-c78b6dfef1b1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdHVkZW50cyUyMGNvbGxhYm9yYXRpbmclMjBjbGFzc3Jvb20lMjBsZWFybmluZ3xlbnwxfHx8fDE3NTc0OTk2MDZ8MA&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1722643882339-7a6c9cb080db?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWFjaGVycyUyMHN0YWZmJTIwY29sbGFib3JhdGlvbiUyMG1lZXRpbmd8ZW58MXx8fHwxNzU3NDk5NjA5fDA&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1696041761463-8532347f4a91?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb21tdW5pdHklMjBwYXJ0bmVyc2hpcCUyMGZhbWlseSUyMGVuZ2FnZW1lbnR8ZW58MXx8fHwxNzU3NDk5NjEzfDA&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1706969151544-dfefd704a3b7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzY2hvb2wlMjBidWlsZGluZyUyMGluZnJhc3RydWN0dXJlJTIwbW9kZXJufGVufDF8fHx8MTc1NzQ5OTYxNnww&ixlib=rb-4.1.0&q=80&w=1080'
    ];

    const goalsText = childGoalsCount === 0 ? 'No goals defined' :
                      childGoalsCount === 1 ? '1 goal in this objective' :
                      `${childGoalsCount} goals in this objective`;

    return {
      id: goal.id,
      goalNumber: goal.goal_number || index + 1,
      title: goal.title,
      description: goal.description || `Strategic objective focused on ${goal.title.toLowerCase()}`,
      imageUrl: goal.image_url || fallbackImages[index % 4],
      headerColor: goal.header_color,
      imageAlt: `Goal ${goal.goal_number || index + 1}`,
      statusText,
      statusColor,
      percentage,
      goalsText,
      metricsText: total > 0 ? `${onTarget}/${total} metrics on track` : '',
      children: goal.children || [],
      childrenCount: goal.children?.length || 0
    };
  });

  const handleViewObjective = (objective: any) => {
    // Find the actual goal object for this objective
    const goalObj = goals.find(g => g.id === objective.id);
    setSelectedObjective({ ...objective, goal: goalObj });
    setIsPanelOpen(true);
  };

  const closePanel = () => {
    setIsPanelOpen(false);
    setTimeout(() => setSelectedObjective(null), 300);
  };

  const handleGoalClick = (goal: GoalWithMetrics) => {
    setSelectedGoal(goal);
    setIsGoalPanelOpen(true);
  };

  const closeGoalPanel = () => {
    setIsGoalPanelOpen(false);
    setTimeout(() => setSelectedGoal(null), 300);
  };




  return (
    <div className="min-h-screen bg-gray-50 relative">
      {/* Mobile Header */}
      <header className="lg:hidden bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Toggle menu"
            >
              <Menu className="w-6 h-6 text-gray-700" />
            </button>
            <div>
              <h1 className="text-lg font-semibold text-gray-900 line-clamp-1">{district?.name || 'Test District'}</h1>
              <p className="text-xs text-gray-500">Strategic Plan</p>
            </div>
          </div>
          <DistrictSwitcher 
            currentDistrictSlug={districtSlug} 
            currentDistrictName={district?.name}
          />
        </div>
        
        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <>
            <div className="absolute top-full left-0 right-0 bg-white border-b border-gray-200 shadow-lg z-50">
              <nav className="py-2">
                <button 
                  onClick={() => setIsMobileMenuOpen(false)} 
                  className="flex items-center gap-3 px-4 py-3 bg-gray-50 transition-colors w-full text-left"
                  disabled
                >
                  <LayoutGrid className="w-5 h-5 text-teal-600" />
                  <span className="text-gray-900 font-medium">Strategic Plan (Current)</span>
                </button>
                <button 
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    router.push(`/dashboard/${districtSlug}/impact`);
                  }} 
                  className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors w-full text-left"
                >
                  <TrendingUp className="w-5 h-5 text-gray-600" />
                  <span className="text-gray-900">Impact Dashboard</span>
                </button>
                <button 
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    router.push(`/districts/${districtSlug}/admin`);
                  }} 
                  className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors w-full text-left border-t border-gray-100 mt-2 pt-4"
                >
                  <Settings className="w-5 h-5 text-gray-600" />
                  <span className="text-gray-900">Admin</span>
                </button>
                <button 
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    router.push(`/homepage/${districtSlug}`);
                  }} 
                  className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors w-full text-left"
                >
                  <Home className="w-5 h-5 text-gray-600" />
                  <span className="text-gray-900">Homepage</span>
                </button>
              </nav>
            </div>
            {/* Overlay to close menu */}
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setIsMobileMenuOpen(false)}
            />
          </>
        )}
      </header>

      {/* Desktop Header */}
      <header className="hidden lg:block bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-gray-900">{district?.name || 'Denver Public Schools'}</h1>
              <span className="text-sm text-gray-500">Strategic Plan Dashboard</span>
              {/* District Switcher */}
              <DistrictSwitcher 
                currentDistrictSlug={districtSlug} 
                currentDistrictName={district?.name}
              />
            </div>
            <div className="flex items-center gap-3">
              {/* Dashboard Navigation */}
              <nav className="flex items-center gap-2">
                <button 
                  className="px-3 py-1.5 bg-teal-600 text-white rounded-md text-sm font-medium flex items-center gap-1.5"
                  disabled
                >
                  <LayoutGrid className="w-4 h-4" />
                  Strategic Plan
                </button>
                <button 
                  onClick={() => router.push(`/dashboard/${districtSlug}/impact`)}
                  className="px-3 py-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors text-sm font-medium flex items-center gap-1.5"
                >
                  <TrendingUp className="w-4 h-4" />
                  Impact Dashboard
                </button>
              </nav>
              
              {/* Other Links */}
              <div className="flex items-center gap-2 border-l pl-3 ml-2">
                <button 
                  onClick={() => router.push(`/districts/${districtSlug}/admin`)}
                  className="px-3 py-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors text-sm font-medium flex items-center gap-1.5"
                >
                  <Settings className="w-4 h-4" />
                  Admin
                </button>
                <button 
                  onClick={() => router.push(`/homepage/${districtSlug}`)}
                  className="px-3 py-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors text-sm font-medium flex items-center gap-1.5"
                >
                  <Home className="w-4 h-4" />
                  Homepage
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className={`transition-all duration-300 ${isPanelOpen ? 'lg:mr-[480px]' : ''}`}>
        {/* Main Dashboard - Centered */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-8">
          {/* Use the dark theme Strategic Objectives component */}
          <StrategicObjectivesDark 
            goals={goals}
            onDrillDown={(goalId) => {
              const objective = objectives.find(o => o.id === goalId);
              if (objective) {
                handleViewObjective(objective);
              }
            }}
          />
          
          {/* Alternative: Light theme version */}
          {/* <StrategicObjectivesGrid 
            goals={goals}
            onDrillDown={(goalId) => {
              const objective = objectives.find(o => o.id === goalId);
              if (objective) {
                handleViewObjective(objective);
              }
            }}
          /> */}

          {/* Keep the old grid commented out for reference */}
          {/* <div className={`grid gap-6 ${
            objectives.length === 1 
              ? 'grid-cols-1 max-w-4xl mx-auto' 
              : objectives.length === 2 
              ? 'grid-cols-1 md:grid-cols-2 max-w-5xl mx-auto' 
              : objectives.length === 3
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto'
              : 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-4'
          }`}>
            {objectives.map((objective) => (
              <div key={objective.id} className={`bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg transition-shadow ${
                objectives.length === 1 ? 'md:flex md:flex-row' : ''
              }`}>
                <div className={`relative ${
                  objectives.length === 1 ? 'md:w-2/5 h-48 md:h-auto' : 'h-36'
                }`}>
                  {objective.headerColor && !objective.imageUrl.includes('unsplash') ? (
                    <div
                      className="w-full h-full"
                      style={{ backgroundColor: objective.headerColor }}
                    />
                  ) : (
                    <>
                      <img
                        src={objective.imageUrl}
                        alt={objective.imageAlt}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    </>
                  )}
                  
                  <div 
                    className="absolute top-3 right-3 rounded-full px-3 py-1.5 flex items-center gap-1.5 text-xs font-semibold border"
                    style={{
                      backgroundColor: objective.statusText === 'On Target' ? '#dcfce7' : 
                                      objective.statusText === 'At Risk' ? '#fee2e2' :
                                      objective.statusText === 'Needs Attention' ? '#fed7aa' :
                                      '#f3f4f6',
                      color: objective.statusColor || '#6b7280',
                      borderColor: objective.statusColor || '#e5e7eb'
                    }}
                  >
                    <div 
                      className="w-2 h-2 rounded-full" 
                      style={{ backgroundColor: objective.statusColor || '#6b7280' }}
                    />
                    <span>{objective.statusText}</span>
                  </div>
                </div>

                <div className={`${
                  objectives.length === 1 
                    ? 'p-6 md:p-8 md:flex-1 flex flex-col justify-between' 
                    : 'p-4 lg:p-5'
                }`}>
                  <div>
                    <h3 className={`font-semibold text-gray-900 mb-3 leading-tight ${
                      objectives.length === 1 ? 'text-xl md:text-2xl' : ''
                    }`}>{objective.goalNumber}. {objective.title}</h3>

                    <div className="mb-4">
                      <p className={`text-gray-600 ${
                        objectives.length === 1 ? 'text-base md:text-lg line-clamp-3' : 'text-sm line-clamp-2'
                      }`}>{objective.description}</p>
                    </div>

                    {objectives.length === 1 && (
                      <div className="flex flex-wrap gap-4 mb-6">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full" />
                          <span className="text-sm text-gray-600">{objective.goalsText}</span>
                        </div>
                        {objective.metricsText && (
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full" />
                            <span className="text-sm text-gray-600">{objective.metricsText}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className={`flex ${objectives.length === 1 ? 'justify-start' : 'justify-end'}`}>
                    <button
                      onClick={() => handleViewObjective(objective)}
                      className={`font-medium flex items-center gap-2 transition-colors ${
                        objectives.length === 1 
                          ? 'px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700'
                          : 'text-sm text-teal-600 hover:text-teal-700 gap-1'
                      }`}
                    >
                      View Progress
                      <ArrowRight className={objectives.length === 1 ? 'w-4 h-4' : 'w-3 h-3'} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div> */}

          {/* Success Story Section */}
          <div className="mt-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-8 text-white relative overflow-hidden">
            <div className="flex items-start gap-2 mb-4">
              <span className="text-2xl">⭐</span>
              <span className="text-sm font-medium opacity-90">Success Story</span>
            </div>
            
            <h2 className="text-3xl font-bold mb-4">Emma's Reading Journey</h2>
            
            <p className="text-lg mb-6 opacity-95">
              "Six months ago, Emma struggled with reading. Thanks to our new reading 
              specialists and personalized support, she's now reading above grade level 
              and loves picking out books at the library!"
            </p>
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-sm font-semibold">SJ</span>
              </div>
              <div>
                <p className="font-semibold">Sarah Johnson</p>
                <p className="text-sm opacity-90">Emma's Mom, Grade 2</p>
              </div>
            </div>
            
            <div className="absolute top-8 right-8 opacity-20">
              <BookOpen className="w-32 h-32" />
            </div>
          </div>

          {/* How You Can Help Section */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">How You Can Help</h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              {/* Volunteer to Read */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 text-center border-0">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Volunteer to Read</h3>
                <p className="text-gray-600 mb-4">
                  Help students practice reading skills during our daily reading circles.
                </p>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
                  Sign Up
                </button>
              </div>

              {/* Share Your Story */}
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 text-center border-0">
                <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Megaphone className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Share Your Story</h3>
                <p className="text-gray-600 mb-4">
                  Tell us how our programs have impacted your child's learning journey.
                </p>
                <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors">
                  Share Now
                </button>
              </div>

              {/* Attend Events */}
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 text-center border-0">
                <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Attend Events</h3>
                <p className="text-gray-600 mb-4">
                  Join our monthly community events and school board meetings.
                </p>
                <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors">
                  View Calendar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Slide-out Panel - Responsive */}
      <div className={`fixed top-0 right-0 h-full w-full sm:w-[480px] bg-white shadow-2xl transform transition-transform duration-300 z-50 ${
        isPanelOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        {selectedObjective && (
          <div className="h-full flex flex-col">
            {/* Panel Header */}
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={closePanel}
                  className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-600" />
                </button>
                <div>
                  <p className="text-xs text-gray-500">Strategic Objective {selectedObjective.goalNumber}</p>
                </div>
              </div>
              <button
                onClick={closePanel}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Panel Content */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-6">
                {/* Goal Title and Description */}
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {selectedObjective.title}
                </h2>
                <p className="text-gray-600 mb-6">
                  {selectedObjective.description}
                </p>
                
                {/* Objective Status */}
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg mb-6">
                  <div className="flex-1">
                    <p className="text-sm text-gray-500">Overall Status</p>
                    <p className="text-lg font-semibold text-gray-900">{selectedObjective.statusText}</p>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-500">Sub-goals</p>
                    <p className="text-lg font-semibold text-gray-900">{selectedObjective.goal?.children?.length || 0}</p>
                  </div>
                </div>

                {/* Goals */}
                <div className="mb-6">
                  {/* Goals Status Overview */}
                {selectedObjective.goal && selectedObjective.goal.children && selectedObjective.goal.children.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Goals Overview</h3>
                    <div className="space-y-3">
                      {selectedObjective.goal.children.map((subGoal: any) => {
                        // Use status indicator from database if available
                        let statusText = subGoal.indicator_text || 'Not Started';
                        let statusColor = subGoal.indicator_color || '#9ca3af';
                        
                        // Map preset color names to hex values if needed
                        const colorMap: { [key: string]: string } = {
                          'green': '#10b981',
                          'yellow': '#eab308', 
                          'orange': '#f97316',
                          'red': '#ef4444',
                          'blue': '#3b82f6',
                          'purple': '#9333ea',
                          'gray': '#9ca3af'
                        };
                        
                        // Convert color name to hex if it's not already a hex value
                        if (statusColor && !statusColor.startsWith('#')) {
                          statusColor = colorMap[statusColor.toLowerCase()] || statusColor;
                        }
                        
                        return (
                          <div
                            key={subGoal.id}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer transition-all hover:bg-gray-100 hover:shadow-sm active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-1"
                            onClick={() => handleGoalClick(subGoal)}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                handleGoalClick(subGoal);
                              }
                            }}
                            aria-label={`View details for ${subGoal.title}`}
                          >
                            <div className="flex-1 pointer-events-none">
                              <p className="text-sm font-medium text-gray-900">
                                {subGoal.goal_number}
                              </p>
                              <p className="text-sm text-gray-600 mt-0.5">
                                {subGoal.title}
                              </p>
                              {subGoal.metrics && subGoal.metrics.length === 0 && (
                                <p className="text-xs text-gray-500 mt-1">No metrics defined</p>
                              )}
                            </div>
                            <div className="flex items-center gap-3 pointer-events-none">
                              <div
                                className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold border"
                                style={{
                                  backgroundColor: statusText === 'On Track' ? '#dcfce7' :
                                                  statusText === 'At Risk' ? '#fee2e2' :
                                                  statusText === 'Needs Attention' ? '#fed7aa' :
                                                  '#f3f4f6',
                                  color: statusColor || '#6b7280',
                                  borderColor: statusColor || '#e5e7eb'
                                }}
                              >
                                <div
                                  className="w-1.5 h-1.5 rounded-full"
                                  style={{ backgroundColor: statusColor || '#6b7280' }}
                                />
                                <span>{statusText}</span>
                              </div>
                              <ChevronRight className="w-4 h-4 text-gray-400" />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                
                <div className="flex items-center gap-2 mb-4">
                    <Target className="w-5 h-5 text-gray-700" />
                    <h3 className="font-semibold text-gray-900">Goals</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    Track progress across all goals and measures within this strategic objective.
                  </p>

                  {/* Sub-goals */}
                  <div className="space-y-3">
                    {selectedObjective.goal && selectedObjective.goal.children && selectedObjective.goal.children.length > 0 ? (
                      selectedObjective.goal.children.map((subGoal: any) => {
                        // Use status indicator from database if available
                        let statusText = subGoal.indicator_text || 'Not Started';
                        let statusColor = subGoal.indicator_color || '#9ca3af';
                        
                        // Map preset color names to hex values if needed
                        const colorMap: { [key: string]: string } = {
                          'green': '#10b981',
                          'yellow': '#eab308', 
                          'orange': '#f97316',
                          'red': '#ef4444',
                          'blue': '#3b82f6',
                          'purple': '#9333ea',
                          'gray': '#9ca3af'
                        };
                        
                        // Convert color name to hex if it's not already a hex value
                        if (statusColor && !statusColor.startsWith('#')) {
                          statusColor = colorMap[statusColor.toLowerCase()] || statusColor;
                        }
                        
                        // Calculate progress for each sub-goal based on metrics
                        const subGoalMetrics = subGoal.metrics || [];
                        const subGoalOnTarget = subGoalMetrics.filter((m: any) => {
                          if (m.target_value && (m.current_value !== undefined || m.actual_value !== undefined)) {
                            const currentVal = m.current_value ?? m.actual_value ?? 0;
                            const percentage = (currentVal / m.target_value) * 100;
                            return percentage >= 75;
                          }
                          return false;
                        }).length;
                        const subGoalTotal = subGoalMetrics.length;
                        const subGoalProgress = subGoalTotal > 0 ? Math.round((subGoalOnTarget / subGoalTotal) * 100) : 0;
                        
                        return (
                          <div
                            key={subGoal.id}
                            className="border border-gray-200 rounded-lg p-4 cursor-pointer transition-all hover:bg-gray-50 hover:border-gray-300 hover:shadow-sm active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
                            onClick={() => handleGoalClick(subGoal)}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                handleGoalClick(subGoal);
                              }
                            }}
                            aria-label={`View metrics and details for ${subGoal.title}`}
                          >
                            <div className="flex items-start justify-between mb-2 pointer-events-none">
                              <div className="flex items-start gap-3">
                                <Target className="w-5 h-5 text-teal-600 mt-0.5" />
                                <div className="flex-1">
                                  <p className="font-medium text-gray-900">
                                    {subGoal.goal_number} {subGoal.title}
                                  </p>
                                  <p className="text-sm text-gray-600 mt-1">
                                    {subGoal.description || `Key goal supporting ${selectedObjective.title}`}
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* Status Badge and Metrics */}
                            <div className="mt-3 flex items-center justify-between pointer-events-none">
                              <div className="flex items-center gap-2">
                                <div
                                  className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold border"
                                  style={{
                                    backgroundColor: statusText === 'On Track' ? '#dcfce7' :
                                                    statusText === 'At Risk' ? '#fee2e2' :
                                                    statusText === 'Needs Attention' ? '#fed7aa' :
                                                    '#f3f4f6',
                                    color: statusColor || '#6b7280',
                                    borderColor: statusColor || '#e5e7eb'
                                  }}
                                >
                                  <div
                                    className="w-1.5 h-1.5 rounded-full"
                                    style={{ backgroundColor: statusColor || '#6b7280' }}
                                  />
                                  <span>{statusText}</span>
                                </div>
                                {subGoalTotal > 0 && (
                                  <span className="text-xs text-gray-500">
                                    {subGoalOnTarget}/{subGoalTotal} metrics on target
                                  </span>
                                )}
                              </div>

                              {/* View Details Indicator */}
                              <div className="flex items-center gap-1 text-sm text-gray-500">
                                <span className="hidden sm:inline">View details</span>
                                <ChevronRight className="w-4 h-4" />
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      /* Default sub-goals for demo */
                      <>
                        <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                          <div className="flex items-start gap-3">
                            <Target className="w-5 h-5 text-teal-600 mt-0.5" />
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">1.1 Improve Reading Proficiency</p>
                              <p className="text-sm text-gray-600 mt-1">
                                Increase the percentage of students reading at grade level through targeted interventions.
                              </p>
                              <div className="mt-3">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-xs font-medium text-red-600">0% complete</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-1.5">
                                  <div className="bg-red-500 h-1.5 rounded-full" style={{ width: '0%' }} />
                                </div>
                              </div>
                              <div className="mt-3 flex justify-end">
                                <button className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1">
                                  View details
                                  <ChevronRight className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                          <div className="flex items-start gap-3">
                            <Activity className="w-5 h-5 text-teal-600 mt-0.5" />
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">1.2 Reduce Chronic Absenteeism</p>
                              <p className="text-sm text-gray-600 mt-1">This is a measure</p>
                              <div className="mt-3">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-xs font-medium text-red-600">0% complete</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-1.5">
                                  <div className="bg-red-500 h-1.5 rounded-full" style={{ width: '0%' }} />
                                </div>
                              </div>
                              <div className="mt-3 flex justify-end">
                                <button className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1">
                                  View details
                                  <ChevronRight className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                          <div className="flex items-start gap-3">
                            <Target className="w-5 h-5 text-teal-600 mt-0.5" />
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">1.3 Improve Reading Proficiency</p>
                              <p className="text-sm text-gray-600 mt-1">
                                Increase the percentage of students reading at grade level through targeted interventions.
                              </p>
                              <div className="mt-3">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-xs font-medium text-red-600">0% complete</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-1.5">
                                  <div className="bg-red-500 h-1.5 rounded-full" style={{ width: '0%' }} />
                                </div>
                              </div>
                              <div className="mt-3 flex justify-end">
                                <button className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1">
                                  View details
                                  <ChevronRight className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                          <div className="flex items-start gap-3">
                            <Activity className="w-5 h-5 text-teal-600 mt-0.5" />
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">1.4 Reduce Chronic Absenteeism</p>
                              <p className="text-sm text-gray-600 mt-1">
                                Implement strategies to improve student attendance and engagement.
                              </p>
                              <div className="mt-3">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-xs font-medium text-red-600">0% complete</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-1.5">
                                  <div className="bg-red-500 h-1.5 rounded-full" style={{ width: '0%' }} />
                                </div>
                              </div>
                              <div className="mt-3 flex justify-end">
                                <button className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1">
                                  View details
                                  <ChevronRight className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Overlay */}
      {isPanelOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-40"
          onClick={closePanel}
        />
      )}

      {/* Goal Detail Panel */}
      <GoalDetailPanel 
        goal={selectedGoal}
        isOpen={isGoalPanelOpen}
        onClose={closeGoalPanel}
      />

      {/* Overlay for Goal Panel */}
      {isGoalPanelOpen && (
        <div 
          className="fixed inset-0 bg-black/30 z-[55]"
          onClick={closeGoalPanel}
        />
      )}
    </div>
  );
}