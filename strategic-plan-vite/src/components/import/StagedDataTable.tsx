import React, { useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  createColumnHelper,
  type SortingState,
  type ColumnFiltersState
} from '@tanstack/react-table';
import { AlertCircle, CheckCircle, Edit2, Trash2, AlertTriangle, Wrench, Sparkles } from 'lucide-react';
import type { StagedGoal, AutoFixSuggestion } from '../../lib/types/import.types';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

export interface StagedDataTableProps {
  data: StagedGoal[];
  onEdit?: (goal: StagedGoal) => void;
  onDelete?: (goalId: string) => void;
  onFix?: (goal: StagedGoal, suggestion: AutoFixSuggestion) => void;
  onBulkAutoFix?: () => void;
  onBulkAction?: (action: 'delete' | 'mark-valid', selectedIds: string[]) => void;
}

const columnHelper = createColumnHelper<StagedGoal>();

export const StagedDataTable: React.FC<StagedDataTableProps> = ({
  data,
  onEdit,
  onDelete,
  onFix,
  onBulkAutoFix,
  onBulkAction
}) => {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = React.useState({});
  const [filterStatus, setFilterStatus] = React.useState<'all' | 'errors' | 'warnings' | 'fixable'>('all');

  // Filter data based on status filter
  const filteredData = useMemo(() => {
    if (filterStatus === 'all') return data;
    if (filterStatus === 'errors') return data.filter(g => g.validation_status === 'error');
    if (filterStatus === 'warnings') return data.filter(g => g.validation_status === 'warning');
    if (filterStatus === 'fixable') return data.filter(g => g.validation_status === 'fixable');
    return data;
  }, [data, filterStatus]);

  const columns = useMemo(
    () => [
      columnHelper.display({
        id: 'select',
        header: ({ table }) => (
          <input
            type="checkbox"
            checked={table.getIsAllRowsSelected()}
            onChange={table.getToggleAllRowsSelectedHandler()}
            className="rounded border-border"
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            checked={row.getIsSelected()}
            onChange={row.getToggleSelectedHandler()}
            className="rounded border-border"
          />
        ),
        size: 40
      }),
      columnHelper.accessor('validation_status', {
        header: 'Status',
        cell: (info) => {
          const status = info.getValue();
          const row = info.row.original;

          if (status === 'valid') {
            return (
              <div className="flex items-center text-green-600">
                <CheckCircle className="h-4 w-4 mr-1" />
                <span className="text-xs font-medium">Valid</span>
                {row.is_auto_generated && (
                  <Sparkles className="h-3 w-3 ml-1" title="Auto-generated" />
                )}
              </div>
            );
          }
          if (status === 'warning') {
            return (
              <div className="flex items-center text-yellow-600">
                <AlertTriangle className="h-4 w-4 mr-1" />
                <span className="text-xs font-medium">Warning</span>
              </div>
            );
          }
          if (status === 'fixable') {
            return (
              <div className="flex items-center text-blue-600">
                <Wrench className="h-4 w-4 mr-1" />
                <span className="text-xs font-medium">Fixable</span>
              </div>
            );
          }
          return (
            <div className="flex items-center text-red-600">
              <AlertCircle className="h-4 w-4 mr-1" />
              <span className="text-xs font-medium">Error</span>
            </div>
          );
        },
        size: 100
      }),
      columnHelper.accessor('row_number', {
        header: 'Row',
        cell: (info) => {
          const rowNum = info.getValue();
          if (rowNum === -1) {
            return (
              <span className="text-xs text-blue-600 font-medium">NEW</span>
            );
          }
          return (
            <span className="text-sm text-muted-foreground">{rowNum}</span>
          );
        },
        size: 60
      }),
      columnHelper.accessor('goal_number', {
        header: 'Goal #',
        cell: (info) => (
          <span className="font-mono text-sm font-medium">{info.getValue() || '-'}</span>
        ),
        size: 80
      }),
      columnHelper.accessor('level', {
        header: 'Level',
        cell: (info) => {
          const level = info.getValue();
          const labels = ['Goal', 'Strategy', 'Action'];
          const colors = ['bg-purple-100 text-purple-700', 'bg-blue-100 text-blue-700', 'bg-green-100 text-green-700'];
          return (
            <span className={`text-xs px-2 py-1 rounded-full ${level !== undefined ? colors[level] : 'bg-gray-100 text-gray-700'}`}>
              {level !== undefined ? labels[level] : '-'}
            </span>
          );
        },
        size: 90
      }),
      columnHelper.accessor('title', {
        header: 'Title',
        cell: (info) => (
          <div className="max-w-md">
            <p className="text-sm truncate">{info.getValue() || '-'}</p>
          </div>
        ),
        size: 300
      }),
      columnHelper.accessor('owner_name', {
        header: 'Owner',
        cell: (info) => (
          <span className="text-sm">{info.getValue() || '-'}</span>
        ),
        size: 150
      }),
      columnHelper.accessor('validation_messages', {
        header: 'Issues',
        cell: (info) => {
          const messages = info.getValue() || [];
          const row = info.row.original;

          if (messages.length === 0) return <span className="text-xs text-muted-foreground">None</span>;

          const statusColor = row.validation_status === 'fixable' ? 'text-blue-600' : 'text-red-600';

          return (
            <div className="space-y-1">
              {messages.slice(0, 2).map((msg, idx) => (
                <p key={idx} className={`text-xs ${statusColor}`}>• {msg}</p>
              ))}
              {messages.length > 2 && (
                <p className="text-xs text-muted-foreground">+{messages.length - 2} more</p>
              )}
            </div>
          );
        },
        size: 200
      }),
      columnHelper.accessor('action', {
        header: 'Action',
        cell: (info) => {
          const action = info.getValue();
          const colors = {
            create: 'bg-green-100 text-green-700',
            update: 'bg-blue-100 text-blue-700',
            skip: 'bg-gray-100 text-gray-700'
          };
          return (
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${colors[action]}`}>
              {action}
            </span>
          );
        },
        size: 80
      }),
      columnHelper.display({
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => {
          const goal = row.original;
          const hasFix = goal.validation_status === 'fixable' && goal.auto_fix_suggestions && goal.auto_fix_suggestions.length > 0;

          return (
            <div className="flex items-center gap-2">
              {hasFix && onFix && (
                <button
                  onClick={() => onFix(goal, goal.auto_fix_suggestions![0])}
                  className="text-blue-600 hover:text-blue-800 font-medium text-xs flex items-center gap-1"
                  title="Auto-fix this issue"
                >
                  <Wrench className="h-3 w-3" />
                  Fix
                </button>
              )}
              {onEdit && !goal.is_auto_generated && (
                <button
                  onClick={() => onEdit(goal)}
                  className="text-gray-600 hover:text-gray-800"
                  title="Edit"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => onDelete(goal.id)}
                  className="text-red-600 hover:text-red-800"
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          );
        },
        size: 120
      })
    ],
    [onEdit, onDelete, onFix]
  );

  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      sorting,
      columnFilters,
      rowSelection
    },
    enableRowSelection: true,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel()
  });

  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const selectedIds = selectedRows.map(row => row.original.id);

  // Calculate summary stats
  const stats = useMemo(() => {
    const errors = data.filter(g => g.validation_status === 'error').length;
    const warnings = data.filter(g => g.validation_status === 'warning').length;
    const fixable = data.filter(g => g.validation_status === 'fixable').length;
    const valid = data.filter(g => g.validation_status === 'valid').length;
    return { errors, warnings, fixable, valid, total: data.length };
  }, [data]);

  return (
    <div className="space-y-4">
      {/* Summary Stats */}
      <div className="grid grid-cols-5 gap-4">
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Total Rows</p>
          <p className="text-2xl font-bold">{stats.total}</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-green-700">Valid</p>
          <p className="text-2xl font-bold text-green-700">{stats.valid}</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-700">Fixable</p>
          <p className="text-2xl font-bold text-blue-700">{stats.fixable}</p>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-700">Warnings</p>
          <p className="text-2xl font-bold text-yellow-700">{stats.warnings}</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-700">Errors</p>
          <p className="text-2xl font-bold text-red-700">{stats.errors}</p>
        </div>
      </div>

      {/* Auto-Fix Banner */}
      {stats.fixable > 0 && onBulkAutoFix && (
        <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center space-x-3">
            <Wrench className="h-5 w-5 text-blue-600" />
            <div>
              <p className="font-medium text-blue-900">
                {stats.fixable} issue{stats.fixable > 1 ? 's' : ''} can be auto-fixed
              </p>
              <p className="text-sm text-blue-700">
                Missing parent goals will be created as placeholders
              </p>
            </div>
          </div>
          <Button onClick={onBulkAutoFix} size="sm">
            <Wrench className="h-4 w-4 mr-2" />
            Fix All
          </Button>
        </div>
      )}

      {/* Filters and Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1 rounded-md text-sm font-medium ${
              filterStatus === 'all'
                ? 'bg-primary text-white'
                : 'bg-muted text-foreground hover:bg-muted/80'
            }`}
          >
            All ({stats.total})
          </button>
          {stats.fixable > 0 && (
            <button
              onClick={() => setFilterStatus('fixable')}
              className={`px-3 py-1 rounded-md text-sm font-medium ${
                filterStatus === 'fixable'
                  ? 'bg-blue-600 text-white'
                  : 'bg-muted text-foreground hover:bg-muted/80'
              }`}
            >
              Fixable ({stats.fixable})
            </button>
          )}
          <button
            onClick={() => setFilterStatus('errors')}
            className={`px-3 py-1 rounded-md text-sm font-medium ${
              filterStatus === 'errors'
                ? 'bg-red-600 text-white'
                : 'bg-muted text-foreground hover:bg-muted/80'
            }`}
          >
            Errors ({stats.errors})
          </button>
          <button
            onClick={() => setFilterStatus('warnings')}
            className={`px-3 py-1 rounded-md text-sm font-medium ${
              filterStatus === 'warnings'
                ? 'bg-yellow-600 text-white'
                : 'bg-muted text-foreground hover:bg-muted/80'
            }`}
          >
            Warnings ({stats.warnings})
          </button>
        </div>

        {selectedIds.length > 0 && onBulkAction && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {selectedIds.length} selected
            </span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onBulkAction('delete', selectedIds)}
            >
              Delete Selected
            </Button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border">
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th
                      key={header.id}
                      className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
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
            <tbody className="bg-white divide-y divide-border">
              {table.getRowModel().rows.map(row => (
                <tr
                  key={row.id}
                  className={`hover:bg-muted/20 ${
                    row.original.validation_status === 'error'
                      ? 'bg-red-50/50'
                      : row.original.validation_status === 'warning'
                      ? 'bg-yellow-50/50'
                      : row.original.validation_status === 'fixable'
                      ? 'bg-blue-50/50'
                      : row.original.is_auto_generated
                      ? 'bg-green-50/30 border-l-4 border-l-green-500'
                      : ''
                  }`}
                >
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id} className="px-4 py-3 text-sm">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredData.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <p>No data to display</p>
          </div>
        )}
      </div>
    </div>
  );
};
