'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Eye, 
  Search, 
  Download, 
  Upload, 
  RefreshCw, 
  Settings,
  Command
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface AdminHeaderProps {
  district: any;
  isPreviewMode?: boolean;
  onTogglePreview?: () => void;
  onSearch: () => void;
  onExport: () => void;
  onRefresh: () => void;
}

export default function AdminHeader({
  district,
  isPreviewMode,
  onTogglePreview,
  onSearch,
  onExport,
  onRefresh
}: AdminHeaderProps) {
  const router = useRouter();
  
  // Calculate stats
  const stats = {
    objectives: district.goals?.filter((g: any) => g.level === 0).length || 0,
    goals: district.goals?.reduce((acc: number, obj: any) => {
      return acc + (obj.children?.filter((c: any) => c.level === 1).length || 0);
    }, 0) || 0,
    subgoals: district.goals?.reduce((acc: number, obj: any) => {
      let count = 0;
      obj.children?.forEach((goal: any) => {
        count += goal.children?.length || 0;
      });
      return acc + count;
    }, 0) || 0,
    metrics: district.goals?.reduce((acc: number, obj: any) => {
      const countMetrics = (goal: any): number => {
        let count = goal.metrics?.length || 0;
        if (goal.children) {
          goal.children.forEach((child: any) => {
            count += countMetrics(child);
          });
        }
        return count;
      };
      return acc + countMetrics(obj);
    }, 0) || 0
  };
  
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-[1920px] mx-auto px-6 py-4 flex items-center justify-between">
        {/* Left section */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/dashboard/${district.slug}`)}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Dashboard
          </Button>
          
          <div className="border-l pl-4">
            <h1 className="text-xl font-bold text-slate-900">
              {district.name} Admin
            </h1>
            <div className="flex items-center gap-3 mt-1">
              <Badge variant="default" className="text-xs bg-blue-100 text-blue-700 border-blue-200">
                {stats.objectives} Objectives
              </Badge>
              <Badge variant="secondary" className="text-xs bg-green-100 text-green-700 border-green-200">
                {stats.goals} Goals
              </Badge>
              <Badge variant="outline" className="text-xs bg-purple-100 text-purple-700 border-purple-200">
                {stats.subgoals} Sub-goals
              </Badge>
              <Badge variant="secondary" className="text-xs bg-green-100 text-green-700 border-green-200">
                {stats.metrics} Metrics
              </Badge>
            </div>
          </div>
        </div>
        
        {/* Right section */}
        <div className="flex items-center gap-2">
          {/* Search Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={onSearch}
            className="gap-2"
          >
            <Search className="h-4 w-4" />
            Search
            <div className="flex items-center gap-1 ml-2">
              <kbd className="px-1 py-0.5 text-xs bg-gray-100 rounded">⌘</kbd>
              <kbd className="px-1 py-0.5 text-xs bg-gray-100 rounded">K</kbd>
            </div>
          </Button>
          
          {/* Preview - Navigate to Draft Dashboard */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/districts/${district.slug}/draft`)}
          >
            <Eye className="h-4 w-4 mr-1" />
            Preview
          </Button>
          
          {/* Export */}
          <Button
            variant="outline"
            size="sm"
            onClick={onExport}
          >
            <Download className="h-4 w-4 mr-1" />
            Export
          </Button>
          
          {/* Import (placeholder) */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              // TODO: Implement import functionality
              alert('Import functionality coming soon!');
            }}
          >
            <Upload className="h-4 w-4" />
          </Button>
          
          {/* Refresh */}
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          
          {/* Settings (placeholder) */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              // TODO: Implement settings
              alert('Settings coming soon!');
            }}
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}