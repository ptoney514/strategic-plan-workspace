'use client';

import React, { useState, useMemo, useCallback, useRef } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  ColumnDef,
  FilterFn,
  SortingState,
  ColumnFiltersState,
  VisibilityState,
} from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu';
import {
  Target,
  Flag,
  Zap,
  MoreHorizontal,
  ArrowUpDown,
  Archive,
  Trash2,
  Edit,
  Eye,
  Filter,
  Columns,
  Download,
  ChevronRight,
  ChevronDown,
  Plus
} from 'lucide-react';
import { GoalWithMetrics } from '@/lib/types';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useDeleteGoal, useCreateGoal } from '@/hooks/use-district';
import { dbService } from '@/lib/db-service';

interface GoalsDataTableProps {
  goals: GoalWithMetrics[];
  selectedGoals: Set<string>;
  onGoalSelect: (goalId: string) => void;
  filters: any;
  sorting: any;
  onFiltersChange: (filters: any) => void;
  onSortingChange: (sorting: any) => void;
  districtSlug: string;
  onRefresh?: () => void;
}

// Flatten hierarchical goals for table display with expand/collapse support
function flattenGoals(
  goals: GoalWithMetrics[], 
  expandedGoals: Set<string>,
  parent?: GoalWithMetrics
): any[] {
  const result: any[] = [];
  
  goals.forEach(goal => {
    const hasChildren = goal.children && goal.children.length > 0;
    const isExpanded = expandedGoals.has(goal.id);
    
    result.push({
      ...goal,
      parentTitle: parent?.title || null,
      parentNumber: parent?.goal_number || null,
      hasChildren,
      isExpanded,
      metricsCount: goal.metrics?.length || 0,
      status: calculateStatus(goal),
    });
    
    // Only add children if this goal is expanded
    if (hasChildren && isExpanded) {
      result.push(...flattenGoals(goal.children, expandedGoals, goal));
    }
  });
  
  return result;
}

// Calculate goal status based on metrics
function calculateStatus(goal: GoalWithMetrics): 'On Target' | 'Achieved' | 'Needs Attention' {
  if (!goal.metrics || goal.metrics.length === 0) return 'On Target';
  
  const progressValues = goal.metrics
    .filter(m => m.current_value !== null && m.target_value !== null)
    .map(m => (m.current_value! / m.target_value!) * 100);
  
  if (progressValues.length === 0) return 'On Target';
  
  const avgProgress = Math.round(
    progressValues.reduce((sum, val) => sum + val, 0) / progressValues.length
  );
  
  if (avgProgress >= 100) return 'Achieved';
  if (avgProgress < 50) return 'Needs Attention';
  return 'On Target';
}

// Get level icon
function getLevelIcon(level: number) {
  if (level === 0) return <Target className="h-4 w-4 text-blue-600" />;
  if (level === 1) return <Flag className="h-4 w-4 text-green-600" />;
  return <Zap className="h-4 w-4 text-purple-600" />;
}

// Get level badge color
function getLevelBadgeVariant(level: number): "default" | "secondary" | "outline" {
  if (level === 0) return "default";
  if (level === 1) return "secondary";
  return "outline";
}

export default function GoalsDataTable({
  goals,
  selectedGoals,
  onGoalSelect,
  filters,
  sorting,
  onFiltersChange,
  onSortingChange,
  districtSlug,
  onRefresh
}: GoalsDataTableProps) {
  const deleteGoalMutation = useDeleteGoal(districtSlug);
  const createGoalMutation = useCreateGoal(districtSlug);
  
  const [rowSelection, setRowSelection] = useState({});
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [sortingState, setSortingState] = useState<SortingState>(sorting || []);
  const [globalFilter, setGlobalFilter] = useState('');
  
  // Track which goals are expanded (start with all level 0 goals expanded)
  const [expandedGoals, setExpandedGoals] = useState<Set<string>>(() => {
    const initialExpanded = new Set<string>();
    goals.forEach(goal => {
      if (goal.level === 0) {
        initialExpanded.add(goal.id);
      }
    });
    return initialExpanded;
  });
  
  // Toggle goal expansion
  const toggleExpanded = useCallback((goalId: string) => {
    setExpandedGoals(prev => {
      const newSet = new Set(prev);
      if (newSet.has(goalId)) {
        newSet.delete(goalId);
      } else {
        newSet.add(goalId);
      }
      return newSet;
    });
  }, []);
  
  // Expand/Collapse all
  const expandAll = useCallback(() => {
    const allGoalIds = new Set<string>();
    const collectIds = (goalList: GoalWithMetrics[]) => {
      goalList.forEach(goal => {
        if (goal.children && goal.children.length > 0) {
          allGoalIds.add(goal.id);
          collectIds(goal.children);
        }
      });
    };
    collectIds(goals);
    setExpandedGoals(allGoalIds);
  }, [goals]);
  
  const collapseAll = useCallback(() => {
    setExpandedGoals(new Set());
  }, []);
  
  // Add new strategic objective
  const handleAddStrategicObjective = async () => {
    const title = prompt('Enter title for new Strategic Objective:');
    if (!title) return;
    
    try {
      await createGoalMutation.mutateAsync({
        parentId: null,
        level: 0,
        title
      });
      toast.success('Strategic Objective created successfully');
      onRefresh?.();
    } catch (error) {
      toast.error('Failed to create Strategic Objective');
    }
  };
  
  // Flatten goals for table with expansion state
  const flatGoals = useMemo(() => flattenGoals(goals, expandedGoals), [goals, expandedGoals]);
  
  // Define columns
  const columns = useMemo<ColumnDef<any>[]>(
    () => [
      {
        accessorKey: 'goal_number',
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            className="-ml-3 h-8"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Goal #
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            {/* Expand/Collapse button for goals with children */}
            {row.original.hasChildren ? (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleExpanded(row.original.id);
                }}
              >
                {row.original.isExpanded ? (
                  <ChevronDown className="h-3 w-3" />
                ) : (
                  <ChevronRight className="h-3 w-3" />
                )}
              </Button>
            ) : (
              <div className="w-6" /> // Spacer for alignment
            )}
            {getLevelIcon(row.original.level)}
            <Badge variant={getLevelBadgeVariant(row.original.level)} className="text-xs">
              {row.getValue('goal_number')}
            </Badge>
          </div>
        ),
        size: 150,
      },
      {
        accessorKey: 'title',
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            className="-ml-3 h-8"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Title
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <div 
            className={cn(
              "cursor-pointer hover:text-blue-600",
              row.original.level === 1 && "pl-4",
              row.original.level === 2 && "pl-8"
            )}
            title={row.getValue('title')}
            onClick={() => onGoalSelect(row.original.id)}
          >
            {row.getValue('title')}
          </div>
        ),
        minSize: 200,
      },
      {
        id: 'actions',
        size: 50,
        cell: ({ row }) => {
          const goal = row.original;
          
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => onGoalSelect(goal.id)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => {
                  // TODO: Implement view
                  toast.info('View functionality coming soon!');
                }}>
                  <Eye className="mr-2 h-4 w-4" />
                  View
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => {
                  // TODO: Implement archive
                  toast.info('Archive functionality coming soon!');
                }}>
                  <Archive className="mr-2 h-4 w-4" />
                  Archive
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-red-600"
                  onClick={() => {
                    if (confirm('Are you sure you want to delete this goal?')) {
                      deleteGoalMutation.mutate(goal.id);
                    }
                  }}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [onGoalSelect, deleteGoalMutation]
  );
  
  // Create table instance
  const table = useReactTable({
    data: flatGoals,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSortingState,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting: sortingState,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
  });
  // Virtualization
  const parentRef = useRef<HTMLDivElement>(null);
  const rowVirtualizer = useVirtualizer({
    count: table.getRowModel().rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 40,
    overscan: 10,
  });
  
  return (
    <div className="flex flex-col h-full w-full">
      {/* Toolbar */}
      <div className="p-4 border-b flex items-center justify-between gap-2 bg-white">
        <div className="flex items-center gap-2 flex-1">
          {/* Search */}
          <div className="relative w-64">
            <Input
              placeholder="Search goals..."
              value={globalFilter ?? ''}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="pl-8"
            />
            <Filter className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          </div>
          
          {/* Expand/Collapse All */}
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={expandAll}
              title="Expand all"
            >
              <ChevronDown className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={collapseAll}
              title="Collapse all"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Add Strategic Objective */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleAddStrategicObjective}
            className="bg-blue-50 hover:bg-blue-100 border-blue-200"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Strategic Objective
          </Button>
          
          {/* Column visibility */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Columns className="mr-2 h-4 w-4" />
                Columns
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
      </div>
      
      {/* Table */}
      <div ref={parentRef} className="flex-1 overflow-auto bg-white">
        <table className="w-full">
          <thead className="sticky top-0 bg-slate-50/80 backdrop-blur-sm border-b">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider"
                    style={{ width: header.getSize() }}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody
            style={{
              height: `${rowVirtualizer.getTotalSize()}px`,
              position: 'relative',
            }}
          >
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const row = table.getRowModel().rows[virtualRow.index];
              return (
                <tr
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="border-b hover:bg-slate-50/50 transition-colors"
                  style={{
                    height: `${virtualRow.size}px`,
                    transform: `translateY(${virtualRow.start}px)`,
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                  }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="px-4 py-3 text-sm"
                      style={{ width: cell.column.getSize() }}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {/* Footer */}
      <div className="p-4 border-t flex items-center justify-between bg-white">
        <div className="text-sm text-gray-600">
          {table.getFilteredRowModel().rows.length} of{' '}
          {table.getCoreRowModel().rows.length} goals
        </div>
      </div>
    </div>
  );
}