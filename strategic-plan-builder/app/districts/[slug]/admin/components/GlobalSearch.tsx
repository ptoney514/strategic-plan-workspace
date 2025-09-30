'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Command } from 'cmdk';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  Target,
  Flag,
  Zap,
  BarChart3,
  ArrowRight,
  FileText,
  Hash,
  Calendar,
  ChevronRight
} from 'lucide-react';
import { GoalWithMetrics, Metric } from '@/lib/types';
import { cn } from '@/lib/utils';

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
  goals: GoalWithMetrics[];
  onGoalSelect: (goalId: string) => void;
}

interface SearchItem {
  id: string;
  type: 'goal' | 'metric';
  title: string;
  subtitle?: string;
  path: string[];
  level?: number;
  goalId?: string;
  data: GoalWithMetrics | Metric;
}

// Flatten goals and metrics for search
function prepareSearchItems(goals: GoalWithMetrics[]): SearchItem[] {
  const items: SearchItem[] = [];
  
  function processGoal(goal: GoalWithMetrics, path: string[] = []) {
    const currentPath = [...path, goal.title];
    
    // Add goal
    items.push({
      id: goal.id,
      type: 'goal',
      title: goal.title,
      subtitle: goal.description,
      path: currentPath,
      level: goal.level,
      data: goal
    });
    
    // Add metrics
    if (goal.metrics) {
      goal.metrics.forEach(metric => {
        items.push({
          id: metric.id,
          type: 'metric',
          title: metric.name,
          subtitle: `${metric.current_value || 0}/${metric.target_value || 0} ${metric.unit || ''}`,
          path: [...currentPath, 'Metrics'],
          goalId: goal.id,
          data: metric
        });
      });
    }
    
    // Process children
    if (goal.children) {
      goal.children.forEach(child => processGoal(child, currentPath));
    }
  }
  
  goals.forEach(goal => processGoal(goal));
  return items;
}

export default function GlobalSearch({
  isOpen,
  onClose,
  goals,
  onGoalSelect
}: GlobalSearchProps) {
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  // Prepare search items
  const searchItems = useMemo(() => prepareSearchItems(goals), [goals]);
  
  // Filter items based on search
  const filteredItems = useMemo(() => {
    if (!search) return searchItems.slice(0, 20); // Show first 20 items when no search
    
    const searchLower = search.toLowerCase();
    const filtered = searchItems.filter(item => {
      const titleMatch = item.title.toLowerCase().includes(searchLower);
      const subtitleMatch = item.subtitle?.toLowerCase().includes(searchLower);
      const pathMatch = item.path.some(p => p.toLowerCase().includes(searchLower));
      
      return titleMatch || subtitleMatch || pathMatch;
    });
    
    // Sort by relevance (title matches first, then subtitle, then path)
    filtered.sort((a, b) => {
      const aTitle = a.title.toLowerCase().indexOf(searchLower);
      const bTitle = b.title.toLowerCase().indexOf(searchLower);
      
      if (aTitle !== -1 && bTitle === -1) return -1;
      if (aTitle === -1 && bTitle !== -1) return 1;
      if (aTitle !== -1 && bTitle !== -1) return aTitle - bTitle;
      
      return 0;
    });
    
    return filtered.slice(0, 50); // Limit to 50 results
  }, [search, searchItems]);
  
  // Reset search when dialog opens/closes
  useEffect(() => {
    if (isOpen) {
      setSearch('');
      setSelectedIndex(0);
    }
  }, [isOpen]);
  
  // Handle item selection
  const handleSelect = (item: SearchItem) => {
    if (item.type === 'goal') {
      onGoalSelect(item.id);
    } else if (item.type === 'metric' && item.goalId) {
      onGoalSelect(item.goalId);
    }
    onClose();
  };
  
  // Get icon for item type
  const getItemIcon = (item: SearchItem) => {
    if (item.type === 'metric') {
      return <BarChart3 className="h-4 w-4 text-indigo-600" />;
    }
    
    if (item.level === 0) return <Target className="h-4 w-4 text-blue-600" />;
    if (item.level === 1) return <Flag className="h-4 w-4 text-green-600" />;
    return <Zap className="h-4 w-4 text-purple-600" />;
  };
  
  // Get type label
  const getTypeLabel = (item: SearchItem) => {
    if (item.type === 'metric') return 'Metric';
    if (item.level === 0) return 'Strategic Objective';
    if (item.level === 1) return 'Goal';
    return 'Sub-goal';
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="p-0 max-w-2xl">
        <Command className="rounded-lg border shadow-md">
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <Command.Input
              placeholder="Search goals, metrics, descriptions..."
              value={search}
              onValueChange={setSearch}
              className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-gray-500 disabled:cursor-not-allowed disabled:opacity-50"
            />
            <div className="ml-2 flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 text-xs bg-gray-100 rounded">ESC</kbd>
              <span className="text-xs text-gray-500">to close</span>
            </div>
          </div>
          
          <Command.List className="max-h-[400px] overflow-y-auto p-2">
            {filteredItems.length === 0 ? (
              <Command.Empty className="py-6 text-center text-sm text-gray-500">
                No results found.
              </Command.Empty>
            ) : (
              <>
                {/* Quick Actions */}
                {!search && (
                  <>
                    <Command.Group heading="Quick Actions" className="px-2 py-1.5 text-xs font-medium text-gray-500">
                      <Command.Item
                        className="flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-gray-100 cursor-pointer"
                        onSelect={() => {
                          // TODO: Add new goal
                          onClose();
                        }}
                      >
                        <Target className="h-4 w-4" />
                        <span>Add Strategic Objective</span>
                      </Command.Item>
                      <Command.Item
                        className="flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-gray-100 cursor-pointer"
                        onSelect={() => {
                          // TODO: View all metrics
                          onClose();
                        }}
                      >
                        <BarChart3 className="h-4 w-4" />
                        <span>View All Metrics</span>
                      </Command.Item>
                    </Command.Group>
                    <Command.Separator className="my-2" />
                  </>
                )}
                
                {/* Search Results */}
                <Command.Group heading={search ? 'Search Results' : 'Recent Items'} className="px-2 py-1.5 text-xs font-medium text-gray-500">
                  {filteredItems.map((item, index) => (
                    <Command.Item
                      key={item.id}
                      value={item.title}
                      onSelect={() => handleSelect(item)}
                      className={cn(
                        "flex items-start gap-2 rounded-sm px-2 py-2 text-sm hover:bg-gray-100 cursor-pointer",
                        selectedIndex === index && "bg-gray-100"
                      )}
                    >
                      <div className="mt-0.5">{getItemIcon(item)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium truncate">{item.title}</span>
                          <Badge variant="outline" className="text-xs">
                            {getTypeLabel(item)}
                          </Badge>
                        </div>
                        {item.subtitle && (
                          <div className="text-xs text-gray-500 truncate mt-0.5">
                            {item.subtitle}
                          </div>
                        )}
                        <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                          {item.path.slice(0, -1).map((p, i) => (
                            <React.Fragment key={i}>
                              {i > 0 && <ChevronRight className="h-3 w-3" />}
                              <span className="truncate max-w-[100px]">{p}</span>
                            </React.Fragment>
                          ))}
                        </div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-gray-400 mt-0.5" />
                    </Command.Item>
                  ))}
                </Command.Group>
              </>
            )}
          </Command.List>
          
          {/* Footer */}
          <div className="border-t px-3 py-2">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <kbd className="px-1 py-0.5 bg-gray-100 rounded">↑↓</kbd>
                  Navigate
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1 py-0.5 bg-gray-100 rounded">↵</kbd>
                  Select
                </span>
              </div>
              <span>
                {filteredItems.length} {filteredItems.length === 1 ? 'result' : 'results'}
              </span>
            </div>
          </div>
        </Command>
      </DialogContent>
    </Dialog>
  );
}