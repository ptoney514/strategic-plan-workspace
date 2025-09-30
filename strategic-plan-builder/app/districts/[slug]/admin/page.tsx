'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useDistrict } from '@/hooks/use-district';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Loader2, Eye, Save, Search, Command, ChevronLeft, ChevronRight, Settings, LayoutGrid, TrendingUp, BarChart2, Home } from 'lucide-react';
import DistrictSwitcher from '@/components/DistrictSwitcher';
import { toast } from 'sonner';
import { useHotkeys } from 'react-hotkeys-hook';
import { cn } from '@/lib/utils';
import GoalsSplitViewV2 from './components/GoalsSplitViewV2';
import GlobalSearch from './components/GlobalSearch';
import { GoalWithMetrics } from '@/lib/types';

// Helper function to find a goal in hierarchical structure
function findGoalById(goals: GoalWithMetrics[], goalId: string): GoalWithMetrics | null {
  for (const goal of goals) {
    if (goal.id === goalId) {
      return goal;
    }
    if (goal.children && goal.children.length > 0) {
      const found = findGoalById(goal.children, goalId);
      if (found) return found;
    }
  }
  return null;
}

export default function DistrictAdminPage() {
  const params = useParams();
  const router = useRouter();
  const districtSlug = params.slug as string;
  
  // Data fetching
  const { data: district, isLoading, error, refetch } = useDistrict(districtSlug);
  
  // Panel visibility states
  const [isTreeVisible, setIsTreeVisible] = useState(false); // Start with tree hidden for more space
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  
  // Selected items
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const [selectedGoals, setSelectedGoals] = useState<Set<string>>(new Set());
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  // Session state (for persistence)
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [tableFilters, setTableFilters] = useState({});
  const [tableSorting, setTableSorting] = useState([]);
  
  // Load session state from localStorage
  useEffect(() => {
    const savedState = localStorage.getItem(`admin-state-${districtSlug}`);
    if (savedState) {
      try {
        const state = JSON.parse(savedState);
        setExpandedNodes(new Set(state.expandedNodes || []));
        setTableFilters(state.tableFilters || {});
        setTableSorting(state.tableSorting || []);
      } catch (e) {
        console.error('Failed to load saved state:', e);
      }
    }
  }, [districtSlug]);
  
  // Save session state
  const saveSessionState = useCallback(() => {
    const state = {
      expandedNodes: Array.from(expandedNodes),
      tableFilters,
      tableSorting,
    };
    localStorage.setItem(`admin-state-${districtSlug}`, JSON.stringify(state));
  }, [expandedNodes, tableFilters, tableSorting, districtSlug]);
  
  // Auto-save session state
  useEffect(() => {
    const timer = setTimeout(saveSessionState, 1000);
    return () => clearTimeout(timer);
  }, [saveSessionState]);
  
  // Keyboard shortcuts
  useHotkeys('cmd+k, ctrl+k', (e) => {
    e.preventDefault();
    setIsSearchOpen(true);
  });
  
  useHotkeys('cmd+p, ctrl+p', (e) => {
    e.preventDefault();
    router.push(`/districts/${districtSlug}/draft`);
  });
  
  useHotkeys('cmd+e, ctrl+e', (e) => {
    e.preventDefault();
    if (selectedGoalId) {
      setIsEditModalOpen(!isEditModalOpen);
    }
  });
  
  useHotkeys('cmd+b, ctrl+b', (e) => {
    e.preventDefault();
    setIsTreeVisible(!isTreeVisible);
  });
  
  // Handle goal selection from any panel - Navigate to full-page editor
  const handleGoalSelect = (goalId: string) => {
    router.push(`/districts/${districtSlug}/goals/${goalId}/edit`);
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <Card className="w-96 shadow-lg">
          <div className="flex flex-col items-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <p className="mt-4 text-slate-600">Loading district data...</p>
          </div>
        </Card>
      </div>
    );
  }
  
  if (error || !district) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <Card className="w-96 shadow-lg">
          <div className="text-center p-8">
            <p className="text-slate-600 mb-4">
              {error instanceof Error ? error.message : 'District not found'}
            </p>
            <div className="flex gap-2 justify-center">
              <Button variant="outline" onClick={() => refetch()}>
                Retry
              </Button>
              <Button onClick={() => router.push('/')}>
                Go to Homepage
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Navigation */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-[1400px] mx-auto px-6">
          {/* Top row with title and district switcher */}
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-xl font-semibold text-gray-900">{district.name}</h1>
                <p className="text-sm text-gray-500">Strategic Planning Dashboard</p>
              </div>
              {/* District Switcher */}
              <DistrictSwitcher 
                currentDistrictSlug={districtSlug} 
                currentDistrictName={district.name}
              />
            </div>
          </div>
          
          {/* Navigation tabs */}
          <div className="flex items-center gap-2 pb-3">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => router.push(`/dashboard/${districtSlug}/strategic-objectives`)}
              title="Strategic Plan Dashboard"
            >
              <LayoutGrid className="w-4 h-4 mr-1" />
              Strategic Plan
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => router.push(`/dashboard/${districtSlug}/impact`)}
              title="Impact Dashboard"
            >
              <TrendingUp className="w-4 h-4 mr-1" />
              Impact Dashboard
            </Button>
            
            {/* Current page - Admin */}
            <Button 
              variant="default" 
              size="sm"
              disabled
              title="Admin (Current)"
            >
              <Settings className="w-4 h-4 mr-1" />
              Admin
            </Button>
            
            {/* Homepage link */}
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => router.push(`/`)}
              title="Homepage"
            >
              <Home className="w-4 h-4 mr-1" />
              Homepage
            </Button>
          </div>
        </div>
      </header>
      
      {/* Main Content Area */}
      <div className="max-w-[1400px] mx-auto px-6 py-6">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">Strategic Objectives</h2>
          <p className="text-gray-500 mt-1">Click an objective to see its roll-up metrics</p>
        </div>

        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search objectives..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              onFocus={() => setIsSearchOpen(true)}
            />
          </div>
        </div>

        {/* Main Panel */}
        <GoalsSplitViewV2
          goals={district.goals || []}
          districtSlug={districtSlug}
          onRefresh={() => refetch()}
        />
      </div>
      
      {/* Global Search Command Palette */}
      <GlobalSearch
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        goals={district.goals || []}
        onGoalSelect={handleGoalSelect}
      />
      
      {/* Keyboard Shortcuts Help - Hidden on mobile */}
      <div className="hidden sm:block fixed bottom-4 left-4 bg-white/90 backdrop-blur-sm border border-slate-200 rounded-lg shadow-md p-2 text-xs text-slate-500">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <kbd className="px-1 py-0.5 bg-slate-100 rounded text-slate-600 font-medium text-[10px]">⌘K</kbd>
            <span className="text-[10px]">Search</span>
          </div>
          <div className="flex items-center gap-1.5">
            <kbd className="px-1 py-0.5 bg-slate-100 rounded text-slate-600 font-medium text-[10px]">⌘P</kbd>
            <span className="text-[10px]">Preview</span>
          </div>
          <div className="flex items-center gap-1.5">
            <kbd className="px-1 py-0.5 bg-slate-100 rounded text-slate-600 font-medium text-[10px]">⌘E</kbd>
            <span className="text-[10px]">Edit</span>
          </div>
        </div>
      </div>
      
    </div>
  );
}